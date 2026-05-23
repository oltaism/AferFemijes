import { Module } from "@nestjs/common";
import { ParentsController } from "./parents.controller";
import { ParentsService } from "./parents.service";
import { EnginesModule } from "../engines/engines.module";

@Module({
  imports: [EnginesModule],
  controllers: [ParentsController],
  providers: [ParentsService],
})
export class ParentsModule {}
