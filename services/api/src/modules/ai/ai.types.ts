export type BibleAiMode = "EXPLAIN" | "STUDY" | "COMPARE" | "CONTEXT" | "QUESTION" | "PRAYER" | "APPLICATION" | "CROSS_REFERENCES";
export interface AiCitation { versionId: number; reference: string; quote?: string; }
export interface AiAnswer { answer: string; citations: AiCitation[]; relatedPassages: Array<{ reference: string; reason: string }>; interpretationNotes: string[]; disclaimer?: string; }
export interface AiModelProvider { generate(input: { system: string; user: string; model: string }): Promise<string>; }
