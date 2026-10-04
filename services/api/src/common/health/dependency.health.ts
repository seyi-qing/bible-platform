import { Injectable } from '@nestjs/common';
import { HealthIndicator, HealthIndicatorResult } from '@nestjs/terminus';
import type { Pool } from 'pg';
import Redis from 'ioredis';

@Injectable()
export class DependencyHealthIndicator extends HealthIndicator {
  async database(pool: Pool): Promise<HealthIndicatorResult> {
    try {
      await pool.query('SELECT 1');
      return this.getStatus('postgres', true);
    } catch {
      return this.getStatus('postgres', false);
    }
  }

  async redis(redis: Redis): Promise<HealthIndicatorResult> {
    try {
      await redis.ping();
      return this.getStatus('redis', true);
    } catch {
      return this.getStatus('redis', false);
    }
  }
}
