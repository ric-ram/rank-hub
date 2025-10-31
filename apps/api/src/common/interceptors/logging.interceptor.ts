/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
	CallHandler,
	ExecutionContext,
	Injectable,
	NestInterceptor,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';

import { PinoLogger } from 'nestjs-pino';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
	constructor(private readonly logger: PinoLogger) {}

	intercept(
		context: ExecutionContext,
		next: CallHandler<any>,
	): Observable<any> | Promise<Observable<any>> {
		const now = Date.now();
		const req = context
			.switchToHttp()
			.getRequest<Request & { requestId?: string; user?: any }>();
		const res = context.switchToHttp().getResponse();

		const payload = {
			requestId: (req as any)?.requestId,
			method: (req as any)?.method,
			url: (req as any)?.url,
			userId: (req as any)?.user?.sub ?? (req as any)?.user?.id ?? null,
			ip: (req as any)?.ip,
		};

		this.logger.info({ msg: 'request_start', ...payload });

		return next.handle().pipe(
			tap({
				next: () => {
					this.logger.info({
						msg: 'request_end',
						...payload,
						statusCode: res?.statusCode,
						durationMs: Date.now() - now,
					});
				},
				error: (err) => {
					this.logger.error({
						msg: 'request_error',
						...payload,
						statusCode: res?.statusCode ?? 500,
						durationMs: Date.now() - now,
						errorName: err?.name,
						errorMessage: err?.message,
					});
				},
			}),
		);
	}
}
