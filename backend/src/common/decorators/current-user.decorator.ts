import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { JwtPayload } from "../../domain/auth.types";

export const CurrentUser = createParamDecorator(
  (_: unknown, ctx: ExecutionContext): JwtPayload => {
    const req = ctx.switchToHttp().getRequest<{ user: JwtPayload }>();
    return req.user;
  },
);
