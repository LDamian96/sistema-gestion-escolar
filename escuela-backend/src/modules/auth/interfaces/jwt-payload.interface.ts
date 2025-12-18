import { Role } from '@prisma/client';

export interface JwtPayload {
  sub: string; // userId
  email: string;
  role: Role;
  schoolId: string;
  firstName: string;
  lastName: string;
  iat?: number; // issued at
  exp?: number; // expiration
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}
