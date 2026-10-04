import { Controller, Get } from '@nestjs/common';
import { HealthCheck, HealthCheckService } from '@nestjs/terminus';
import { createDatabase } from '@bible-platform/database';
import Redis from 'ioredis';
import { DependencyHealthIndicator } from './dependency.health';

@Controller('health')
export class HealthController {
  private readonly database = createDatabase(process.env.DATABASE_URL ?? '');
  private readonly redis = new Redis(process.env.REDIS_URL ?? '', { maxRetriesPerRequest: 1 });

  constructor(
    private readonly health: HealthCheckService,
    private readonly dependency: DependencyHealthIndicator,
  ) {}

  @Get('live')
  live() {
    return { status: 'ok', service: 'api', timestamp: new Date().toISOString() };
  }

  @Get()
  @HealthCheck()
  health() {
    return this.ready();
  }

  @Get('ready')
  @HealthCheck()
  ready() {
    return this.health.check([
      () => this.dependency.database(this.database.pool),
      () => this.dependency.redis(this.redis),
    ]);
  }
}
