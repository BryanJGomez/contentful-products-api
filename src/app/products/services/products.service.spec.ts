import { Test, TestingModule } from '@nestjs/testing';
import { ProductsService } from './products.service';
import { ProductsRepository } from '../repositories/products.repository';
import { ContenfulService } from './contenful.service';
import { Products } from '../entities/product.entity';
import { SearchQueryParamsDto } from '../dto/product.dto';
import { InsertResult } from 'typeorm';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { IUpdateResult } from '../interface/producto.interface';

describe('ProductsService (unit)', () => {
  // Service and repository mocks
  let productService: jest.Mocked<ProductsService>;
  let productsRepo: jest.Mocked<ProductsRepository>;
  let contenfulService: jest.Mocked<ContenfulService>;
  // Mock implementations
  const mockProductRepository: Partial<jest.Mocked<ProductsRepository>> = {
    findAll: jest.fn(),
    productUpsert: jest.fn(),
    updateStatus: jest.fn(),
    findOne: jest.fn(),
  };
  const mockedContentfulApiService: Partial<jest.Mocked<ContenfulService>> = {
    syncProductsFromApi: jest.fn(),
  };
  const mockLogger = {
    log: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        { provide: ProductsRepository, useValue: mockProductRepository },
        { provide: ContenfulService, useValue: mockedContentfulApiService },
        { provide: WINSTON_MODULE_PROVIDER, useValue: mockLogger },
      ],
    }).compile();
    // Get instances of service and repository
    productService = module.get(ProductsService);
    productsRepo = module.get(ProductsRepository);
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
      const params: SearchQueryParamsDto = { page: 1, limit: 2 };
      // Arrange
      productsRepo.findAll.mockResolvedValue({
        results: mockResults,
        count: 2,
      });
      // Spies
      const findAllSpy = jest
        .spyOn(productsRepo, 'findAll')
        .mockResolvedValue({ results: mockResults, count: 2 });
      // Act
      const res = await productService.findAll(params);
      // Assert
      expect(findAllSpy).toHaveBeenCalledWith(params);
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
      const params: SearchQueryParamsDto = {
        page: 1,
        limit: 10,
        name: 'test product',
        category: 'electronics',
        minPrice: 50,
        maxPrice: 200,
      };
      // Arrange
      productsRepo.findAll.mockResolvedValue({
        results: mockResults,
        count: 0,
      });
      // Spies
      const findAllSpy = jest
        .spyOn(productsRepo, 'findAll')
        .mockResolvedValue({ results: mockResults, count: 0 });
      // Act

      const res = await productService.findAll(params);
      // Assert
      expect(findAllSpy).toHaveBeenCalledWith(params);
      expect(res.results).toHaveLength(0);
      expect(res.totalRecords).toBe(0);
    });
  });

  describe('syncProductsFromApi', () => {
    it('should successfully sync products from Contentful', async () => {
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
      const mockUpsertResults: InsertResult[] = [
        { identifiers: [{ id: '1' }], generatedMaps: [{ id: '1' }], raw: [] },
        { identifiers: [{ id: '2' }], generatedMaps: [{ id: '2' }], raw: [] },
      ];
      // Arrange
      contenfulService.syncProductsFromApi.mockResolvedValue(
        mockContentfulProducts,
      );
      //
      productsRepo.productUpsert
        .mockResolvedValueOnce(mockUpsertResults[0])
        .mockResolvedValueOnce(mockUpsertResults[1]);
      // Spies
      const syncSpy = jest
        .spyOn(contenfulService, 'syncProductsFromApi')
        .mockResolvedValue(mockContentfulProducts);
      //
      const upsertSpy = jest
        .spyOn(productsRepo, 'productUpsert')
        .mockResolvedValueOnce(mockUpsertResults[0])
        .mockResolvedValueOnce(mockUpsertResults[1]);
      // Act
      const result = await productService.syncProducts();
      // Assert
      expect(syncSpy).toHaveBeenCalledTimes(1);
      expect(upsertSpy).toHaveBeenCalledTimes(2);
      expect(upsertSpy).toHaveBeenCalledWith(mockContentfulProducts[0]);
      expect(upsertSpy).toHaveBeenCalledWith(mockContentfulProducts[1]);

      expect(result).toEqual(mockUpsertResults);
    });
  });

  describe('updateStatus', () => {
    it('should update product status successfully', async () => {
      const productId = '123e4567-e89b-12d3-a456-426614174000';
      const mockProduct = {
        id: productId,
        externalId: 'EXT1',
        sku: 'SKU1',
        name: 'Test Product',
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
      };
      const mockUpdateResult: IUpdateResult = {
        generatedMaps: [],
        affected: 1,
        raw: {},
      };
      // Arrange
      productsRepo.findOne.mockResolvedValue(mockProduct);
      productsRepo.updateStatus.mockResolvedValue(mockUpdateResult);
      // Spies
      const findOneSpy = jest
        .spyOn(productsRepo, 'findOne')
        .mockResolvedValue(mockProduct);
      //
      const updateSpy = jest
        .spyOn(productsRepo, 'updateStatus')
        .mockResolvedValue(mockUpdateResult);

      // Act
      const result = await productService.updateStatus(productId);
      // Assert
      expect(findOneSpy).toHaveBeenCalledWith(productId);
      expect(updateSpy).toHaveBeenCalledWith(productId);
      expect(result).toEqual(mockUpdateResult);
    });
  });
  //
  afterEach(() => {
    // clean up mocks after each test
    jest.clearAllMocks();
  });
});
