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
	],
	controllers: [AppController],
	providers: [AppService],
})
export class AppModule {}
