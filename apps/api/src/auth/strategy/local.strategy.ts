import {
	HttpException,
	Injectable,
	UnauthorizedException,
} from '@nestjs/common';

import { PassportStrategy } from '@nestjs/passport';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { Strategy } from 'passport-local';
import { UserAdmin } from 'src/users-admin/entities/users-admin.entity';
import { AuthService } from '../auth.service';

/**
 * Local strategy for email/password authentication.
 * Validates credentials via AuthService.validateUser and injects the user for the controller.
 *
 * @export
 * @class LocalStrategy
 * @typedef {LocalStrategy}
 * @extends {PassportStrategy(Strategy)}
 */
@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
	/**
	 * Creates an instance of LocalStrategy.
	 *
	 * @constructor
	 * @param {AuthService} authService
	 * @param {logger} logger
	 */
	constructor(
		private readonly authService: AuthService,
		@InjectPinoLogger(AuthService.name) private readonly logger: PinoLogger,
	) {
		super({
			usernameField: 'email',
		});
	}

	/**
	 * Map a validated JWT payload to the object exposed as `req.user`.
	 *
	 * @async
	 * @param {string} email Admin email
	 * @param {string} password Admin password
	 * @returns {Promise<UserAdmin>}
	 * @throws {UnauthorizedException} Invalid user information.
	 */
	async validate(email: string, password: string): Promise<UserAdmin> {
		try {
			const user = await this.authService.validateUser(email, password);
			if (!user) {
				throw new UnauthorizedException('AUTH.USER_UNAUTHORIZED');
			}
			return user;
		} catch (e: any) {
			this.logger.error(
				{
					err: (e as Error)?.message,
					code: 'AUTH.VALIDATE_USER',
				},
				'user validation failed',
			);
			if (e instanceof HttpException) throw e;
			throw new UnauthorizedException('AUTH.USER_UNAUTHORIZED');
		}
	}
}
