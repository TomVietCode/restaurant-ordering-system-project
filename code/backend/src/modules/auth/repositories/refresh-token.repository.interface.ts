import { RefreshToken } from '@modules/auth/entities/refresh-token.entity.js';

export interface IRefreshTokenRepository {
  findByUserId(userId: number): Promise<RefreshToken | null>;
  upsertForUser(token: RefreshToken): Promise<RefreshToken>;
  revokeByUserId(userId: number): Promise<void>;
}
