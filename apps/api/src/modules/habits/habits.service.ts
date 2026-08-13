import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { BaseCrudService } from "../../common/services/base-crud.service";
import { Habit, HabitDocument } from "./schemas/habit.schema";
import { HabitLog, HabitLogDocument } from "./schemas/habit-log.schema";

@Injectable()
export class HabitsService extends BaseCrudService<HabitDocument> {
  constructor(
    @InjectModel(Habit.name) habitModel: Model<HabitDocument>,
    @InjectModel(HabitLog.name) private habitLogModel: Model<HabitLogDocument>
  ) {
    super(habitModel, "HabitsService");
  }

  async log(habitId: string, userId: string, date: string, count = 1): Promise<HabitLogDocument> {
    const habit = await this.findOne(habitId, userId);
    const completed = count >= habit.targetCount;

    const data = await this.habitLogModel.findOneAndUpdate(
      { habitId, userId, date },
      { $set: { count, completed } },
      { new: true, upsert: true }
    ).exec();

    await this.recomputeStreak(habitId, userId);
    return data;
  }

  async getLogs(userId: string, habitId: string, startDate: string, endDate: string) {
    const data = await this.habitLogModel.find({
      userId,
      habitId,
      date: { $gte: startDate, $lte: endDate }
    }).sort({ date: 1 }).exec();

    return data;
  }

  private async recomputeStreak(habitId: string, userId: string): Promise<void> {
    const data = await this.habitLogModel.find({
      habitId,
      userId
    }).sort({ date: -1 }).limit(365).exec();

    if (!data || data.length === 0) return;

    let streak = 0;
    let bestStreak = 0;
    for (const log of data) {
      if (log.completed) {
        streak++;
        bestStreak = Math.max(bestStreak, streak);
      } else {
        streak = 0;
      }
    }

    await this.model.findByIdAndUpdate(habitId, {
      $set: { streak, bestStreak }
    }).exec();
  }
}
