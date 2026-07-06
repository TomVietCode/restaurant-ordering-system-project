import { Role } from '@common/enums.js';

export interface IJwtPayload {
  sub: number;
  role: Role;
  iat?: number;
  exp?: number;
}
