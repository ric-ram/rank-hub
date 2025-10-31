import { AppModule } from './app.module';
import { CorrelationMiddleware } from './common/middleware/correlation-id.middleware';
import { GlobalHttpExceptionFilter } from './common/filters/http-exception.filter';
import { Logger } from 'nestjs-pino';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import { json } from 'express';

async function bootstrap() {
	const app = await NestFactory.create(AppModule, { bufferLogs: true });
	app.useLogger(app.get(Logger));

	// Security + body limits
	app.use(helmet());
	app.use(json({ limit: 'imb' }));

	// Correlation ID before anything else
	// eslint-disable-next-line @typescript-eslint/unbound-method
	app.use(new CorrelationMiddleware().use as any);

	// Global DTO validation
	app.useGlobalPipes(
		new ValidationPipe({
			whitelist: true,
			forbidNonWhitelisted: true,
			transform: true,
			transformOptions: { enableImplicitConversion: true },
			stopAtFirstError: true,
		}),
	);

	// Global logging & global error shape
	app.useGlobalInterceptors(app.get(LoggingInterceptor));
	app.useGlobalFilters(app.get(GlobalHttpExceptionFilter));

	await app.listen(process.env.PORT ?? 3001);
}
bootstrap();
