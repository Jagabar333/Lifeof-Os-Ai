import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

export type TaskDocument = Task & Document;

export enum TaskPriority {
  NONE = "none",
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  URGENT = "urgent",
}

export enum TaskStatus {
  INBOX = "inbox",
  TODO = "todo",
  IN_PROGRESS = "in_progress",
  DONE = "done",
  ARCHIVED = "archived",
}

@Schema({ timestamps: true, collection: "tasks" })
export class Task extends Document {
  @Prop({ required: true, index: true })
  userId!: string;

  @Prop({ required: true })
  title!: string;

  @Prop()
  description?: string;

  @Prop({ type: String, enum: TaskStatus, default: TaskStatus.TODO, index: true })
  status!: TaskStatus;

  @Prop({ type: String, enum: TaskPriority, default: TaskPriority.MEDIUM })
  priority!: TaskPriority;

  @Prop({ type: Date, index: true })
  dueDate?: Date;

  @Prop([String])
  tags!: string[];
}

export const TaskSchema = SchemaFactory.createForClass(Task);
// Create compound index for querying tasks by user
TaskSchema.index({ userId: 1, createdAt: -1 });
