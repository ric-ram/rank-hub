import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

import { randomUUID } from 'node:crypto';

export const REQUEST_ID_HEADER = 'x-request-id';

@Injectable()
export class CorrelationMiddleware implements NestMiddleware {
	use(
		req: Request & { requestId?: string },
		res: Response,
		next: NextFunction,
	) {
		const incoming = req.header(REQUEST_ID_HEADER);
		const requestId = incoming?.trim() ? incoming : randomUUID();

		req.requestId = requestId;
		res.setHeader(REQUEST_ID_HEADER, requestId);

		next();
	}
}
