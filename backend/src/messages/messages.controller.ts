import { Body, Controller, Get, Param, Post, Query } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { JwtPayload } from "../domain/auth.types";
import { MessageCategory } from "../domain/types";
import { MessagesService } from "./messages.service";
import { SendMessageDto } from "./dto/send-message.dto";

@ApiTags("Messaging")
@ApiBearerAuth()
@Controller("messages")
export class MessagesController {
  constructor(private readonly messages: MessagesService) {}

  @Get("threads")
  threads(@CurrentUser() user: JwtPayload) {
    return this.messages.threads(user);
  }

  @Get("threads/:threadId")
  thread(
    @CurrentUser() user: JwtPayload,
    @Param("threadId") threadId: string,
  ) {
    return this.messages.threadMessages(user, threadId);
  }

  @Post()
  send(@CurrentUser() user: JwtPayload, @Body() dto: SendMessageDto) {
    return this.messages.send(user, dto);
  }

  @Get("ai-draft")
  aiDraft(
    @CurrentUser() user: JwtPayload,
    @Query("childId") childId: string,
    @Query("category") category: MessageCategory = "general",
  ) {
    return this.messages.aiDraft(user, childId, category);
  }
}
