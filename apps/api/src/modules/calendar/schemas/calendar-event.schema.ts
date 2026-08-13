import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

export type CalendarEventDocument = CalendarEvent & Document;

@Schema({ timestamps: true, collection: "calendar_events" })
export class CalendarEvent {
  @Prop({ required: true, index: true })
  userId!: string;

  @Prop({ required: true })
  title!: string;

  @Prop()
  description?: string;

  @Prop({ required: true })
  startTime!: string;

  @Prop({ required: true })
  endTime!: string;

  @Prop({ default: false })
  allDay!: boolean;

  @Prop()
  color?: string;

  @Prop()
  location?: string;

  @Prop()
  reminderMinutes?: number;

  @Prop()
  recurrenceRule?: string;
}

export const CalendarEventSchema = SchemaFactory.createForClass(CalendarEvent);
