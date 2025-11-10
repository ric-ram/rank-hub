import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO for the response to a login request
 *
 * @export
 * @typedef {LoginAdminResponseDto}
 */
export class LoginAdminResponseDto {
	@ApiProperty({ example: 'eyJhbGciOiJI...' })
	access_token: string;
}

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
	@ApiProperty({ example: 'admin@rankhub.dev' })
	email!: string;

	@IsNotEmpty()
	@IsString()
	@MinLength(8)
	@ApiProperty({ example: 'admin123', minLength: 8 })
	password!: string;
}
