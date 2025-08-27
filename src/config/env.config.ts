import * as dotenv from "dotenv";
import * as z from "zod";

dotenv.config();

/**
 * Environment configuration for the Heron Wellnest Authentication API.
 *
 * This module defines the environment variables required for the application,
 * validates them using Zod, and exports them for use throughout the application.
 *
 * @file env.config.ts
 * @description Configuration for environment variables.
 * 
 * Usage:
 * - Imported in `app.ts` to access environment variables.
 * - Validates required variables and provides defaults where applicable.
 *
 * @author Arthur M. Artugue
 * @created 2025-08-17
 * @updated 2025-08-20
 */
export const envSchema = z.object({
  // Application environment
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.coerce.number().default(8080),
  
  // Database configuration
  DB_HOST : z.string().default("localhost"),
  DB_PORT : z.coerce.number().default(3306),
  DB_USER : z.string().min(1, "DB_USER is required").default("root"),
  DB_PASSWORD : z.string().optional().default(""),
  DB_NAME : z.string().min(1, "DB_NAME is required").default("heron_wellnest_db"),

  // Security
  // JWT_SECRET: z.string().min(32),
  // CORS_ORIGIN: z.string().url(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("Invalid environment variables:", parsed.error.format());
  process.exit(1);
}

export const env = parsed.data;

