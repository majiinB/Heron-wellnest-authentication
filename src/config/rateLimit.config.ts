/**
 * @file rateLimit.config.ts
 * @description Configuration for rate limiting in the Heron Wellnest Authentication API.
 * This file defines the rate limit settings to prevent abuse and ensure fair usage of the API.
 * 
 * @author Arthur M. Artugue
 * @created 2025-08-17
 * @updated 2025-08-18
 */
export const rateLimitConfig = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // Limit each IP to 100 requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: {
    status: 'error',
    message: 'Too many requests, please try again later.',
  },
}
