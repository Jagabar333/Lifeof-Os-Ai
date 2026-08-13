import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { CurrentUser, type RequestUser } from "../../common/decorators/current-user.decorator";
import { ParseObjectIdPipe } from "../../common/pipes/parse-objectid.pipe";
import { HealthService } from "./health.service";

@ApiTags("health")
@ApiBearerAuth()
@Controller("health")
export class HealthMetricsController {
  constructor(private readonly health: HealthService) {}

  @Get()
  @ApiOperation({ summary: "List health metrics" })
  list(@CurrentUser() user: RequestUser) {
    return this.health.findAll(user.id);
  }

  @Get("by-type/:type")
  @ApiOperation({ summary: "Get metrics by type for the last N days" })
  byType(
    @CurrentUser() user: RequestUser,
    @Param("type") type: string,
    @Query("days") days?: string,
  ) {
    return this.health.findByType(user.id, type as never, days ? Number(days) : 30);
  }

  @Get("latest/:type")
  @ApiOperation({ summary: "Get the latest value for a metric type" })
  latest(@CurrentUser() user: RequestUser, @Param("type") type: string) {
    return this.health.getLatest(user.id, type as never);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Log a health metric" })
  create(@CurrentUser() user: RequestUser, @Body() dto: Record<string, unknown>) {
    return this.health.create({ ...dto, userId: user.id });
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update a health metric" })
  update(
    @CurrentUser() user: RequestUser,
    @Param("id", ParseObjectIdPipe) id: string,
    @Body() dto: Record<string, unknown>,
  ) {
    return this.health.update(id, user.id, dto);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Delete a health metric" })
  remove(@CurrentUser() user: RequestUser, @Param("id", ParseObjectIdPipe) id: string) {
    return this.health.remove(id, user.id);
  }
}
