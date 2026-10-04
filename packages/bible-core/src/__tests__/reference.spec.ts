import { describe, expect, it } from 'vitest';
import { formatReference, normalizeReference, toUsfm } from '../index';

describe('Bible reference engine', () => {
  it('normalizes a verse reference', () => {
    const ref = normalizeReference('Romans 8:28');
    expect(ref).toEqual({ bookId: 'ROM', chapter: 8, verseStart: 28, verseEnd: undefined });
  });

  it('supports verse ranges', () => {
    const ref = normalizeReference('John 3:16-18');
    expect(ref.bookId).toBe('JHN');
    expect(ref.verseStart).toBe(16);
    expect(ref.verseEnd).toBe(18);
  });

  it('supports chapter-only references', () => {
    const ref = normalizeReference('Psalm 23');
    expect(formatReference(ref)).toBe('Psalms 23');
    expect(toUsfm(ref)).toBe('PSA.23');
  });

  it('rejects reversed ranges', () => {
    expect(() => normalizeReference('John 3:18-16')).toThrow('Verse range is invalid');
  });
});
