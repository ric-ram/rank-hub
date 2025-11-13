import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe, VersioningType } from '@nestjs/common';

import { AppModule } from './app.module';
import { CorrelationMiddleware } from './common/middleware/correlation-id.middleware';
import { GlobalHttpExceptionFilter } from './common/filters/http-exception.filter';
import { Logger } from 'nestjs-pino';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { NestFactory } from '@nestjs/core';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { json } from 'express';

async function bootstrap() {
	const app = await NestFactory.create(AppModule, { bufferLogs: true });
	app.useLogger(app.get(Logger));

	// Security + body limits
	app.use(helmet());
	app.use(json({ limit: 'imb' }));

	app.use(cookieParser());

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

	app.setGlobalPrefix('api', {});
	app.enableVersioning({
		type: VersioningType.URI,
		defaultVersion: '1',
	});

	// Swagger config
	const config = new DocumentBuilder()
		.setTitle('RankhHub api')
		.setDescription('Admin + Game Leaderboards API')
		.setVersion('1.0.0')
		.addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' })
		.addCookieAuth('refresh_token', { type: 'apiKey', in: 'cookie' })
		.build();
	const documentFactory = () => SwaggerModule.createDocument(app, config);
	SwaggerModule.setup('api', app, documentFactory);

	await app.listen(process.env.PORT ?? 3001);
}
bootstrap();
