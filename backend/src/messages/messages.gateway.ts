import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { MessagesService } from "./messages.service";

@WebSocketGateway({
  cors: { origin: "*" },
  namespace: "/messages",
})
export class MessagesGateway {
  @WebSocketServer()
  server!: Server;

  constructor(private readonly messages: MessagesService) {}

  @SubscribeMessage("joinThread")
  joinThread(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { threadId: string },
  ) {
    client.join(`thread:${data.threadId}`);
    return { joined: data.threadId };
  }

  @SubscribeMessage("leaveThread")
  leaveThread(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { threadId: string },
  ) {
    client.leave(`thread:${data.threadId}`);
    return { left: data.threadId };
  }

  emitNewMessage(threadId: string, message: unknown) {
    this.server?.to(`thread:${threadId}`).emit("message:new", message);
  }
}
