import 'reflect-metadata';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { RequestIdInterceptor } from './common/interceptors/request-id.interceptor';
import { loadEnv } from './config/env';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ZodExceptionFilter } from './common/filters/zod-exception.filter';

async function bootstrap() {
  loadEnv();
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  app.setGlobalPrefix('api/v1');
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true, forbidUnknownValues: true }));
  app.useGlobalFilters(new ZodExceptionFilter(), new HttpExceptionFilter());
  app.useGlobalInterceptors(app.get(RequestIdInterceptor));
  const swaggerConfig = new DocumentBuilder().setTitle('Bible Platform API').setDescription('Versioned REST API for the Bible Platform').setVersion('1.8.0').addBearerAuth().build();
  SwaggerModule.setup('api/docs', app, SwaggerModule.createDocument(app, swaggerConfig));
  app.enableShutdownHooks();
  await app.listen(Number(process.env.PORT ?? 4000), '0.0.0.0');
}
bootstrap();
