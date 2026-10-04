import { z } from "zod";
export const chapterQuerySchema = z.object({ versionId: z.coerce.number().int().positive(), bookId: z.string().min(2).max(12), chapter: z.coerce.number().int().positive().max(200) });
export const passageQuerySchema = chapterQuerySchema.extend({ verseStart: z.coerce.number().int().positive().optional(), verseEnd: z.coerce.number().int().positive().optional() });
