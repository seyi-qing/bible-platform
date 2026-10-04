import { z } from 'zod';

/** UUID parser used for all route parameters that address persistent resources. */
export const uuidParamSchema = z.string().uuid();

/** Positive integer parser with an explicit upper bound for user-controlled pagination. */
export const boundedPageSize = z.number().int().min(1).max(100);
