import { Module } from "@nestjs/common";
import { AiController } from "./ai.controller";
import { AiService } from "./ai.service";
import { OpenAiModelProvider } from "./model.provider";
@Module({ controllers: [AiController], providers: [AiService, OpenAiModelProvider] })
export class AiModule {}
