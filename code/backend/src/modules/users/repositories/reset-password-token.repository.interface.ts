import { IBaseRepository } from "@common/repositories/base.repository.interface.js";
import { ResetPasswordToken } from "../entities/reset-password-token.entity.js";

export interface IResetPasswordTokenRepository extends IBaseRepository<ResetPasswordToken>{
    findByOtp(otp: string):Promise <ResetPasswordToken|null> 
    deleteByEmail(email: string):Promise <void> 
}