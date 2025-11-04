import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

import { AccessToken } from '../types/AccessToken';

export class RegisterAdminRequestDto {
	@IsNotEmpty()
	@IsEmail()
	email!: string;

	@IsNotEmpty()
	@IsString()
	@MinLength(8)
	password!: string;
}

export type RegisterResponseDTO = AccessToken;
