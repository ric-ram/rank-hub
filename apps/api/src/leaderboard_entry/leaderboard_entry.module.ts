import { LeaderboardEntry } from './entities/leaderboard_entry.entity';
import { LeaderboardEntryController } from './leaderboard_entry.controller';
import { LeaderboardEntryService } from './leaderboard_entry.service';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
	imports: [TypeOrmModule.forFeature([LeaderboardEntry])],
	controllers: [LeaderboardEntryController],
	providers: [LeaderboardEntryService],
})
export class LeaderboardEntryModule {}
