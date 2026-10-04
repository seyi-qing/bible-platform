import { Module } from "@nestjs/common";
import { PrayerController } from "./prayer.controller";

@Module({ controllers: [PrayerController] })
export class PrayerModule {}
