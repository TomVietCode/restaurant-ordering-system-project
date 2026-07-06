import { Module, Global } from '@nestjs/common';
import { RealtimeGateway } from '@modules/realtime/realtime.gateway.js';
import { RealtimeService } from '@modules/realtime/realtime.service.js';
import { REALTIME_SERVICE_TOKEN } from '@common/constants.js';

/**
 * @Global so any module can inject REALTIME_SERVICE_TOKEN
 * without explicitly importing RealtimeModule.
 */
@Global()
@Module({
  providers: [
    RealtimeGateway,
    RealtimeService,
    {
      provide: REALTIME_SERVICE_TOKEN,
      useExisting: RealtimeService,
    },
  ],
  exports: [REALTIME_SERVICE_TOKEN],
})
export class RealtimeModule {}
