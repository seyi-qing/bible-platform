import type { BibleChapter, BibleReference, BibleVersion } from '@bible-platform/types';
import { bookName, resolveBook } from './catalog';

export interface BibleBook { id: string; title: string; fullTitle?: string; abbreviation?: string; canon?: string; }
export interface BiblePassage { id: string; reference: string; content: string; }
export interface BibleProvider {
  getVersions(language?: string): Promise<BibleVersion[]>;
  getBooks(versionId: number): Promise<BibleBook[]>;
  getChapter(versionId: number, bookId: string, chapter: number): Promise<BibleChapter>;
  getPassage(versionId: number, reference: BibleReference): Promise<BiblePassage>;
}

export function normalizeReference(input: string): BibleReference {
  const value = input.trim().replace(/\s+/g, ' ');
  const match = value.match(/^(.+?)\s+(\d+)(?::(\d+)(?:-(\d+))?)?$/);
  if (!match) throw new Error(`Invalid Bible reference: ${input}`);
  const bookId = resolveBook(match[1]);
  const chapter = Number(match[2]);
  const verseStart = match[3] ? Number(match[3]) : undefined;
  const verseEnd = match[4] ? Number(match[4]) : undefined;
  if (!Number.isInteger(chapter) || chapter < 1) throw new Error('Chapter must be a positive integer');
  if (verseStart !== undefined && (!Number.isInteger(verseStart) || verseStart < 1)) throw new Error('Verse must be a positive integer');
  if (verseEnd !== undefined && verseEnd < verseStart!) throw new Error('Verse range is invalid');
  return { bookId, chapter, verseStart, verseEnd };
}

export function formatReference(ref: BibleReference): string {
  const book = bookName(ref.bookId);
  if (!ref.verseStart) return `${book} ${ref.chapter}`;
  return `${book} ${ref.chapter}:${ref.verseStart}${ref.verseEnd ? `-${ref.verseEnd}` : ''}`;
}

export function toUsfm(ref: BibleReference): string {
  const base = `${ref.bookId}.${ref.chapter}`;
  return ref.verseStart ? `${base}.${ref.verseStart}${ref.verseEnd ? `-${ref.verseEnd}` : ''}` : base;
}
