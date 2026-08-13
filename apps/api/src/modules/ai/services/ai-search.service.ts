import { Injectable, Logger } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { AiService } from "../ai.service";
import type { AISearchResult } from "@lifeos/shared";

// Documents
import { TaskDocument, Task } from "../../tasks/schemas/task.schema";
import { NoteDocument, Note } from "../../notes/schemas/note.schema";
import { CalendarEventDocument, CalendarEvent } from "../../calendar/schemas/calendar-event.schema";
import { GoalDocument, Goal } from "../../goals/schemas/goal.schema";
import { HabitDocument, Habit } from "../../habits/schemas/habit.schema";

const SYSTEM_PROMPT = `You are LifeOS AI Search. Convert the user's natural language query into a list of search terms optimized for finding relevant notes, tasks, events, goals, and habits.
Return JSON only: { "terms": ["string"], "types": ["note|task|event|goal|habit|finance|health"] }
Limit to 5 terms and the most relevant types.`;

@Injectable()
export class AiSearchService {
  private readonly logger = new Logger(AiSearchService.name);

  constructor(
    private readonly ai: AiService,
    @InjectModel(Task.name) private taskModel: Model<TaskDocument>,
    @InjectModel(Note.name) private noteModel: Model<NoteDocument>,
    @InjectModel(CalendarEvent.name) private eventModel: Model<CalendarEventDocument>,
    @InjectModel(Goal.name) private goalModel: Model<GoalDocument>,
    @InjectModel(Habit.name) private habitModel: Model<HabitDocument>
  ) {}

  async search(userId: string, query: string, limit = 20): Promise<AISearchResult[]> {
    // Use AI to expand the query into search terms and target types
    const expanded = await this.ai
      .complete({
        prompt: query,
        systemPrompt: SYSTEM_PROMPT,
        temperature: 0.3,
        maxTokens: 200,
      })
      .catch(() => ({ text: JSON.stringify({ terms: [query], types: [] }) }));

    let terms: string[] = [query];
    let types: string[] = [];
    try {
      const parsed = JSON.parse(expanded.text) as { terms: string[]; types: string[] };
      terms = parsed.terms.length > 0 ? parsed.terms : [query];
      types = parsed.types;
    } catch {
      // fall back to raw query
    }

    const tables = this.resolveTables(types);
    const results: AISearchResult[] = [];

    for (const table of tables) {
      const regexTerms = terms.map(t => new RegExp(t, "i"));
      const orClause = regexTerms.map(regex => ({ [table.searchColumn]: regex }));

      try {
        const data = await (table.model as any).find({
          userId,
          $or: orClause
        }).limit(limit).exec();

        for (const row of data) {
          results.push(this.toResult(table.type, row as any));
        }
      } catch (error: any) {
        this.logger.warn(`Search on ${table.type} failed: ${error.message}`);
      }
    }

    return results
      .sort((a, b) => this.score(b, terms) - this.score(a, terms))
      .slice(0, limit);
  }

  private resolveTables(types: string[]) {
    const all = [
      { type: "task", model: this.taskModel, searchColumn: "title" },
      { type: "note", model: this.noteModel, searchColumn: "title" },
      { type: "event", model: this.eventModel, searchColumn: "title" },
      { type: "goal", model: this.goalModel, searchColumn: "title" },
      { type: "habit", model: this.habitModel, searchColumn: "name" },
    ] as const;

    if (types.length === 0) return [...all];
    return all.filter((t) => types.includes(t.type));
  }

  private toResult(
    type: AISearchResult["type"],
    row: any,
  ): AISearchResult {
    return {
      id: row._id?.toString() ?? row.id?.toString() ?? "",
      type,
      title: row.title ?? row.name ?? "Untitled",
      excerpt: (row.description ?? row.content ?? "").slice(0, 160),
      source: type,
      url: `/dashboard/${type === "event" ? "calendar" : `${type}s`}/${row._id?.toString() ?? ""}`,
      relevanceScore: 1,
    };
  }

  private score(result: AISearchResult, terms: string[]): number {
    return terms.reduce(
      (sum, term) =>
        sum +
        (result.title.toLowerCase().includes(term.toLowerCase()) ? 2 : 0) +
        (result.excerpt.toLowerCase().includes(term.toLowerCase()) ? 1 : 0),
      0,
    );
  }
}
