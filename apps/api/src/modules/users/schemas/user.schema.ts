import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

export type UserDocument = User & Document;

@Schema({ timestamps: true, collection: "users" })
export class User {
  @Prop({ required: true })
  name!: string;

  @Prop({ required: true, unique: true, index: true })
  email!: string;

  @Prop({ type: String, default: null })
  passwordHash?: string | null;

  @Prop({ default: "local" })
  authProvider!: string;

  @Prop({ default: "free" })
  role!: string;

  @Prop({ default: "active" })
  status!: string;

  @Prop({ default: "UTC" })
  timezone!: string;

  @Prop({ default: "en" })
  locale!: string;

  @Prop({ type: String, default: null })
  avatarUrl!: string | null;

  @Prop({ type: String, default: null })
  bio!: string | null;
}

export const UserSchema = SchemaFactory.createForClass(User);
