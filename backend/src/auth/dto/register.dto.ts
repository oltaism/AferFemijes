import { IsEmail, IsEnum, IsOptional, IsString, MinLength } from "class-validator";
import { Role } from "../../domain/types";

export class RegisterDto {
  @IsEmail({}, { message: "Email i pavlefshëm." })
  email!: string;

  @IsString()
  @MinLength(6, { message: "Fjalëkalimi duhet të ketë të paktën 6 karaktere." })
  password!: string;

  @IsString()
  @MinLength(2, { message: "Shkruani emrin e plotë." })
  name!: string;

  @IsOptional()
  @IsEnum(["parent", "pediatrician", "nurse", "public-health"] as const)
  role?: Role;
}
