import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { User, UserDocument } from "./schemas/user.schema";

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  bio: string | null;
  role: string;
  status: string;
  timezone: string;
  locale: string;
}

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  private mapToProfile(user: UserDocument): UserProfile {
    return {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      avatarUrl: user.avatarUrl,
      bio: user.bio,
      role: user.role,
      status: user.status,
      timezone: user.timezone,
      locale: user.locale,
    };
  }

  async getProfile(id: string): Promise<UserProfile | null> {
    const user = await this.userModel.findById(id).exec();
    if (!user || user.status === "deleted") {
      return null;
    }
    return this.mapToProfile(user);
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email, status: { $ne: "deleted" } }).exec();
  }

  async findById(id: string): Promise<UserDocument | null> {
    return this.userModel.findById(id).exec();
  }

  async createProfile(input: {
    email: string;
    name: string;
    passwordHash?: string | null;
    authProvider?: string;
    avatarUrl?: string | null;
  }): Promise<UserProfile> {
    const createdUser = new this.userModel({
      email: input.email,
      name: input.name,
      passwordHash: input.passwordHash || null,
      authProvider: input.authProvider ?? "local",
      avatarUrl: input.avatarUrl ?? null,
      role: "free",
      status: "active",
      timezone: "UTC",
      locale: "en",
    });
    
    await createdUser.save();
    return this.mapToProfile(createdUser);
  }

  async findOrCreateGoogleUser(googleUser: {
    email: string;
    name: string;
    avatarUrl: string | null;
  }): Promise<UserProfile> {
    const existing = await this.findByEmail(googleUser.email);
    if (existing) {
      return this.mapToProfile(existing);
    }

    return this.createProfile({
      email: googleUser.email,
      name: googleUser.name,
      passwordHash: null,
      authProvider: "google",
      avatarUrl: googleUser.avatarUrl,
    });
  }

  async updateProfile(
    id: string,
    input: Partial<Omit<UserProfile, "id" | "email">>,
  ): Promise<UserProfile> {
    const updatedUser = await this.userModel
      .findByIdAndUpdate(id, { $set: input }, { new: true })
      .exec();

    if (!updatedUser) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return this.mapToProfile(updatedUser);
  }

  async updatePassword(id: string, passwordHash: string): Promise<void> {
    await this.userModel.findByIdAndUpdate(id, { $set: { passwordHash } }).exec();
  }

  async deleteProfile(id: string): Promise<void> {
    const result = await this.userModel
      .findByIdAndUpdate(id, { $set: { status: "deleted" } })
      .exec();

    if (!result) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
  }
}
