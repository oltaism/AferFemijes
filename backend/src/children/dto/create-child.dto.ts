import {
  IsArray,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from "class-validator";
import { Type } from "class-transformer";
import { Municipality } from "../../domain/types";

class EmergencyContactDto {
  @IsString()
  name!: string;

  @IsString()
  phone!: string;

  @IsString()
  relation!: string;
}

export class CreateChildDto {
  @IsString()
  fullName!: string;

  @IsString()
  dateOfBirth!: string;

  @IsOptional()
  @IsEnum(["F", "M", "O"] as const)
  gender?: "F" | "M" | "O";

  @IsOptional()
  @IsNumber()
  avatarHue?: number;

  @IsOptional()
  @IsEnum([
    "Prishtina",
    "Prizren",
    "Peja",
    "Mitrovica",
    "Gjilan",
    "Ferizaj",
  ] as const)
  municipality?: Municipality;

  @IsOptional()
  @IsString()
  healthCenter?: string;

  @IsOptional()
  @IsString()
  pediatricianId?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  allergies?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  chronicConditions?: string[];

  @IsOptional()
  @ValidateNested()
  @Type(() => EmergencyContactDto)
  emergencyContact?: EmergencyContactDto;
}
