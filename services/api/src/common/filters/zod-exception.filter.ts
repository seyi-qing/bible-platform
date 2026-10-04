import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus } from '@nestjs/common';
import { ZodError } from 'zod';
import type { Request, Response } from 'express';

/** Converts Zod validation failures into a stable 400 API contract. */
@Catch(ZodError)
export class ZodExceptionFilter implements ExceptionFilter {
  catch(error: ZodError, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse<Response>();
    const request = host.switchToHttp().getRequest<Request>();
    response.status(HttpStatus.BAD_REQUEST).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Request validation failed',
        details: error.issues.map((issue) => ({
          path: issue.path,
          message: issue.message,
          code: issue.code,
        })),
      },
      requestId: request.header('x-request-id') ?? null,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
