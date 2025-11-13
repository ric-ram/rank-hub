import { Leaderboard } from './entities/leaderboards.entity';
import { LeaderboardController } from './leaderboards.controller';
import { LeaderboardService } from './leaderboards.service';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
	imports: [TypeOrmModule.forFeature([Leaderboard])],
	controllers: [LeaderboardController],
	providers: [LeaderboardService],
})
export class LeaderboardModule {}
