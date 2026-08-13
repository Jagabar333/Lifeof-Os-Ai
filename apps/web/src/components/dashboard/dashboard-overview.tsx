"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckSquare, Calendar, Target, Repeat, Plus, TrendingUp, Sparkles, Clock, CheckCircle2, Circle } from "lucide-react";
import Link from "next/link";
import { apiClient } from "@/lib/api/client";

const upcomingEvents = [
  { title: "Team standup", time: "9:00 AM", duration: "30 min" },
  { title: "Product review", time: "11:00 AM", duration: "1 hour" },
  { title: "Lunch with Sarah", time: "12:30 PM", duration: "1 hour" },
  { title: "Deep work session", time: "2:00 PM", duration: "2 hours" },
];

const priorityColor: Record<string, string> = {
  high: "destructive",
  medium: "warning",
  low: "secondary" };

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

export function DashboardOverview() {
  const queryClient = useQueryClient();

  // Fetch Tasks
  const { data: tasksDataResp, isLoading: isLoadingTasks } = useQuery({
    queryKey: ["tasks", { status: "todo" }],
    queryFn: async () => {
      const res = await apiClient.get<any[]>("/api/tasks?status=todo&limit=5");
      const items = (res as any)?.data ?? res;
      return Array.isArray(items) ? items : [];
    } });
  const tasksData = Array.isArray(tasksDataResp) ? tasksDataResp : [];

  // Fetch Goals
  const { data: goalsDataResp, isLoading: isLoadingGoals } = useQuery({
    queryKey: ["goals"],
    queryFn: async () => {
      const res = await apiClient.get<any[]>("/api/goals");
      const items = (res as any)?.data ?? res;
      return Array.isArray(items) ? items : [];
    } });
  const goalsData = Array.isArray(goalsDataResp) ? goalsDataResp : [];

  const toggleTaskMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string, status: string }) => {
      return apiClient.patch(`/api/tasks/${id}`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    }
  });

  const activeTasks = tasksData;
  const activeGoals = goalsData.slice(0, 3);

  const stats = [
    {
      label: "Tasks Pending",
      value: activeTasks.length.toString(),
      icon: CheckSquare,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10" },
    {
      label: "Active Goals",
      value: (goalsData?.length || 0).toString(),
      icon: Target,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10" },
    {
      label: "Habit Streak",
      value: "24",
      sub: "days",
      icon: Repeat,
      color: "text-orange-500",
      bgColor: "bg-orange-500/10" },
    {
      label: "Productivity",
      value: "92",
      sub: "score",
      icon: TrendingUp,
      color: "text-emerald-500",
      bgColor: "bg-emerald-500/10" },
  ];

  return (
    <motion.div 
      className="space-y-8 max-w-7xl mx-auto"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Good morning 👋
          </h1>
          <p className="text-muted-foreground mt-1 text-lg">
            Here&apos;s your AI-curated Command Center for today.
          </p>
        </div>
        <Button className="rounded-full shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95">
          <Plus className="mr-2 h-4 w-4" />
          Quick Add
        </Button>
      </motion.div>

      {/* AI Insight Banner */}
      <motion.div variants={itemVariants}>
        <Card className="relative overflow-hidden border-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-emerald-600/10 shadow-lg ring-1 ring-white/10 dark:ring-white/5 backdrop-blur-xl">
          <div className="absolute inset-0 bg-white/40 dark:bg-black/20" />
          <CardContent className="relative flex items-start gap-5 p-6 sm:p-8">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-purple-600 text-white shadow-inner">
              <Sparkles className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <p className="text-lg font-semibold tracking-tight">AI Daily Briefing</p>
              <p className="mt-2 text-muted-foreground leading-relaxed">
                You have {activeTasks.length} pending tasks today. Your peak focus hours are 9–11 AM.
                Consider scheduling your <span className="font-medium text-foreground">Deep Work</span> session then. 
                Your habit streak is at 24 days — phenomenal consistency!
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Stats grid */}
      <motion.div variants={itemVariants} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="border-0 shadow-md ring-1 ring-black/5 dark:ring-white/5 bg-card/50 backdrop-blur-xl hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${stat.bgColor}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <Badge variant="secondary" className="bg-background/50 backdrop-blur-md">Today</Badge>
              </div>
              <div>
                <p className="text-3xl font-extrabold tracking-tight">
                  {stat.value}
                  {stat.sub && (
                    <span className="text-sm font-medium text-muted-foreground ml-1">
                      {stat.sub}
                    </span>
                  )}
                </p>
                <p className="text-sm font-medium text-muted-foreground mt-1">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Today's tasks */}
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <Card className="h-full border-0 shadow-md ring-1 ring-black/5 dark:ring-white/5 bg-card/50 backdrop-blur-xl">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle className="text-xl font-bold">Priority Tasks</CardTitle>
                <CardDescription>Your most important actions for today</CardDescription>
              </div>
              <Button variant="ghost" size="sm" asChild className="hover:bg-primary/10 hover:text-primary">
                <Link href="/dashboard/tasks">View all</Link>
              </Button>
            </CardHeader>
            <CardContent>
              {isLoadingTasks ? (
                <div className="space-y-3 mt-4">
                  {[1, 2, 3].map((i) => <Skeleton key={i} className="h-14 w-full rounded-xl" />)}
                </div>
              ) : activeTasks.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <div className="h-12 w-12 rounded-full bg-success/10 text-success flex items-center justify-center mb-3">
                    <CheckCircle2 className="h-6 w-6" />
                  </div>
                  <p className="font-medium">All caught up!</p>
                  <p className="text-sm text-muted-foreground">Enjoy the rest of your day.</p>
                </div>
              ) : (
                <div className="space-y-2 mt-2">
                  {activeTasks.map((task: any) => (
                    <motion.div
                      whileHover={{ scale: 1.01 }}
                      key={task._id || task.id}
                      className="group flex items-center gap-4 rounded-xl border bg-background/50 p-3 shadow-sm transition-all hover:shadow-md hover:border-primary/30"
                    >
                      <button
                        onClick={() => toggleTaskMutation.mutate({ id: task._id || task.id, status: "done" })}
                        disabled={toggleTaskMutation.isPending}
                        className="text-muted-foreground hover:text-success transition-colors shrink-0"
                      >
                        <Circle className="h-5 w-5" />
                      </button>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{task.title}</p>
                        {task.category && (
                          <p className="text-xs text-muted-foreground truncate">{task.category}</p>
                        )}
                      </div>
                      <Badge variant={priorityColor[task.priority] as never || "secondary"} className="capitalize text-xs whitespace-nowrap shadow-sm">
                        {task.priority || "Normal"}
                      </Badge>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Upcoming events */}
        <motion.div variants={itemVariants}>
          <Card className="h-full border-0 shadow-md ring-1 ring-black/5 dark:ring-white/5 bg-card/50 backdrop-blur-xl">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle className="text-xl font-bold">Upcoming</CardTitle>
                <CardDescription>Your schedule</CardDescription>
              </div>
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Calendar className="h-4 w-4 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 mt-2">
                {upcomingEvents.map((event, i) => (
                  <div key={event.title} className="relative pl-6">
                    <div className="absolute left-0 top-1.5 h-2 w-2 rounded-full bg-primary ring-4 ring-primary/20" />
                    {i !== upcomingEvents.length - 1 && (
                      <div className="absolute left-[3px] top-4 h-full w-px bg-border" />
                    )}
                    <div>
                      <p className="text-sm font-semibold">{event.title}</p>
                      <div className="flex items-center gap-1.5 mt-1 text-xs text-muted-foreground font-medium">
                        <Clock className="h-3.5 w-3.5" />
                        <span>{event.time}</span>
                        <span>•</span>
                        <span>{event.duration}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Goals progress */}
      <motion.div variants={itemVariants}>
        <Card className="border-0 shadow-md ring-1 ring-black/5 dark:ring-white/5 bg-card/50 backdrop-blur-xl overflow-hidden relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
          <CardHeader className="flex flex-row items-center justify-between relative z-10 pb-2">
            <div>
              <CardTitle className="text-xl font-bold">Active Goals</CardTitle>
              <CardDescription>Tracking your long-term objectives</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild className="hover:bg-primary/10 hover:text-primary">
              <Link href="/dashboard/goals">View all</Link>
            </Button>
          </CardHeader>
          <CardContent className="relative z-10">
            {isLoadingGoals ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mt-4">
                {[1, 2, 3].map((i) => <Skeleton key={i} className="h-28 w-full rounded-2xl" />)}
              </div>
            ) : activeGoals.length === 0 ? (
              <div className="text-center py-8">
                <Target className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-50" />
                <p className="text-muted-foreground">No active goals found. Time to set some targets!</p>
              </div>
            ) : (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 mt-4">
                {activeGoals.map((goal: any) => (
                  <motion.div 
                    whileHover={{ scale: 1.02 }}
                    key={goal._id || goal.id} 
                    className="group rounded-2xl border bg-background/60 p-5 shadow-sm transition-all hover:shadow-lg hover:border-primary/40 relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-3">
                        <Badge variant="outline" className="bg-background shadow-sm text-xs px-2.5 py-0.5">
                          {goal.category}
                        </Badge>
                        <span className="text-sm font-bold text-primary">{goal.progress || 0}%</span>
                      </div>
                      <p className="font-semibold line-clamp-1 mb-4">{goal.title}</p>
                      <Progress value={goal.progress || 0} className="h-2 bg-primary/10" />
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
