import { Injectable, NotFoundException } from '@nestjs/common';
import type { AudioTrack, PlaybackPosition } from './audio.types';

/**
 * Audio catalog boundary. Storage/CDN credentials deliberately stay outside the client.
 * Replace the demo catalog lookup with PostgreSQL/Drizzle queries when audio licenses are loaded.
 */
@Injectable()
export class AudioService {
  private readonly demoTracks = new Map<string, AudioTrack>();

  list(versionId: number, bookId: string): AudioTrack[] {
    return [...this.demoTracks.values()].filter((track) => track.versionId === versionId && track.bookId === bookId);
  }

  get(trackId: string): AudioTrack {
    const track = this.demoTracks.get(trackId);
    if (!track) throw new NotFoundException('Audio track not found');
    return track;
  }

  /**
   * The real implementation should issue a short-lived signed CDN URL after
   * verifying that the user/app is licensed to access the requested track.
   */
  createPlaybackDescriptor(trackId: string) {
    const track = this.get(trackId);
    return { trackId, mimeType: track.mimeType, durationSeconds: track.durationSeconds, streamUrl: null };
  }

  normalizePosition(input: PlaybackPosition): PlaybackPosition {
    const track = this.get(input.trackId);
    const positionSeconds = Math.max(0, Math.min(input.positionSeconds, track.durationSeconds));
    return { ...input, positionSeconds, completed: input.completed || positionSeconds >= track.durationSeconds };
  }
}
