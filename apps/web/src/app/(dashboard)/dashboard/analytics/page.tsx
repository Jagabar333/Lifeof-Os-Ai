"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import { motion } from "framer-motion";
import {
  BarChart3, Activity, ListTodo, Repeat, Wallet, TrendingUp, Search
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

// Types derived from existing schemas
interface Task { status: string; priority: string }
interface Habit { streak: number; bestStreak: number; targetCount: number }
interface Account { balance: number }
interface HealthMetric { type: string; value: number }

export default function AnalyticsPage() {
  const { data: tasks = [], isLoading: loadingTasks } = useQuery<Task[]>({
    queryKey: ["tasks"],
    queryFn: async () => {
      const res = await apiClient.get<any>("/api/tasks");
      const items = res?.data ?? res;
      return Array.isArray(items) ? items : [];
    }
  });

  const { data: habits = [], isLoading: loadingHabits } = useQuery<Habit[]>({
    queryKey: ["habits"],
    queryFn: async () => {
      const res = await apiClient.get<any>("/api/habits");
      const items = res?.data ?? res;
      return Array.isArray(items) ? items : [];
    }
  });

  const { data: accounts = [], isLoading: loadingAccounts } = useQuery<Account[]>({
    queryKey: ["finance", "accounts"],
    queryFn: async () => {
      const res = await apiClient.get<any>("/api/finance/accounts");
      const items = res?.data ?? res;
      return Array.isArray(items) ? items : [];
    }
  });

  const { data: health = [], isLoading: loadingHealth } = useQuery<HealthMetric[]>({
    queryKey: ["health"],
    queryFn: async () => {
      const res = await apiClient.get<any>("/api/health");
      const items = res?.data ?? res;
      return Array.isArray(items) ? items : [];
    }
  });

  const isLoading = loadingTasks || loadingHabits || loadingAccounts || loadingHealth;

  // Task Stats
  const totalTasks = tasks.length;
  const doneTasks = tasks.filter(t => t.status === "done").length;
  const taskCompletionRate = totalTasks ? Math.round((doneTasks / totalTasks) * 100) : 0;

  // Habit Stats
  const activeHabits = habits.length;
  const totalStreaks = habits.reduce((acc, h) => acc + h.streak, 0);
  const avgStreak = activeHabits ? Math.round(totalStreaks / activeHabits) : 0;

  // Finance Stats
  const totalWealth = accounts.reduce((acc, a) => acc + a.balance, 0);

  // Health Stats
  const sleepLogs = health.filter(h => h.type === "sleep");
  const avgSleep = sleepLogs.length ? (sleepLogs.reduce((acc, h) => acc + h.value, 0) / sleepLogs.length).toFixed(1) : 0;

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-10">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-fuchsia-600 to-pink-500 bg-clip-text text-transparent">
            Deep Analytics
          </h1>
          <p className="text-muted-foreground mt-0.5 text-lg">Unified metrics across all LifeOS modules.</p>
        </div>
      </div>

      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32 w-full rounded-2xl" />)}
        </div>
      ) : (
        <>
          {/* Top Level KPIs */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card className="border-0 shadow-md ring-1 ring-black/5 dark:ring-white/5 bg-card/60 backdrop-blur-xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <ListTodo className="h-16 w-16 text-blue-500" />
              </div>
              <CardContent className="p-6">
                <p className="text-sm font-bold tracking-wider text-muted-foreground uppercase">Task Completion</p>
                <div className="flex items-baseline gap-2 mt-2">
                  <h2 className="text-4xl font-extrabold">{taskCompletionRate}%</h2>
                  <span className="text-xs font-semibold text-emerald-500">+{doneTasks} done</span>
                </div>
                <div className="w-full bg-muted h-2 rounded-full mt-4 overflow-hidden">
                  <div className="bg-blue-500 h-full rounded-full transition-all" style={{ width: `${taskCompletionRate}%` }} />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md ring-1 ring-black/5 dark:ring-white/5 bg-card/60 backdrop-blur-xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Repeat className="h-16 w-16 text-orange-500" />
              </div>
              <CardContent className="p-6">
                <p className="text-sm font-bold tracking-wider text-muted-foreground uppercase">Habit Consistency</p>
                <div className="flex items-baseline gap-2 mt-2">
                  <h2 className="text-4xl font-extrabold">{avgStreak} <span className="text-lg">days</span></h2>
                  <span className="text-xs font-semibold text-muted-foreground">average streak</span>
                </div>
                <p className="text-xs text-muted-foreground mt-4 font-medium">Tracking {activeHabits} active habits globally.</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md ring-1 ring-black/5 dark:ring-white/5 bg-card/60 backdrop-blur-xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Wallet className="h-16 w-16 text-emerald-500" />
              </div>
              <CardContent className="p-6">
                <p className="text-sm font-bold tracking-wider text-muted-foreground uppercase">Net Worth</p>
                <div className="flex items-baseline gap-2 mt-2">
                  <h2 className="text-4xl font-extrabold">${totalWealth.toLocaleString(undefined, { maximumFractionDigits: 0 })}</h2>
                </div>
                <div className="flex items-center gap-1 text-emerald-500 mt-4 text-xs font-bold">
                  <TrendingUp className="h-3 w-3" />
                  <span>Liquid Capital Available</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md ring-1 ring-black/5 dark:ring-white/5 bg-card/60 backdrop-blur-xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Activity className="h-16 w-16 text-rose-500" />
              </div>
              <CardContent className="p-6">
                <p className="text-sm font-bold tracking-wider text-muted-foreground uppercase">Avg Sleep Time</p>
                <div className="flex items-baseline gap-2 mt-2">
                  <h2 className="text-4xl font-extrabold">{avgSleep} <span className="text-lg">hrs</span></h2>
                </div>
                <p className="text-xs text-muted-foreground mt-4 font-medium">Based on {sleepLogs.length} recent health logs.</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Visual Task Priority Breakdown */}
            <Card className="border-0 shadow-md ring-1 ring-black/5 dark:ring-white/5 bg-card/60 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  Task Priority Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {["low", "medium", "high", "urgent"].map(p => {
                    const count = tasks.filter(t => t.priority === p).length;
                    const pct = totalTasks ? (count / totalTasks) * 100 : 0;
                    const color = p === "urgent" ? "bg-rose-500" : p === "high" ? "bg-orange-500" : p === "medium" ? "bg-amber-500" : "bg-blue-500";
                    return (
                      <div key={p}>
                        <div className="flex justify-between text-xs font-bold mb-1 uppercase tracking-wider text-muted-foreground">
                          <span>{p}</span>
                          <span>{count}</span>
                        </div>
                        <div className="w-full bg-muted h-3 rounded-full overflow-hidden">
                          <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 1 }} className={cn("h-full rounded-full", color)} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* AI Summary Standin */}
            <Card className="border-0 shadow-md ring-1 ring-black/5 dark:ring-white/5 bg-gradient-to-br from-primary/10 to-fuchsia-500/10">
              <CardContent className="p-8 flex flex-col items-center justify-center h-full text-center space-y-4">
                <div className="h-16 w-16 rounded-full bg-background shadow-sm flex items-center justify-center">
                  <Search className="h-8 w-8 text-fuchsia-500" />
                </div>
                <h3 className="text-xl font-bold tracking-tight">AI Correlation Insights</h3>
                <p className="text-sm text-muted-foreground leading-relaxed max-w-sm">
                  We are currently analyzing how your <strong className="text-foreground">Sleep Hours</strong> correlate with your <strong className="text-foreground">Task Completion Rate</strong>. Check back soon for deep correlation models!
                </p>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
