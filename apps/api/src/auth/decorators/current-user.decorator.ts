import { ExecutionContext, createParamDecorator } from '@nestjs/common';

import { AccessTokenPayload } from '../types/AccessTokenPayload';

/**
 * Parameter decorator that injects the current admin's UUID from the validated JWT.
 *
 * Reads `req.user.sub` (set by the `JwtStrategy`) and returns it as a `string`.
 * If the request is not authenticated or the payload is missing, returns `undefined`.
 *
 * @example
 * @UseGuards(AuthGuard('jwt'))
 * create(@CurrentAdminId() adminId: string) { ... }
 *
 * @param _ - Unused data parameter (required by Nest's decorator signature).
 * @param {ExecutionContext} ctx - Execution context used to access the HTTP request.
 * @returns {string | undefined} The admin UUID (subject) from the access token, or `undefined`.
 *
 * @remarks
 * - Requires `AuthGuard('jwt')` to run **before** parameter resolution so that `req.user`
 *   is populated by the `JwtStrategy.validate()` method.
 * - The `AccessTokenPayload` must include a `sub: string` field.
 */
export const CurrentAdminId = createParamDecorator(
	(_, ctx: ExecutionContext): string | undefined => {
		const req = ctx
			.switchToHttp()
			.getRequest<Request & { user?: AccessTokenPayload }>();
		const sub = req.user?.sub;
		return typeof sub === 'string' ? sub : undefined;
	},
);
