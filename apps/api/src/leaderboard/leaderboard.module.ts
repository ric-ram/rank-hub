import { Leaderboard } from './entities/leaderboard.entity';
import { LeaderboardController } from './leaderboard.controller';
import { LeaderboardService } from './leaderboard.service';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
	imports: [TypeOrmModule.forFeature([Leaderboard])],
	controllers: [LeaderboardController],
	providers: [LeaderboardService],
})
export class LeaderboardModule {}
