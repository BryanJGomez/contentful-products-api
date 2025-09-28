import { AppDataSource } from '../data-source';
import { seedProducts } from './product.seed';
import { seedUsers } from './user.seed';
import { loggerOptions, createContextWinston } from '../../utils/logger.util';
import * as winston from 'winston';

async function seed() {
  const logger = winston.createLogger(loggerOptions('SeedApplication'));
  const context = createContextWinston('Seeder', 'seed');

  await AppDataSource.initialize();

  try {
    await Promise.all([seedProducts(), seedUsers()]);
    logger.info('Seeding completado exitosamente', context);
  } catch (error) {
    logger.error('Error durante el seeding', {
      ...context,
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  } finally {
    await AppDataSource.destroy();
  }
}

void seed();
