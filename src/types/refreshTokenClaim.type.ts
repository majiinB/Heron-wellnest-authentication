import type { JWTPayload } from "jose";

/**
 * Refresh Token Claims Type
 * 
 * @description Defines the structure for JWT refresh token claims.
 * 
 * @file refreshTokenClaim.type.ts
 * 
 * @author Arthur M. Artugue
 * @created 2025-09-29
 * @updated 2025-09-29
 */
export type RefreshTokenClaims = {
  sub: string;
  typ: "refresh";
} & JWTPayload;