import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { APP_GUARD } from "@nestjs/core";
import { AuthModule } from "./auth/auth.module";
import { JwtAuthGuard } from "./common/guards/jwt-auth.guard";
import { RolesGuard } from "./common/guards/roles.guard";
import { DatabaseModule } from "./database/database.module";
import { EnginesModule } from "./engines/engines.module";
import { HealthModule } from "./health/health.module";
import { ParentsModule } from "./parents/parents.module";
import { ChildrenModule } from "./children/children.module";
import { ProvidersModule } from "./providers/providers.module";
import { AppointmentsModule } from "./appointments/appointments.module";
import { VaccinesModule } from "./vaccines/vaccines.module";
import { RemindersModule } from "./reminders/reminders.module";
import { MessagesModule } from "./messages/messages.module";
import { NotificationsModule } from "./notifications/notifications.module";
import { AnalyticsModule } from "./analytics/analytics.module";
import { HealthCardsModule } from "./health-cards/health-cards.module";
import { AiRiskModule } from "./ai-risk/ai-risk.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    EnginesModule,
    AuthModule,
    HealthModule,
    ParentsModule,
    ChildrenModule,
    ProvidersModule,
    AppointmentsModule,
    VaccinesModule,
    RemindersModule,
    MessagesModule,
    NotificationsModule,
    AnalyticsModule,
    HealthCardsModule,
    AiRiskModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule {}
