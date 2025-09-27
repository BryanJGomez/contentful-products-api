import { AppDataSource } from '../data-source';
import { Products } from '../../app/products/entities/product.entity';

async function seed() {
  await AppDataSource.initialize();

  const productRepository = AppDataSource.getRepository(Products);

  const productsData = [
    {
      externalId: '4HZHurmc8Ld78PNnI1ReYh',
      sku: 'ZIMPDOPD',
      name: 'Apple Mi Watch',
      brand: 'Apple',
      model: 'Mi Watch',
      category: 'Smartwatch',
      color: 'Rose Gold',
      price: 1410.29,
      currency: 'USD',
      stock: 7,
    },
    {
      externalId: '3ZxS5MCw4W3R8rcN1SdQB7',
      sku: 'O53YSHQL',
      name: 'Dell Moto G7',
      brand: 'Dell',
      model: 'Moto G7',
      category: 'Smartphone',
      color: 'Blue',
      price: 1829.92,
      currency: 'USD',
      stock: 75,
    },
    {
      externalId: '3LO1GPO3x1hjnVFzAp7V6S',
      sku: 'UVBY6AR9',
      name: 'Apple Watch Series 7',
      brand: 'Apple',
      model: 'Watch Series 7',
      category: 'Smartwatch',
      color: 'Black',
      price: 133.6,
      currency: 'USD',
      stock: 54,
    },
    {
      externalId: '6Nj5cWcuVoIPDJfZ72Lheb',
      sku: 'UEBN4YX5',
      name: 'Samsung iPhone 13',
      brand: 'Samsung',
      model: 'iPhone 13',
      category: 'Smartphone',
      color: 'Green',
      price: 1855.43,
      currency: 'USD',
      stock: 36,
    },
    {
      externalId: 'AgIYlVoYCrTAIASSu9vnS',
      sku: 'FRGJWMXC',
      name: 'HP QuietComfort 35',
      brand: 'HP',
      model: 'QuietComfort 35',
      category: 'Headphones',
      color: 'Rose Gold',
      price: 806.45,
      currency: 'USD',
      stock: 101,
    },
    {
      externalId: '46vsqDaDYQH9R82adCwCig',
      sku: 'T7JQPVWB',
      name: 'Acer ZenBook 14',
      brand: 'Acer',
      model: 'ZenBook 14',
      category: 'Laptop',
      color: 'Black',
      price: 125.43,
      currency: 'USD',
      stock: 169,
      deletedAt: new Date(), // Simula un producto eliminado
      isDeleted: true,
    },
  ];
  try {
    await productRepository.upsert(productsData, ['externalId']);
  } catch (error) {
    await AppDataSource.destroy();
    throw error;
  }
}

void seed();
