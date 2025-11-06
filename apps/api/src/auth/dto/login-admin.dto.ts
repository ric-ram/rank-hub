import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

import { AccessToken } from '../types/AccessToken';

/**
 * DTO for the response to a login request
 *
 * @export
 * @typedef {LoginAdminResponseDto}
 */
export type LoginAdminResponseDto = AccessToken;

/**
 * DTO object for a login request
 *
 * @export
 * @class LoginAdminRequestDto
 * @typedef {LoginAdminRequestDto}
 */
export class LoginAdminRequestDto {
	@IsNotEmpty()
	@IsEmail()
	email!: string;

	@IsNotEmpty()
	@IsString()
	@MinLength(8)
	password!: string;
}
