export interface AudioTrack {
  id: string;
  versionId: number;
  bookId: string;
  chapter: number;
  title: string;
  durationSeconds: number;
  storageKey: string;
  mimeType: string;
  licenseId?: string | null;
}

export interface PlaybackPosition {
  trackId: string;
  positionSeconds: number;
  completed: boolean;
}
