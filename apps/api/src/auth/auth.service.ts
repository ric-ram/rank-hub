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
import { randomBytes } from 'node:crypto';
import { CreateUserAdminDto } from 'src/user-admin/dto/create-user-admin.dto';
import { UserAdmin } from 'src/user-admin/entities/user-admin.entity';
import { IsNull, Repository } from 'typeorm';
import { UserAdminService } from '../user-admin/user-admin.service';
import { RegisterAdminRequestDto } from './dto/register-admin.dto';
import { RefreshTokens } from './entities/refresh-tokens.entity';

interface IAuthenticatedResponse {
	access_token: string;
	refresh_token: string;
	expires_at: Date;
}

interface IGenRefreshToken {
	refreshToken: string;
	refreshTokenHash: string;
	expiresAt: Date;
}

interface IRotateRefreshToken {
	adminId: string;
	refreshToken: string;
	expiresAt: Date;
}

@Injectable()
export class AuthService {
	constructor(
		@InjectRepository(RefreshTokens)
		private readonly refreshTokenRepo: Repository<RefreshTokens>,
		private readonly userAdminService: UserAdminService,
		private readonly jwtService: JwtService,
		private readonly configService: ConfigService,
		@InjectPinoLogger(AuthService.name) private readonly logger: PinoLogger,
	) {}

	private get REFRESH_TTL_MS(): number {
		return Number(
			this.configService.get('REFRESH_TOKEN_EXPIRATION_MS') ??
				1000 * 60 * 60 * 24 * 7,
		);
	}

	private async issueRefreshToken(): Promise<IGenRefreshToken> {
		try {
			const refreshToken = randomBytes(32).toString('base64url'); // 256-bit
			const refreshTokenHash = await bcrypt.hash(refreshToken, 10);
			const expiresAt = new Date(Date.now() + this.REFRESH_TTL_MS);

			return {
				refreshToken: refreshToken,
				refreshTokenHash: refreshTokenHash,
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

	async login(admin: UserAdmin): Promise<IAuthenticatedResponse> {
		try {
			const accessToken = await this.issueAccessToken(admin.id);

			const { refreshToken, refreshTokenHash, expiresAt } =
				await this.issueRefreshToken();
			await this.refreshTokenRepo.save({
				adminId: admin.id,
				tokenHash: refreshTokenHash,
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

	async verifyAndRotateRefresh(
		refreshToken: string,
	): Promise<IRotateRefreshToken> {
		if (!refreshToken)
			throw new UnauthorizedException('AUTH.MISSING_REFRESH');

		try {
			const rows = await this.refreshTokenRepo.find({
				where: { revokedAt: IsNull() },
			});

			let match: RefreshTokens | undefined;
			for (const row of rows) {
				if (await bcrypt.compare(refreshToken, row.tokenHash)) {
					match = row;
					break;
				}
			}

			if (!match) throw new UnauthorizedException('AUTH.INVALID_REFRESH');

			await this.refreshTokenRepo.update(
				{ id: match.id },
				{ revokedAt: new Date() },
			);

			const {
				refreshToken: newRefreshToken,
				refreshTokenHash,
				expiresAt,
			} = await this.issueRefreshToken();

			await this.refreshTokenRepo.save({
				adminId: match.adminId,
				tokenHash: refreshTokenHash,
				expiresAt: expiresAt,
			});

			return {
				adminId: match.adminId,
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
