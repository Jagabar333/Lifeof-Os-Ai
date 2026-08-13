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
import { FinanceService } from "./finance.service";

@ApiTags("finance")
@ApiBearerAuth()
@Controller("finance")
export class FinanceController {
  constructor(private readonly finance: FinanceService) {}

  @Get("accounts")
  @ApiOperation({ summary: "List finance accounts" })
  listAccounts(@CurrentUser() user: RequestUser) {
    return this.finance.findAll(user.id);
  }

  @Post("accounts")
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Create a finance account" })
  createAccount(@CurrentUser() user: RequestUser, @Body() dto: Record<string, unknown>) {
    return this.finance.create({ ...dto, userId: user.id });
  }

  @Get("transactions")
  @ApiOperation({ summary: "List transactions" })
  listTransactions(
    @CurrentUser() user: RequestUser,
    @Query("accountId") accountId?: string,
  ) {
    return this.finance.listTransactions(user.id, accountId);
  }

  @Post("transactions")
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Create a transaction" })
  createTransaction(@CurrentUser() user: RequestUser, @Body() dto: Record<string, unknown>) {
    return this.finance.createTransaction(user.id, { ...dto, userId: user.id });
  }

  @Delete("transactions/:id")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Delete a transaction" })
  deleteTransaction(@CurrentUser() user: RequestUser, @Param("id", ParseObjectIdPipe) id: string) {
    return this.finance.deleteTransaction(id, user.id);
  }

  @Get("summary")
  @ApiOperation({ summary: "Get finance summary for a date range" })
  summary(
    @CurrentUser() user: RequestUser,
    @Query("startDate") startDate: string,
    @Query("endDate") endDate: string,
  ) {
    return this.finance.getSummary(user.id, startDate, endDate);
  }

  @Patch("accounts/:id")
  @ApiOperation({ summary: "Update an account" })
  updateAccount(
    @CurrentUser() user: RequestUser,
    @Param("id", ParseObjectIdPipe) id: string,
    @Body() dto: Record<string, unknown>,
  ) {
    return this.finance.update(id, user.id, dto);
  }

  @Delete("accounts/:id")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Delete an account" })
  removeAccount(@CurrentUser() user: RequestUser, @Param("id", ParseObjectIdPipe) id: string) {
    return this.finance.remove(id, user.id);
  }
}
