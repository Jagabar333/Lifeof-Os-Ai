"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Repeat, Flame, Trash2, Edit2, Target
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";

interface Habit {
  _id?: string;
  id?: string;
  name: string;
  description?: string;
  frequency: "daily" | "weekly";
  targetCount: number;
  unit: string;
  streak: number;
  bestStreak: number;
  category?: string;
}

export default function HabitsPage() {
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);

  // Form State
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [frequency, setFrequency] = useState<"daily" | "weekly">("daily");
  const [targetCount, setTargetCount] = useState(1);
  const [unit, setUnit] = useState("times");
  const [category, setCategory] = useState("Health");

  // Fetch Habits
  const { data: habits = [], isLoading } = useQuery<Habit[]>({
    queryKey: ["habits"],
    queryFn: async () => {
      const res = await apiClient.get<any>("/api/habits");
      const items = res?.data ?? res;
      return Array.isArray(items) ? items : [];
    },
  });

  // Create Habit
  const createMutation = useMutation({
    mutationFn: async (habit: Partial<Habit>) => {
      const res = await apiClient.post<any>("/api/habits", habit);
      return res.data || res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["habits"] });
      setModalOpen(false);
      resetForm();
    },
  });

  // Update Habit
  const updateMutation = useMutation({
    mutationFn: async ({ id, habit }: { id: string; habit: Partial<Habit> }) => {
      const res = await apiClient.patch<any>(`/api/habits/${id}`, habit);
      return res.data || res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["habits"] });
      setModalOpen(false);
      resetForm();
    },
  });

  // Delete Habit
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/api/habits/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["habits"] });
    },
  });

  // Log Entry
  const logMutation = useMutation({
    mutationFn: async ({ id, date, count }: { id: string; date: string; count: number }) => {
      const res = await apiClient.post<any>(`/api/habits/${id}/log`, { date, count });
      return res.data || res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["habits"] });
    },
  });

  const resetForm = () => {
    setName("");
    setDescription("");
    setFrequency("daily");
    setTargetCount(1);
    setUnit("times");
    setCategory("Health");
    setEditingHabit(null);
  };

  const handleOpenEdit = (habit: Habit) => {
    setEditingHabit(habit);
    setName(habit.name);
    setDescription(habit.description || "");
    setFrequency(habit.frequency);
    setTargetCount(habit.targetCount);
    setUnit(habit.unit);
    setCategory(habit.category || "Health");
    setModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { name, description, frequency, targetCount, unit, category };
    if (editingHabit) {
      updateMutation.mutate({ id: editingHabit._id || editingHabit.id || "", habit: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const handleLogToday = (habit: Habit, currentCount = 0) => {
    const today = format(new Date(), "yyyy-MM-dd");
    logMutation.mutate({
      id: habit._id || habit.id || "",
      date: today,
      count: currentCount + 1,
    });
  };

  const handleDelete = (id: string) => {
    if (confirm("Delete this habit?")) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-10">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">
            Habits Tracker
          </h1>
          <p className="text-muted-foreground mt-0.5 text-lg">Build routines, track progress, maintain consistency.</p>
        </div>
        <Button
          onClick={() => { resetForm(); setModalOpen(true); }}
          className="rounded-full shadow-lg shadow-orange-500/10 hover:shadow-orange-500/20 bg-orange-600 hover:bg-orange-500"
        >
          <Plus className="mr-2 h-4 w-4" /> Add Habit
        </Button>
      </div>

      {/* Habits Grid */}
      {isLoading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-44 w-full rounded-2xl" />)}
        </div>
      ) : habits.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 px-4 text-center rounded-3xl border border-dashed bg-card/30 backdrop-blur-xl">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-orange-500/10 text-orange-600 mb-4">
            <Repeat className="h-8 w-8" />
          </div>
          <h3 className="text-xl font-bold tracking-tight mb-2">No habits tracked</h3>
          <p className="text-muted-foreground max-w-sm mb-6">
            Track daily or weekly consistencies. Turn small steps into massive achievements.
          </p>
          <Button onClick={() => setModalOpen(true)} className="bg-orange-600 hover:bg-orange-500 rounded-full">
            Create First Habit
          </Button>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {habits.map((habit) => {
            const habitId = habit._id || habit.id || "";
            return (
              <Card key={habitId} className="border-0 shadow-md ring-1 ring-black/5 dark:ring-white/5 bg-card/60 backdrop-blur-xl hover:shadow-lg transition-all duration-300 relative group overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-orange-500 opacity-60" />
                <CardHeader className="pb-3 flex flex-row justify-between items-start space-y-0">
                  <div className="min-w-0 pr-8">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="text-xs bg-orange-500/10 border-0 text-orange-600 dark:text-orange-400">
                        {habit.category || "General"}
                      </Badge>
                      <Badge variant="secondary" className="capitalize text-[10px] py-0">
                        {habit.frequency}
                      </Badge>
                    </div>
                    <h3 className="font-bold text-base leading-snug truncate">{habit.name}</h3>
                  </div>

                  <div className="absolute right-4 top-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg" onClick={() => handleOpenEdit(habit)}>
                      <Edit2 className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg text-destructive hover:bg-destructive/10" onClick={() => handleDelete(habitId)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {habit.description && (
                    <p className="text-xs text-muted-foreground line-clamp-1">{habit.description}</p>
                  )}

                  {/* Streaks */}
                  <div className="flex items-center gap-4 text-xs font-semibold">
                    <div className="flex items-center gap-1 text-orange-600 dark:text-orange-400">
                      <Flame className="h-4.5 w-4.5 fill-orange-500/10" />
                      <span>{habit.streak} day streak</span>
                    </div>
                    <div className="text-muted-foreground flex items-center gap-1">
                      <Target className="h-3.5 w-3.5" />
                      <span>Best: {habit.bestStreak}</span>
                    </div>
                  </div>

                  {/* Goal completion */}
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">
                      Goal: <span className="font-medium text-foreground">{habit.targetCount} {habit.unit} / {habit.frequency === "daily" ? "day" : "week"}</span>
                    </p>
                    <Button
                      size="sm"
                      onClick={() => handleLogToday(habit)}
                      className="rounded-full bg-orange-600 hover:bg-orange-500 h-8 px-3 shadow-md shadow-orange-500/10 text-xs"
                    >
                      <Plus className="h-3.5 w-3.5 mr-1" /> Log Today
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Create / Edit Habit Dialog */}
      <AnimatePresence>
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={() => setModalOpen(false)}>
            <motion.div
              initial={{ scale: 0.95, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 10 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md rounded-2xl border-0 shadow-2xl ring-1 ring-black/10 dark:ring-white/10 bg-background p-6"
            >
              <h2 className="text-xl font-bold mb-4">{editingHabit ? "Edit Habit" : "Create Habit"}</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-xs font-bold block mb-1.5 text-muted-foreground uppercase tracking-wider">Name</label>
                  <Input value={name} onChange={(e) => setName(e.target.value)} required placeholder="e.g. Read books" />
                </div>
                <div>
                  <label className="text-xs font-bold block mb-1.5 text-muted-foreground uppercase tracking-wider">Description</label>
                  <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="e.g. 15 pages of non-fiction" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold block mb-1.5 text-muted-foreground uppercase tracking-wider">Frequency</label>
                    <select
                      value={frequency}
                      onChange={(e) => setFrequency(e.target.value as any)}
                      className="w-full rounded-xl border-0 ring-1 ring-black/10 dark:ring-white/10 bg-muted/40 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold block mb-1.5 text-muted-foreground uppercase tracking-wider">Target Count</label>
                    <Input type="number" min={1} value={targetCount} onChange={(e) => setTargetCount(parseInt(e.target.value))} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold block mb-1.5 text-muted-foreground uppercase tracking-wider">Unit</label>
                    <Input value={unit} onChange={(e) => setUnit(e.target.value)} placeholder="e.g. times, pages, km" />
                  </div>
                  <div>
                    <label className="text-xs font-bold block mb-1.5 text-muted-foreground uppercase tracking-wider">Category</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full rounded-xl border-0 ring-1 ring-black/10 dark:ring-white/10 bg-muted/40 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="Health">Health</option>
                      <option value="Education">Education</option>
                      <option value="Finance">Finance</option>
                      <option value="Career">Career</option>
                      <option value="Personal">Personal</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
                  <Button type="submit" className="bg-orange-600 hover:bg-orange-500">Save</Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
