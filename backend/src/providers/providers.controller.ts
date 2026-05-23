import { Controller, Get, Param, Patch } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { Roles } from "../common/decorators/roles.decorator";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { JwtPayload } from "../domain/auth.types";
import { ProvidersService } from "./providers.service";

@ApiTags("Pediatrician")
@ApiBearerAuth()
@Roles("pediatrician", "nurse")
@Controller("providers")
export class ProvidersController {
  constructor(private readonly providers: ProvidersService) {}

  @Get("dashboard")
  dashboard(@CurrentUser() user: JwtPayload) {
    return this.providers.dashboard(user);
  }

  @Get("children")
  children(@CurrentUser() user: JwtPayload) {
    return this.providers.listChildren(user);
  }

  @Patch("vaccines/:id/confirm")
  confirmVaccine(
    @CurrentUser() user: JwtPayload,
    @Param("id") id: string,
  ) {
    return this.providers.confirmVaccine(user, id);
  }
}
