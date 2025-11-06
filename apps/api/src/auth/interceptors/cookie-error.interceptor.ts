import {
	CallHandler,
	ExecutionContext,
	Injectable,
	NestInterceptor,
} from '@nestjs/common';
import { Observable, catchError, throwError } from 'rxjs';
import { COOKIE_OPTS, REFRESH_COOKIE } from '../auth.controller';

import { Response } from 'express';

/**
 * Clears the refresh cookie when any auth handler throws, ensuring no stale tokens remain client-side.
 * Controller-scoped to /auth routes.
 *
 * @export
 * @class CookieErrorInterceptor
 * @typedef {CookieErrorInterceptor}
 * @implements {NestInterceptor}
 */
@Injectable()
export class CookieErrorInterceptor implements NestInterceptor {
	/**
	 * @override
	 * Clears the refresh cookie on error, then rethrows.
	 * @see NestInterceptor#intercept
	 *
	 * @param {ExecutionContext} context
	 * @param {CallHandler<any>} next
	 * @returns {(Observable<any> | Promise<Observable<any>>)}
	 */
	intercept(
		context: ExecutionContext,
		next: CallHandler<any>,
	): Observable<any> | Promise<Observable<any>> {
		const res = context.switchToHttp().getResponse<Response>();

		return next.handle().pipe(
			catchError((err) => {
				try {
					if (!res.headersSent) {
						res.clearCookie(REFRESH_COOKIE, COOKIE_OPTS);
					}
				} catch {
					// ignore failures to clear
				}
				return throwError(() => err as Error);
			}),
		);
	}
}
