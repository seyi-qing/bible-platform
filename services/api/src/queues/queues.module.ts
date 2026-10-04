import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';

/** Central queue registry. Heavy work must not block HTTP requests. */
@Module({
  imports: [
    BullModule.forRoot({
      connection: { url: process.env.REDIS_URL ?? 'redis://localhost:6379' },
      prefix: 'bible-platform',
    }),
    BullModule.registerQueue(
      { name: 'audio' },
      { name: 'notifications' },
      { name: 'ai' },
      { name: 'search-index' },
      { name: 'maintenance' },
    ),
  ],
  exports: [BullModule],
})
export class QueuesModule {}
