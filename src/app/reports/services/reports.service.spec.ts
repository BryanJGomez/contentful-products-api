// reports.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { ReportsService } from './reports.service';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { ProductsRepository } from '../../products/repositories/products.repository';
import { ReportsQueryParamsDto } from '../dto/reports.dto';

describe('ReportsService (unit)', () => {
  // Service and repository mocks
  let reportsService: ReportsService;
  // Mock implementations
  const mockProductsRepository = {
    getDeletedProductsPercentage: jest.fn(),
    getNonDeletedProductsPercentage: jest.fn(),
    getProductsByCategoryReport: jest.fn(),
  };
  const loggerMock = {
    log: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReportsService,
        { provide: ProductsRepository, useValue: mockProductsRepository },
        { provide: WINSTON_MODULE_PROVIDER, useValue: loggerMock },
      ],
    }).compile();
    // Get instances of service and repository
    reportsService = module.get<ReportsService>(ReportsService);
  });

  describe('getDeletedProductsPercentage', () => {
    it('should return deleted products percentage and log the operation', async () => {
      const mockFilter = { page: 1, limit: 2 };

      const mockRepositoryResult = {
        results: [
          {
            id: '1',
            externalId: 'EXT1',
            sku: 'SKU1',
            name: 'Deleted A',
            brand: 'Brand',
            model: 'Model X',
            category: 'Cat',
            color: 'Red',
            price: 100,
            currency: 'USD',
            stock: 0,
            isDeleted: true,
            createdAt: new Date('2024-01-01T00:00:00.000Z'),
            updatedAt: new Date('2024-01-02T00:00:00.000Z'),
            deletedAt: new Date('2024-02-01T00:00:00.000Z'),
          },
          {
            id: '2',
            externalId: 'EXT2',
            sku: 'SKU2',
            name: 'Deleted B',
            brand: 'Brand',
            model: 'Model Y',
            category: 'Cat',
            color: 'Blue',
            price: 150,
            currency: 'USD',
            stock: 0,
            isDeleted: true,
            createdAt: new Date('2024-01-05T00:00:00.000Z'),
            updatedAt: new Date('2024-01-06T00:00:00.000Z'),
            deletedAt: new Date('2024-02-03T00:00:00.000Z'),
          },
        ],
        count: 2,
        total: 100,
      };
      // Arrange
      mockProductsRepository.getDeletedProductsPercentage.mockResolvedValue(
        mockRepositoryResult,
      );
      // Act
      const result =
        await reportsService.getDeletedProductsPercentage(mockFilter);
      // Assert
      expect(
        mockProductsRepository.getDeletedProductsPercentage,
      ).toHaveBeenCalledWith(mockFilter);

      expect(result).toHaveProperty('results');
      expect(result).toHaveProperty('totalRecords');
      expect(result).toHaveProperty('totalPages');
      expect(result).toHaveProperty('currentPage');
      expect(result).toHaveProperty('hasPreviousPage');
      expect(result).toHaveProperty('hasNextPage');

      expect(result).toHaveProperty('totalProducts');
      expect(result).toHaveProperty('deletedProducts');
      expect(result).toHaveProperty('deletedPercentage');

      expect(result.totalProducts).toBe(100);
      expect(result.deletedProducts).toBe(2);
      expect(result.deletedPercentage).toBe(2.0);

      expect(result.results).toEqual(mockRepositoryResult.results);
    });
  });

  describe('getNonDeletedProductsPercentages', () => {
    it('should return non-deleted products percentage with filters and log the operation', async () => {
      const mockFilter: ReportsQueryParamsDto = {
        hasPrice: 'true',
        startDate: '2024-01-01',
        endDate: '2024-12-31',
        page: 1,
        limit: 10,
      };

      const mockRepositoryResult = {
        results: [
          {
            id: '1',
            externalId: 'EXT1',
            sku: 'SKU1',
            name: 'Active A',
            brand: 'Brand',
            model: 'Model X',
            category: 'Cat',
            color: 'Red',
            price: 100,
            currency: 'USD',
            stock: 10,
            isDeleted: false,
            createdAt: new Date('2024-01-01T00:00:00.000Z'),
            updatedAt: new Date('2024-01-02T00:00:00.000Z'),
            deletedAt: undefined,
          },
          {
            id: '2',
            externalId: 'EXT2',
            sku: 'SKU2',
            name: 'Active B',
            brand: 'Brand',
            model: 'Model Y',
            category: 'Smartphone',
            color: 'Green',
            price: 1855.43,
            currency: 'USD',
            stock: 36,
            isDeleted: false,
            createdAt: new Date('2024-01-05T00:00:00.000Z'),
            updatedAt: new Date('2024-01-06T00:00:00.000Z'),
            deletedAt: undefined,
          },
        ],
        count: 2,
        total: 100,
      };
      // Arrange
      mockProductsRepository.getNonDeletedProductsPercentage.mockResolvedValue(
        mockRepositoryResult,
      );
      // Act
      const result =
        await reportsService.getNonDeletedProductsPercentages(mockFilter);
      // Assert
      expect(
        mockProductsRepository.getNonDeletedProductsPercentage,
      ).toHaveBeenCalledWith(mockFilter);

      expect(result).toHaveProperty('results');
      expect(result).toHaveProperty('totalRecords');
      expect(result).toHaveProperty('totalPages');
      expect(result).toHaveProperty('currentPage');
      expect(result).toHaveProperty('hasPreviousPage');
      expect(result).toHaveProperty('hasNextPage');

      expect(result).toHaveProperty('startDate');
      expect(result).toHaveProperty('endDate');
      expect(result).toHaveProperty('totalProducts');
      expect(result).toHaveProperty('deletedProducts');
      expect(result).toHaveProperty('nonDeletedProducts');
      expect(result).toHaveProperty('percentage');

      expect(result.totalProducts).toBe(100);
      expect(result.deletedProducts).toBe(98);
      expect(result.nonDeletedProducts).toBe(2);
      expect(result.percentage).toBe(2.0);

      expect(result.results).toEqual(mockRepositoryResult.results);

      expect(result.startDate).toBe('2024-01-01T00:00:00.000Z');
      expect(result.endDate).toBe('2024-12-31T00:00:00.000Z');
    });
  });

  describe('getProductsByCategoryReport', () => {
    it('should return products by category report and log the operation', async () => {
      const mockResult = [
        { category: 'Electronics', productCount: 25, averagePrice: 599.99 },
        { category: 'Clothing', productCount: 12, averagePrice: 89.5 },
      ];
      // Arrange
      mockProductsRepository.getProductsByCategoryReport.mockResolvedValue(
        mockResult,
      );
      // Act
      const result = await reportsService.getProductsByCategoryReport();
      // Assert

      expect(
        mockProductsRepository.getProductsByCategoryReport,
      ).toHaveBeenCalledTimes(1);

      expect(result).toEqual(mockResult);
    });
  });
  // clean up mocks after each test
  afterEach(() => {
    jest.clearAllMocks();
  });
});
