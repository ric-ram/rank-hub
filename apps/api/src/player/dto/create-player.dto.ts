import { IsEmail, IsOptional, IsString } from 'class-validator';

export class CreatePlayerDto {
	@IsString()
	username: string;

	@IsOptional()
	@IsEmail()
	email?: string;

	@IsOptional()
	metadata?: Record<string, any>;
}
