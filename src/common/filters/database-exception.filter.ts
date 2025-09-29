// src/common/filters/database-exception.filter.ts
import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Response, Request } from 'express';
import { QueryFailedError } from 'typeorm';
import { PgDriverError } from './types/error.type';

function pickPgDriver(err: unknown): PgDriverError {
  if (typeof err === 'object' && err !== null) {
    const r = err as Record<string, unknown>;
    return {
      code: typeof r.code === 'string' ? r.code : undefined,
      detail: typeof r.detail === 'string' ? r.detail : undefined,
      routine: typeof r.routine === 'string' ? r.routine : undefined,
    };
  }
  return {};
}

@Catch(QueryFailedError)
export class DatabaseExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(DatabaseExceptionFilter.name);

  catch(exception: QueryFailedError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const req = ctx.getRequest<Request>();

    const { code, detail, routine } = pickPgDriver(
      (exception as QueryFailedError & { driverError?: unknown }).driverError,
    );

    const { status, error, message } = this.mapPgError(code, detail);

    this.logger.error(
      `DB ${code ?? 'UNKNOWN'} ${routine ?? ''} → ${message}`,
      exception.stack,
    );

    res.status(status).json({
      statusCode: status,
      error,
      message,
      path: req.url,
    });
  }

  private mapPgError(code?: string, detail?: string) {
    switch (code) {
      case '23505': // unique_violation
        return {
          status: HttpStatus.CONFLICT,
          error: 'UNIQUE_VIOLATION',
          message: 'Resource already exists',
        };
      case '23503': // foreign_key_violation
        return {
          status: HttpStatus.CONFLICT,
          error: 'FOREIGN_KEY_VIOLATION',
          message: 'Related resource constraint',
        };
      case '23502': // not_null_violation
        return {
          status: HttpStatus.BAD_REQUEST,
          error: 'NOT_NULL_VIOLATION',
          message: 'Null value not allowed',
        };
      case '22P02': // invalid_text_representation
        return {
          status: HttpStatus.BAD_REQUEST,
          error: 'INVALID_TEXT_REPRESENTATION',
          message: 'Invalid value format',
        };
      default:
        return {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: 'DB_ERROR',
          message: detail ?? 'Database error',
        };
    }
  }
}
