import { BadRequestException, Controller, Get, Query } from "@nestjs/common";
import { sql } from "drizzle-orm";
import { createDatabase, bibleVerses } from "@bible-platform/database";

@Controller("search")
export class SearchController {
  private readonly database = createDatabase(process.env.DATABASE_URL ?? "");

  @Get("bible")
  async searchBible(
    @Query("q") q?: string,
    @Query("versionId") versionId?: string,
    @Query("bookId") bookId?: string,
    @Query("limit") limitRaw?: string,
  ) {
    const query = q?.trim();
    if (!query || query.length < 2) throw new BadRequestException("q must contain at least 2 characters");

    const limit = Math.min(Math.max(Number(limitRaw ?? 30) || 30, 1), 100);
    const version = versionId ? Number(versionId) : undefined;
    if (version !== undefined && (!Number.isInteger(version) || version < 1)) {
      throw new BadRequestException("versionId must be a positive integer");
    }

    const filters = [sql`to_tsvector('simple', ${bibleVerses.searchText}) @@ plainto_tsquery('simple', ${query})`];
    if (version !== undefined) filters.push(sql`${bibleVerses.versionId} = ${version}`);
    if (bookId) filters.push(sql`${bibleVerses.bookId} = ${bookId.toUpperCase()}`);

    const where = filters.reduce((a, b) => sql`${a} AND ${b}`);
    const rows = await this.database.db.select({
      id: bibleVerses.id, versionId: bibleVerses.versionId, reference: bibleVerses.reference,
      bookId: bibleVerses.bookId, chapter: bibleVerses.chapter, verse: bibleVerses.verse, text: bibleVerses.text,
    }).from(bibleVerses).where(where).limit(limit);

    return { query, count: rows.length, results: rows };
  }
}
