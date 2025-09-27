export interface HealthResult {
  'node-version': string;
  memory: {
    rss: number;
    heapTotal: number;
    heapUsed: number;
    external: number;
    arrayBuffers: number;
  };
  pid: number;
  uptime: number;
  appName: string;
  appVersion: string;
  hostname: string;
  status: 'ok' | 'error' | 'shutting_down';
  info: {
    database: {
      status: 'up' | 'down';
    };
  };
  error: Record<string, unknown>;
  details: {
    database: {
      status: 'up' | 'down';
    };
  };
}

export interface TerminusHealthResult {
  status: 'ok' | 'error' | 'shutting_down';
  info: {
    database: {
      status: 'up' | 'down';
    };
  };
  error: Record<string, unknown>;
  details: {
    database: {
      status: 'up' | 'down';
    };
  };
}
