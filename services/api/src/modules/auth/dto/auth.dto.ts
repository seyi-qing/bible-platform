import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().email().max(320),
  password: z.string().min(12).max(200),
  displayName: z.string().trim().min(2).max(120),
});

export const loginSchema = z.object({
  email: z.string().email().max(320),
  password: z.string().min(1).max(200),
  deviceId: z.string().uuid().optional(),
});

export const refreshSchema = z.object({ refreshToken: z.string().min(40).max(200) });
