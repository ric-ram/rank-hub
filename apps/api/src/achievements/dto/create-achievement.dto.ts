import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateAchievementDto {
	@IsString()
	@IsNotEmpty()
	key: string;

	@IsString()
	@IsNotEmpty()
	title: string;

	@IsString()
	@IsNotEmpty()
	description: string;

	@IsOptional()
	metadata?: Record<string, any>;
}
