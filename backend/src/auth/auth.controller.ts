import { Body, Controller, Get, Post } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { AuthService } from "./auth.service";
import { DemoLoginDto, LoginDto } from "./dto/login.dto";
import { RegisterDto } from "./dto/register.dto";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { JwtPayload } from "../domain/auth.types";
import { Public } from "../common/decorators/public.decorator";

@ApiTags("Auth")
@Controller("auth")
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Public()
  @Post("login")
  login(@Body() dto: LoginDto) {
    return this.auth.login(dto);
  }

  @Public()
  @Post("register")
  register(@Body() dto: RegisterDto) {
    return this.auth.register(dto);
  }

  @Public()
  @Post("demo-login")
  demoLogin(@Body() dto: DemoLoginDto) {
    return this.auth.demoLogin(dto);
  }

  @Public()
  @Get("demo-accounts")
  demoAccounts() {
    return this.auth.demoAccounts();
  }

  @ApiBearerAuth()
  @Get("me")
  me(@CurrentUser() user: JwtPayload) {
    return this.auth.me(user);
  }
}
