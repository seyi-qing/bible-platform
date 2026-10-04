import { z } from "zod";
export const aiStudySchema = z.object({
  question: z.string().trim().min(3).max(8_000),
  mode: z.enum(["EXPLAIN", "STUDY", "COMPARE", "CONTEXT", "QUESTION", "PRAYER", "APPLICATION", "CROSS_REFERENCES"]).default("STUDY"),
  versionId: z.number().int().positive().optional(),
  reference: z.string().trim().max(120).optional(),
  conversationId: z.string().uuid().optional(),
});
export type AiStudyInput = z.infer<typeof aiStudySchema>;
