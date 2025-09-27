import { environment } from 'src/enums/env.enum';
import { DataSource } from 'typeorm';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  // Configuration for entities
  entities: ['src/**/*.entity.ts'],
  // Configuración for migrations
  migrations: ['src/db/migrations/*.ts'],
  migrationsTableName: 'migrations',
  // Only for development
  synchronize: false,
  logging: process.env.NODE_ENV === environment.development,
});
