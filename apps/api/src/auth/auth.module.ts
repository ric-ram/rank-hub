import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './strategy/jwt.strategy';
import { LocalStrategy } from './strategy/local.strategy';
import { Module } from '@nestjs/common';
import { UserAdminModule } from 'src/user-admin/user-admin.module';
import { config } from 'dotenv';
import path from 'node:path';

config({ path: path.resolve(__dirname, '../../../../.env') });

@Module({
	imports: [
		UserAdminModule,
		JwtModule.registerAsync({
			useFactory: (configService: ConfigService) => ({
				secret: configService.get<string>('JWT_SECRET'),
				signOptions: {
					expiresIn: Number.parseInt(
						configService.getOrThrow<string>(
							'ACCESS_TOKEN_VALIDITY_DURATION_IN_SEC',
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
