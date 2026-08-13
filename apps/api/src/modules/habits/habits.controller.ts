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
import { HabitsService } from "./habits.service";

@ApiTags("habits")
@ApiBearerAuth()
@Controller("habits")
export class HabitsController {
  constructor(private readonly habits: HabitsService) {}

  @Get()
  @ApiOperation({ summary: "List habits" })
  list(@CurrentUser() user: RequestUser) {
    return this.habits.findAll(user.id);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get a habit by id" })
  get(@CurrentUser() user: RequestUser, @Param("id", ParseObjectIdPipe) id: string) {
    return this.habits.findOne(id, user.id);
  }

  @Get(":id/logs")
  @ApiOperation({ summary: "Get habit logs in a date range" })
  logs(
    @CurrentUser() user: RequestUser,
    @Param("id", ParseObjectIdPipe) id: string,
    @Query("startDate") startDate: string,
    @Query("endDate") endDate: string,
  ) {
    return this.habits.getLogs(user.id, id, startDate, endDate);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Create a habit" })
  create(@CurrentUser() user: RequestUser, @Body() dto: Record<string, unknown>) {
    return this.habits.create({ ...dto, userId: user.id });
  }

  @Post(":id/log")
  @ApiOperation({ summary: "Log a habit entry for a date" })
  log(
    @CurrentUser() user: RequestUser,
    @Param("id", ParseObjectIdPipe) id: string,
    @Body() dto: { date: string; count?: number },
  ) {
    return this.habits.log(id, user.id, dto.date, dto.count ?? 1);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update a habit" })
  update(
    @CurrentUser() user: RequestUser,
    @Param("id", ParseObjectIdPipe) id: string,
    @Body() dto: Record<string, unknown>,
  ) {
    return this.habits.update(id, user.id, dto);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Delete a habit" })
  remove(@CurrentUser() user: RequestUser, @Param("id", ParseObjectIdPipe) id: string) {
    return this.habits.remove(id, user.id);
  }
}
