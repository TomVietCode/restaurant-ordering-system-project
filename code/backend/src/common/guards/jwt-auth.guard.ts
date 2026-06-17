import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from '@common/decorators/public.decorator.js';

/**
 * Global JWT authentication guard.
 *
 * Extends Passport's AuthGuard('jwt') and adds @Public() support.
 * - Routes decorated with @Public() bypass JWT validation entirely.
 * - All other routes require a valid JWT in the Authorization header.
 *
 * Registered globally via APP_GUARD in AppModule.
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private readonly reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [context.getHandler(), context.getClass()]);

    if (isPublic) {
      return true;
    }

    // Delegate to Passport JWT strategy for token validation
    return super.canActivate(context);
  }
}
