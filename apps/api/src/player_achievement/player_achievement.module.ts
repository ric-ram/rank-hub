import { Module } from '@nestjs/common';
import { PlayerAchievement } from './entities/player_achievement.entity';
import { PlayerAchievementController } from './player_achievement.controller';
import { PlayerAchievementService } from './player_achievement.service';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
	imports: [TypeOrmModule.forFeature([PlayerAchievement])],
	controllers: [PlayerAchievementController],
	providers: [PlayerAchievementService],
})
export class PlayerAchievementModule {}
