import { describe, expect, it } from 'vitest';
import { chapterQuerySchema, passageQuerySchema } from '../index';

describe('Bible query validation', () => {
  it('coerces URL query strings into typed values', () => {
    const result = chapterQuerySchema.parse({ versionId: '123', bookId: 'JHN', chapter: '3' });
    expect(result).toEqual({ versionId: 123, bookId: 'JHN', chapter: 3 });
  });

  it('rejects impossible chapter values', () => {
    expect(() => chapterQuerySchema.parse({ versionId: '0', bookId: 'JHN', chapter: '3' })).toThrow();
  });

  it('accepts an optional verse range', () => {
    const result = passageQuerySchema.parse({ versionId: '123', bookId: 'JHN', chapter: '3', verseStart: '16', verseEnd: '18' });
    expect(result.verseStart).toBe(16);
    expect(result.verseEnd).toBe(18);
  });
});
