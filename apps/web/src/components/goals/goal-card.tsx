"use client";

import { useState } from "react";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { Target, Calendar, MoreVertical, Edit, Trash2, CheckCircle2, Circle, ChevronDown, ChevronUp } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { apiClient } from "@/lib/api/client";

interface Milestone {
  id: string;
  title: string;
  completed: boolean;
  completedAt?: string;
}

interface Goal {
  id: string;
  _id: string;
  title: string;
  description?: string;
  category: string;
  status: string;
  progress: number;
  targetDate?: string;
  milestones: Milestone[];
}

const categoryColors: Record<string, { bg: string; text: string; dot: string }> = {
  Career: { bg: "bg-blue-500/10", text: "text-blue-600 dark:text-blue-400", dot: "bg-blue-500" },
  Education: { bg: "bg-violet-500/10", text: "text-violet-600 dark:text-violet-400", dot: "bg-violet-500" },
  Finance: { bg: "bg-emerald-500/10", text: "text-emerald-600 dark:text-emerald-400", dot: "bg-emerald-500" },
  Health: { bg: "bg-rose-500/10", text: "text-rose-600 dark:text-rose-400", dot: "bg-rose-500" },
  Personal: { bg: "bg-orange-500/10", text: "text-orange-600 dark:text-orange-400", dot: "bg-orange-500" },
  Relationships: { bg: "bg-pink-500/10", text: "text-pink-600 dark:text-pink-400", dot: "bg-pink-500" },
  Other: { bg: "bg-gray-500/10", text: "text-gray-600 dark:text-gray-400", dot: "bg-gray-500" },
};

const statusConfig: Record<string, { label: string; color: string }> = {
  not_started: { label: "Not Started", color: "bg-secondary text-secondary-foreground" },
  in_progress: { label: "In Progress", color: "bg-blue-500/15 text-blue-600 dark:text-blue-400" },
  completed: { label: "Completed", color: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400" },
  paused: { label: "Paused", color: "bg-orange-500/15 text-orange-600 dark:text-orange-400" },
};

export function GoalCard({ goal, onEdit, listView = false }: { goal: Goal; onEdit: (goal: Goal) => void; listView?: boolean }) {
  const queryClient = useQueryClient();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isToggling, setIsToggling] = useState<string | null>(null);
  const [showMilestones, setShowMilestones] = useState(true);

  const goalId = goal._id || goal.id;
  const catColor = (categoryColors[goal.category] || categoryColors["Other"])!;
  const statusCfg = statusConfig[goal.status] || { label: goal.status, color: "bg-secondary text-secondary-foreground" };

  const completedMilestones = goal.milestones.filter((m) => m.completed).length;
  const totalMilestones = goal.milestones.length;

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this goal?")) return;
    setIsDeleting(true);
    try {
      await apiClient.delete(`/api/goals/${goalId}`);
      queryClient.invalidateQueries({ queryKey: ["goals"] });
    } catch (error) {
      console.error(error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleToggleMilestone = async (milestoneId: string) => {
    setIsToggling(milestoneId);
    try {
      await apiClient.post(`/api/goals/${goalId}/milestones/${milestoneId}/toggle`);
      queryClient.invalidateQueries({ queryKey: ["goals"] });
    } catch (error) {
      console.error(error);
    } finally {
      setIsToggling(null);
    }
  };

  if (listView) {
    return (
      <Card className="border-0 shadow-sm ring-1 ring-black/5 dark:ring-white/5 bg-card/60 backdrop-blur-xl hover:shadow-md transition-all group overflow-hidden">
        <CardContent className="p-4 flex items-center gap-4">
          <div className={`h-10 w-10 rounded-xl ${catColor.bg} flex items-center justify-center shrink-0`}>
            <Target className={`h-5 w-5 ${catColor.text}`} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold truncate">{goal.title}</h3>
              <Badge className={cn("text-xs shrink-0", statusCfg.color)}>{statusCfg.label}</Badge>
            </div>
            <Progress value={goal.progress} className="h-1.5 mt-1" />
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <span className="text-sm font-bold tabular-nums">{goal.progress}%</span>
            <span className="text-xs text-muted-foreground">{completedMilestones}/{totalMilestones} milestones</span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit(goal)}>
                  <Edit className="mr-2 h-4 w-4" /> Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleDelete} disabled={isDeleting} className="text-destructive focus:bg-destructive/10">
                  <Trash2 className="mr-2 h-4 w-4" /> Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="flex flex-col h-full border-0 shadow-md ring-1 ring-black/5 dark:ring-white/5 bg-card/60 backdrop-blur-xl hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group overflow-hidden relative">
      {/* Top accent bar based on category */}
      <div className={`absolute top-0 left-0 right-0 h-1 ${catColor.dot} opacity-60 group-hover:opacity-100 transition-opacity`} />

      <CardHeader className="pt-5 pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className={cn("inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-full", catColor.bg, catColor.text)}>
                <span className={cn("h-1.5 w-1.5 rounded-full", catColor.dot)} />
                {goal.category}
              </span>
              <span className={cn("text-xs font-medium px-2.5 py-0.5 rounded-full", statusCfg.color)}>
                {statusCfg.label}
              </span>
            </div>
            <h3 className="font-bold text-base leading-snug line-clamp-2">{goal.title}</h3>
            {goal.description && (
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2 leading-relaxed">{goal.description}</p>
            )}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 -mr-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(goal)}>
                <Edit className="mr-2 h-4 w-4" /> Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleDelete} disabled={isDeleting} className="text-destructive focus:bg-destructive/10">
                <Trash2 className="mr-2 h-4 w-4" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="flex-1 pb-4 space-y-4">
        {/* Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-muted-foreground flex items-center gap-1.5">
              <Target className="h-3.5 w-3.5" /> Progress
            </span>
            <span className="font-extrabold text-base tabular-nums">{goal.progress}%</span>
          </div>
          <Progress value={goal.progress} className="h-2.5 bg-muted/50" />
        </div>

        {/* Target Date */}
        {goal.targetDate && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/40 rounded-lg px-3 py-1.5">
            <Calendar className="h-3.5 w-3.5 shrink-0" />
            <span>Target: <span className="font-medium text-foreground">{format(new Date(goal.targetDate), "MMM d, yyyy")}</span></span>
          </div>
        )}

        {/* Milestones */}
        {totalMilestones > 0 && (
          <div>
            <button
              onClick={() => setShowMilestones(!showMilestones)}
              className="flex w-full items-center justify-between text-sm font-semibold mb-2 hover:text-primary transition-colors"
            >
              <span className="flex items-center gap-2">
                Milestones
                <span className="text-xs font-normal text-muted-foreground bg-muted rounded-full px-2 py-0.5">
                  {completedMilestones}/{totalMilestones}
                </span>
              </span>
              {showMilestones ? <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" /> : <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />}
            </button>
            {showMilestones && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="space-y-1.5 max-h-36 overflow-y-auto scrollbar-thin pr-1"
              >
                {goal.milestones.map((milestone) => (
                  <motion.button
                    key={milestone.id}
                    onClick={() => handleToggleMilestone(milestone.id)}
                    disabled={isToggling === milestone.id}
                    className="w-full flex items-start gap-2.5 text-left rounded-lg p-1.5 hover:bg-muted/60 transition-colors group/ms disabled:opacity-50"
                    whileTap={{ scale: 0.98 }}
                  >
                    <span className="mt-0.5 shrink-0 transition-colors">
                      {milestone.completed ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      ) : (
                        <Circle className="h-4 w-4 text-muted-foreground group-hover/ms:text-primary transition-colors" />
                      )}
                    </span>
                    <span className={cn("text-sm leading-snug", milestone.completed ? "text-muted-foreground line-through" : "")}>
                      {milestone.title}
                    </span>
                  </motion.button>
                ))}
              </motion.div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
