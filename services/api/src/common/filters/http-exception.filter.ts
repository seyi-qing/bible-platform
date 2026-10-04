import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);
  catch(error: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = error instanceof HttpException ? error.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
    const payload = error instanceof HttpException ? error.getResponse() : undefined;
    if (status >= 500) this.logger.error({ path: request.url, method: request.method, error });
    response.status(status).json({
      error: { code: `HTTP_${status}`, message: typeof payload === 'string' ? payload : 'Request failed' },
      requestId: request.header('x-request-id') ?? null,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
