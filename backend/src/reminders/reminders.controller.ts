import { Controller, Get, Query } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { JwtPayload } from "../domain/auth.types";
import { RemindersService } from "./reminders.service";

@ApiTags("Reminders")
@ApiBearerAuth()
@Controller("reminders")
export class RemindersController {
  constructor(private readonly reminders: RemindersService) {}

  @Get()
  list(
    @CurrentUser() user: JwtPayload,
    @Query("childId") childId?: string,
  ) {
    return this.reminders.list(user, childId);
  }
}
