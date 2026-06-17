import {
  Entity,
  PrimaryColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity.js';

/**
 * Token lifecycle:
 * 1. Login → insert/upsert a new row for the user
 * 2. Refresh → replace the old token with a new one
 * 3. Logout → set revoked_at to current timestamp
 */
@Entity('refresh_tokens')
export class RefreshToken {
  @PrimaryColumn({ type: 'varchar', length: 36 })
  id: string;

  @Column({ name: 'user_id', type: 'int', unique: true })
  userId: number;

  @Column({ name: 'token_hash', type: 'varchar', length: 512 })
  tokenHash: string;

  @Column({ name: 'expired_at', type: 'timestamp' })
  expiredAt: Date;

  @Column({ name: 'revoked_at', type: 'timestamp', nullable: true })
  revokedAt: Date | null;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
