import { Column, Entity, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('reset_password_tokens')
export class ResetPasswordToken {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', unique: true })
  email: string;

  @Column({ name: 'otp', type: 'varchar', length: 6, unique: true })
  otp: string;

  @Column({ name: 'expired_at', type: 'timestamp' })
  expiredAt: Date;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

}
