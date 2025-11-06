/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { ExtractJwt, Strategy } from 'passport-jwt';

import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { AccessTokenPayload } from '../types/AccessTokenPayload';

/**
 * JWT strategy for validating access tokens from the Authorization Bearer header.
 * Validates signature/exp/iss/aud and exposes a minimal user object on req.user.
 *
 * @export
 * @class JwtStrategy
 * @typedef {JwtStrategy}
 * @extends {PassportStrategy(Strategy)}
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
	/**
	 * Creates an instance of JwtStrategy.
	 *
	 * @constructor
	 * @param {ConfigService} configService
	 */
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

	/**
	 * Map a validated JWT payload to the object exposed as `req.user`.
	 *
	 * @param {AccessTokenPayload} payload
	 * @returns {{ sub: any; role: any; }}
	 */
	validate(payload: AccessTokenPayload) {
		return {
			sub: payload.sub,
			role: payload.role ?? 'ADMIN',
		};
	}
}
