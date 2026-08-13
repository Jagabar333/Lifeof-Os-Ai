import { Injectable } from "@nestjs/common";
import { AiService } from "../ai.service";
import type { AIPlannerResponse } from "@lifeos/shared";

interface PlannerContext {
  tasks: Array<{ id: string; title: string; priority: string; dueDate: string | null }>;
  events: Array<{ id: string; title: string; startTime: string; endTime: string }>;
  habits: Array<{ id: string; name: string; frequency: string }>;
  goals: Array<{ id: string; title: string; progress: number }>;
}

const SYSTEM_PROMPT = `You are LifeOS AI, an expert life planner.
Given a user's tasks, events, habits, and goals for a day, generate an optimized schedule.
Return JSON only with this shape:
{
  "schedule": [
    { "startTime": "HH:MM", "endTime": "HH:MM", "title": "string", "type": "task|event|habit|break|focus", "priority": "none|low|medium|high|urgent", "notes": "string|null" }
  ],
  "recommendations": ["string"],
  "priorities": ["string"],
  "estimatedProductivity": number
}
Consider energy levels, deadlines, and avoid over-scheduling. Include breaks.`;

@Injectable()
export class AiPlannerService {
  constructor(private readonly ai: AiService) {}

  async generatePlan(userId: string, date: string, context: PlannerContext): Promise<AIPlannerResponse> {
    const prompt = `Plan the day for ${date}.\n\nUser context:\n${JSON.stringify(context, null, 2)}`;

    const response = await this.ai.complete({
      prompt,
      systemPrompt: SYSTEM_PROMPT,
      temperature: 0.6,
      maxTokens: 2000,
    });

    try {
      const parsed = JSON.parse(response.text) as AIPlannerResponse;
      return {
        ...parsed,
        schedule: parsed.schedule.map((block, i) => ({
          ...block,
          id: `plan_${userId}_${i}`,
          notes: block.notes ?? null,
        })),
      };
    } catch {
      return {
        schedule: [],
        recommendations: ["Unable to parse AI plan. Please try again."],
        priorities: [],
        estimatedProductivity: 0,
      };
    }
  }
}
