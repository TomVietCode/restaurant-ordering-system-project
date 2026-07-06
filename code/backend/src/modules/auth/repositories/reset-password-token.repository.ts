import { BaseRepository } from '@common/repositories/base.repository.js';
import { ResetPasswordToken } from '../entities/reset-password-token.entity.js';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { IResetPasswordTokenRepository } from './reset-password-token.repository.interface';

@Injectable()
export class ResetPasswordTokenRepository extends BaseRepository<ResetPasswordToken> implements IResetPasswordTokenRepository {
  constructor(
    @InjectRepository(ResetPasswordToken)
    private readonly resetPasswordTokenRepository: Repository<ResetPasswordToken>,
  ) {
    // Pass the TypeORM repository to BaseRepository's constructor
    super(resetPasswordTokenRepository);
  }

  async findByOtp(otp: string): Promise<ResetPasswordToken | null> {
    return this.repository.findOne({ where: { otp } });
  }

  async deleteByEmail(email: string): Promise<void>{
    await this.repository.delete({ email });
  }
}
