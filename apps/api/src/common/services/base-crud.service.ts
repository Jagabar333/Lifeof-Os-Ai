import { Injectable, NotFoundException, Logger } from "@nestjs/common";
import { Model, Document } from "mongoose";

export interface PaginationOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

@Injectable()
export abstract class BaseCrudService<T extends Document> {
  protected readonly logger: Logger;

  constructor(
    protected readonly model: Model<T>,
    loggerName: string,
  ) {
    this.logger = new Logger(loggerName);
  }

  async findAll(
    userId: string,
    options: PaginationOptions = {},
    filters: Record<string, unknown> = {},
  ): Promise<PaginatedResult<T>> {
    const { page = 1, limit = 20, sortBy = "createdAt", sortOrder = "desc" } = options;
    const skip = (page - 1) * limit;

    const queryFilter: Record<string, any> = { userId, ...filters };

    // Clean up undefined filters
    for (const key in queryFilter) {
      if (queryFilter[key] === undefined || queryFilter[key] === null) {
        delete queryFilter[key];
      }
    }

    try {
      const [data, total] = await Promise.all([
        this.model
          .find(queryFilter as any)
          .sort({ [sortBy]: sortOrder === "asc" ? 1 : -1 })
          .skip(skip)
          .limit(limit)
          .exec(),
        this.model.countDocuments(queryFilter as any).exec(),
      ]);

      return {
        data,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error: any) {
      this.logger.error(`findAll failed: ${error.message}`);
      throw new Error(error.message);
    }
  }

  async findOne(id: string, userId: string): Promise<T> {
    const data = await this.model.findOne({ _id: id, userId } as any).exec();

    if (!data) {
      throw new NotFoundException(`${this.model.modelName} with id "${id}" not found`);
    }
    return data;
  }

  async create(input: Partial<T> & { userId: string }): Promise<T> {
    try {
      const created = new this.model(input);
      return await created.save();
    } catch (error: any) {
      this.logger.error(`create failed: ${error.message}`);
      throw new Error(error.message);
    }
  }

  async update(id: string, userId: string, input: Partial<T>): Promise<T> {
    const data = await this.model
      .findOneAndUpdate(
        { _id: id, userId } as any,
        { $set: input },
        { new: true }
      )
      .exec();

    if (!data) {
      throw new NotFoundException(`${this.model.modelName} with id "${id}" not found`);
    }
    return data;
  }

  async remove(id: string, userId: string): Promise<void> {
    const result = await this.model.deleteOne({ _id: id, userId } as any).exec();
    if (result.deletedCount === 0) {
      this.logger.warn(`remove failed: document ${id} not found or not owned by ${userId}`);
      throw new NotFoundException(`${this.model.modelName} with id "${id}" not found`);
    }
  }
}
