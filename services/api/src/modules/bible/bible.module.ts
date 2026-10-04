import { Module } from '@nestjs/common';
import { BibleController } from './bible.controller';
import { BibleService } from './bible.service';
import { YouVersionProvider } from './youversion.provider';
@Module({ controllers: [BibleController], providers: [BibleService, YouVersionProvider], exports: [BibleService] })
export class BibleModule {}
