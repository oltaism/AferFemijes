import { Controller, Get } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { Roles } from "../common/decorators/roles.decorator";
import { AnalyticsService } from "./analytics.service";

@ApiTags("Public Health Analytics")
@ApiBearerAuth()
@Roles("public-health")
@Controller("analytics")
export class AnalyticsController {
  constructor(private readonly analytics: AnalyticsService) {}

  @Get("dashboard")
  dashboard() {
    return this.analytics.dashboard();
  }

  @Get("outbreaks")
  outbreaks() {
    return this.analytics.outbreaks();
  }

  @Get("outbreaks/vaccine-panel")
  vaccinePanel() {
    return this.analytics.outbreakVaccinePanel();
  }

  @Get("heatmap")
  heatmap() {
    return this.analytics.heatmap();
  }

  @Get("campaigns")
  campaigns() {
    return this.analytics.campaigns();
  }
}
