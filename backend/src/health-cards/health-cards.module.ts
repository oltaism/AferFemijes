import { Module } from "@nestjs/common";
import { ChildrenModule } from "../children/children.module";
import { HealthCardsController } from "./health-cards.controller";
import { HealthCardsService } from "./health-cards.service";

@Module({
  imports: [ChildrenModule],
  controllers: [HealthCardsController],
  providers: [HealthCardsService],
})
export class HealthCardsModule {}
