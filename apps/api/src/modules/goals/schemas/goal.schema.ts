import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

export type GoalDocument = Goal & Document;

@Schema({ timestamps: true, collection: "goals" })
export class Goal {
  @Prop({ required: true, index: true })
  userId!: string;

  @Prop({ required: true })
  title!: string;

  @Prop()
  description?: string;

  @Prop({ default: "not_started" })
  status!: string;

  @Prop({ default: 0 })
  progress!: number;

  @Prop()
  targetDate?: string;

  @Prop({ required: true })
  category!: string;

  @Prop({ type: [{ id: String, title: String, completed: Boolean, completedAt: String }], default: [] })
  milestones!: any[];
}

export const GoalSchema = SchemaFactory.createForClass(Goal);
