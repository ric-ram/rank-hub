import { APP_GUARD } from '@nestjs/core';
import { AchievementModule } from './achievements/achievements.module';
import { ApiKeyModule } from './api_keys/api_keys.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { GameModule } from './games/games.module';
import { GlobalHttpExceptionFilter } from './common/filters/http-exception.filter';
import { JwtGuard } from './auth/guards/jwt.guard';
import { LeaderboardEntryModule } from './leaderboard_entries/leaderboard_entries.module';
import { LeaderboardModule } from './leaderboards/leaderboards.module';
import { LoggerModule } from 'nestjs-pino';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Module } from '@nestjs/common';
import { PlayerAchievementModule } from './player_achievements/player_achievements.module';
import { PlayerModule } from './players/players.module';
import { ScoreModule } from './scores/scores.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserAdminModule } from './users-admin/users-admin.module';
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
