import * as bcrypt from 'bcrypt';

import { BadRequestException, Injectable } from '@nestjs/common';

import { AccessToken } from './types/AccessToken';
import { CreateUserAdminDto } from 'src/user-admin/dto/create-user-admin.dto';
import { JwtService } from '@nestjs/jwt';
import { RegisterAdminRequestDto } from './entities/register-admin.dto';
import { UserAdmin } from 'src/user-admin/entities/user-admin.entity';
import { UserAdminService } from '../user-admin/user-admin.service';

@Injectable()
export class AuthService {
	constructor(
		private readonly userAdminService: UserAdminService,
		private readonly jwtService: JwtService,
	) {}

	async validateUser(
		email: string,
		passwordHash: string,
	): Promise<UserAdmin> {
		const admin: UserAdmin | null =
			await this.userAdminService.findOneByEmail(email);
		if (!admin) {
			throw new BadRequestException('User not found!');
		}

		const isMatch: boolean = bcrypt.compareSync(
			passwordHash,
			admin.passwordHash,
		);
		if (!isMatch) {
			throw new BadRequestException('Password do not match!');
		}

		return admin;
	}

	async login(admin: UserAdmin): Promise<AccessToken> {
		const payload = { email: admin.email, id: admin.id };
		const token = await this.jwtService.signAsync(payload);
		return { access_token: token };
	}

	async register(admin: RegisterAdminRequestDto): Promise<AccessToken> {
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
		await this.userAdminService.create(newAdmin);
		return this.login(newAdmin as UserAdmin);
	}
}
