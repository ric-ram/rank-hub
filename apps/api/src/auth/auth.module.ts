import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './strategy/jwt.strategy';
import { LocalStrategy } from './strategy/local.strategy';
import { Module } from '@nestjs/common';
import { RefreshTokens } from './entities/refresh-tokens.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserAdminModule } from 'src/users-admin/users-admin.module';
import { config } from 'dotenv';
import path from 'node:path';

config({ path: path.resolve(__dirname, '../../../../.env') });

@Module({
	imports: [
		UserAdminModule,
		TypeOrmModule.forFeature([RefreshTokens]),
		JwtModule.registerAsync({
			useFactory: (configService: ConfigService) => ({
				secret: configService.get<string>('JWT_SECRET'),
				signOptions: {
					expiresIn: Number.parseInt(
						configService.getOrThrow<string>(
							'ACCESS_TOKEN_EXPIRATION_MS',
						),
					),
				},
			}),
			inject: [ConfigService],
		}),
	],
	controllers: [AuthController],
	providers: [AuthService, LocalStrategy, JwtStrategy],
	exports: [AuthService, JwtModule],
})
export class AuthModule {}
