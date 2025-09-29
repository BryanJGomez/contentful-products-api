import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TerminusModule } from '@nestjs/terminus';
import { ScheduleModule } from '@nestjs/schedule';
import { WinstonModule } from 'nest-winston';
import { APP_GUARD, APP_FILTER } from '@nestjs/core';

import { ConfigurationService } from './config/services/configuration.service';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigurationValidate } from './config/services/configuration.validate';
import { environment } from './enums/env.enum';
import { ProductsModule } from './app/products/products.module';
import { ConfigurationModule } from './config/configuration.module';
import { ReportsModule } from './app/reports/reports.module';
import { AuthModule } from './app/auth/auth.module';
import { JwtAuthGuard } from './app/auth/guards/jwt-auth.guard';
import { loggerOptions } from './utils';
import { DatabaseExceptionFilter } from './common/filters/database-exception.filter';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({
      isGlobal: true,
      validate: ConfigurationValidate,
    }),
    //
    WinstonModule.forRoot(loggerOptions(process.env.APPLICATION_NAME || 'app')),
    // Database connection config
    TypeOrmModule.forRootAsync({
      imports: [ConfigurationModule],
      useFactory: (configService: ConfigurationService) => ({
        type: 'postgres',
        host: configService.dbHost,
        port: configService.dbPort,
        username: configService.dbUsername,
        password: configService.dbPassword,
        database: configService.dbDatabase,
        entities: ['dist/**/*.entity{.ts,.js}'],
        migrations: ['dist/database/migrations/*{.ts,.js}'],
        migrationsTableName: 'migrations',
        synchronize: false,
        logging: configService.nodeEnv === environment.development.toString(), // Log queries in dev mode
      }),
      inject: [ConfigurationService],
    }),
    TerminusModule,
    ConfigurationModule,
    ProductsModule,
    ReportsModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    // Global Exception Filters
    {
      provide: APP_FILTER,
      useClass: DatabaseExceptionFilter,
    },
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
  ],
})
export class AppModule {}
