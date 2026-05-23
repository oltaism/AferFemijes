import { Module } from "@nestjs/common";
import { ChildrenModule } from "../children/children.module";
import { VaccinesController } from "./vaccines.controller";
import { VaccinesService } from "./vaccines.service";

@Module({
  imports: [ChildrenModule],
  controllers: [VaccinesController],
  providers: [VaccinesService],
})
export class VaccinesModule {}
