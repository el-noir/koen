import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { validateEnvironment } from './config/validate-env';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  validateEnvironment();
  const app = await NestFactory.create(AppModule);

  // ── CORS ───────────────────────────────────────────────────────────────────
  app.enableCors({
    origin: [process.env.FRONTEND_URL || 'http://localhost:3000', 'http://localhost:3001'],
    credentials: true,
  });

  // ── Global Prefix ──────────────────────────────────────────────────────────
  app.setGlobalPrefix('api');

  // ── Global Pipes ───────────────────────────────────────────────────────────
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // ── Global Filters & Interceptors ──────────────────────────────────────────
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new TransformInterceptor());

  // ── Swagger ────────────────────────────────────────────────────────────────
  const config = new DocumentBuilder()
    .setTitle('KOEN API')
    .setDescription('Voice-first job site assistant — Stage 1 API')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // ── Listen ─────────────────────────────────────────────────────────────────
  const port = process.env.PORT || 4000;
  await app.listen(port);
}

bootstrap().catch((error: unknown) => {
  const logger = new Logger('Bootstrap');
  logger.error(
    error instanceof Error ? error.message : 'Failed to start KOEN API.',
    error instanceof Error ? error.stack : undefined,
  );
  process.exit(1);
});
