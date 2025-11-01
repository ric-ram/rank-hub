import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CreateUserAdminDto {
	@IsNotEmpty()
	@IsEmail()
	email!: string;

	@IsNotEmpty()
	@IsString()
	@MinLength(20)
	passwordHash!: string;
}
