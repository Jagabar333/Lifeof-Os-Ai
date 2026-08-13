import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

export type HabitDocument = Habit & Document;

@Schema({ timestamps: true, collection: "habits" })
export class Habit {
  @Prop({ required: true, index: true })
  userId!: string;

  @Prop({ required: true })
  title!: string;

  @Prop({ default: "" })
  description!: string;

  @Prop({ required: true })
  frequency!: string; // "daily", "weekly", etc.

  @Prop({ required: true, default: 1 })
  targetCount!: number;

  @Prop({ default: 0 })
  streak!: number;

  @Prop({ default: 0 })
  bestStreak!: number;
}

export const HabitSchema = SchemaFactory.createForClass(Habit);
