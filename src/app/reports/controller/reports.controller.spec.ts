import { Test, TestingModule } from '@nestjs/testing';
import { ReportsController } from './reports.controller';
import { ReportsService } from '../services/reports.service';
import { ReportsQueryParamsDto } from '../dto/reports.dto';
import {
  DeletedProductsReportResponse,
  NonDeletedProductsReportResponse,
} from '../interface/reports.interface';
import { IProduct } from '../../products/interface/producto.interface';

describe('ReportsController (unit)', () => {
  // Service and repository mocks
  let controller: ReportsController;
  let service: ReportsService;
  // Mock implementations
  const mockReportsService = {
    getDeletedProductsPercentage: jest.fn(),
    getNonDeletedProductsPercentages: jest.fn(),
    getProductsByCategoryReport: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReportsController],
      providers: [
        {
          provide: ReportsService,
          useValue: mockReportsService,
        },
      ],
    }).compile();
    // Get instances of service and repository
    controller = module.get<ReportsController>(ReportsController);
    service = module.get<ReportsService>(ReportsService);
  });

  describe('GET /deleted-percentage', () => {
    it('should return deleted products percentage', async () => {
      const mockDeletedResult: DeletedProductsReportResponse<IProduct> = {
        results: [
          {
            id: '1',
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
            isDeleted: true,
            createdAt: new Date('2024-01-01T00:00:00.000Z'),
            updatedAt: new Date('2024-01-02T00:00:00.000Z'),
            deletedAt: new Date('2024-02-01T00:00:00.000Z'),
          },
          {
            id: '2',
            externalId: 'EXT2',
            sku: 'UEBN4YX5',
            name: 'Samsung iPhone 13',
            brand: 'Samsung',
            model: 'iPhone 13',
            category: 'Smartphone',
            color: 'Green',
            price: 1855.43,
            currency: 'USD',
            stock: 36,
            isDeleted: true,
            createdAt: new Date('2024-01-01T00:00:00.000Z'),
            updatedAt: new Date('2024-01-02T00:00:00.000Z'),
            deletedAt: new Date('2024-02-01T00:00:00.000Z'),
          },
        ],
        totalRecords: 2,
        totalPages: 1,
        currentPage: 1,
        hasPreviousPage: false,
        hasNextPage: false,
        previousPage: null,
        nextPage: null,
        hasEllipsisBefore: false,
        hasEllipsisAfter: false,
        pageLinks: [1],
        totalProducts: 100,
        deletedProducts: 2,
        deletedPercentage: 2.0,
      };
      // Arrange
      mockReportsService.getDeletedProductsPercentage.mockResolvedValue(
        mockDeletedResult,
      );
      // Spies
      const getDeletedProductsPercentageSpy = jest.spyOn(
        service,
        'getDeletedProductsPercentage',
      );
      // Act
      const result = await controller.getDeletedProductsPercentage({
        page: 1,
        limit: 5,
      });
      // Assert
      expect(getDeletedProductsPercentageSpy).toHaveBeenCalledWith({
        page: 1,
        limit: 5,
      });
      expect(result).toEqual(mockDeletedResult);
      // Assert
      expect(result).toHaveProperty('results');
      expect(result).toHaveProperty('totalProducts');
      expect(result).toHaveProperty('deletedProducts');
      expect(result).toHaveProperty('deletedPercentage');
    });
  });

  describe('GET /non-deleted-percentages', () => {
    it('should return non-deleted products percentage with filters', async () => {
      const mockFilter: ReportsQueryParamsDto = {
        hasPrice: 'true',
        startDate: '2024-01-01',
        endDate: '2024-12-31',
        page: 1,
        limit: 5,
      };

      const mockNonDeleted: NonDeletedProductsReportResponse<IProduct> = {
        results: [
          {
            id: '1',
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
          },
          {
            id: '2',
            externalId: 'EXT2',
            sku: 'UEBN4YX5',
            name: 'Samsung iPhone 13',
            brand: 'Samsung',
            model: 'iPhone 13',
            category: 'Smartphone',
            color: 'Green',
            price: 1855.43,
            currency: 'USD',
            stock: 36,
            isDeleted: false,
            createdAt: new Date(),
            updatedAt: new Date(),
            deletedAt: undefined,
          },
        ],
        totalRecords: 2,
        totalPages: 1,
        currentPage: 1,
        hasPreviousPage: false,
        hasNextPage: false,
        previousPage: null,
        nextPage: null,
        hasEllipsisBefore: false,
        hasEllipsisAfter: false,
        pageLinks: [1],
        startDate: '2024-01-01T00:00:00.000Z',
        endDate: '2024-12-31T23:59:59.999Z',
        totalProducts: 100,
        deletedProducts: 2,
        nonDeletedProducts: 98,
        percentage: 98.0,
      };
      // Arrange
      mockReportsService.getNonDeletedProductsPercentages.mockResolvedValue(
        mockNonDeleted,
      );
      // Act
      const result =
        await controller.getNonDeletedProductsPercentages(mockFilter);
      // Assert
      expect(result).toEqual(mockNonDeleted);
      expect(result).toHaveProperty('results');
      expect(result).toHaveProperty('totalRecords');
      expect(result).toHaveProperty('startDate');
      expect(result).toHaveProperty('endDate');
      expect(result).toHaveProperty('totalProducts');
      expect(result).toHaveProperty('percentage');
    });
  });

  describe('GET /by-category', () => {
    it('should return products report by category', async () => {
      const mockResult = [
        { category: 'Smartphones', productCount: '15', averagePrice: 899.99 },
        { category: 'Laptops', productCount: '8', averagePrice: 1299.5 },
      ];
      // Arrange
      mockReportsService.getProductsByCategoryReport.mockResolvedValue(
        mockResult,
      );
      // Act
      const result = await controller.getProductsByCategoryReport();
      // Assert
      expect(result).toEqual(mockResult);
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
});
