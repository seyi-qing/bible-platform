import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { Observable, tap } from 'rxjs';

@Injectable()
export class RequestIdInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const response = context.switchToHttp().getResponse();
    const request = context.switchToHttp().getRequest();
    const id = request.header('x-request-id') || randomUUID();
    request.requestId = id;
    response.setHeader('x-request-id', id);
    return next.handle().pipe(tap(() => undefined));
  }
}
