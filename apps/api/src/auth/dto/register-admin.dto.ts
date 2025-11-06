import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

import { AccessToken } from '../types/AccessToken';

/**
 * DTO for the response to a register request
 *
 * @export
 * @typedef {RegisterResponseDTO}
 */
export type RegisterResponseDTO = AccessToken;

/**
 * DTO object for a register request
 *
 * @export
 * @class RegisterAdminRequestDto
 * @typedef {RegisterAdminRequestDto}
 */
export class RegisterAdminRequestDto {
	@IsNotEmpty()
	@IsEmail()
	email!: string;

	@IsNotEmpty()
	@IsString()
	@MinLength(8)
	password!: string;
}
