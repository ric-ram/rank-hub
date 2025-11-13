import { Achievement } from './entities/achievements.entity';
import { AchievementController } from './achievements.controller';
import { AchievementService } from './achievements.service';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
	imports: [TypeOrmModule.forFeature([Achievement])],
	controllers: [AchievementController],
	providers: [AchievementService],
})
export class AchievementModule {}
