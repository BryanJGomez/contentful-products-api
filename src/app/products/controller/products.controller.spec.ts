import { Test, TestingModule } from '@nestjs/testing';
import { ProductsController } from './products.controller';
import { ProductsService } from '../services/products.service';
import { SearchQueryParamsDto } from '../dto/product.dto';
import {
  IProduct,
  IResultData,
  IUpdateResult,
} from '../interface/producto.interface';

describe('ProductsController (unit)', () => {
  // Service and repository mocks
  let controller: ProductsController;
  let service: jest.Mocked<ProductsService>;
  // Mock implementations
  const mockProductsService: Partial<jest.Mocked<ProductsService>> = {
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
    service = module.get(ProductsService);
  });

  describe('GET /products', () => {
    it('should call service with query params and return its result', async () => {
      // Arrange
      const query: SearchQueryParamsDto = { page: 1, limit: 5 };
      const expected: IResultData<IProduct> = {
        results: [] as IProduct[],
        totalRecords: 0,
        totalPages: 0,
        currentPage: 1,
        hasPreviousPage: false,
        hasNextPage: false,
        previousPage: null,
        nextPage: null,
        hasEllipsisBefore: false,
        hasEllipsisAfter: false,
        pageLinks: [],
      };
      service.findAll.mockResolvedValue(expected);
      // Spies
      const findAllSpy = jest.spyOn(service, 'findAll');
      // Act
      const res = await controller.findAll(query);
      // Assert
      expect(findAllSpy).toHaveBeenCalledWith(query);
      expect(res).toEqual(expected);
    });

    it('handles search filters and returns the service result', async () => {
      // Arrange
      const query: SearchQueryParamsDto = {
        page: 2,
        limit: 10,
        name: 'test',
        category: 'electronics',
        minPrice: 100,
        maxPrice: 200,
      };
      const expected: IResultData<IProduct> = {
        results: [
          {
            externalId: '4HZHurmc8Ld78PNnI1ReYqh',
            sku: 'ZIMPDOPD',
            name: 'Apple Mi Watch',
            brand: 'Apple',
            model: 'Mi Watch',
            category: 'Smartwatch',
            color: 'Rose Gold',
            price: 1410.29,
            currency: 'USD',
            stock: 7,
            id: '',
            createdAt: new Date('2023-10-01T12:00:00Z'),
            updatedAt: new Date('2023-10-01T12:00:00Z'),
            isDeleted: false,
          },
        ],
        totalRecords: 1,
        totalPages: 1,
        currentPage: 1,
        hasPreviousPage: true,
        hasNextPage: false,
        previousPage: null,
        nextPage: null,
        hasEllipsisBefore: false,
        hasEllipsisAfter: false,
        pageLinks: [],
      };
      service.findAll.mockResolvedValue(expected);
      // Spies
      const findAllSpy = jest.spyOn(service, 'findAll');
      // Act
      const res = await controller.findAll(query);

      // Assert
      expect(findAllSpy).toHaveBeenCalledWith(query);
      expect(res).toEqual(expected);
    });
  });

  describe('PATCH /products/status/:id', () => {
    it('delegates to service.updateStatus and returns result', async () => {
      // Arrange
      const productId = '123e4567-e89b-12d3-a456-426614174000';
      const expectedResult: IUpdateResult = {
        generatedMaps: [],
        affected: 1,
        raw: {},
      };
      service.updateStatus.mockResolvedValue(expectedResult);
      // Spies
      const updateStatusSpy = jest.spyOn(service, 'updateStatus');
      // Act
      const res = await controller.updateStatus(productId);
      // Assert
      expect(updateStatusSpy).toHaveBeenCalledWith(productId);
      expect(res).toEqual(expectedResult);
    });
  });
  // clean up mocks after each test
  afterEach(() => {
    jest.clearAllMocks();
  });
});
