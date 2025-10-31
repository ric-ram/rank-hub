/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
	ArgumentsHost,
	Catch,
	ExceptionFilter,
	HttpException,
	HttpStatus,
} from '@nestjs/common';

import { PinoLogger } from 'nestjs-pino';
import { toSnakeUpper } from 'src/utils/text-manipulation';

@Catch()
export class GlobalHttpExceptionFilter implements ExceptionFilter {
	constructor(private readonly logger: PinoLogger) {}

	catch(exception: any, host: ArgumentsHost) {
		const ctx = host.switchToHttp();
		const req = ctx.getRequest<Request & { requestId?: string }>();
		const res = ctx.getResponse();

		let status = HttpStatus.INTERNAL_SERVER_ERROR;
		let code = 'INTERNAL_ERROR';
		let message = 'Unexpected error';
		let details: any = undefined;

		if (exception instanceof HttpException) {
			status = exception.getStatus();
			const response = exception.getResponse();

			const explicitCode =
				typeof response === 'object' &&
				response &&
				(response as any).code;

			if (explicitCode && typeof explicitCode === 'string') {
				code = explicitCode;
			} else {
				const rawName =
					((exception as any)?.constructor?.name as string) ||
					exception.name ||
					'HttpException';
				const base = rawName.replace(/Exception$/i, '_Exception');
				code = toSnakeUpper(base);
			}

			if (typeof response === 'string') {
				message = response;
			} else if (response && typeof response === 'object') {
				const r: any = response;
				message = r.message || message;

				if (Array.isArray(r.message)) {
					details = r.message;
				} else if (Array.isArray(r.errors)) {
					details = r.error;
				}
			}
		}

		this.logger.warn({
			msg: 'http_exception',
			requestId: (req as any)?.requestId,
			method: (req as any)?.method,
			url: (req as any)?.url,
			status,
			code,
			message,
		});

		// eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call
		return res.status(status).json({
			error: {
				status,
				code,
				message,
				details,
				requestId: (req as any)?.requestId,
			},
		});
	}
}
