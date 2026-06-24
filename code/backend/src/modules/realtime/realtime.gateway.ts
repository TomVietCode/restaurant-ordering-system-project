import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class RealtimeGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(RealtimeGateway.name);

  @WebSocketServer()
  server: Server;

  afterInit(): void {
    this.logger.log('WebSocket gateway initialized');
  }

  handleConnection(client: Socket): void {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket): void {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  /**
   * Allows a customer client to join a room for tracking a specific order.
   * The client sends: { trackingCode: 'uuid-string' }
   * and joins room: 'order:track:{trackingCode}'
   */
  @SubscribeMessage('join-order-tracking')
  handleJoinOrderTracking(@MessageBody() data: { trackingCode: string }, @ConnectedSocket() client: Socket): void {
    const room = `order:track:${data.trackingCode}`;
    client.join(room);
    this.logger.log(`Client ${client.id} joined room: ${room}`);
  }
}
