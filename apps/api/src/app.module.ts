import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { dataSourceOptions } from 'db/datasource';
import { UserAdminModule } from './user-admin/user-admin.module';
import { GameModule } from './game/game.module';
import { ApiKeyModule } from './api_key/api_key.module';
import { PlayerModule } from './player/player.module';
import { LeaderboardModule } from './leaderboard/leaderboard.module';
import { ScoreModule } from './score/score.module';
import { LeaderboardEntryModule } from './leaderboard_entry/leaderboard_entry.module';
import { AchievementModule } from './achievement/achievement.module';
import { PlayerAchievementModule } from './player_achievement/player_achievement.module';

@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true,
		}),
		TypeOrmModule.forRoot(dataSourceOptions),
		UserAdminModule,
		GameModule,
		ApiKeyModule,
		PlayerModule,
		LeaderboardModule,
		ScoreModule,
		LeaderboardEntryModule,
		AchievementModule,
		PlayerAchievementModule,
	],
	controllers: [AppController],
	providers: [AppService],
})
export class AppModule {}
