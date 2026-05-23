import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { AuthUser, JwtPayload } from "../domain/auth.types";
import { DEMO_PASSWORD } from "./users.seed";
import { DemoLoginDto, LoginDto } from "./dto/login.dto";
import { RegisterDto } from "./dto/register.dto";
import { UsersStore } from "./users.store";

@Injectable()
export class AuthService {
  constructor(
    private readonly jwt: JwtService,
    private readonly users: UsersStore,
  ) {}

  validateUser(email: string, password: string) {
    const user = this.users.findByEmail(email);
    if (!user || user.passwordHash !== password) {
      throw new UnauthorizedException("Email ose fjalëkalim i gabuar.");
    }
    return user;
  }

  login(dto: LoginDto) {
    const user = this.validateUser(dto.email, dto.password);
    if (dto.expectedRole && user.role !== dto.expectedRole) {
      throw new UnauthorizedException(
        "Kjo llogari nuk i përket rolit që zgjodhët. Kontrolloni rolin dhe email-in.",
      );
    }
    return this.tokenFor(user);
  }

  register(dto: RegisterDto) {
    const role = dto.role ?? "parent";
    if (role !== "parent") {
      throw new BadRequestException(
        "Regjistrimi publik është i hapur vetëm për prindër. Për mjekë/infermierë, kontaktoni administratorin.",
      );
    }
    const user = this.users.register({
      email: dto.email,
      password: dto.password,
      name: dto.name,
      role,
    });
    return this.tokenFor(user);
  }

  demoLogin(dto: DemoLoginDto) {
    const user = this.users.listDemo().find((u) => u.role === dto.role);
    if (!user) throw new UnauthorizedException("Roli demo nuk ekziston.");
    return this.tokenFor(user);
  }

  me(payload: JwtPayload) {
    return { user: payload };
  }

  demoAccounts() {
    return this.users.listDemo().map((u) => ({
      email: u.email,
      role: u.role,
      name: u.name,
      passwordHint: DEMO_PASSWORD,
    }));
  }

  private tokenFor(user: AuthUser) {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
      parentId: user.parentId,
      providerId: user.providerId,
    };
    return {
      accessToken: this.jwt.sign(payload),
      user: payload,
    };
  }

}
