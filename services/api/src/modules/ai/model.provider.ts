import { Injectable, ServiceUnavailableException } from "@nestjs/common";
import type { AiModelProvider } from "./ai.types";

@Injectable()
export class OpenAiModelProvider implements AiModelProvider {
  private readonly baseUrl = process.env.AI_BASE_URL ?? "https://api.openai.com/v1";
  private readonly apiKey = process.env.AI_API_KEY;

  async generate(input: { system: string; user: string; model: string }): Promise<string> {
    if (!this.apiKey) throw new ServiceUnavailableException("AI provider is not configured. Set AI_API_KEY on the API server.");
    const response = await fetch(`${this.baseUrl}/responses`, {
      method: "POST",
      headers: { "content-type": "application/json", authorization: `Bearer ${this.apiKey}` },
      body: JSON.stringify({ model: input.model, instructions: input.system, input: input.user, max_output_tokens: 1800 }),
      signal: AbortSignal.timeout(30_000),
    });
    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      throw new ServiceUnavailableException(`AI provider error (${response.status}): ${detail.slice(0, 300)}`);
    }
    const payload = await response.json() as { output_text?: string; output?: Array<{ content?: Array<{ text?: string }> }> };
    if (payload.output_text?.trim()) return payload.output_text.trim();
    const text = payload.output?.flatMap(item => item.content ?? []).map(part => part.text ?? "").join(" ").trim();
    if (!text) throw new ServiceUnavailableException("AI provider returned an empty response");
    return text;
  }
}
