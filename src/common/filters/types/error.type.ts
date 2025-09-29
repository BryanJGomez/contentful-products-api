export type ErrorResponse = {
  statusCode: number;
  message: string | string[];
  error?: string;
  path: string;
  timestamp: string;
};

export type PgDriverError = {
  code?: string;
  detail?: string;
  routine?: string;
};

export type ErrorBody = { message?: string; error?: string };
