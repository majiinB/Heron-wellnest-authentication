/** 
 * @fileoverview Utility functions for Google Authentication
 * @module utils/googleAuth.utils 
 * 
 * @description This module provides utility functions to handle Google OAuth2 authentication,
 * including token verification and user information extraction.
 * 
 * @requires google-auth-library
 * @requires ../config/env.config
 * @requires ../utils/logger.util
 * 
 * @author Arthur M. Artugue
 * @created 2025-08-27
 * @updated 2025-08-27
 */

import { OAuth2Client, type TokenPayload } from "google-auth-library";
import { env } from "../config/env.config.js";
import { AppError } from "../types/appError.type.js";

const client = new OAuth2Client();

/**
 * Verifies a Google ID token and returns the token payload if valid.
 * 
 * @param token - Google ID token to verify
 * 
 * @returns Promise resolving to the token payload if valid
 * @throws Error if the token is invalid, email is not verified, or domain does not match
 */
export async function verifyGoogleToken(token: string) : Promise<TokenPayload> {
  try {
  
    if (!token) {
      throw new AppError(
        401, 
        "AUTH_NO_TOKEN", 
        "No token provided", 
        true
      );
    }

    if (typeof token !== "string") {
      throw new AppError(
        400, 
        "AUTH_INVALID_TYPE", 
        "Invalid token type", 
        true
      );
    }

    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload) {
      throw new AppError(
        401, 
        "AUTH_INVALID_TOKEN", 
        "Invalid Google token payload", 
        true
      );
    }

    const email_verified = payload['email_verified'];
    if (!email_verified) {
      throw new AppError(
        403, 
        "AUTH_EMAIL_NOT_VERIFIED", 
        "Email not verified", 
        true
      );
    }

    const domain = payload['hd'];
    if (domain !== env.GOOGLE_EMAIL_DOMAIN) {
      throw new AppError(
        403, 
        "AUTH_UNAUTHORIZED_DOMAIN", 
        `Unauthorized domain: ${domain}, Umak email required`, 
        true
      );
    }

    return payload;
  } catch (err) {
    if (err instanceof AppError) {
      throw err;
    }

    const message = (err as Error).message || "Unknown error";

    if (message.includes("Token used too late") || message.includes("Token used too early")) {
      throw new AppError(
        401,
        "AUTH_TOKEN_TIME_ERROR",
        "Google token rejected due to time mismatch. Please check your device or server clock.",
        true
      );
    }

    const appError = new AppError(
      500, 
      "AUTH_TOKEN_VERIFICATION_FAILED", 
      `Failed to verify Google token: ${message}`, 
      false
    );

    // Preserve original error details for debugging
    if (err instanceof Error) {
      appError.stack = err.stack; // replace stack with original
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (appError as any).originalError = err; // optional, keep full error object
    }

    throw appError;
  }
}