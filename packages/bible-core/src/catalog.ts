/** Canonical Bible book catalog used for parsing and displaying references.
 * The identifiers follow USFM conventions used by the provider API.
 */
export const BIBLE_BOOKS = [
  ['GEN','Genesis'],['EXO','Exodus'],['LEV','Leviticus'],['NUM','Numbers'],['DEU','Deuteronomy'],
  ['JOS','Joshua'],['JDG','Judges'],['RUT','Ruth'],['1SA','1 Samuel'],['2SA','2 Samuel'],
  ['1KI','1 Kings'],['2KI','2 Kings'],['1CH','1 Chronicles'],['2CH','2 Chronicles'],['EZR','Ezra'],
  ['NEH','Nehemiah'],['EST','Esther'],['JOB','Job'],['PSA','Psalms'],['PRO','Proverbs'],['ECC','Ecclesiastes'],
  ['SNG','Song of Songs'],['ISA','Isaiah'],['JER','Jeremiah'],['LAM','Lamentations'],['EZK','Ezekiel'],
  ['DAN','Daniel'],['HOS','Hosea'],['JOL','Joel'],['AMO','Amos'],['OBA','Obadiah'],['JON','Jonah'],
  ['MIC','Micah'],['NAM','Nahum'],['HAB','Habakkuk'],['ZEP','Zephaniah'],['HAG','Haggai'],['ZEC','Zechariah'],['MAL','Malachi'],
  ['MAT','Matthew'],['MRK','Mark'],['LUK','Luke'],['JHN','John'],['ACT','Acts'],['ROM','Romans'],
  ['1CO','1 Corinthians'],['2CO','2 Corinthians'],['GAL','Galatians'],['EPH','Ephesians'],['PHP','Philippians'],
  ['COL','Colossians'],['1TH','1 Thessalonians'],['2TH','2 Thessalonians'],['1TI','1 Timothy'],['2TI','2 Timothy'],
  ['TIT','Titus'],['PHM','Philemon'],['HEB','Hebrews'],['JAS','James'],['1PE','1 Peter'],['2PE','2 Peter'],
  ['1JN','1 John'],['2JN','2 John'],['3JN','3 John'],['JUD','Jude'],['REV','Revelation'],
] as const;

const aliases: Record<string,string> = {
  PS:'PSA',PSALM:'PSA',PSALMS:'PSA',JN:'JHN',JOHN:'JHN',ROMANS:'ROM',ROM:'ROM',
  CORINTHIANS:'1CO',CORINTHIAN:'1CO',"1CORINTHIANS":'1CO',"2CORINTHIANS":'2CO',
  PHIL:'PHP',PHILIPPIANS:'PHP',EPH:'EPH',REVELATION:'REV',REV:'REV',GENESIS:'GEN',GEN:'GEN',
  EXODUS:'EXO',EX:'EXO',MATTHEW:'MAT',MATT:'MAT',MARK:'MRK',LUKE:'LUK',ACTS:'ACT'
};

export function resolveBook(input: string): string {
  const normalized = input.toUpperCase().replace(/\./g,'').replace(/\s+/g,' ').trim();
  const exact = BIBLE_BOOKS.find(([id,name]) => id === normalized || name.toUpperCase() === normalized);
  if (exact) return exact[0];
  return aliases[normalized.replace(/ /g,'')] ?? normalized.replace(/ /g,'');
}

export function bookName(bookId: string): string {
  return BIBLE_BOOKS.find(([id]) => id === bookId)?.[1] ?? bookId;
}
