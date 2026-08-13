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
import { CalendarService } from "./calendar.service";

@ApiTags("calendar")
@ApiBearerAuth()
@Controller("calendar")
export class CalendarController {
  constructor(private readonly calendar: CalendarService) {}

  @Get()
  @ApiOperation({ summary: "List events in date range" })
  list(
    @CurrentUser() user: RequestUser,
    @Query("startDate") startDate?: string,
    @Query("endDate") endDate?: string,
  ) {
    if (startDate && endDate) {
      return this.calendar.findByDateRange(user.id, startDate, endDate);
    }
    return this.calendar.findAll(user.id);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get an event by id" })
  get(@CurrentUser() user: RequestUser, @Param("id", ParseObjectIdPipe) id: string) {
    return this.calendar.findOne(id, user.id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Create an event" })
  create(@CurrentUser() user: RequestUser, @Body() dto: Record<string, unknown>) {
    return this.calendar.create({ ...dto, userId: user.id });
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update an event" })
  update(
    @CurrentUser() user: RequestUser,
    @Param("id", ParseObjectIdPipe) id: string,
    @Body() dto: Record<string, unknown>,
  ) {
    return this.calendar.update(id, user.id, dto);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Delete an event" })
  remove(@CurrentUser() user: RequestUser, @Param("id", ParseObjectIdPipe) id: string) {
    return this.calendar.remove(id, user.id);
  }
}
