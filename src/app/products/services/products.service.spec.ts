import { Test, TestingModule } from '@nestjs/testing';
import { ProductsService } from './products.service';
import { ProductsRepository } from '../repositories/products.repository';
import { ContenfulService } from './contenful.service';
import { Products } from '../entities/product.entity';
import { SearchQueryParamsDto } from '../dto/product.dto';
import { InsertResult } from 'typeorm';

describe('ProductsService (unit)', () => {
  let service: ProductsService;
  let repo: jest.Mocked<ProductsRepository>;
  let contenfulService: jest.Mocked<ContenfulService>;

  beforeEach(async () => {
    const repoMock: Partial<jest.Mocked<ProductsRepository>> = {
      findAll: jest.fn(),
      productUpsert: jest.fn(),
    };

    const contenfulServiceMock: Partial<jest.Mocked<ContenfulService>> = {
      syncProductsFromApi: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        { provide: ProductsRepository, useValue: repoMock },
        { provide: ContenfulService, useValue: contenfulServiceMock },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
    repo = module.get(ProductsRepository);
    contenfulService = module.get(ContenfulService);
  });

  describe('findAll', () => {
    it('should return paginated products successfully', async () => {
      const mockResults: Products[] = [
        {
          id: '1',
          externalId: 'EXT1',
          sku: 'SKU1',
          name: 'Producto 1',
          brand: 'Brand',
          model: 'Model X',
          category: 'Cat',
          color: 'Red',
          price: 100,
          currency: 'USD',
          stock: 10,
          isDeleted: false,
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: undefined,
        },
        {
          id: '2',
          externalId: 'EXT2',
          sku: 'SKU2',
          name: 'Producto 2',
          brand: 'Brand',
          model: 'Model Y',
          category: 'Cat',
          color: 'Blue',
          price: 200,
          currency: 'USD',
          stock: 5,
          isDeleted: false,
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: undefined,
        },
      ];
      repo.findAll.mockResolvedValue({ results: mockResults, count: 2 });

      const params: SearchQueryParamsDto = { page: 1, limit: 2 };
      const res = await service.findAll(params);

      expect(jest.spyOn(repo, 'findAll')).toHaveBeenCalledWith(params);
      expect(res).toBeDefined();
      expect(res.results).toHaveLength(2);
      expect(res.totalRecords).toBe(2);
      expect(res.totalPages).toBe(1);
      expect(res.currentPage).toBe(1);
      expect(res.hasNextPage).toBe(false);
      expect(res.hasPreviousPage).toBe(false);
      expect(res.previousPage).toBeNull();
      expect(res.nextPage).toBeNull();
    });

    it('should handle search parameters', async () => {
      const mockResults: Products[] = [];
      repo.findAll.mockResolvedValue({ results: mockResults, count: 0 });

      const params: SearchQueryParamsDto = {
        page: 1,
        limit: 10,
        name: 'test product',
        category: 'electronics',
        minPrice: 50,
        maxPrice: 200,
      };

      const res = await service.findAll(params);

      expect(jest.spyOn(repo, 'findAll')).toHaveBeenCalledWith(params);
      expect(res.results).toHaveLength(0);
      expect(res.totalRecords).toBe(0);
    });
  });

  describe('syncProductsFromApi', () => {
    it('should successfully sync products from Contentful', async () => {
      // Mock data from Contentful service
      const mockContentfulProducts: Partial<Products>[] = [
        {
          externalId: 'contentful-1',
          sku: 'SKU-001',
          name: 'Test Product 1',
          brand: 'Test Brand',
          model: 'Model A',
          category: 'Electronics',
          color: 'Black',
          price: 299.99,
          currency: 'USD',
          stock: 50,
        },
        {
          externalId: 'contentful-2',
          sku: 'SKU-002',
          name: 'Test Product 2',
          brand: 'Test Brand',
          model: 'Model B',
          category: 'Electronics',
          color: 'White',
          price: 199.99,
          currency: 'USD',
          stock: 25,
        },
      ];
      // Mock repository upsert results (TypeORM InsertResult)
      const mockUpsertResults: InsertResult[] = [
        {
          identifiers: [{ id: '1' }],
          generatedMaps: [{ id: '1' }],
          raw: [],
        },
        {
          identifiers: [{ id: '2' }],
          generatedMaps: [{ id: '2' }],
          raw: [],
        },
      ];
      // Setup mocks
      contenfulService.syncProductsFromApi.mockResolvedValue(
        mockContentfulProducts,
      );
      repo.productUpsert
        .mockResolvedValueOnce(mockUpsertResults[0])
        .mockResolvedValueOnce(mockUpsertResults[1]);
      // Execute the method
      const result = await service.syncProducts();
      // Verify the calls
      expect(
        jest.spyOn(contenfulService, 'syncProductsFromApi'),
      ).toHaveBeenCalledTimes(1);
      expect(jest.spyOn(repo, 'productUpsert')).toHaveBeenCalledTimes(2);
      expect(jest.spyOn(repo, 'productUpsert')).toHaveBeenCalledWith(
        mockContentfulProducts[0],
      );
      expect(jest.spyOn(repo, 'productUpsert')).toHaveBeenCalledWith(
        mockContentfulProducts[1],
      );
      // Verify the result
      expect(result).toEqual(mockUpsertResults);
    });
  });
  //
  afterEach(() => {
    // Limpia todos los mocks después de cada test
    jest.clearAllMocks();
  });
});
