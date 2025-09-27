import { AppDataSource } from '../data-source';
import { Products } from '../../app/products/entities/product.entity';

async function seed() {
  try {
    await AppDataSource.initialize();

    const productRepository = AppDataSource.getRepository(Products);

    const productsData = [
      {
        sku: 'SKU001',
        name: 'iPhone 15 Pro',
        brand: 'Apple',
        model: 'iPhone 15 Pro',
        category: 'Smartphone',
        color: 'Black',
        price: 999.99,
        currency: 'USD',
        stock: 50,
      },
      {
        sku: 'SKU002',
        name: 'Samsung Galaxy S24',
        brand: 'Samsung',
        model: 'Galaxy S24',
        category: 'Smartphone',
        color: 'White',
        price: 899.99,
        currency: 'USD',
        stock: 30,
      },
      {
        sku: 'SKU003',
        name: 'MacBook Pro 16"',
        brand: 'Apple',
        model: 'MacBook Pro 16"',
        category: 'Laptop',
        color: 'Silver',
        price: 2499.99,
        currency: 'USD',
        stock: 20,
      },
      {
        sku: 'SKU004',
        name: 'Dell XPS 13',
        brand: 'Dell',
        model: 'XPS 13',
        category: 'Laptop',
        color: 'Black',
        price: 1299.99,
        currency: 'USD',
        stock: 15,
      },
      {
        sku: 'SKU005',
        name: 'Sony WH-1000XM5',
        brand: 'Sony',
        model: 'WH-1000XM5',
        category: 'Headphones',
        color: 'Black',
        price: 399.99,
        currency: 'USD',
        stock: 40,
      },
    ];

    await productRepository.upsert(productsData, ['sku']);
  } catch (error) {
    await AppDataSource.destroy();
    return error as Error;
  }
}

void seed();
