import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'staging', 'production']).default('development'),
  DATABASE_URL: z.string().min(1),
  DATABASE_PASSWORD_FILE: z.string().optional(),
  JWT_ACCESS_SECRET: z.string().min(32),
  JWT_ISSUER: z.string().min(1).default('bible-platform'),
  REDIS_URL: z.string().min(1),
  INTERNAL_ADMIN_TOKEN: z.string().min(32).optional(),
  AI_API_KEY: z.string().min(1).optional(),
  AI_MODEL: z.string().min(1).optional(),
  YVP_APP_KEY: z.string().min(1).optional(),
});

export type AppEnv = z.infer<typeof envSchema>;

export function loadEnv(): AppEnv {
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    const details = parsed.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`).join('; ');
    throw new Error(`Invalid API environment: ${details}`);
  }

  if (parsed.data.NODE_ENV === 'production' && !parsed.data.INTERNAL_ADMIN_TOKEN) {
    throw new Error('INTERNAL_ADMIN_TOKEN is required in production');
  }

  if (parsed.data.AI_API_KEY && !parsed.data.AI_MODEL) {
    throw new Error('AI_MODEL is required when AI_API_KEY is configured');
  }

  return parsed.data;
}
