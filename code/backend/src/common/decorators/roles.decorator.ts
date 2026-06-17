import { SetMetadata } from '@nestjs/common';
import { Role } from '../enums.js';

/**
 * Metadata key used by RolesGuard to check required roles.
 */
export const ROLES_KEY = 'roles';


export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
