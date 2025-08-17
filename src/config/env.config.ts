import * as dotenv from "dotenv";
import * as z from "zod";

dotenv.config();

export const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.coerce.number().default(8080),
  // DATABASE_URL: z.string().url(),
  // JWT_SECRET: z.string().min(32),
  // CORS_ORIGIN: z.string().url(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("❌ Invalid environment variables:", parsed.error.format());
  process.exit(1);
}

export const env = parsed.data;

