import { Controller, Get, Param } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { JwtPayload } from "../domain/auth.types";
import { VaccinesService } from "./vaccines.service";

@ApiTags("Vaccines")
@ApiBearerAuth()
@Controller("vaccines")
export class VaccinesController {
  constructor(private readonly vaccines: VaccinesService) {}

  @Get("child/:childId")
  forChild(
    @CurrentUser() user: JwtPayload,
    @Param("childId") childId: string,
  ) {
    return this.vaccines.forChild(user, childId);
  }
}
