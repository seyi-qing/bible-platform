import { BadRequestException, Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard, AuthenticatedRequest } from '../../common/guards/auth.guard';
import { pushSyncSchema, pullSyncSchema } from './sync.dto';
import { SyncService } from './sync.service';

@Controller('sync')
@UseGuards(AuthGuard)
export class SyncController {
  constructor(private readonly sync: SyncService) {}

  @Post('devices') registerDevice(@Req() req: AuthenticatedRequest, @Body() body: unknown) {
    const parsed = body as { id?: string; name?: string; platform?: string };
    if (!parsed.name || !parsed.platform) throw new BadRequestException('name and platform are required');
    return this.sync.registerDevice(req.user.sub, { id: parsed.id, name: parsed.name, platform: parsed.platform });
  }

  @Post('push') push(@Req() req: AuthenticatedRequest, @Body() body: unknown) {
    const input = pushSyncSchema.parse(body);
    return this.sync.push(req.user.sub, input.operations);
  }

  @Post('pull') pull(@Req() req: AuthenticatedRequest, @Body() body: unknown) {
    const input = pullSyncSchema.parse(body);
    return this.sync.pull(req.user.sub, input.cursor, input.limit);
  }
}
