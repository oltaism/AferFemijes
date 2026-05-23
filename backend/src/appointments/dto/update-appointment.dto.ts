import { IsEnum, IsOptional, IsString } from "class-validator";

export class UpdateAppointmentDto {
  @IsOptional()
  @IsEnum(["pending", "confirmed", "completed", "missed", "cancelled"] as const)
  status?: "pending" | "confirmed" | "completed" | "missed" | "cancelled";

  @IsOptional()
  @IsString()
  date?: string;

  @IsOptional()
  @IsString()
  time?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
