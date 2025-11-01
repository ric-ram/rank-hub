import { Achievement } from './entities/achievement.entity';
import { AchievementController } from './achievement.controller';
import { AchievementService } from './achievement.service';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
	imports: [TypeOrmModule.forFeature([Achievement])],
	controllers: [AchievementController],
	providers: [AchievementService],
})
export class AchievementModule {}
