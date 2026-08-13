"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, DollarSign, ArrowUpRight, ArrowDownRight,
  Trash2, Wallet
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface Account {
  _id?: string;
  id?: string;
  name: string;
  type: string;
  balance: number;
  currency: string;
}

interface Transaction {
  _id?: string;
  id?: string;
  accountId: string;
  amount: number;
  type: "income" | "expense";
  category: string;
  description?: string;
  date: string;
}

export default function FinancePage() {
  const queryClient = useQueryClient();
  const [activeAccount, setActiveAccount] = useState<string>("all");
  const [modalType, setModalType] = useState<"account" | "transaction" | null>(null);

  // Form states - Account
  const [accName, setAccName] = useState("");
  const [accType, setAccType] = useState("checking");
  const [accBalance, setAccBalance] = useState(0);

  // Form states - Transaction
  const [txAmount, setTxAmount] = useState(0);
  const [txType, setTxType] = useState<"income" | "expense">("expense");
  const [txCategory, setTxCategory] = useState("Food");
  const [txDesc, setTxDesc] = useState("");
  const [txAccountId, setTxAccountId] = useState("");

  // Fetch Accounts
  const { data: accounts = [], isLoading: isLoadingAcc } = useQuery<Account[]>({
    queryKey: ["finance", "accounts"],
    queryFn: async () => {
      const res = await apiClient.get<any>("/api/finance/accounts");
      const items = res?.data ?? res;
      return Array.isArray(items) ? items : [];
    },
  });

  // Fetch Transactions
  const { data: transactions = [], isLoading: isLoadingTx } = useQuery<Transaction[]>({
    queryKey: ["finance", "transactions", activeAccount],
    queryFn: async () => {
      const query = activeAccount !== "all" ? `?accountId=${activeAccount}` : "";
      const res = await apiClient.get<any>(`/api/finance/transactions${query}`);
      const items = res?.data ?? res;
      return Array.isArray(items) ? items : [];
    },
  });

  // Mutations
  const createAccountMutation = useMutation({
    mutationFn: async (acc: Partial<Account>) => {
      const res = await apiClient.post<any>("/api/finance/accounts", acc);
      return res.data || res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["finance", "accounts"] });
      setModalType(null);
      setAccName("");
      setAccBalance(0);
    },
  });

  const createTxMutation = useMutation({
    mutationFn: async (tx: Partial<Transaction>) => {
      const res = await apiClient.post<any>("/api/finance/transactions", tx);
      return res.data || res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["finance"] });
      setModalType(null);
      setTxAmount(0);
      setTxDesc("");
    },
  });

  const deleteTxMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/api/finance/transactions/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["finance"] });
    },
  });

  const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);

  const handleCreateAccount = (e: React.FormEvent) => {
    e.preventDefault();
    createAccountMutation.mutate({
      name: accName,
      type: accType,
      balance: Number(accBalance),
      currency: "USD",
    });
  };

  const handleCreateTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    const targetAccountId = txAccountId || (accounts[0]?._id || accounts[0]?.id || "");
    createTxMutation.mutate({
      accountId: targetAccountId,
      amount: Number(txAmount),
      type: txType,
      category: txCategory,
      description: txDesc,
      date: new Date().toISOString(),
    });
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-10">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
            Financial Hub
          </h1>
          <p className="text-muted-foreground mt-0.5 text-lg">Secure income, expense, and budget tracking.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setModalType("account")} className="rounded-full">
            Add Account
          </Button>
          <Button onClick={() => {
            if (accounts.length > 0) {
              setTxAccountId(accounts[0]?._id || accounts[0]?.id || "");
            }
            setModalType("transaction");
          }} disabled={accounts.length === 0} className="rounded-full bg-emerald-600 hover:bg-emerald-500">
            <Plus className="mr-2 h-4 w-4" /> Log Transaction
          </Button>
        </div>
      </div>

      {/* Balance Hero Card */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-emerald-600 to-teal-700 text-white md:col-span-1">
          <CardContent className="p-6">
            <div className="flex items-center justify-between opacity-80 mb-2">
              <span className="text-sm font-semibold tracking-wide uppercase">Net Worth</span>
              <Wallet className="h-5 w-5" />
            </div>
            <h2 className="text-4xl font-extrabold tracking-tight">${totalBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</h2>
            <p className="text-xs opacity-75 mt-2">Across {accounts.length} active financial accounts</p>
          </CardContent>
        </Card>

        {/* Accounts strip */}
        <div className="md:col-span-2 flex gap-4 overflow-x-auto pb-2 scrollbar-thin">
          {isLoadingAcc ? (
            <Skeleton className="h-28 w-44 rounded-2xl" />
          ) : (
            <>
              <button
                onClick={() => setActiveAccount("all")}
                className={cn(
                  "p-4 rounded-2xl border text-left min-w-[160px] flex flex-col justify-between transition-all",
                  activeAccount === "all" ? "bg-primary/10 border-primary/20" : "bg-card/50 hover:bg-muted/50 border-transparent"
                )}
              >
                <span className="text-xs text-muted-foreground font-semibold uppercase">All Accounts</span>
                <span className="text-xl font-bold mt-2">${totalBalance.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
              </button>

              {accounts.map((acc) => {
                const accId = acc._id || acc.id || "";
                const isSelected = activeAccount === accId;
                return (
                  <button
                    key={accId}
                    onClick={() => setActiveAccount(accId)}
                    className={cn(
                      "p-4 rounded-2xl border text-left min-w-[160px] flex flex-col justify-between transition-all",
                      isSelected ? "bg-primary/10 border-primary/20" : "bg-card/50 hover:bg-muted/50 border-transparent"
                    )}
                  >
                    <span className="text-xs text-muted-foreground font-semibold truncate capitalize">{acc.name}</span>
                    <span className="text-xl font-bold mt-2">${acc.balance.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                  </button>
                );
              })}
            </>
          )}
        </div>
      </div>

      {/* Transactions list */}
      <Card className="border-0 shadow-md ring-1 ring-black/5 dark:ring-white/5 bg-card/60 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="text-lg font-bold">Transaction History</CardTitle>
          <CardDescription>Recent records for the selected account</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingTx ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => <Skeleton key={i} className="h-12 w-full rounded-xl" />)}
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              <DollarSign className="h-8 w-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No transactions logged yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {transactions.map((tx) => {
                const txId = tx._id || tx.id || "";
                const isExpense = tx.type === "expense";
                return (
                  <div key={txId} className="flex items-center justify-between p-3 rounded-xl border bg-background/40 hover:bg-background/80 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "h-9 w-9 rounded-lg flex items-center justify-center shrink-0",
                        isExpense ? "bg-destructive/10 text-destructive" : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                      )}>
                        {isExpense ? <ArrowDownRight className="h-5 w-5" /> : <ArrowUpRight className="h-5 w-5" />}
                      </div>
                      <div>
                        <p className="text-sm font-semibold">{tx.description || tx.category}</p>
                        <p className="text-xs text-muted-foreground">{format(new Date(tx.date), "MMM d, yyyy")}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <span className={cn("font-bold text-sm", isExpense ? "text-destructive" : "text-emerald-600 dark:text-emerald-400")}>
                        {isExpense ? "-" : "+"}${tx.amount.toFixed(2)}
                      </span>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => deleteTxMutation.mutate(txId)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Account / Transaction Modal */}
      <AnimatePresence>
        {modalType && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={() => setModalType(null)}>
            <motion.div
              initial={{ scale: 0.95, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 10 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md rounded-2xl border-0 shadow-2xl ring-1 ring-black/10 dark:ring-white/10 bg-background p-6"
            >
              {modalType === "account" ? (
                <>
                  <h2 className="text-xl font-bold mb-4">Add Account</h2>
                  <form onSubmit={handleCreateAccount} className="space-y-4">
                    <div>
                      <label className="text-xs font-bold block mb-1 text-muted-foreground uppercase">Account Name</label>
                      <Input value={accName} onChange={(e) => setAccName(e.target.value)} required placeholder="e.g. Chase checking" />
                    </div>
                    <div>
                      <label className="text-xs font-bold block mb-1 text-muted-foreground uppercase">Account Type</label>
                      <select
                        value={accType}
                        onChange={(e) => setAccType(e.target.value)}
                        className="w-full rounded-xl border-0 ring-1 ring-black/10 dark:ring-white/10 bg-muted/40 px-3 py-2 text-sm focus:outline-none"
                      >
                        <option value="checking">Checking</option>
                        <option value="savings">Savings</option>
                        <option value="credit">Credit Card</option>
                        <option value="investment">Investment</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-bold block mb-1 text-muted-foreground uppercase">Initial Balance</label>
                      <Input type="number" step="0.01" value={accBalance} onChange={(e) => setAccBalance(Number(e.target.value))} />
                    </div>
                    <div className="flex justify-end gap-3 pt-2">
                      <Button type="button" variant="outline" onClick={() => setModalType(null)}>Cancel</Button>
                      <Button type="submit" className="bg-emerald-600 hover:bg-emerald-500">Save</Button>
                    </div>
                  </form>
                </>
              ) : (
                <>
                  <h2 className="text-xl font-bold mb-4">Log Transaction</h2>
                  <form onSubmit={handleCreateTransaction} className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-bold block mb-1 text-muted-foreground uppercase">Type</label>
                        <select
                          value={txType}
                          onChange={(e) => setTxType(e.target.value as any)}
                          className="w-full rounded-xl border-0 ring-1 ring-black/10 dark:ring-white/10 bg-muted/40 px-3 py-2 text-sm focus:outline-none"
                        >
                          <option value="expense">Expense</option>
                          <option value="income">Income</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-xs font-bold block mb-1 text-muted-foreground uppercase">Amount</label>
                        <Input type="number" step="0.01" value={txAmount} onChange={(e) => setTxAmount(Number(e.target.value))} required />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-bold block mb-1 text-muted-foreground uppercase">Account</label>
                      <select
                        value={txAccountId}
                        onChange={(e) => setTxAccountId(e.target.value)}
                        className="w-full rounded-xl border-0 ring-1 ring-black/10 dark:ring-white/10 bg-muted/40 px-3 py-2 text-sm focus:outline-none"
                      >
                        {accounts.map((acc) => (
                          <option key={acc._id || acc.id} value={acc._id || acc.id}>{acc.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-bold block mb-1 text-muted-foreground uppercase">Category</label>
                      <Input value={txCategory} onChange={(e) => setTxCategory(e.target.value)} placeholder="Food, Rent, Salary, Shopping" />
                    </div>
                    <div>
                      <label className="text-xs font-bold block mb-1 text-muted-foreground uppercase">Description</label>
                      <Input value={txDesc} onChange={(e) => setTxDesc(e.target.value)} placeholder="Grocery store run" />
                    </div>
                    <div className="flex justify-end gap-3 pt-2">
                      <Button type="button" variant="outline" onClick={() => setModalType(null)}>Cancel</Button>
                      <Button type="submit" className="bg-emerald-600 hover:bg-emerald-500">Log</Button>
                    </div>
                  </form>
                </>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
