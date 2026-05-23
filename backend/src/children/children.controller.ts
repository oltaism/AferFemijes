import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { JwtPayload } from "../domain/auth.types";
import { ChildrenService } from "./children.service";
import { CreateChildDto } from "./dto/create-child.dto";

@ApiTags("Children")
@ApiBearerAuth()
@Controller("children")
export class ChildrenController {
  constructor(private readonly children: ChildrenService) {}

  @Get()
  list(@CurrentUser() user: JwtPayload) {
    return this.children.findAll(user);
  }

  @Get(":id")
  one(@CurrentUser() user: JwtPayload, @Param("id") id: string) {
    return this.children.findOne(user, id);
  }

  @Post()
  create(@CurrentUser() user: JwtPayload, @Body() dto: CreateChildDto) {
    return this.children.create(user, dto);
  }
}
