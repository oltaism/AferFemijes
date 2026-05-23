import { Controller, Get } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { Roles } from "../common/decorators/roles.decorator";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { JwtPayload } from "../domain/auth.types";
import { ParentsService } from "./parents.service";

@ApiTags("Parent")
@ApiBearerAuth()
@Roles("parent")
@Controller("parent")
export class ParentsController {
  constructor(private readonly parents: ParentsService) {}

  @Get("dashboard")
  dashboard(@CurrentUser() user: JwtPayload) {
    return this.parents.dashboard(user);
  }
}
