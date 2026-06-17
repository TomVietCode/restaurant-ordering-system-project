import { SetMetadata } from '@nestjs/common';

/**
 * Metadata key used by JwtAuthGuard to identify public routes.
 */
export const IS_PUBLIC_KEY = 'isPublic';

export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
