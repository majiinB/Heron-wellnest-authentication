import type { JWTPayload } from "jose";

/**
 * Access Token Claims Type
 * 
 * @description Defines the structure for JWT access token claims.
 * 
 * @file accessTokenClaim.type.ts
 * 
 * @author Arthur M. Artugue
 * @created 2025-09-29
 * @updated 2025-10-17
 */
export type AccessTokenClaims = {
  sub: string;           // user id
  role: string;         // "student" | "admin | "counselor"
  email: string;
  name: string;
  is_onboarded?: boolean;
  college_program?: string | null; // optional, for students
  college_department?: string | null; // optional, for staff and students
} & JWTPayload;