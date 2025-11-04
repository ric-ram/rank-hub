import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

import { AccessToken } from '../types/AccessToken';

export type LoginAdminResponseDto = AccessToken;

export class LoginAdminRequestDto {
	@IsNotEmpty()
	@IsEmail()
	email!: string;

	@IsNotEmpty()
	@IsString()
	@MinLength(8)
	password!: string;
}
