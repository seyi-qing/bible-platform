import { Body, Controller, Delete, Get, Param, Post, Put, Req, UseGuards } from "@nestjs/common";
import { eq, and, desc } from "drizzle-orm";
import { createDatabase, bookmarks, highlights, notes } from "@bible-platform/database";
import { AuthGuard, AuthenticatedRequest } from "../../common/guards/auth.guard";
import { z } from "zod";

const highlightSchema = z.object({ versionId: z.number().int().positive(), reference: z.string().min(3).max(80), color: z.enum(["yellow","green","blue","pink","orange"]) });
const noteSchema = z.object({ versionId: z.number().int().positive().optional(), reference: z.string().max(80).optional(), title: z.string().max(200).optional(), body: z.string().min(1).max(50_000), isPrivate: z.boolean().optional() });
const bookmarkSchema = z.object({ versionId: z.number().int().positive(), reference: z.string().min(3).max(80), label: z.string().max(120).optional() });

@Controller("study")
@UseGuards(AuthGuard)
export class StudyController {
  private readonly database = createDatabase(process.env.DATABASE_URL ?? "");
  constructor() {}

  @Get("highlights") listHighlights(@Req() req: AuthenticatedRequest) { return this.database.db.select().from(highlights).where(eq(highlights.userId, req.user.sub)).orderBy(desc(highlights.createdAt)); }
  @Post("highlights") createHighlight(@Req() req: AuthenticatedRequest, @Body() body: unknown) { const input = highlightSchema.parse(body); return this.database.db.insert(highlights).values({ ...input, userId: req.user.sub }).onConflictDoUpdate({ target: [highlights.userId, highlights.versionId, highlights.reference], set: { color: input.color } }).returning(); }
  @Delete("highlights/:id") deleteHighlight(@Req() req: AuthenticatedRequest, @Param("id") id: string) { return this.database.db.delete(highlights).where(and(eq(highlights.id, id), eq(highlights.userId, req.user.sub))).returning(); }

  @Get("notes") listNotes(@Req() req: AuthenticatedRequest) { return this.database.db.select().from(notes).where(eq(notes.userId, req.user.sub)).orderBy(desc(notes.updatedAt)); }
  @Post("notes") createNote(@Req() req: AuthenticatedRequest, @Body() body: unknown) { const input = noteSchema.parse(body); return this.database.db.insert(notes).values({ ...input, userId: req.user.sub, isPrivate: input.isPrivate ?? true }).returning(); }
  @Put("notes/:id") updateNote(@Req() req: AuthenticatedRequest, @Param("id") id: string, @Body() body: unknown) { const input = noteSchema.partial().parse(body); return this.database.db.update(notes).set({ ...input, updatedAt: new Date() }).where(and(eq(notes.id, id), eq(notes.userId, req.user.sub))).returning(); }
  @Delete("notes/:id") deleteNote(@Req() req: AuthenticatedRequest, @Param("id") id: string) { return this.database.db.delete(notes).where(and(eq(notes.id, id), eq(notes.userId, req.user.sub))).returning(); }

  @Get("bookmarks") listBookmarks(@Req() req: AuthenticatedRequest) { return this.database.db.select().from(bookmarks).where(eq(bookmarks.userId, req.user.sub)).orderBy(desc(bookmarks.createdAt)); }
  @Post("bookmarks") createBookmark(@Req() req: AuthenticatedRequest, @Body() body: unknown) { const input = bookmarkSchema.parse(body); return this.database.db.insert(bookmarks).values({ ...input, userId: req.user.sub }).returning(); }
  @Delete("bookmarks/:id") deleteBookmark(@Req() req: AuthenticatedRequest, @Param("id") id: string) { return this.database.db.delete(bookmarks).where(and(eq(bookmarks.id, id), eq(bookmarks.userId, req.user.sub))).returning(); }
}
