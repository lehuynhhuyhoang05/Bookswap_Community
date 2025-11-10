// src/main.ts
import { NestFactory, Reflector } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { JwtAuthGuard } from './modules/auth/guards/jwt-auth.guard';
import { HttpExceptionLogFilter } from './common/filters/http-exception-log.filter';
import { TimeoutInterceptor } from './common/interceptors/timeout.interceptor'; // ← THÊM

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
  origin: true,
    credentials: true,
  });

  // Global JWT Guard: mọi route mặc định cần JWT, trừ khi @Public()
  const reflector = app.get(Reflector);
  app.useGlobalGuards(new JwtAuthGuard(reflector));
  app.useGlobalFilters(new HttpExceptionLogFilter());
  
  // ← THÊM TIMEOUT INTERCEPTOR (30 giây cho tất cả requests)
  app.useGlobalInterceptors(new TimeoutInterceptor(30000));

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
        description: 'JWT token for authentication',
      },
      'bearer'
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
      // ← THÊM REQUEST INTERCEPTOR ĐỂ DEBUG
      requestInterceptor: (req) => {
        console.log('[Swagger Request]', {
          url: req.url,
          method: req.method,
          headers: req.headers,
        });
        return req;
      },
    },
  });

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`🚀 Server running: http://localhost:${port}`);
  console.log(`📚 Swagger UI: http://localhost:${port}/api/docs`);
  console.log(`⏱️  Request timeout: 30 seconds`);
}

bootstrap();