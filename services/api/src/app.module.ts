import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { HealthController } from './common/health/health.controller';
import { RequestIdInterceptor } from './common/interceptors/request-id.interceptor';
import { SecurityHeadersMiddleware } from './common/security/security-headers';
import { AdminController } from './admin/admin.controller';
import { AdminService } from './admin/admin.service';
import { NotificationsController } from './notifications/notifications.controller';
import { QueuesModule } from './queues/queues.module';
import { AuthModule } from './modules/auth/auth.module';
import { BibleModule } from './modules/bible/bible.module';
import { StudyModule } from './modules/study/study.module';
import { SearchModule } from './modules/search/search.module';
import { SyncModule } from './modules/sync/sync.module';
import { PlansModule } from './modules/plans/plans.module';
import { PrayerModule } from './modules/prayer/prayer.module';
import { HistoryModule } from './modules/history/history.module';
import { CommunityModule } from './modules/community/community.module';
import { AiModule } from './modules/ai/ai.module';
import { AudioModule } from './modules/audio/audio.module';
import { TerminusModule } from '@nestjs/terminus';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { DependencyHealthIndicator } from './common/health/dependency.health';

@Module({
  imports: [TerminusModule, ThrottlerModule.forRoot([{ ttl: 60000, limit: 120 }]), QueuesModule, AuthModule, BibleModule, StudyModule, SearchModule, SyncModule, PlansModule, PrayerModule, HistoryModule, CommunityModule, AiModule, AudioModule],
  controllers: [HealthController, AdminController, NotificationsController],
  providers: [RequestIdInterceptor, AdminService, DependencyHealthIndicator, { provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(SecurityHeadersMiddleware).forRoutes('*');
  }
}
