import { Test, TestingModule } from '@nestjs/testing';
import { ReportsController } from './reports.controller';
import { ReportsService } from '../services/reports.service';
import { ReportsQueryParamsDto } from '../dto/reports.dto';

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
      const mockResult = { percentage: 25.5 };
      // Arrange
      mockReportsService.getDeletedProductsPercentage.mockResolvedValue(
        mockResult,
      );
      // Spies
      const getDeletedProductsPercentageSpy = jest.spyOn(
        service,
        'getDeletedProductsPercentage',
      );
      // Act
      const result = await controller.getDeletedProductsPercentage();
      // Assert
      expect(getDeletedProductsPercentageSpy).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockResult);
    });
  });

  describe('GET /non-deleted-percentages', () => {
    it('should return non-deleted products percentage with filters', async () => {
      const mockFilter: ReportsQueryParamsDto = {
        hasPrice: 'true',
        startDate: '2024-01-01',
        endDate: '2024-12-31',
      };
      const mockResult = { percentage: 75.8 };
      // Arrange
      mockReportsService.getNonDeletedProductsPercentages.mockResolvedValue(
        mockResult,
      );
      // Spies
      const getNonDeletedProductsPercentagesSpy = jest.spyOn(
        service,
        'getNonDeletedProductsPercentages',
      );
      // Act
      const result =
        await controller.getNonDeletedProductsPercentages(mockFilter);
      // Assert
      expect(getNonDeletedProductsPercentagesSpy).toHaveBeenCalledWith(
        mockFilter,
      );
      //
      expect(result).toEqual(mockResult);
    });
  });

  describe('GET /by-category', () => {
    it('should return products report by category', async () => {
      const mockResult = [
        { category: 'Smartphones', productCount: '15', averagePrice: '899.99' },
        { category: 'Laptops', productCount: '8', averagePrice: '1299.50' },
      ];
      // Arrange
      mockReportsService.getProductsByCategoryReport.mockResolvedValue(
        mockResult,
      );
      // Spies
      const getProductsByCategoryReportSpy = jest.spyOn(
        service,
        'getProductsByCategoryReport',
      );
      // Act
      const result = await controller.getProductsByCategoryReport();
      // Assert
      expect(getProductsByCategoryReportSpy).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockResult);
    });
  });

  afterEach(() => {
    // clean up mocks after each test
    jest.clearAllMocks();
  });
});
