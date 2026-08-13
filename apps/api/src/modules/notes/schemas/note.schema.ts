import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

export type NoteDocument = Note & Document;

@Schema({ timestamps: true, collection: "notes" })
export class Note {
  @Prop({ required: true, index: true })
  userId!: string;

  @Prop({ required: true })
  title!: string;

  @Prop({ required: true })
  content!: string;

  @Prop({ type: [String], default: [] })
  tags!: string[];

  @Prop({ default: false })
  isPinned!: boolean;

  @Prop({ default: false })
  isArchived!: boolean;
}

export const NoteSchema = SchemaFactory.createForClass(Note);
