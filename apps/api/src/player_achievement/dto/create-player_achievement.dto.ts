import { IsOptional, IsUUID } from 'class-validator';

export class CreatePlayerAchievementDto {
	@IsUUID()
	achievementId: string;

	@IsOptional()
	metadata?: Record<string, any>;
}
