import { Test, TestingModule } from '@nestjs/testing';
import { HealthCheckService, TypeOrmHealthIndicator } from '@nestjs/terminus';
import { AppService } from './app.service';
import { HealthResult, TerminusHealthResult } from './utils/app.interface';

const mockHealthCheckService = {
  check: jest
    .fn()
    .mockImplementation(
      async (
        indicators: Array<() => unknown>,
      ): Promise<TerminusHealthResult> => {
        for (const indicator of indicators) {
          await indicator();
        }
        return {
          status: 'ok',
          info: { database: { status: 'up' } },
          error: {},
          details: { database: { status: 'up' } },
        };
      },
    ),
};

const mockTypeOrmHealthIndicator = {
  pingCheck: jest.fn().mockResolvedValue({ database: { status: 'up' } }),
};

describe('AppService', () => {
  let service: AppService;
  // Mocks
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AppService,
        { provide: HealthCheckService, useValue: mockHealthCheckService },
        {
          provide: TypeOrmHealthIndicator,
          useValue: mockTypeOrmHealthIndicator,
        },
      ],
    }).compile();
    // Servicio a testear
    service = module.get<AppService>(AppService);
  });

  it('healthCheck returns merged health info', async () => {
    const result = <HealthResult>await service.healthCheck();
    //
    expect(result.status).toBe('ok');
    expect(result.info.database.status).toBe('up');
    expect(result.details.database.status).toBe('up');
    expect(result.error).toEqual({});
    //
    expect(result['node-version']).toBeDefined();
    expect(result.memory).toBeDefined();
    expect(result.pid).toBeDefined();
    expect(result.uptime).toBeDefined();
    expect(result.appName).toBeDefined();
    expect(result.appVersion).toBeDefined();
    expect(result.hostname).toBeDefined();
    //
    expect(mockHealthCheckService.check).toHaveBeenCalledTimes(1);
    expect(mockTypeOrmHealthIndicator.pingCheck).toHaveBeenCalledWith(
      'database',
    );
  });

  it('should handle database error', async () => {
    mockTypeOrmHealthIndicator.pingCheck.mockRejectedValueOnce(
      new Error('DB error'),
    );

    await expect(service.healthCheck()).rejects.toThrow();
  });
  //
  afterEach(() => {
    // Limpia todos los mocks después de cada test
    jest.clearAllMocks();
  });
});
