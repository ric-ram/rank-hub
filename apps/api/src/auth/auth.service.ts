import * as bcrypt from 'bcrypt';

import {
	BadRequestException,
	HttpException,
	Injectable,
	InternalServerErrorException,
	UnauthorizedException,
} from '@nestjs/common';

import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { createHmac, randomBytes } from 'node:crypto';
import { CreateUserAdminDto } from 'src/user-admin/dto/create-user-admin.dto';
import { UserAdmin } from 'src/user-admin/entities/user-admin.entity';
import { IsNull, MoreThan, Repository } from 'typeorm';
import { UserAdminService } from '../user-admin/user-admin.service';
import { RegisterAdminRequestDto } from './dto/register-admin.dto';
import { RefreshTokens } from './entities/refresh-tokens.entity';

/**
 * Response of a successful login
 *
 * @interface IAuthenticatedResponse
 * @typedef {IAuthenticatedResponse}
 */
interface IAuthenticatedResponse {
	access_token: string;
	refresh_token: string;
	expires_at: Date;
}

/**
 * Return type of a generated refresh token
 *
 * @interface IGenRefreshToken
 * @typedef {IGenRefreshToken}
 */
interface IGenRefreshToken {
	refreshToken: string;
	refreshTokenHash: string;
	fingerprint: string;
	expiresAt: Date;
}

/**
 * Response of rotating a refresh token
 *
 * @interface IRotateRefreshToken
 * @typedef {IRotateRefreshToken}
 */
interface IRotateRefreshToken {
	adminId: string;
	refreshToken: string;
	expiresAt: Date;
}

/**
 * Service responsible for the Business Logic of the Authentication Module
 *
 * @export
 * @class AuthService
 * @typedef {AuthService}
 */
@Injectable()
export class AuthService {
	/**
	 * Creates an instance of AuthService.
	 *
	 * @constructor
	 * @param {Repository<RefreshTokens>} refreshTokenRepo
	 * @param {UserAdminService} userAdminService
	 * @param {JwtService} jwtService
	 * @param {ConfigService} configService
	 * @param {PinoLogger} logger
	 */
	constructor(
		@InjectRepository(RefreshTokens)
		private readonly refreshTokenRepo: Repository<RefreshTokens>,
		private readonly userAdminService: UserAdminService,
		private readonly jwtService: JwtService,
		private readonly configService: ConfigService,
		@InjectPinoLogger(AuthService.name) private readonly logger: PinoLogger,
	) {}

	/**
	 * Gets the expiration time of a refresh token
	 *
	 * @private
	 * @readonly
	 * @type {number}
	 */
	private get REFRESH_TTL_MS(): number {
		return Number(
			this.configService.get('REFRESH_TOKEN_EXPIRATION_MS') ??
				1000 * 60 * 60 * 24 * 7,
		);
	}

	/**
	 * Generates a Fingerprint from a refresh token
	 *
	 * @private
	 * @param {string} refreshToken
	 * @returns {string} fingerprint Refresh token fingerprint
	 */
	private refreshTokenFingerprint(refreshToken: string): string {
		const secret = this.configService.getOrThrow<string>('REFRESH_PEPPER');
		return createHmac('sha256', secret).update(refreshToken).digest('hex');
	}

	/**
	 * Issues a refresh token to be sent in a cookie and saved in the database
	 *
	 * @private
	 * @async
	 * @returns {Promise<IGenRefreshToken>}
	 * @throws {InternalServerErrorException} On crypto/hash errors.
	 */
	private async issueRefreshToken(): Promise<IGenRefreshToken> {
		try {
			const refreshToken = randomBytes(32).toString('base64url'); // 256-bit
			const fingerprint = this.refreshTokenFingerprint(refreshToken);
			const refreshTokenHash = await bcrypt.hash(refreshToken, 10);
			const expiresAt = new Date(Date.now() + this.REFRESH_TTL_MS);

			return {
				refreshToken: refreshToken,
				refreshTokenHash: refreshTokenHash,
				fingerprint: fingerprint,
				expiresAt: expiresAt,
			};
		} catch (e: any) {
			this.logger.error(
				{ err: (e as Error)?.message, code: 'AUTH.REFRESH_TOKEN' },
				'issue refresh token failed',
			);
			if (e instanceof HttpException) throw e;
			throw new InternalServerErrorException('AUTH.INTERNAL');
		}
	}

	/**
	 * Issues a refresh token to be sent in a cookie and saved in the database
	 *
	 * @async
	 * @param {string} adminId Admin UUID (as string).
	 * @returns {Promise<string>} Signed access token (JWT).
	 * @throws {InternalServerErrorException} On signing/config errors.
	 */
	async issueAccessToken(adminId: string): Promise<string> {
		try {
			const payload = { sub: adminId, role: 'ADMIN' };
			const accessToken = await this.jwtService.signAsync(payload, {
				issuer: 'rankhub.api',
				audience: 'rankhub.admin',
			});

			return accessToken;
		} catch (e: any) {
			this.logger.error(
				{
					err: (e as Error)?.message,
					code: 'AUTH.ACCESS_TOKEN',
				},
				'issue access token failed',
			);
			if (e instanceof HttpException) throw e;
			throw new InternalServerErrorException('AUTH.INTERNAL');
		}
	}

	/**
	 * Validate credentials and return the matching admin.
	 *
	 * @async
	 * @param {string} email Admin email.
	 * @param {string} password Plaintext password to verify.
	 * @returns {Promise<UserAdmin>} The authenticated admin.
	 * @throws {BadRequestException} When credentials are invalid.
	 * @throws {InternalServerErrorException} On unexpected DB/crypto errors.
	 */
	async validateUser(email: string, password: string): Promise<UserAdmin> {
		try {
			const admin: UserAdmin | null =
				await this.userAdminService.findOneByEmail(email);
			if (!admin) {
				throw new BadRequestException('Invalid credentials');
			}

			const isMatch: boolean = await bcrypt.compare(
				password,
				admin.passwordHash,
			);

			if (!isMatch) {
				throw new BadRequestException('Invalid credentials');
			}

			return admin;
		} catch (e: any) {
			this.logger.error(
				{
					err: (e as Error)?.message,
					code: 'AUTH.VALIDATE_USER',
				},
				'user validation failed',
			);
			if (e instanceof HttpException) throw e;
			throw new InternalServerErrorException('AUTH.INTERNAL');
		}
	}

	/**
	 * Complete login: issues access + refresh, persists refresh, returns both
	 *
	 * @async
	 * @param {UserAdmin} admin Authenticated admin entity.
	 * @returns {Promise<IAuthenticatedResponse>}
	 * @throws {InternalServerErrorException} On token issuance/persistence failures.
	 */
	async login(admin: UserAdmin): Promise<IAuthenticatedResponse> {
		try {
			const accessToken = await this.issueAccessToken(admin.id);

			const { refreshToken, refreshTokenHash, fingerprint, expiresAt } =
				await this.issueRefreshToken();
			await this.refreshTokenRepo.save({
				adminId: admin.id,
				tokenHash: refreshTokenHash,
				fingerprint,
				expiresAt: expiresAt,
			});

			return {
				access_token: accessToken,
				refresh_token: refreshToken,
				expires_at: expiresAt,
			};
		} catch (e: any) {
			this.logger.error(
				{
					err: (e as Error)?.message,
					code: 'AUTH.LOGIN',
				},
				'login failed',
			);
			if (e instanceof HttpException) throw e;
			throw new InternalServerErrorException('AUTH.INTERNAL');
		}
	}

	/**
	 * Register a new admin, then log them in (access + refresh).
	 *
	 * @async
	 * @param {RegisterAdminRequestDto} admin Registration payload.
	 * @returns {Promise<IAuthenticatedResponse>}
	 * @throws {BadRequestException | ConflictException} When email already exists.
	 * @throws {InternalServerErrorException} On DB/crypto/token errors.
	 */
	async register(
		admin: RegisterAdminRequestDto,
	): Promise<IAuthenticatedResponse> {
		try {
			const existingAdmin = await this.userAdminService.findOneByEmail(
				admin.email,
			);

			if (existingAdmin) {
				throw new BadRequestException('Email is already in use');
			}

			const hashedPassword = await bcrypt.hash(admin.password, 10);
			const newAdmin: CreateUserAdminDto = {
				email: admin.email,
				passwordHash: hashedPassword,
			};
			const createdAdmin = await this.userAdminService.create(newAdmin);
			return this.login(createdAdmin);
		} catch (e: any) {
			this.logger.error(
				{
					err: (e as Error)?.message,
					code: 'AUTH.REGISTER',
				},
				'register new user failed',
			);
			if (e instanceof HttpException) throw e;
			throw new InternalServerErrorException('AUTH.INTERNAL');
		}
	}

	/**
	 * Verify the presented refresh token, rotate it (revoke old, persist new), and return rotation result.
	 *
	 * @async
	 * @param {string} refreshToken Raw refresh token from cookie.
	 * @returns {Promise<IRotateRefreshToken>}
	 * @throws {UnauthorizedException} When token is missing/invalid/expired (or reused if enforced).
	 * @throws {InternalServerErrorException} On DB/crypto errors.
	 */
	async verifyAndRotateRefresh(
		refreshToken: string,
	): Promise<IRotateRefreshToken> {
		if (!refreshToken)
			throw new UnauthorizedException('AUTH.MISSING_REFRESH');

		try {
			const fingerprint = this.refreshTokenFingerprint(refreshToken);
			const row = await this.refreshTokenRepo.findOne({
				where: {
					fingerprint,
					revokedAt: IsNull(),
					expiresAt: MoreThan(new Date()),
				},
			});

			if (!row) throw new UnauthorizedException('AUTH.INVALID_REFRESH');

			const match = await bcrypt.compare(refreshToken, row.tokenHash);

			if (!match) throw new UnauthorizedException('AUTH.INVALID_REFRESH');

			await this.refreshTokenRepo.update(
				{ id: row.id },
				{ revokedAt: new Date() },
			);

			const {
				refreshToken: newRefreshToken,
				refreshTokenHash,
				fingerprint: newFingerprint,
				expiresAt,
			} = await this.issueRefreshToken();

			await this.refreshTokenRepo.save({
				adminId: row.adminId,
				tokenHash: refreshTokenHash,
				fingerprint: newFingerprint,
				expiresAt: expiresAt,
			});

			return {
				adminId: row.adminId,
				refreshToken: newRefreshToken,
				expiresAt: expiresAt,
			};
		} catch (e: any) {
			this.logger.error(
				{
					err: (e as Error)?.message,
					code: 'AUTH.VERIFY_ROTATE_REFRESH',
				},
				'failed to verify and rotate refresh token',
			);
			if (e instanceof HttpException) throw e;
			throw new InternalServerErrorException('AUTH.INTERNAL');
		}
	}

	/**
	 * Logout current session: revoke the matching active refresh token (idempotent).
	 *
	 * @async
	 * @param {string} adminId Admin UUID.
	 * @param {?string} [refreshCookie] Raw refresh token from cookie (if any).
	 * @returns {Promise<void>}
	 * @throws {InternalServerErrorException} On DB/crypto errors.
	 */
	async logout(adminId: string, refreshCookie?: string): Promise<void> {
		if (!refreshCookie) return;

		try {
			const rows = await this.refreshTokenRepo.find({
				where: { adminId: adminId, revokedAt: IsNull() },
			});
			for (const row of rows) {
				if (await bcrypt.compare(refreshCookie, row.tokenHash)) {
					await this.refreshTokenRepo.update(
						{ id: row.id },
						{ revokedAt: new Date() },
					);
					break;
				}
			}
		} catch (e: any) {
			this.logger.error(
				{
					err: (e as Error)?.message,
					code: 'AUTH.LOGOUT',
				},
				'logout failed',
			);
			if (e instanceof HttpException) throw e;
			throw new InternalServerErrorException('AUTH.INTERNAL');
		}
	}

	/**
	 * Logout all sessions: revoke all active refresh tokens for the admin.
	 *
	 * @async
	 * @param {string} adminId Admin UUID.
	 * @returns {Promise<void>}
	 * @throws {InternalServerErrorException} On DB errors.
	 */
	async logoutAll(adminId: string): Promise<void> {
		try {
			const rows = await this.refreshTokenRepo.find({
				where: { adminId: adminId, revokedAt: IsNull() },
			});

			for (const row of rows) {
				await this.refreshTokenRepo.update(
					{ id: row.id },
					{ revokedAt: new Date() },
				);
			}
		} catch (e: any) {
			this.logger.error(
				{
					err: (e as Error)?.message,
					code: 'AUTH.LOGOUT_ALL',
				},
				'logout all failed',
			);
			if (e instanceof HttpException) throw e;
			throw new InternalServerErrorException('AUTH.INTERNAL');
		}
	}
}
