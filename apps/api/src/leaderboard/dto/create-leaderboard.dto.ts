import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateLeaderboardDto {
	@IsString()
	@IsNotEmpty()
	name: string;

	@IsString()
	@IsNotEmpty()
	metricType: string;

	@IsString()
	@IsNotEmpty()
	orderDir: string;

	@IsOptional()
	@IsBoolean()
	isDefault?: boolean;
}
