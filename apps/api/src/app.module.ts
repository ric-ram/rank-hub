import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { LoggerModule } from 'nestjs-pino';
import { AchievementModule } from './achievements/achievement.module';
import { ApiKeyModule } from './api_keys/api_key.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { JwtGuard } from './auth/guards/jwt.guard';
import { GlobalHttpExceptionFilter } from './common/filters/http-exception.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { GameModule } from './games/game.module';
import { LeaderboardEntryModule } from './leaderboard_entry/leaderboard_entry.module';
import { LeaderboardModule } from './leaderboards/leaderboard.module';
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { dataSourceOptions } from 'db/datasource';
import { PlayerAchievementModule } from './player_achievement/player_achievement.module';
import { PlayerModule } from './players/player.module';
import { ScoreModule } from './score/score.module';
import { UserAdminModule } from './user-admin/user-admin.module';

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
					process.env.NODE_ENV === 'development' // TODO: when in production remove coloring so, if implemented, aggregators can parse.
						? {
								target: 'pino-pretty',
								options: {
									colorize: true,
									levelFirst: true,
									translateTime: 'SYS:HH:MM:ss.l',
									singleLine: true,
									messageFormat: '{context} {msg}',
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
		AuthModule,
	],
	controllers: [AppController],
	providers: [
		AppService,
		LoggingInterceptor,
		GlobalHttpExceptionFilter,
		{
			provide: APP_GUARD,
			useClass: JwtGuard,
		},
	],
	exports: [LoggingInterceptor, GlobalHttpExceptionFilter],
})
export class AppModule {}
