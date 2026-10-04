import { Module } from "@nestjs/common";
import { SearchController } from "./search.controller";
import { IndexingController } from "./indexing.controller";

@Module({ controllers: [SearchController, IndexingController] })
export class SearchModule {}
