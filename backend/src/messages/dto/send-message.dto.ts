import { IsEnum, IsOptional, IsString } from "class-validator";
import { MessageCategory, Role } from "../../domain/types";

export class SendMessageDto {
  @IsString()
  threadId!: string;

  @IsString()
  childId!: string;

  @IsString()
  text!: string;

  @IsEnum(["parent", "pediatrician", "nurse", "public-health"] as const)
  toRole!: Role;

  @IsOptional()
  @IsEnum(["vaccine", "appointment", "growth", "general"] as const)
  category?: MessageCategory;
}
