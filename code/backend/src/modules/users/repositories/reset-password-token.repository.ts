import { BaseRepository } from "@common/repositories/base.repository.js";
import { ResetPasswordToken } from "../entities/reset-password-token.entity.js";
import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { Injectable } from "@nestjs/common";
import { IResetPasswordTokenRepository } from "./reset-password-token.repository.interface.js";

@Injectable()
export class ResetPasswordTokenRepository extends BaseRepository<ResetPasswordToken> implements IResetPasswordTokenRepository {
  constructor(
    @InjectRepository(ResetPasswordToken)
    private readonly resetPasswordTokenRepository: Repository<ResetPasswordToken>,
  ) {
    // Pass the TypeORM repository to BaseRepository's constructor
    super(resetPasswordTokenRepository);
  }


}
