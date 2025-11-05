import * as bcrypt from 'bcrypt';

import { BadRequestException, Injectable } from '@nestjs/common';

import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Logger } from 'nestjs-pino';
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
		private readonly logger: Logger,
	) {}

	private get REFRESH_TTL_MS(): number {
		return Number(
			this.configService.get('REFRESH_TOKEN_EXPIRATION_MS') ??
				1000 * 60 * 60 * 24 * 7,
		);
	}

	private async issueRefreshToken(): Promise<IGenRefreshToken> {
		const refreshToken = randomBytes(32).toString('base64url'); // 256-bit
		const refreshTokenHash = await bcrypt.hash(refreshToken, 10);
		const expiresAt = new Date(Date.now() + this.REFRESH_TTL_MS);

		return {
			refreshToken: refreshToken,
			refreshTokenHash: refreshTokenHash,
			expiresAt: expiresAt,
		};
	}

	async issueAccessToken(adminId: string): Promise<string> {
		const payload = { sub: adminId, role: 'ADMIN' };
		const accessToken = await this.jwtService.signAsync(payload, {
			issuer: 'rankhub.api',
			audience: 'rankhub.admin',
		});

		return accessToken;
	}

	async validateUser(email: string, password: string): Promise<UserAdmin> {
		const admin: UserAdmin | null =
			await this.userAdminService.findOneByEmail(email);
		if (!admin) {
			throw new BadRequestException('User not found!');
		}

		const isMatch: boolean = await bcrypt.compare(
			password,
			admin.passwordHash,
		);

		if (!isMatch) {
			throw new BadRequestException('Password do not match!');
		}

		return admin;
	}

	async login(admin: UserAdmin): Promise<IAuthenticatedResponse> {
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
	}

	async register(
		admin: RegisterAdminRequestDto,
	): Promise<IAuthenticatedResponse> {
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
	}

	async verifyAndRotateRefresh(
		refreshToken: string,
	): Promise<IRotateRefreshToken> {
		const rows = await this.refreshTokenRepo.find({
			where: { revokedAt: IsNull() },
		});

		this.logger.log(refreshToken);
		this.logger.log(rows);

		let match: RefreshTokens | undefined;
		for (const row of rows) {
			if (await bcrypt.compare(refreshToken, row.tokenHash)) {
				match = row;
				break;
			}
		}

		if (!match)
			throw new BadRequestException('Invalid or Expired Refresh Token');

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
	}

	async logout(adminId: string, refreshCookie?: string): Promise<void> {
		if (!refreshCookie) return;

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
	}

	async logoutAll(adminId: string): Promise<void> {
		const rows = await this.refreshTokenRepo.find({
			where: { adminId: adminId, revokedAt: IsNull() },
		});

		for (const row of rows) {
			await this.refreshTokenRepo.update(
				{ id: row.id },
				{ revokedAt: new Date() },
			);
		}
	}
}
