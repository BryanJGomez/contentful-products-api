import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class ConfigurationEnv {
  // General Configuration
  @IsNotEmpty()
  @IsString()
  NODE_ENV: string;

  @IsNotEmpty()
  @IsNumber()
  PORT: number;

  @IsNotEmpty()
  @IsString()
  GLOBAL_PREFIX: string;

  @IsNotEmpty()
  @IsString()
  JWT_SECRET: string;
  // Configuration for Database
  @IsNotEmpty()
  @IsString()
  DB_HOST: string;

  @IsNotEmpty()
  @IsNumber()
  DB_PORT: number;

  @IsNotEmpty()
  @IsString()
  DB_USERNAME: string;

  @IsNotEmpty()
  @IsString()
  DB_PASSWORD: string;

  @IsNotEmpty()
  @IsString()
  DB_DATABASE: string;
  // External APIs
  @IsNotEmpty()
  @IsString()
  CONTENTFUL_API: string;

  @IsNotEmpty()
  @IsString()
  CONTENTFUL_SPACE_ID: string;

  @IsNotEmpty()
  @IsString()
  CONTENTFUL_ACCESS_TOKEN: string;

  @IsNotEmpty()
  @IsString()
  CONTENTFUL_ENVIRONMENT: string;

  @IsNotEmpty()
  @IsString()
  CONTENTFUL_CONTENT_TYPE: string;
}
