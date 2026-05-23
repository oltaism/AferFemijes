import { Controller, Get, Param } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { JwtPayload } from "../domain/auth.types";
import { AiRiskService } from "./ai-risk.service";

@ApiTags("AI Risk Engine")
@ApiBearerAuth()
@Controller("ai-risk")
export class AiRiskController {
  constructor(private readonly ai: AiRiskService) {}

  @Get("portfolio")
  portfolio(@CurrentUser() user: JwtPayload) {
    return this.ai.portfolio(user);
  }

  @Get("children/:childId/score")
  score(
    @CurrentUser() user: JwtPayload,
    @Param("childId") childId: string,
  ) {
    return this.ai.score(user, childId);
  }

  @Get("children/:childId/forecast")
  forecast(
    @CurrentUser() user: JwtPayload,
    @Param("childId") childId: string,
  ) {
    return this.ai.forecast(user, childId);
  }

  @Get("children/:childId/alerts")
  alerts(
    @CurrentUser() user: JwtPayload,
    @Param("childId") childId: string,
  ) {
    return this.ai.alerts(user, childId);
  }

  @Get("children/:childId/alerts/:alertId/explain")
  explain(
    @CurrentUser() user: JwtPayload,
    @Param("childId") childId: string,
    @Param("alertId") alertId: string,
  ) {
    return this.ai.explain(user, childId, alertId);
  }
}
