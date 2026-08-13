import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { FinanceController } from "./finance.controller";
import { FinanceService } from "./finance.service";
import { FinanceAccount, FinanceAccountSchema } from "./schemas/finance-account.schema";
import { FinanceTransaction, FinanceTransactionSchema } from "./schemas/finance-transaction.schema";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: FinanceAccount.name, schema: FinanceAccountSchema },
      { name: FinanceTransaction.name, schema: FinanceTransactionSchema }
    ])
  ],
  controllers: [FinanceController],
  providers: [FinanceService],
})
export class FinanceModule {}
