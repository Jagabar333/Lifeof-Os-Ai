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
} from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { CurrentUser, type RequestUser } from "../../common/decorators/current-user.decorator";
import { ParseObjectIdPipe } from "../../common/pipes/parse-objectid.pipe";
import { GoalsService } from "./goals.service";

@ApiTags("goals")
@ApiBearerAuth()
@Controller("goals")
export class GoalsController {
  constructor(private readonly goals: GoalsService) {}

  @Get()
  @ApiOperation({ summary: "List goals" })
  list(@CurrentUser() user: RequestUser) {
    return this.goals.findAll(user.id);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get a goal by id" })
  get(@CurrentUser() user: RequestUser, @Param("id", ParseObjectIdPipe) id: string) {
    return this.goals.findOne(id, user.id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Create a goal" })
  create(@CurrentUser() user: RequestUser, @Body() dto: Record<string, unknown>) {
    return this.goals.create({ ...dto, userId: user.id });
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update a goal" })
  update(
    @CurrentUser() user: RequestUser,
    @Param("id", ParseObjectIdPipe) id: string,
    @Body() dto: Record<string, unknown>,
  ) {
    return this.goals.update(id, user.id, dto);
  }

  @Post(":id/milestones/:milestoneId/toggle")
  @ApiOperation({ summary: "Toggle a milestone completion" })
  toggleMilestone(
    @CurrentUser() user: RequestUser,
    @Param("id", ParseObjectIdPipe) id: string,
    @Param("milestoneId") milestoneId: string,
  ) {
    return this.goals.toggleMilestone(id, user.id, milestoneId);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Delete a goal" })
  remove(@CurrentUser() user: RequestUser, @Param("id", ParseObjectIdPipe) id: string) {
    return this.goals.remove(id, user.id);
  }
}
