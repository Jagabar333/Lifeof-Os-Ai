import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { BaseCrudService } from "../../common/services/base-crud.service";
import { FinanceAccount, FinanceAccountDocument } from "./schemas/finance-account.schema";
import { FinanceTransaction, FinanceTransactionDocument } from "./schemas/finance-transaction.schema";

@Injectable()
export class FinanceService extends BaseCrudService<FinanceAccountDocument> {
  constructor(
    @InjectModel(FinanceAccount.name) accountModel: Model<FinanceAccountDocument>,
    @InjectModel(FinanceTransaction.name) private transactionModel: Model<FinanceTransactionDocument>
  ) {
    super(accountModel, "FinanceService");
  }

  async listTransactions(userId: string, accountId?: string) {
    const filter: any = { userId };
    if (accountId) filter.accountId = accountId;

    const data = await this.transactionModel.find(filter).sort({ date: -1 }).exec();
    return data;
  }

  async createTransaction(
    userId: string,
    input: Partial<FinanceTransaction> & { userId: string },
  ): Promise<FinanceTransactionDocument> {
    const newTx = new this.transactionModel(input);
    const data = await newTx.save();

    await this.recomputeAccountBalance(input.accountId!, userId);
    return data;
  }

  async deleteTransaction(id: string, userId: string): Promise<void> {
    const existing = await this.transactionModel.findOne({ _id: id, userId }).exec();
    if (!existing) throw new NotFoundException("Transaction not found");

    await this.transactionModel.deleteOne({ _id: id, userId }).exec();

    await this.recomputeAccountBalance(existing.accountId, userId);
  }

  async getSummary(userId: string, startDate: string, endDate: string) {
    const data = await this.transactionModel.find({
      userId,
      date: { $gte: startDate, $lte: endDate }
    }).exec();

    const summary = data.reduce(
      (acc, tx) => {
        const amount = Number(tx.amount);
        if (tx.type === "income") acc.income += amount;
        else if (tx.type === "expense") acc.expenses += amount;
        acc.byCategory[tx.category] = (acc.byCategory[tx.category] ?? 0) + amount;
        return acc;
      },
      { income: 0, expenses: 0, byCategory: {} as Record<string, number> },
    );

    return {
      ...summary,
      net: summary.income - summary.expenses,
    };
  }

  private async recomputeAccountBalance(accountId: string, userId: string): Promise<void> {
    const data = await this.transactionModel.find({ accountId, userId }).exec();

    const balance = data.reduce((sum, tx) => {
      const amount = Number(tx.amount);
      if (tx.type === "income") return sum + amount;
      if (tx.type === "expense") return sum - amount;
      return sum;
    }, 0);

    await this.model.findByIdAndUpdate(accountId, { $set: { balance } }).exec();
  }
}
