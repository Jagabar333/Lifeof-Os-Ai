import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { AiController } from "./ai.controller";
import { AiService } from "./ai.service";
import { AiPlannerService } from "./services/ai-planner.service";
import { AiCoachService } from "./services/ai-coach.service";
import { AiSearchService } from "./services/ai-search.service";
import { AiGoalsService } from "./services/ai-goals.service";
import { AiNotesService } from "./services/ai-notes.service";
import { TasksModule } from "../tasks/tasks.module";

// Schemas
import { Task, TaskSchema } from "../tasks/schemas/task.schema";
import { Note, NoteSchema } from "../notes/schemas/note.schema";
import { CalendarEvent, CalendarEventSchema } from "../calendar/schemas/calendar-event.schema";
import { Goal, GoalSchema } from "../goals/schemas/goal.schema";
import { Habit, HabitSchema } from "../habits/schemas/habit.schema";

@Module({
  imports: [
    TasksModule,
    MongooseModule.forFeature([
      { name: Task.name, schema: TaskSchema },
      { name: Note.name, schema: NoteSchema },
      { name: CalendarEvent.name, schema: CalendarEventSchema },
      { name: Goal.name, schema: GoalSchema },
      { name: Habit.name, schema: HabitSchema },
    ])
  ],
  controllers: [AiController],
  providers: [AiService, AiPlannerService, AiCoachService, AiSearchService, AiGoalsService, AiNotesService],
  exports: [AiGoalsService, AiNotesService],
})
export class AiModule {}
