import { Test, TestingModule } from '@nestjs/testing';
import { ReportsService } from './reports.service';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';

import { ProductsRepository } from '../../products/repositories/products.repository';
import { ReportsQueryParamsDto } from '../dto/reports.dto';

describe('ReportsService', () => {
  let service: ReportsService;
  let productsRepository: ProductsRepository;

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
    verbose: jest.fn(),
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

    service = module.get<ReportsService>(ReportsService);
    productsRepository = module.get<ProductsRepository>(ProductsRepository);
  });

  describe('getDeletedProductsPercentage', () => {
    it('should return deleted products percentage and log the operation', async () => {
      const mockResult = { percentage: 15.75 };
      mockProductsRepository.getDeletedProductsPercentage.mockResolvedValue(
        mockResult,
      );

      const result = await service.getDeletedProductsPercentage();

      expect(
        jest.spyOn(productsRepository, 'getDeletedProductsPercentage'),
      ).toHaveBeenCalledTimes(1);
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
      //
      const mockResult = { percentage: 84.25 };
      mockProductsRepository.getNonDeletedProductsPercentage.mockResolvedValue(
        mockResult,
      );

      const result = await service.getNonDeletedProductsPercentages(mockFilter);

      expect(
        jest.spyOn(productsRepository, 'getNonDeletedProductsPercentage'),
      ).toHaveBeenCalledWith(mockFilter);
      expect(result).toEqual(mockResult);
    });
  });

  describe('getProductsByCategoryReport', () => {
    it('should return products by category report and log the operation', async () => {
      const mockResult = [
        { category: 'Electronics', productCount: '25', averagePrice: '599.99' },
        { category: 'Clothing', productCount: '12', averagePrice: '89.50' },
      ];
      mockProductsRepository.getProductsByCategoryReport.mockResolvedValue(
        mockResult,
      );
      // Execute the method
      const result = await service.getProductsByCategoryReport();

      expect(
        jest.spyOn(productsRepository, 'getProductsByCategoryReport'),
      ).toHaveBeenCalledTimes(1);

      expect(result).toEqual(mockResult);
    });
  });
  afterEach(() => {
    jest.clearAllMocks();
  });
});
