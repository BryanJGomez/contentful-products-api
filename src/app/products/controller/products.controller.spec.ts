import { Test, TestingModule } from '@nestjs/testing';
import { ProductsController } from './products.controller';
import { ProductsService } from '../services/products.service';
import { SearchQueryParamsDto } from '../dto/product.dto';
import { IUpdateResult } from '../interface/producto.interface';

describe('ProductsController (unit)', () => {
  let controller: ProductsController;
  let service: {
    findAll: jest.Mock;
    updateStatus: jest.Mock;
  };

  beforeEach(async () => {
    service = {
      findAll: jest.fn(),
      updateStatus: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductsController],
      providers: [{ provide: ProductsService, useValue: service }],
    }).compile();

    controller = module.get<ProductsController>(ProductsController);
  });

  describe('/GET products', () => {
    it('llama al service con los query params y retorna su resultado', async () => {
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
      service.findAll.mockResolvedValue(expected);

      const res = await controller.findAll(query);

      expect(service.findAll).toHaveBeenCalledWith(query);
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
      service.findAll.mockResolvedValue(expected);

      const res = await controller.findAll(query);

      expect(service.findAll).toHaveBeenCalledWith(query);
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
      service.updateStatus.mockResolvedValue(expectedResult);

      const res = await controller.updateStatus(productId);

      expect(service.updateStatus).toHaveBeenCalledWith(productId);
      expect(res).toEqual(expectedResult);
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
});
