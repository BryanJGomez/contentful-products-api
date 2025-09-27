import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ConfigurationService {
  constructor(private config: ConfigService) {}
  // Configurarion General
  get nodeEnv(): string {
    return this.config.get('NODE_ENV') as string;
  }
  get globalPrefix(): string {
    return this.config.get('GLOBAL_PREFIX') as string;
  }
  get port(): number {
    return this.config.get('PORT') as number;
  }
  // Database
  get dbHost(): string {
    return this.config.get('DB_HOST') as string;
  }
  get dbPort(): number {
    return this.config.get('DB_PORT') as number;
  }
  get dbUsername(): string {
    return this.config.get('DB_USERNAME') as string;
  }
  get dbPassword(): string {
    return this.config.get('DB_PASSWORD') as string;
  }
  get dbDatabase(): string {
    return this.config.get('DB_DATABASE') as string;
  }
  // External APIs - Contentful
  get contentfulApi(): string {
    return this.config.get('CONTENTFUL_API') as string;
  }
  get contentfulSpaceId(): string {
    return this.config.get('CONTENTFUL_SPACE_ID') as string;
  }
  get contentfulAccessToken(): string {
    return this.config.get('CONTENTFUL_ACCESS_TOKEN') as string;
  }
  get contentfulEnvironment(): string {
    return this.config.get('CONTENTFUL_ENVIRONMENT') as string;
  }
  get contentfulContentType(): string {
    return this.config.get('CONTENTFUL_CONTENT_TYPE') as string;
  }
}
