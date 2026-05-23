import { Module } from "@nestjs/common";
import { EnginesModule } from "../engines/engines.module";
import { ChildrenController } from "./children.controller";
import { ChildrenService } from "./children.service";

@Module({
  imports: [EnginesModule],
  controllers: [ChildrenController],
  providers: [ChildrenService],
  exports: [ChildrenService],
})
export class ChildrenModule {}
