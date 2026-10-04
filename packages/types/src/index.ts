export type BibleReference = { bookId: string; chapter: number; verseStart?: number; verseEnd?: number };
export type BibleVersion = { id: number; name: string; abbreviation: string; languageTag: string; publisher?: string; copyright?: string };
export type BibleVerse = { reference: string; number: number; text: string };
export type BibleChapter = { versionId: number; bookId: string; chapter: number; verses: BibleVerse[] };
export type HighlightColor = "yellow" | "green" | "blue" | "pink" | "orange";
