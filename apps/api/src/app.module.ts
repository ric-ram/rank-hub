import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true,
		}),
		TypeOrmModule.forRoot({
			type: 'postgres',
			host: process.env.DB_HOST ?? 'db',
			port: Number(process.env.DB_PORT ?? 5432),
			username: process.env.DB_USERNAME,
			password: process.env.DB_PASSWORD,
			database: process.env.DB_NAME,
			entities: [],
			synchronize: true,
			logging: true,
		}),
	],
	controllers: [AppController],
	providers: [AppService],
})
export class AppModule {}
