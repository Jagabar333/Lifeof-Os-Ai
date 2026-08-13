import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
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
