// src/main.ts
import { NestFactory, Reflector } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { JwtAuthGuard } from './modules/auth/guards/jwt-auth.guard';
import { HttpExceptionLogFilter } from './common/filters/http-exception-log.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Validation global
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
    transformOptions: { enableImplicitConversion: true },
  }));

  // CORS
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  });

  // Global JWT Guard: mọi route mặc định cần JWT, trừ khi @Public()
  const reflector = app.get(Reflector);
  app.useGlobalGuards(new JwtAuthGuard(reflector));
  app.useGlobalFilters(new HttpExceptionLogFilter());

  // Swagger
  const config = new DocumentBuilder()
    .setTitle('BookSwap Community API')
    .setDescription('API documentation for BookSwap - A book exchange social platform')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        in: 'header',
        description: 'Enter JWT token (without "Bearer " prefix)',
      },
      'bearer', // ← ĐỔI TỪ 'JWT-auth' THÀNH 'bearer'
    )
    .addTag('Authentication', 'User authentication endpoints')
    .addTag('Users', 'User management endpoints')
    .addTag('Books', 'Book management endpoints')
    .addTag('Personal Library', 'Personal library and wanted books')
    .addTag('Exchanges', 'Book exchange endpoints')
    .addTag('Messages', 'Messaging system endpoints')
    .addTag('Reviews', 'Review and rating endpoints')
    .addTag('Admin', 'Admin management endpoints')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
  });

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`🚀 http://localhost:${port}`);
  console.log(`📚 Swagger: http://localhost:${port}/api/docs`);
}

bootstrap();