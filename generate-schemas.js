const fs = require('fs');
const path = require('path');

const schemas = {
  'apps/api/src/modules/finance/schemas/finance-account.schema.ts': `import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

export type FinanceAccountDocument = FinanceAccount & Document;

@Schema({ timestamps: true, collection: "finance_accounts" })
export class FinanceAccount {
  @Prop({ required: true, index: true })
  userId!: string;

  @Prop({ required: true })
  name!: string;

  @Prop({ required: true })
  type!: string;

  @Prop({ default: 0 })
  balance!: number;

  @Prop({ default: "USD" })
  currency!: string;

  @Prop()
  color?: string;

  @Prop()
  icon?: string;
}

export const FinanceAccountSchema = SchemaFactory.createForClass(FinanceAccount);
`,
  'apps/api/src/modules/finance/schemas/finance-transaction.schema.ts': `import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

export type FinanceTransactionDocument = FinanceTransaction & Document;

@Schema({ timestamps: true, collection: "finance_transactions" })
export class FinanceTransaction {
  @Prop({ required: true, index: true })
  userId!: string;

  @Prop({ required: true, index: true })
  accountId!: string;

  @Prop({ required: true })
  amount!: number;

  @Prop({ required: true })
  type!: string;

  @Prop({ required: true })
  category!: string;

  @Prop({ default: "" })
  description!: string;

  @Prop({ required: true })
  date!: string;

  @Prop({ type: [String], default: [] })
  tags!: string[];
}

export const FinanceTransactionSchema = SchemaFactory.createForClass(FinanceTransaction);
`,
  'apps/api/src/modules/health/schemas/health-metric.schema.ts': `import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
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
`,
  'apps/api/src/modules/calendar/schemas/calendar-event.schema.ts': `import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
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
`,
  'apps/api/src/modules/goals/schemas/goal.schema.ts': `import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
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
`
};

for (const [filePath, content] of Object.entries(schemas)) {
  const fullPath = path.join(__dirname, filePath);
  const dir = path.dirname(fullPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(fullPath, content);
  console.log('Created:', fullPath);
}
