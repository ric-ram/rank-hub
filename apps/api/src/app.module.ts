import { AchievementModule } from './achievements/achievement.module';
import { ApiKeyModule } from './api_keys/api_key.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { GameModule } from './games/game.module';
import { GlobalHttpExceptionFilter } from './common/filters/http-exception.filter';
import { LeaderboardEntryModule } from './leaderboard_entry/leaderboard_entry.module';
import { LeaderboardModule } from './leaderboards/leaderboard.module';
import { LoggerModule } from 'nestjs-pino';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Module } from '@nestjs/common';
import { PlayerAchievementModule } from './player_achievement/player_achievement.module';
import { PlayerModule } from './players/player.module';
import { ScoreModule } from './score/score.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserAdminModule } from './user-admin/user-admin.module';
import { dataSourceOptions } from 'db/datasource';

@Module({
	imports: [
		LoggerModule.forRoot({
			pinoHttp: {
				autoLogging: false,
				redact: {
					paths: [
						'req.headers.authorization',
						'req.headers.cookie',
						'req.body.password',
						'req.body.passwordHash',
						'req.body.key',
						'req.body.keyHash',
						'req.headers["set-cookie"]',
					],
					remove: true,
				},
				transport:
					process.env.NODE_ENV === 'development'
						? {
								target: 'pino-pretty',
								options: {
									singleLine: true,
									translateTime: 'SYS:standard',
								},
							}
						: undefined,
				serializers: {
					req(req: any) {
						return {
							id: req.requestId,
							method: req.method,
							url: req.url,
							params: req.params,
							query: req.query,
						};
					},
					res(res: any) {
						return { statusCode: res.statusCode };
					},
				},
			},
		}),
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
	providers: [AppService, LoggingInterceptor, GlobalHttpExceptionFilter],
	exports: [LoggingInterceptor, GlobalHttpExceptionFilter],
})
export class AppModule {}
