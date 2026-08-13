import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { BaseCrudService } from "../../common/services/base-crud.service";
import { HealthMetric, HealthMetricDocument } from "./schemas/health-metric.schema";

@Injectable()
export class HealthService extends BaseCrudService<HealthMetricDocument> {
  constructor(
    @InjectModel(HealthMetric.name) metricModel: Model<HealthMetricDocument>
  ) {
    super(metricModel, "HealthService");
  }

  async findByType(userId: string, type: string, days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days); 

    const data = await this.model.find({
      userId,
      type,
      date: { $gte: startDate.toISOString().split("T")[0] }
    }).sort({ date: 1 }).exec();

    return data;
  }

  async getLatest(userId: string, type: string) {
    const data = await this.model.findOne({
      userId,
      type
    }).sort({ date: -1 }).exec();

    return data;
  }
}
