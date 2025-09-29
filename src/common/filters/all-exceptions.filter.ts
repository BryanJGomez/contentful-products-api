import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Response, Request } from 'express';
import { ErrorResponse } from './types/error.type';

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null;
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const req = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let body: ErrorResponse = {
      statusCode: status,
      message: 'Internal server error',
      path: req.url,
      timestamp: new Date().toISOString(),
    };

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const resp = exception.getResponse();

      const msg: string | string[] =
        typeof resp === 'string'
          ? resp
          : isRecord(resp) &&
              (typeof resp.message === 'string' || Array.isArray(resp.message))
            ? (resp.message as string | string[])
            : exception.message;

      const errStr =
        isRecord(resp) && typeof resp.error === 'string'
          ? resp.error
          : undefined;

      body = {
        statusCode: status,
        message: msg,
        ...(errStr && { error: errStr }),
        path: req.url,
        timestamp: new Date().toISOString(),
      };
    } else if (exception instanceof Error) {
      this.logger.error(exception.message, exception.stack);
      body.message = exception.message;
    } else {
      this.logger.error(`Unknown thrown value: ${String(exception)}`);
    }

    res.status(status).json(body);
  }
}
