import { Body, Controller, Get, Param, ParseIntPipe, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../../common/guards/auth.guard';
import { AudioService } from './audio.service';

@Controller('audio')
export class AudioController {
  constructor(private readonly audio: AudioService) {}

  @Get('versions/:versionId/books/:bookId')
  list(@Param('versionId', ParseIntPipe) versionId: number, @Param('bookId') bookId: string) {
    return this.audio.list(versionId, bookId);
  }

  @Get('tracks/:trackId')
  get(@Param('trackId') trackId: string) {
    return this.audio.get(trackId);
  }

  @UseGuards(AuthGuard)
  @Post('tracks/:trackId/playback')
  playback(@Param('trackId') trackId: string, @Body() body: { positionSeconds: number; completed?: boolean }) {
    return this.audio.normalizePosition({ trackId, positionSeconds: body.positionSeconds, completed: body.completed ?? false });
  }
}
