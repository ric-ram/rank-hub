import { ExecutionContext, Injectable } from '@nestjs/common';

import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';

/**
 * JWT guard that honors the `@Public()` decorator.
 *
 * If a handler/class is marked public via `SetMetadata('isPublic', true)`,
 * this guard short-circuits and allows the request without JWT validation.
 * Otherwise, it defers to the default Passport `'jwt'` strategy.
 *
 * @export
 * @class JwtGuard
 * @typedef {JwtGuard}
 * @extends {AuthGuard('jwt')}
 *
 * @remarks
 * - Attach globally (app-wide) or at the controller level.
 * - Use `@Public()` on routes that must bypass authentication (e.g., login, refresh).
 */
@Injectable()
export class JwtGuard extends AuthGuard('jwt') {
	/**
	 * Creates an instance of JwtGuard.
	 *
	 * @constructor
	 * @param {Reflector} reflector
	 */
	constructor(private readonly reflector: Reflector) {
		super();
	}

	/**
	 * Decide whether the current request can proceed.
	 *
	 * Checks for `isPublic` metadata (set by `@Public()`). If present, skips JWT auth.
	 * Otherwise, invokes the base `AuthGuard('jwt')` logic to validate the access token.
	 *
	 * @param {ExecutionContext} context
	 * @returns {*}
	 */
	canActivate(context: ExecutionContext) {
		const isPublic = this.reflector.getAllAndOverride<boolean>('isPublic', [
			context.getHandler(),
			context.getClass(),
		]);

		if (isPublic) return true;

		return super.canActivate(context);
	}
}
