import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateScoreDto {
	@IsString()
	@IsNotEmpty()
	value: string;

	@IsOptional()
	metadata?: Record<string, any>;
}
