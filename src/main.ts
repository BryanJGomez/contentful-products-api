import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ConfigService } from '@nestjs/config';
import { Logger, ValidationPipe } from '@nestjs/common';
import { WinstonModule } from 'nest-winston';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { AppModule } from './app.module';
import { loggerOptions } from './utils/logger.util';
import { environment } from './enums/env.enum';

async function bootstrap() {
  // Set up custom logger
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: WinstonModule.createLogger(
      loggerOptions(process.env.APPLICATION_NAME || 'app'),
    ),
  });
  // Get environment variables
  const configService = app.get(ConfigService);
  const environmentData = configService.get<string>('NODE_ENV');
  const port = configService.get<number>('PORT') || 3000;
  const globalPrefix = configService.get<string>('GLOBAL_PREFIX') || 'api';
  // Set global API prefix (e.g., /api)
  app.setGlobalPrefix(globalPrefix);
  // Configure Swagger for API documentation
  const config = new DocumentBuilder()
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token (without Bearer prefix)',
        in: 'header',
      },
      'JWT-auth',
    )
    .setTitle('Contentful Products API')
    .setDescription(
      'API RESTful para la gestión de productos integrada con Contentful CMS. ' +
        'Incluye autenticación JWT, manejo de base de datos PostgreSQL con TypeORM, ' +
        'y reportes de productos. Para usar los endpoints protegidos, ' +
        'haga clic en "Authorize" e ingrese su token JWT.',
    )
    .setVersion('1.0')
    .addTag('App', 'Información general de la aplicación')
    .addTag('Auth', 'Endpoints de autenticación')
    .addTag('Products', 'Gestión de productos')
    .addTag('Reports', 'Reportes y estadísticas')
    .build();
  // Set up Swagger module
  const document = SwaggerModule.createDocument(app, config);
  if (environmentData !== environment.production) {
    SwaggerModule.setup('docs', app, document, {
      swaggerOptions: {
        defaultModelsExpandDepth: -1,
        docExpansion: 'none',
        persistAuthorization: true,
        displayRequestDuration: true,
        tryItOutEnabled: true,
      },
      customSiteTitle: 'Contentful Products API - Swagger',
      customfavIcon: '/favicon.ico',
    });
  }
  // Enable CORS (Cross-Origin Resource Sharing)
  app.enableCors({
    origin: '*',
    allowedHeaders: ['Content-Type', 'Authorization'],
    methods: ['GET', 'PUT', 'POST', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD'],
    preflightContinue: false,
    credentials: true,
  });
  // Set up global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Only allow properties that are in the DTO
      forbidNonWhitelisted: true, // Throw an error if non-whitelisted properties are present
    }),
  );
  // Start the application
  await app.listen(port, () => {
    Logger.log('Listening at http://localhost:' + port + '/' + globalPrefix);
    environmentData !== environment.production &&
      Logger.log('Documentation in http://localhost:' + port + '/' + 'docs');
  });
}
void bootstrap();
