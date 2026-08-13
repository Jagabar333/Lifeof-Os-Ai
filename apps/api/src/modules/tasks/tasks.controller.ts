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
import { TasksService } from "./tasks.service";
import { CreateTaskDto, UpdateTaskDto, TaskQueryDto } from "./dto";

@ApiTags("tasks")
@ApiBearerAuth()
@Controller("tasks")
export class TasksController {
  constructor(private readonly tasks: TasksService) {}

  @Get()
  @ApiOperation({ summary: "List tasks" })
  list(@CurrentUser() user: RequestUser, @Query() query: TaskQueryDto) {
    return this.tasks.findAll(user.id, {
      page: query.page,
      limit: query.limit,
      sortBy: query.sortBy,
      sortOrder: query.sortOrder,
    });
  }

  @Get(":id")
  @ApiOperation({ summary: "Get a task by id" })
  get(@CurrentUser() user: RequestUser, @Param("id", ParseObjectIdPipe) id: string) {
    return this.tasks.findOne(id, user.id);
  }

  @Post()
  @ApiOperation({ summary: "Create a task" })
  @HttpCode(HttpStatus.CREATED)
  create(@CurrentUser() user: RequestUser, @Body() dto: CreateTaskDto) {
    return this.tasks.create({ ...dto, userId: user.id } as any);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update a task" })
  update(
    @CurrentUser() user: RequestUser,
    @Param("id", ParseObjectIdPipe) id: string,
    @Body() dto: UpdateTaskDto,
  ) {
    return this.tasks.update(id, user.id, dto as any);
  }

  @Post(":id/toggle")
  @ApiOperation({ summary: "Toggle task completion" })
  toggle(@CurrentUser() user: RequestUser, @Param("id", ParseObjectIdPipe) id: string) {
    return this.tasks.toggleComplete(id, user.id);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Delete a task" })
  remove(@CurrentUser() user: RequestUser, @Param("id", ParseObjectIdPipe) id: string) {
    return this.tasks.remove(id, user.id);
  }
}
