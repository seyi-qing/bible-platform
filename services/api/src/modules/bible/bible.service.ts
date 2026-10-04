import { BadRequestException, Injectable } from '@nestjs/common';
import type { BibleChapter, BibleVersion } from '@bible-platform/types';
import { formatReference, normalizeReference } from '@bible-platform/bible-core';
import { YouVersionProvider } from './youversion.provider';

@Injectable()
export class BibleService {
  constructor(private readonly provider: YouVersionProvider) {}
  getVersions(language?: string): Promise<BibleVersion[]> { return this.provider.getVersions(language); }
  getBooks(versionId: number) { return this.provider.getBooks(versionId); }
  getChapter(versionId: number, bookId: string, chapter: number): Promise<BibleChapter> { return this.provider.getChapter(versionId, bookId, chapter); }
  async getPassage(versionId: number, rawReference: string) {
    try {
      const reference = normalizeReference(rawReference);
      const passage = await this.provider.getPassage(versionId, reference);
      return { ...passage, normalizedReference: formatReference(reference) };
    } catch (error) {
      if (error instanceof Error && error.message.startsWith('Invalid Bible reference')) throw new BadRequestException(error.message);
      throw error;
    }
  }
}
