import { Test, TestingModule } from '@nestjs/testing';
import { ReportsController } from './reports.controller';
import { ReportsService } from '../services/reports.service';
import { ReportsQueryParamsDto } from '../dto/reports.dto';

describe('ReportsController', () => {
  let controller: ReportsController;
  let service: ReportsService;

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

    controller = module.get<ReportsController>(ReportsController);
    service = module.get<ReportsService>(ReportsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getDeletedProductsPercentage', () => {
    it('should return deleted products percentage', async () => {
      const mockResult = { percentage: 25.5 };
      mockReportsService.getDeletedProductsPercentage.mockResolvedValue(
        mockResult,
      );

      const result = await controller.getDeletedProductsPercentage();

      expect(
        jest.spyOn(service, 'getDeletedProductsPercentage'),
      ).toHaveBeenCalledTimes(1);

      expect(result).toEqual(mockResult);
    });
  });

  describe('getNonDeletedProductsPercentages', () => {
    it('should return non-deleted products percentage with filters', async () => {
      const mockFilter: ReportsQueryParamsDto = {
        hasPrice: 'true',
        startDate: '2024-01-01',
        endDate: '2024-12-31',
      };
      const mockResult = { percentage: 75.8 };
      mockReportsService.getNonDeletedProductsPercentages.mockResolvedValue(
        mockResult,
      );

      const result =
        await controller.getNonDeletedProductsPercentages(mockFilter);

      expect(
        jest.spyOn(service, 'getNonDeletedProductsPercentages'),
      ).toHaveBeenCalledWith(mockFilter);

      expect(result).toEqual(mockResult);
    });
  });

  describe('getProductsByCategoryReport', () => {
    it('should return products report by category', async () => {
      const mockResult = [
        { category: 'Smartphones', productCount: '15', averagePrice: '899.99' },
        { category: 'Laptops', productCount: '8', averagePrice: '1299.50' },
      ];
      mockReportsService.getProductsByCategoryReport.mockResolvedValue(
        mockResult,
      );

      const result = await controller.getProductsByCategoryReport();

      expect(
        jest.spyOn(service, 'getProductsByCategoryReport'),
      ).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockResult);
    });
  });
});
