import { Module } from "@nestjs/common";
import { DatabaseModule } from "../database/database.module";
import { RiskEngine } from "./risk.engine";
import { PredictiveEngine } from "./predictive.engine";
import { OutbreakEngine } from "./outbreak.engine";

@Module({
  imports: [DatabaseModule],
  providers: [RiskEngine, PredictiveEngine, OutbreakEngine],
  exports: [RiskEngine, PredictiveEngine, OutbreakEngine],
})
export class EnginesModule {}