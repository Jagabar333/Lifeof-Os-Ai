import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { BaseCrudService } from "../../common/services/base-crud.service";
import { Goal, GoalDocument } from "./schemas/goal.schema";

@Injectable()
export class GoalsService extends BaseCrudService<GoalDocument> {
  constructor(
    @InjectModel(Goal.name) goalModel: Model<GoalDocument>
  ) {
    super(goalModel, "GoalsService");
  }

  async toggleMilestone(goalId: string, userId: string, milestoneId: string) {
    const goal = await this.findOne(goalId, userId);

    const milestone = goal.milestones.find((m) => m.id === milestoneId);
    if (!milestone) {
      throw new NotFoundException("Milestone not found");
    }

    const completed = !milestone.completed;

    milestone.completed = completed;
    milestone.completedAt = completed ? new Date().toISOString() : null;

    const total = goal.milestones.length;
    const completedCount = goal.milestones.filter((m) => m.completed).length;
    goal.progress = total > 0 ? Math.round((completedCount / total) * 100) : 0;

    if (goal.progress === 100 && goal.status !== "completed") {
      goal.status = "completed";
    } else if (goal.progress > 0 && goal.progress < 100 && goal.status === "not_started") {
      goal.status = "in_progress";
    } else if (goal.progress === 0 && goal.status !== "not_started") {
      goal.status = "not_started";
    }

    const updated = await this.model.findOneAndUpdate(
      { _id: goalId, userId },
      { 
        $set: { 
          milestones: goal.milestones,
          progress: goal.progress,
          status: goal.status
        }
      },
      { new: true }
    ).exec();

    return updated;
  }
}
