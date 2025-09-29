import { Test, TestingModule } from '@nestjs/testing';
import { ReportsService } from './reports.service';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';

import { ProductsRepository } from '../../products/repositories/products.repository';
import { ReportsQueryParamsDto } from '../dto/reports.dto';

describe('ReportsService (unit)', () => {
  // Service and repository mocks
  let reportsService: ReportsService;
  let productsRepository: ProductsRepository;
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
        {
          provide: ProductsRepository,
          useValue: mockProductsRepository,
        },
        { provide: WINSTON_MODULE_PROVIDER, useValue: loggerMock },
      ],
    }).compile();
    // Get instances of service and repository
    reportsService = module.get<ReportsService>(ReportsService);
    productsRepository = module.get<ProductsRepository>(ProductsRepository);
  });

  describe('getDeletedProductsPercentage', () => {
    it('should return deleted products percentage and log the operation', async () => {
      const mockResult = { percentage: 15.75 };
      // Arrange
      mockProductsRepository.getDeletedProductsPercentage.mockResolvedValue(
        mockResult,
      );
      // Spies
      const productSpy = jest.spyOn(
        productsRepository,
        'getDeletedProductsPercentage',
      );
      // Act
      const result = await reportsService.getDeletedProductsPercentage();
      // Assert
      expect(productSpy).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockResult);
    });
  });

  describe('getNonDeletedProductsPercentages', () => {
    it('should return non-deleted products percentage with filters and log the operation', async () => {
      const mockFilter: ReportsQueryParamsDto = {
        hasPrice: 'true',
        startDate: '2024-01-01',
        endDate: '2024-12-31',
      };
      const mockResult = { percentage: 84.25 };
      // Arrange
      mockProductsRepository.getNonDeletedProductsPercentage.mockResolvedValue(
        mockResult,
      );
      // spies
      const productSpy = jest.spyOn(
        productsRepository,
        'getNonDeletedProductsPercentage',
      );
      // Act
      const result =
        await reportsService.getNonDeletedProductsPercentages(mockFilter);
      // Assert
      expect(productSpy).toHaveBeenCalledWith(mockFilter);
      expect(result).toEqual(mockResult);
    });
  });

  describe('getProductsByCategoryReport', () => {
    it('should return products by category report and log the operation', async () => {
      const mockResult = [
        { category: 'Electronics', productCount: '25', averagePrice: '599.99' },
        { category: 'Clothing', productCount: '12', averagePrice: '89.50' },
      ];
      // Arrange
      mockProductsRepository.getProductsByCategoryReport.mockResolvedValue(
        mockResult,
      );
      // spies
      const productSpy = jest.spyOn(
        productsRepository,
        'getProductsByCategoryReport',
      );
      // Act
      const result = await reportsService.getProductsByCategoryReport();
      // Assert
      expect(productSpy).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockResult);
    });
  });
  // clean up mocks after each test
  afterEach(() => {
    jest.clearAllMocks();
  });
});
