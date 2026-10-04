import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { BibleService } from './bible.service';

@Controller('bible')
export class BibleController {
  constructor(private readonly bible: BibleService) {}
  @Get('versions') versions(@Query('language') language?: string) { return this.bible.getVersions(language); }
  @Get('versions/:versionId/books') books(@Param('versionId', ParseIntPipe) versionId: number) { return this.bible.getBooks(versionId); }
  @Get('versions/:versionId/books/:bookId/chapters/:chapter') chapter(@Param('versionId', ParseIntPipe) versionId: number, @Param('bookId') bookId: string, @Param('chapter', ParseIntPipe) chapter: number) { return this.bible.getChapter(versionId, bookId, chapter); }
  @Get('versions/:versionId/passages/:reference') passage(@Param('versionId', ParseIntPipe) versionId: number, @Param('reference') reference: string) { return this.bible.getPassage(versionId, reference); }
}
