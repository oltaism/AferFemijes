import { Controller, Get, Param } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { JwtPayload } from "../domain/auth.types";
import { HealthCardsService } from "./health-cards.service";

@ApiTags("QR Health Cards")
@ApiBearerAuth()
@Controller("health-cards")
export class HealthCardsController {
  constructor(private readonly cards: HealthCardsService) {}

  @Get(":childId/qr")
  qr(
    @CurrentUser() user: JwtPayload,
    @Param("childId") childId: string,
  ) {
    return this.cards.qrForChild(user, childId);
  }
}
