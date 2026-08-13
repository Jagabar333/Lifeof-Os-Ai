import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { HealthMetricsController } from "./health.controller";
import { HealthService } from "./health.service";
import { HealthMetric, HealthMetricSchema } from "./schemas/health-metric.schema";

@Module({
  imports: [MongooseModule.forFeature([{ name: HealthMetric.name, schema: HealthMetricSchema }])],
  controllers: [HealthMetricsController],
  providers: [HealthService],
})
export class HealthModule {}
