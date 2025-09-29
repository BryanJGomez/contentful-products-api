import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import type { Response } from 'express';
import { AxiosError } from 'axios';
import { ErrorBody } from './types/error.type';

@Catch(AxiosError)
export class AxiosExceptionFilter implements ExceptionFilter {
  catch(err: AxiosError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();

    const isTimeout =
      err.code === 'ECONNABORTED' ||
      (typeof err.message === 'string' &&
        err.message.toLowerCase().includes('timeout'));

    const status =
      (typeof err.response?.status === 'number'
        ? err.response.status
        : undefined) ??
      (isTimeout ? HttpStatus.GATEWAY_TIMEOUT : HttpStatus.BAD_GATEWAY);

    const body = err.response?.data as ErrorBody;
    const message = body?.message ?? body?.error ?? err.message;

    res.status(status).json({
      statusCode: status,
      error: 'UPSTREAM_ERROR',
      message,
    });
  }
}
