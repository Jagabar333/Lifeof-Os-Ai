import { Injectable, Logger } from "@nestjs/common";
import { AiService } from "../ai.service";

export interface GeneratedMilestone {
  id: string;
  title: string;
  completed: boolean;
}

@Injectable()
export class AiGoalsService {
  private readonly logger = new Logger(AiGoalsService.name);

  constructor(private readonly ai: AiService) {}

  async generateMilestones(
    goalTitle: string,
    goalDescription: string,
    category: string,
    targetDate?: string,
    count = 5,
  ): Promise<GeneratedMilestone[]> {
    const systemPrompt = `You are a personal life coaching AI embedded in LifeOS, an intelligent Personal Operating System.
Your job is to break ambitious goals into concrete, actionable milestones.
Guidelines:
- Generate exactly ${count} milestones.
- Each milestone should be specific, measurable, and achievable.
- Order them logically from foundation-building to completion.
- Use action verbs (Complete, Build, Reach, Achieve, Learn, etc.).
- Keep each title concise (under 60 characters).
- Return ONLY a valid JSON array of strings (the milestone titles). No other text.
Example output: ["Complete initial assessment", "Build daily routine", "Reach first checkpoint", "Overcome main challenge", "Achieve final goal"]`;

    const dateContext = targetDate ? ` Target date: ${targetDate}.` : "";
    const descContext = goalDescription ? ` Context: ${goalDescription}.` : "";
    const prompt = `Goal: "${goalTitle}" (Category: ${category}).${descContext}${dateContext}

Generate ${count} concrete, actionable milestones as a JSON array of strings.`;

    try {
      const result = await this.ai.complete({
        prompt,
        systemPrompt,
        temperature: 0.6,
        maxTokens: 500,
      });

      // Parse AI response - try to extract JSON array
      const text = result.text.trim();
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (!jsonMatch) throw new Error("No JSON array found in AI response");

      const titles: string[] = JSON.parse(jsonMatch[0]);
      if (!Array.isArray(titles)) throw new Error("AI response is not an array");

      return titles.slice(0, count).map((title) => ({
        id: crypto.randomUUID(),
        title: String(title).trim(),
        completed: false,
      }));
    } catch (error) {
      this.logger.error("Failed to generate milestones:", error);
      throw error;
    }
  }
}
