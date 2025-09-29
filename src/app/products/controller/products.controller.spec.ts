import { Test, TestingModule } from '@nestjs/testing';
import { ProductsController } from './products.controller';
import { ProductsService } from '../services/products.service';
import { SearchQueryParamsDto } from '../dto/product.dto';
import { IUpdateResult } from '../interface/producto.interface';

describe('ProductsController (unit)', () => {
  // Service and repository mocks
  let controller: ProductsController;
  // Mock implementations
  const mockProductsService = {
    findAll: jest.fn(),
    updateStatus: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductsController],
      providers: [{ provide: ProductsService, useValue: mockProductsService }],
    }).compile();
    // Get instances of service and repository
    controller = module.get<ProductsController>(ProductsController);
  });

  describe('/GET products', () => {
    it('should call service with query params and return its result', async () => {
      const query: SearchQueryParamsDto = { page: 2, limit: 5 };
      const expected = {
        results: [],
        totalRecords: 0,
        totalPages: 0,
        currentPage: 2,
        hasPreviousPage: true,
        hasNextPage: false,
        previousPage: 1,
        nextPage: null,
      };
      // Arrange
      mockProductsService.findAll.mockResolvedValue(expected);
      // Spies
      const findAllSpy = jest.spyOn(mockProductsService, 'findAll');
      // Act
      const res = await controller.findAll(query);
      // Assert
      expect(findAllSpy).toHaveBeenCalledWith(query);
      expect(res).toEqual(expected);
    });

    it('should handle search parameters', async () => {
      const query: SearchQueryParamsDto = {
        page: 1,
        limit: 10,
        name: 'test',
        category: 'electronics',
      };
      const expected = {
        results: [],
        totalRecords: 0,
        totalPages: 0,
        currentPage: 1,
        hasPreviousPage: false,
        hasNextPage: false,
        previousPage: null,
        nextPage: null,
      };
      // Arrange
      mockProductsService.findAll.mockResolvedValue(expected);
      // Spies
      const findAllSpy = jest.spyOn(mockProductsService, 'findAll');
      // Act
      const res = await controller.findAll(query);
      // Assert
      expect(findAllSpy).toHaveBeenCalledWith(query);
      expect(res).toEqual(expected);
    });
  });

  describe('/PATCH products/:id/status', () => {
    it('should call service to update product status and return the result', async () => {
      const productId = '123e4567-e89b-12d3-a456-426614174000';
      const expectedResult: IUpdateResult = {
        generatedMaps: [],
        affected: 1,
        raw: {},
      };
      // Arrange
      mockProductsService.updateStatus.mockResolvedValue(expectedResult);
      // Spies
      const updateStatusSpy = jest.spyOn(mockProductsService, 'updateStatus');
      // Act
      const res = await controller.updateStatus(productId);
      // Assert
      expect(updateStatusSpy).toHaveBeenCalledWith(productId);
      expect(res).toEqual(expectedResult);
    });
  });

  afterEach(() => {
    // clean up mocks after each test
    jest.clearAllMocks();
  });
});
