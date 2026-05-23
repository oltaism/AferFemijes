import { IsEmail, IsEnum, IsOptional, IsString, MinLength } from "class-validator";
import { Role } from "../../domain/types";

export class LoginDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(4)
  password!: string;

  @IsOptional()
  @IsEnum(["parent", "pediatrician", "nurse", "public-health"] as const)
  expectedRole?: Role;
}

export class DemoLoginDto {
  @IsEnum(["parent", "pediatrician", "nurse", "public-health"] as const)
  role!: Role;
}
