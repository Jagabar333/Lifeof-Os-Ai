import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

export type HabitLogDocument = HabitLog & Document;

@Schema({ timestamps: true, collection: "habit_logs" })
export class HabitLog {
  @Prop({ required: true, index: true })
  userId!: string;

  @Prop({ required: true, index: true })
  habitId!: string;

  @Prop({ required: true })
  date!: string; // YYYY-MM-DD

  @Prop({ default: 1 })
  count!: number;

  @Prop({ default: false })
  completed!: boolean;
}

export const HabitLogSchema = SchemaFactory.createForClass(HabitLog);
