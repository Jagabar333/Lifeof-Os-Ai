"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Target as TargetIcon, LayoutGrid, List, Search, Filter, Sparkles, CheckCircle2, Clock, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { GoalCard } from "@/components/goals/goal-card";
import { CreateGoalModal } from "@/components/goals/create-goal-modal";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
};

const CATEGORIES = ["All", "Career", "Education", "Finance", "Health", "Personal", "Relationships", "Other"];
const STATUS_FILTERS = [
  { value: "all", label: "All Status" },
  { value: "not_started", label: "Not Started" },
  { value: "in_progress", label: "In Progress" },
  { value: "completed", label: "Completed" },
  { value: "paused", label: "Paused" },
];

export default function GoalsPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [goalToEdit, setGoalToEdit] = useState<any | null>(null);
  const [view, setView] = useState<"grid" | "list">("grid");
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("all");

  const { data, isLoading, error } = useQuery({
    queryKey: ["goals"],
    queryFn: async () => {
      const res = await apiClient.get<any>("/api/goals");
      const items = res?.data ?? res;
      return Array.isArray(items) ? items : [];
    },
  });

  const goals = Array.isArray(data) ? data : [];

  // Derived stats
  const totalGoals = goals.length;
  const completedGoals = goals.filter((g: any) => g.status === "completed").length;
  const inProgressGoals = goals.filter((g: any) => g.status === "in_progress").length;
  const avgProgress = totalGoals > 0
    ? Math.round(goals.reduce((sum: number, g: any) => sum + (g.progress || 0), 0) / totalGoals)
    : 0;

  // Filter goals
  const filteredGoals = goals.filter((goal: any) => {
    const matchesSearch = !search || goal.title?.toLowerCase().includes(search.toLowerCase()) || goal.description?.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === "All" || goal.category === categoryFilter;
    const matchesStatus = statusFilter === "all" || goal.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleEdit = (goal: any) => {
    setGoalToEdit(goal);
    setModalOpen(true);
  };

  const handleCreate = () => {
    setGoalToEdit(null);
    setModalOpen(true);
  };

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
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-purple-600 to-primary bg-clip-text text-transparent">
            My Goals
          </h1>
          <p className="text-muted-foreground mt-1 text-lg">
            Turn long-term vision into achievable milestones with AI.
          </p>
        </div>
        <Button
          onClick={handleCreate}
          className="rounded-full shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95"
        >
          <Plus className="mr-2 h-4 w-4" />
          Create Goal
        </Button>
      </motion.div>

      {/* Stats strip */}
      {!isLoading && totalGoals > 0 && (
        <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Total Goals", value: totalGoals, icon: TargetIcon, color: "text-purple-500", bg: "bg-purple-500/10" },
            { label: "In Progress", value: inProgressGoals, icon: TrendingUp, color: "text-blue-500", bg: "bg-blue-500/10" },
            { label: "Completed", value: completedGoals, icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-500/10" },
            { label: "Avg Progress", value: `${avgProgress}%`, icon: Clock, color: "text-orange-500", bg: "bg-orange-500/10" },
          ].map((stat) => (
            <div key={stat.label} className="flex items-center gap-3 rounded-2xl border-0 shadow-md ring-1 ring-black/5 dark:ring-white/5 bg-card/50 backdrop-blur-xl p-4 hover:shadow-lg transition-all hover:-translate-y-0.5">
              <div className={`h-10 w-10 rounded-xl ${stat.bg} flex items-center justify-center shrink-0`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
              <div>
                <p className="text-2xl font-extrabold">{stat.value}</p>
                <p className="text-xs text-muted-foreground font-medium">{stat.label}</p>
              </div>
            </div>
          ))}
        </motion.div>
      )}

      {/* Filters */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search goals..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 rounded-xl border-0 shadow-sm ring-1 ring-black/10 dark:ring-white/10 bg-card/50 backdrop-blur-xl"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full sm:w-[160px] rounded-xl border-0 shadow-sm ring-1 ring-black/10 dark:ring-white/10 bg-card/50 backdrop-blur-xl">
            <Filter className="h-4 w-4 mr-2 text-muted-foreground" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[160px] rounded-xl border-0 shadow-sm ring-1 ring-black/10 dark:ring-white/10 bg-card/50 backdrop-blur-xl">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STATUS_FILTERS.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
          </SelectContent>
        </Select>
        <div className="flex gap-1 p-1 rounded-xl border-0 shadow-sm ring-1 ring-black/10 dark:ring-white/10 bg-card/50 backdrop-blur-xl">
          <button
            onClick={() => setView("grid")}
            className={`p-2 rounded-lg transition-colors ${view === "grid" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
          <button
            onClick={() => setView("list")}
            className={`p-2 rounded-lg transition-colors ${view === "list" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
          >
            <List className="h-4 w-4" />
          </button>
        </div>
      </motion.div>

      {/* Filter results badge */}
      {(search || categoryFilter !== "All" || statusFilter !== "all") && (
        <motion.div variants={itemVariants} className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-muted-foreground">{filteredGoals.length} result{filteredGoals.length !== 1 ? "s" : ""}</span>
          {search && <Badge variant="secondary" className="gap-1">Search: {search} <button onClick={() => setSearch("")} className="ml-1 hover:text-destructive">×</button></Badge>}
          {categoryFilter !== "All" && <Badge variant="secondary" className="gap-1">{categoryFilter} <button onClick={() => setCategoryFilter("All")} className="ml-1 hover:text-destructive">×</button></Badge>}
          {statusFilter !== "all" && <Badge variant="secondary" className="gap-1">{STATUS_FILTERS.find(s => s.value === statusFilter)?.label} <button onClick={() => setStatusFilter("all")} className="ml-1 hover:text-destructive">×</button></Badge>}
        </motion.div>
      )}

      {/* Content */}
      {isLoading ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-[300px] w-full rounded-2xl" />
          ))}
        </div>
      ) : error ? (
        <div className="flex h-40 items-center justify-center rounded-2xl border border-destructive/20 bg-destructive/5 text-destructive p-4 text-center">
          <p>Failed to load goals. Please try again later.</p>
        </div>
      ) : goals.length === 0 ? (
        <motion.div
          variants={itemVariants}
          className="flex flex-col items-center justify-center py-24 px-4 text-center rounded-3xl border border-dashed bg-card/30 backdrop-blur-xl"
        >
          <div className="relative mb-6">
            <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-purple-500/20 to-primary/20 text-primary">
              <TargetIcon className="h-10 w-10" />
            </div>
            <div className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <Sparkles className="h-3.5 w-3.5" />
            </div>
          </div>
          <h3 className="text-2xl font-bold tracking-tight mb-2">No goals yet</h3>
          <p className="text-muted-foreground max-w-sm mb-8 leading-relaxed">
            Create your first goal and let AI break it into concrete milestones. Your journey starts with a single intention.
          </p>
          <Button onClick={handleCreate} size="lg" className="rounded-full shadow-lg shadow-primary/20">
            <Plus className="mr-2 h-4 w-4" /> Create Your First Goal
          </Button>
        </motion.div>
      ) : filteredGoals.length === 0 ? (
        <motion.div variants={itemVariants} className="text-center py-16 text-muted-foreground">
          <Search className="h-10 w-10 mx-auto mb-3 opacity-30" />
          <p className="font-medium">No goals match your filters.</p>
          <p className="text-sm">Try adjusting your search or filter criteria.</p>
        </motion.div>
      ) : (
        <AnimatePresence mode="popLayout">
          <motion.div
            key={view}
            className={view === "grid" ? "grid gap-5 sm:grid-cols-2 xl:grid-cols-3" : "flex flex-col gap-4"}
            variants={containerVariants}
            initial="hidden"
            animate="show"
          >
            {filteredGoals.map((goal: any) => (
              <motion.div key={goal._id || goal.id} variants={itemVariants} layout>
                <GoalCard goal={goal} onEdit={handleEdit} listView={view === "list"} />
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
      )}

      {/* Modal */}
      <CreateGoalModal
        open={modalOpen}
        onOpenChange={(open) => {
          setModalOpen(open);
          if (!open) setTimeout(() => setGoalToEdit(null), 200);
        }}
        goalToEdit={goalToEdit}
      />
    </motion.div>
  );
}
