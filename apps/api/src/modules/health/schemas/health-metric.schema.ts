import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

export type HealthMetricDocument = HealthMetric & Document;

@Schema({ timestamps: true, collection: "health_metrics" })
export class HealthMetric {
  @Prop({ required: true, index: true })
  userId!: string;

  @Prop({ required: true })
  type!: string;

  @Prop({ required: true })
  value!: number;

  @Prop({ required: true })
  unit!: string;

  @Prop({ required: true })
  date!: string;

  @Prop()
  notes?: string;
}

export const HealthMetricSchema = SchemaFactory.createForClass(HealthMetric);
