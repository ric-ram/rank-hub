import { DataSource, DataSourceOptions } from 'typeorm';

import { ConfigService } from '@nestjs/config';
import { config } from 'dotenv';
import path from 'path';

config({ path: path.resolve(__dirname, '../../../.env') });

const configService = new ConfigService();

export const dataSourceOptions: DataSourceOptions = {
	// @ts-expect-error // TypeORM expects predefined strings for type
	type: configService.getOrThrow<string>('DB_TYPE'),
	host: configService.getOrThrow<string>('DB_HOST'),
	port: configService.getOrThrow<number>('DB_PORT'),
	username: configService.getOrThrow<string>('DB_USERNAME'),
	password: configService.getOrThrow<string>('DB_PASSWORD'),
	database: configService.getOrThrow<string>('DB_NAME'),
	entities: ['dist/**/*.entity.js'],
	migrations: ['dist/db/migrations/*.ts'],
	migrationsTableName: 'migrations',
	migrationsRun: false,
	synchronize: process.env.ENV !== 'prod',
	logging: process.env.ENV !== 'prod',
	extra: {
		connectionLimit: 10,
	},
};

const dataSource = new DataSource(dataSourceOptions);

export default dataSource;
