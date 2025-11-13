import { Module } from '@nestjs/common';
import { PlayerAchievement } from './entities/player_achievements.entity';
import { PlayerAchievementController } from './player_achievements.controller';
import { PlayerAchievementService } from './player_achievements.service';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
	imports: [TypeOrmModule.forFeature([PlayerAchievement])],
	controllers: [PlayerAchievementController],
	providers: [PlayerAchievementService],
})
export class PlayerAchievementModule {}
