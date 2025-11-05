/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { ExtractJwt, Strategy } from 'passport-jwt';

import { AccessTokenPayload } from '../types/AccessTokenPayload';
import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
	constructor(private readonly configService: ConfigService) {
		super({
			// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			ignoreExpiration: false,
			secretOrKey: configService.getOrThrow<string>('JWT_SECRET'),
			issuer: configService.get<string>('JWT_ISSUER') ?? 'rankhub.api',
			audience:
				configService.get<string>('JWT_AUDIENCE') ?? 'rankhub.admin',
			algorithms: ['HS256'],
			clockTolerance: 5,
		});
	}

	validate(payload: AccessTokenPayload) {
		return {
			sub: payload.sub,
			role: payload.role ?? 'ADMIN',
		};
	}
}
