import { LeaderboardEntry } from './entities/leaderboard_entries.entity';
import { LeaderboardEntryController } from './leaderboard_entries.controller';
import { LeaderboardEntryService } from './leaderboard_entries.service';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
	imports: [TypeOrmModule.forFeature([LeaderboardEntry])],
	controllers: [LeaderboardEntryController],
	providers: [LeaderboardEntryService],
})
export class LeaderboardEntryModule {}
