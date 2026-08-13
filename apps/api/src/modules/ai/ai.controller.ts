import { Body, Controller, Post, Get } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { Throttle } from "@nestjs/throttler";
import { CurrentUser, type RequestUser } from "../../common/decorators/current-user.decorator";
import { AiPlannerService } from "./services/ai-planner.service";
import { AiCoachService } from "./services/ai-coach.service";
import { AiSearchService } from "./services/ai-search.service";
import { AiGoalsService } from "./services/ai-goals.service";
import { AiNotesService } from "./services/ai-notes.service";

@ApiTags("ai")
@ApiBearerAuth()
@Controller("ai")
export class AiController {
  constructor(
    private readonly planner: AiPlannerService,
    private readonly coach: AiCoachService,
    private readonly searchService: AiSearchService,
    private readonly goalsService: AiGoalsService,
    private readonly notesService: AiNotesService,
  ) {}

  @Post("plan")
  @Throttle({ ai: { ttl: 60_000, limit: 10 } })
  @ApiOperation({ summary: "Generate an AI daily plan" })
  generatePlan(
    @CurrentUser() user: RequestUser,
    @Body() dto: { date: string; context: Record<string, unknown> },
  ) {
    return this.planner.generatePlan(user.id, dto.date, dto.context as never);
  }

  @Post("insights")
  @Throttle({ ai: { ttl: 60_000, limit: 10 } })
  @ApiOperation({ summary: "Get AI insights from user data" })
  insights(
    @CurrentUser() user: RequestUser,
    @Body() dto: { context: Record<string, unknown> },
  ) {
    return this.coach.getInsights(user.id, dto.context);
  }

  @Post("chat")
  @Throttle({ ai: { ttl: 60_000, limit: 20 } })
  @ApiOperation({ summary: "Chat with AI Coach" })
  chat(
    @CurrentUser() user: RequestUser,
    @Body() dto: { message: string; history?: Array<{ role: string; content: string }> },
  ) {
    return this.coach.chat(user.id, dto.message, dto.history ?? []);
  }

  @Post("search")
  @Throttle({ ai: { ttl: 60_000, limit: 30 } })
  @ApiOperation({ summary: "AI-powered semantic search across all data" })
  search(
    @CurrentUser() user: RequestUser,
    @Body() dto: { query: string; limit?: number },
  ) {
    return this.searchService.search(user.id, dto.query, dto.limit);
  }

  @Post("goals/generate-milestones")
  @Throttle({ ai: { ttl: 60_000, limit: 10 } })
  @ApiOperation({ summary: "Generate AI milestones for a goal" })
  generateMilestones(
    @CurrentUser() _user: RequestUser,
    @Body() dto: { title: string; description?: string; category: string; targetDate?: string; count?: number },
  ) {
    return this.goalsService.generateMilestones(
      dto.title,
      dto.description ?? "",
      dto.category,
      dto.targetDate,
      dto.count ?? 5,
    );
  }

  @Post("notes/summarize")
  @Throttle({ ai: { ttl: 60_000, limit: 10 } })
  @ApiOperation({ summary: "Generate AI summary for a note" })
  summarizeNote(
    @CurrentUser() _user: RequestUser,
    @Body() dto: { title: string; content: string },
  ) {
    return this.notesService.summarizeNote(dto.title, dto.content);
  }

  @Get("health")
  @Throttle({ ai: { ttl: 60_000, limit: 10 } })
  @ApiOperation({ summary: "AI Configuration Health Check" })
  healthCheck() {
    return {
      status: "ok",
      aiConfigured: !!process.env["GEMINI_API_KEY"],
      provider: "gemini"
    };
  }
}
