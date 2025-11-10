import { IsNotEmpty, IsString, Matches } from 'class-validator';

export class CreateGameDto {
	@IsNotEmpty()
	@IsString()
	name: string;

	@IsNotEmpty()
	@IsString()
	@Matches(/^[A-Z0-9_]{3,12}$/)
	shortCode: string;
}
