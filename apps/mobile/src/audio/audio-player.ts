/**
 * Platform audio boundary.
 *
 * The UI talks to this interface instead of depending directly on a native audio library.
 * Install the Expo-SDK-compatible `expo-audio` version with `npx expo install expo-audio`.
 */
export interface BibleAudioTrack {
  id: string;
  title: string;
  streamUrl: string;
  durationSeconds: number;
}

export interface BibleAudioPlayer {
  load(track: BibleAudioTrack): Promise<void>;
  play(): Promise<void>;
  pause(): Promise<void>;
  seek(seconds: number): Promise<void>;
  stop(): Promise<void>;
}

/**
 * Placeholder adapter. The production adapter should wrap expo-audio and persist
 * playback position periodically through the sync API.
 */
export class UnconfiguredAudioPlayer implements BibleAudioPlayer {
  async load(_track: BibleAudioTrack) {}
  async play() { throw new Error('Audio adapter is not configured. Install and configure expo-audio.'); }
  async pause() {}
  async seek(_seconds: number) {}
  async stop() {}
}
