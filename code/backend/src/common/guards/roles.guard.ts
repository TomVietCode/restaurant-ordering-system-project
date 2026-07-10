import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '@common/decorators/roles.decorator.js';
import { Role } from '@common/enums.js';
import { ErrorCode } from '@common/error-codes.js';

/**
 * Global role-based access control guard.
 *
 * Checks if the authenticated user has one of the required roles
 * set by the @Roles() decorator. If no roles are specified on a route,
 * the guard allows access (any authenticated user can proceed).
 *
 * Execution order: JwtAuthGuard → RolesGuard
 * (JwtAuthGuard must run first to populate request.user)
 *
 * Registered globally via APP_GUARD in AppModule.
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Read required roles from @Roles() metadata (handler + class level)
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // No @Roles() decorator → route is open to any authenticated user
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();

    // Defensive check: if user is not attached (shouldn't happen after JwtAuthGuard)
    if (!user) {
      throw new ForbiddenException({
        message: 'Access denied',
        errorCode: ErrorCode.FORBIDDEN,
      });
    }

    const hasRole = requiredRoles.includes(user.role);

    if (!hasRole) {
      throw new ForbiddenException({
        message: 'Access denied',
        errorCode: ErrorCode.FORBIDDEN,
      });
    }

    return true;
  }
}
