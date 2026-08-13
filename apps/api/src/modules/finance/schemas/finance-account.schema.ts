import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
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
