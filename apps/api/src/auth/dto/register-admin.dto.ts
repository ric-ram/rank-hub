import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO for the response to a register request
 *
 * @export
 * @typedef {RegisterResponseDTO}
 */
export class RegisterResponseDTO {
	@ApiProperty({ example: 'eyJhbGciOiJI...' })
	access_token: string;
}

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
	@ApiProperty({ example: 'admin@rankhub.dev' })
	email!: string;

	@IsNotEmpty()
	@IsString()
	@MinLength(8)
	@ApiProperty({ example: 'Str0ngP@ss!', minLength: 8 })
	password!: string;
}
