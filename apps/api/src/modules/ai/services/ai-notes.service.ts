import { Injectable, Logger } from "@nestjs/common";
import { AiService } from "../ai.service";

@Injectable()
export class AiNotesService {
  private readonly logger = new Logger(AiNotesService.name);

  constructor(private readonly ai: AiService) {}

  async summarizeNote(title: string, content: string): Promise<string> {
    const systemPrompt = `You are a personal research assistant AI embedded in LifeOS, an intelligent Personal Operating System.
Your job is to read the note content and provide a highly concise, elegant summary (max 3-4 bullet points).
Guidelines:
- Keep the summary clear, actionable, and visually appealing.
- Focus on key takeaways, decisions, and action items.
- Return markdown formatted bullet points.
- Do not output any preamble or meta-text. Start directly with the first bullet point.`;

    const prompt = `Note Title: "${title}"
Content:
${content}

Provide a concise, elegant bulleted summary of the note above.`;

    try {
      const result = await this.ai.complete({
        prompt,
        systemPrompt,
        temperature: 0.5,
        maxTokens: 300,
      });

      return result.text.trim();
    } catch (error) {
      this.logger.error("Failed to summarize note:", error);
      throw error;
    }
  }
}
