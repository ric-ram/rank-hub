import { COOKIE_OPTS, REFRESH_COOKIE } from '../auth.controller';
import {
	CallHandler,
	ExecutionContext,
	Injectable,
	NestInterceptor,
} from '@nestjs/common';
import { Observable, catchError, throwError } from 'rxjs';

import { Response } from 'express';

@Injectable()
export class CookieErrorInterceptor implements NestInterceptor {
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
