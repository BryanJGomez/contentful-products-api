import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HealthResult } from './utils/app.interface';

describe('AppController', () => {
  let appController: AppController;

  const mockAppService = {
    healthCheck: jest.fn().mockResolvedValue({
      'node-version': 'v20.19.5',
      memory: {
        rss: 106627072,
        heapTotal: 50061312,
        heapUsed: 39175584,
        external: 3490290,
        arrayBuffers: 74590,
      },
      pid: 462,
      uptime: 8.496334099,
      appName: 'contentful-product-sync',
      appVersion: '0.0.1',
      hostname: 'd7166d6dfbbb',
      status: 'ok',
      info: { database: { status: 'up' } },
      error: {},
      details: { database: { status: 'up' } },
    }),
  };
  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [{ provide: AppService, useValue: mockAppService }],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('GET /health', () => {
    it('should return complete health object', async () => {
      const result = <HealthResult>await appController.check();

      expect(result.status).toBe('ok');
      expect(result.info.database.status).toBe('up');
      expect(result.details.database.status).toBe('up');
      expect(result.error).toEqual({});
      expect(result['node-version']).toBeDefined();
      expect(result.memory).toBeDefined();
      expect(result.pid).toBeDefined();
      expect(result.uptime).toBeDefined();
      expect(result.appName).toBeDefined();
      expect(result.appVersion).toBeDefined();
      expect(result.hostname).toBeDefined();

      expect(mockAppService.healthCheck).toHaveBeenCalledTimes(1);
      expect(mockAppService.healthCheck).toHaveBeenCalledWith();
    });

    it('should handle service errors', async () => {
      mockAppService.healthCheck.mockRejectedValueOnce(
        new Error('Service error'),
      );

      await expect(appController.check()).rejects.toThrow();
    });
  });
});
