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
import { NotesService } from "./notes.service";

@ApiTags("notes")
@ApiBearerAuth()
@Controller("notes")
export class NotesController {
  constructor(private readonly notes: NotesService) {}

  @Get()
  @ApiOperation({ summary: "List notes" })
  list(@CurrentUser() user: RequestUser, @Query("search") search?: string) {
    if (search) return this.notes.search(user.id, search);
    return this.notes.findAll(user.id);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get a note by id" })
  get(@CurrentUser() user: RequestUser, @Param("id", ParseObjectIdPipe) id: string) {
    return this.notes.findOne(id, user.id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Create a note" })
  create(@CurrentUser() user: RequestUser, @Body() dto: Record<string, unknown>) {
    return this.notes.create({ ...dto, userId: user.id });
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update a note" })
  update(
    @CurrentUser() user: RequestUser,
    @Param("id", ParseObjectIdPipe) id: string,
    @Body() dto: Record<string, unknown>,
  ) {
    return this.notes.update(id, user.id, dto);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Delete a note" })
  remove(@CurrentUser() user: RequestUser, @Param("id", ParseObjectIdPipe) id: string) {
    return this.notes.remove(id, user.id);
  }
}
