import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateLeaderboardEntryDto {
	@IsString()
	@IsNotEmpty()
	bestValue: string;

	@IsInt()
	@IsOptional()
	rank?: number;
}
