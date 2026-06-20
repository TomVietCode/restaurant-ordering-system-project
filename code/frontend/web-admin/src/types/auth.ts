// Auth & user types — mirror the backend `User` entity and auth DTOs.

export enum Role {
  OWNER = 'OWNER',
  STAFF = 'STAFF',
}

/** Authenticated user profile from `GET /auth/profile` (no password hash). */
export interface User {
  id: number;
  email: string;
  role: Role;
  fullName: string;
  phone: string | null;
  isActive: boolean;
}

/** Request body for `POST /auth/login`. */
export interface LoginPayload {
  email: string;
  password: string;
}

/** `data` payload of a successful login/refresh response. */
export interface TokenResponse {
  accessToken: string;
}
