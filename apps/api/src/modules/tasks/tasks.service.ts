import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { BaseCrudService } from "../../common/services/base-crud.service";
import { Task } from "./schemas/task.schema";

@Injectable()
export class TasksService extends BaseCrudService<Task> {
  constructor(@InjectModel(Task.name) taskModel: Model<Task>) {
    super(taskModel, "TasksService");
  }

  async findByStatus(userId: string, status: string) {
    return this.model
      .find({ userId, status } as any)
      .sort({ createdAt: -1 })
      .exec();
  }

  async toggleComplete(id: string, userId: string): Promise<Task> {
    const task = await this.findOne(id, userId);
    const newStatus = task.status === "done" ? "todo" : "done";
    return this.update(id, userId, {
      status: newStatus,
      completedAt: newStatus === "done" ? new Date() : null,
    } as any);
  }
}

