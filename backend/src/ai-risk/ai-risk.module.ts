import { Module } from "@nestjs/common";
import { ChildrenModule } from "../children/children.module";
import { EnginesModule } from "../engines/engines.module";
import { AiRiskController } from "./ai-risk.controller";
import { AiRiskService } from "./ai-risk.service";

@Module({
  imports: [EnginesModule, ChildrenModule],
  controllers: [AiRiskController],
  providers: [AiRiskService],
})
export class AiRiskModule {}
