import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import type { BibleChapter, BiblePassage, BibleProvider, BibleBook } from '@bible-platform/bible-core';
import type { BibleReference, BibleVersion } from '@bible-platform/types';
import { toUsfm } from '@bible-platform/bible-core';

interface YvpEnvelope<T> { data: T; next_page_token?: string; total_size?: number; }

@Injectable()
export class YouVersionProvider implements BibleProvider {
  private readonly baseUrl = process.env.YVP_BASE_URL ?? 'https://api.youversion.com/v1';
  private readonly appKey = process.env.YVP_APP_KEY;

  private async request<T>(path: string, init?: RequestInit): Promise<T> {
    if (!this.appKey) throw new ServiceUnavailableException('Bible provider is not configured. Set YVP_APP_KEY on the API server.');
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 10_000);
    try {
      const response = await fetch(`${this.baseUrl}${path}`, {
        ...init,
        signal: controller.signal,
        headers: { accept: 'application/json', 'X-YVP-App-Key': this.appKey, ...(init?.headers ?? {}) },
      });
      if (response.status === 204) throw new ServiceUnavailableException('Bible provider returned no content');
      if (!response.ok) {
        const body = await response.text().catch(() => '');
        const error = new Error(`Bible provider returned ${response.status}: ${body.slice(0, 300)}`);
        if (response.status === 429) throw new ServiceUnavailableException('Bible provider rate limit reached. Retry shortly.');
        throw error;
      }
      return await response.json() as T;
    } finally { clearTimeout(timer); }
  }

  async getVersions(language = 'en'): Promise<BibleVersion[]> {
    const query = new URLSearchParams({ 'language_ranges[]': language, page_size: '99' });
    const envelope = await this.request<YvpEnvelope<Array<Record<string, unknown>>>>(`/bibles?${query}`);
    return envelope.data.map(v => ({
      id: Number(v.id), abbreviation: String(v.abbreviation ?? v.localized_abbreviation ?? ''),
      name: String(v.title ?? v.localized_title ?? ''), languageTag: String(v.language_tag ?? (v.language as Record<string,unknown>|undefined)?.iso_639_1 ?? language),
      publisher: v.publisher ? String(v.publisher) : undefined, copyright: v.copyright ? String(v.copyright) : undefined,
    }));
  }

  async getBooks(versionId: number): Promise<BibleBook[]> {
    const envelope = await this.request<YvpEnvelope<BibleBook[]>>(`/bibles/${versionId}/books`);
    return envelope.data;
  }

  async getChapter(versionId: number, bookId: string, chapter: number): Promise<BibleChapter> {
    const envelope = await this.request<YvpEnvelope<Array<{ id: string; passage_id?: string; title?: string }>>>(`/bibles/${versionId}/books/${encodeURIComponent(bookId)}/chapters/${chapter}/verses`);
    return { versionId, bookId, chapter, verses: envelope.data.map(v => ({ reference: v.passage_id ?? `${bookId}.${chapter}.${v.id}`, number: Number(v.id), text: v.title ?? '' })) };
  }

  async getPassage(versionId: number, reference: BibleReference): Promise<BiblePassage> {
    const usfm = toUsfm(reference);
    return this.request<BiblePassage>(`/bibles/${versionId}/passages/${encodeURIComponent(usfm)}`);
  }
}
