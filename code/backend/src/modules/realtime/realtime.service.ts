import { Injectable, Logger } from '@nestjs/common';
import { RealtimeGateway } from './realtime.gateway.js';
import type { IRealtimeService } from './realtime.service.interface.js';

/**
 * Wraps the RealtimeGateway for clean dependency injection.
 * Other services inject IRealtimeService (via token) rather than
 * depending directly on the gateway.
 */
@Injectable()
export class RealtimeService implements IRealtimeService {
  private readonly logger = new Logger(RealtimeService.name);

  constructor(private readonly gateway: RealtimeGateway) {}

  emit<T>(event: string, payload: T): void {
    this.logger.debug(`Emitting event: ${event}`, JSON.stringify(payload));
    this.gateway.server.emit(event, payload);
  }
}
