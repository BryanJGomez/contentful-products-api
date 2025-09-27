import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TerminusModule } from '@nestjs/terminus';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigurationValidate } from './config/services/configuration.validate';
import { environment } from './enums/env.enum';
import { ProductsModule } from './app/products/products.module';
import { ConfigurationModule } from './config/configuration.module';
import { ConfigurationService } from './config/services/configuration.service';

@Module({
  imports: [
    TerminusModule,
    ConfigModule.forRoot({
      isGlobal: true,
      validate: ConfigurationValidate,
    }),
    ConfigurationModule,
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
    ProductsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
