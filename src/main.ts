import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { default as morgan } from 'morgan';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Global prefix
  app.setGlobalPrefix('api/v1');

  // CORS
  app.enableCors({
    origin: configService.get('FRONTEND_URL') || 'http://localhost:5173',
    credentials: true,
  });

  // Global pipes for validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // HTTP request logging
  app.use(morgan('dev'));

  // Swagger setup
  const config = new DocumentBuilder()
    .setTitle(configService.get('SWAGGER_TITLE') || 'BookSwap API')
    .setDescription(
      configService.get('SWAGGER_DESCRIPTION') || 'API documentation for BookSwap Community',
    )
    .setVersion(configService.get('SWAGGER_VERSION') || '1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .addTag('Authentication', 'Authentication endpoints (register, login, OAuth)')
    .addTag('Users', 'User management endpoints')
    .addTag('Books', 'Book management and listing endpoints')
    .addTag('Personal Library', 'Personal book library management')
    .addTag('Exchanges', 'Book exchange requests and management')
    .addTag('Messaging', 'Real-time messaging between users')
    .addTag('Reviews', 'Review and rating system')
    .addTag('Notifications', 'User notifications')
    .addTag('Admin', 'Admin panel endpoints')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    customSiteTitle: 'BookSwap API Docs',
    customCss: '.swagger-ui .topbar { display: none }',
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
  });

  const port = configService.get('PORT') || 3000;
  await app.listen(port);

  console.log(`
  🚀 BookSwap Backend is running!
  
  📝 API Documentation: http://localhost:${port}/api/docs
  🔧 API Endpoint: http://localhost:${port}/api/v1
  🗄️  Database Admin: http://localhost:8080 (Adminer)
  
  Environment: ${configService.get('NODE_ENV')}
  `);
}

bootstrap();