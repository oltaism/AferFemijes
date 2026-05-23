import { IsEnum, IsOptional, IsString } from "class-validator";
import { AppointmentServiceType } from "../../domain/types";

export class CreateAppointmentDto {
  @IsString()
  childId!: string;

  @IsEnum([
    "vaccination",
    "routine-checkup",
    "growth-monitoring",
    "development-follow-up",
    "pediatric-consultation",
  ] as const)
  service!: AppointmentServiceType;

  @IsString()
  date!: string;

  @IsString()
  time!: string;

  @IsOptional()
  @IsString()
  providerId?: string;

  @IsOptional()
  @IsString()
  healthCenter?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
