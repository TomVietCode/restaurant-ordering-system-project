import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RefreshToken } from '@modules/auth/entities/refresh-token.entity.js';
import { IRefreshTokenRepository } from './refresh-token.repository.interface.js';

@Injectable()
export class RefreshTokenRepository implements IRefreshTokenRepository {
  constructor(
    @InjectRepository(RefreshToken)
    private readonly repository: Repository<RefreshToken>,
  ) {}

  async findByUserId(userId: number): Promise<RefreshToken | null> {
    return this.repository.findOne({ where: { userId } });
  }
  
  //Upsert: delete any existing token for the user, then insert the new one.
  async upsertForUser(token: RefreshToken): Promise<RefreshToken> {
    await this.repository.delete({ userId: token.userId });
    return this.repository.save(token);
  }
  
  //Revoke by setting revoked_at timestamp.
  async revokeByUserId(userId: number): Promise<void> {
    await this.repository.update(
      { userId },
      { revokedAt: new Date() },
    );
  }
}
