"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Heart, HeartPulse, Activity, Zap, Droplets,
  Trash2, Footprints
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface HealthMetric {
  _id?: string;
  id?: string;
  type: "sleep" | "weight" | "water" | "steps" | "exercise" | "mood";
  value: number;
  unit: string;
  date: string;
  notes?: string;
}

const metricConfigs = {
  sleep: { label: "Sleep", icon: Activity, color: "text-indigo-500", bg: "bg-indigo-500/10", unit: "hours" },
  weight: { label: "Weight", icon: Heart, color: "text-rose-500", bg: "bg-rose-500/10", unit: "kg" },
  water: { label: "Water", icon: Droplets, color: "text-blue-500", bg: "bg-blue-500/10", unit: "ml" },
  steps: { label: "Steps", icon: Footprints, color: "text-emerald-500", bg: "bg-emerald-500/10", unit: "steps" },
  exercise: { label: "Exercise", icon: HeartPulse, color: "text-orange-500", bg: "bg-orange-500/10", unit: "mins" },
  mood: { label: "Mood", icon: Zap, color: "text-amber-500", bg: "bg-amber-500/10", unit: "/10" } };

export default function HealthPage() {
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);

  // Form states
  const [type, setType] = useState<HealthMetric["type"]>("sleep");
  const [value, setValue] = useState(0);
  const [unit, setUnit] = useState("hours");
  const [notes, setNotes] = useState("");

  // Fetch Health Metrics
  const { data: metrics = [], isLoading } = useQuery<HealthMetric[]>({
    queryKey: ["health"],
    queryFn: async () => {
      const res = await apiClient.get<any>("/api/health");
      const items = res?.data ?? res;
      return Array.isArray(items) ? items : [];
    } });

  // Log Metric
  const logMutation = useMutation({
    mutationFn: async (metric: Partial<HealthMetric>) => {
      const res = await apiClient.post<any>("/api/health", metric);
      return res.data || res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["health"] });
      setModalOpen(false);
      resetForm();
    } });

  // Delete Metric
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/api/health/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["health"] });
    } });

  const resetForm = () => {
    setType("sleep");
    setValue(0);
    setUnit("hours");
    setNotes("");
  };

  const handleTypeChange = (newType: HealthMetric["type"]) => {
    setType(newType);
    setUnit(metricConfigs[newType].unit);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    logMutation.mutate({
      type,
      value: Number(value),
      unit,
      notes,
      date: new Date().toISOString() });
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-10">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-rose-600 to-rose-400 bg-clip-text text-transparent">
            Health & Wellness
          </h1>
          <p className="text-muted-foreground mt-0.5 text-lg">Monitor vitals, sleep, mood, and daily energy logs.</p>
        </div>
        <Button onClick={() => setModalOpen(true)} className="rounded-full bg-rose-600 hover:bg-rose-500 shadow-lg shadow-rose-500/10">
          <Plus className="mr-2 h-4 w-4" /> Log Metric
        </Button>
      </div>

      {/* Latest Metrics Cards Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {(Object.keys(metricConfigs) as Array<HealthMetric["type"]>).map((t) => {
          const config = metricConfigs[t];
          const latest = metrics.filter((m) => m.type === t)[0];
          return (
            <Card key={t} className="border-0 shadow-md ring-1 ring-black/5 dark:ring-white/5 bg-card/60 backdrop-blur-xl hover:shadow-lg transition-all duration-300">
              <CardContent className="p-5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={cn("h-11 w-11 rounded-xl flex items-center justify-center shrink-0", config.bg)}>
                    <config.icon className={cn("h-5.5 w-5.5", config.color)} />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-muted-foreground">{config.label}</h3>
                    <p className="text-xl font-extrabold mt-0.5">
                      {latest ? `${latest.value} ${latest.unit}` : "No logs"}
                    </p>
                  </div>
                </div>
                {latest && (
                  <span className="text-[10px] text-muted-foreground bg-muted rounded-full px-2 py-0.5">
                    {format(new Date(latest.date), "MMM d")}
                  </span>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Metric Logs List */}
      <Card className="border-0 shadow-md ring-1 ring-black/5 dark:ring-white/5 bg-card/60 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="text-lg font-bold">Recent Logs</CardTitle>
          <CardDescription>Detailed health metric logs</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => <Skeleton key={i} className="h-12 w-full rounded-xl" />)}
            </div>
          ) : metrics.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              <HeartPulse className="h-8 w-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No health metrics logged yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {metrics.map((m) => {
                const metricId = m._id || m.id || "";
                const config = metricConfigs[m.type] || metricConfigs["sleep"];
                return (
                  <div key={metricId} className="flex items-center justify-between p-3 rounded-xl border bg-background/40 hover:bg-background/80 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={cn("h-9 w-9 rounded-lg flex items-center justify-center shrink-0", config.bg)}>
                        <config.icon className={cn("h-4.5 w-4.5", config.color)} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold capitalize">{m.type} • {m.value} {m.unit}</p>
                        <p className="text-xs text-muted-foreground">{format(new Date(m.date), "MMM d, h:mm a")}{m.notes ? ` • ${m.notes}` : ""}</p>
                      </div>
                    </div>

                    <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => deleteMutation.mutate(metricId)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Log Metric Modal */}
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
              <h2 className="text-xl font-bold mb-4">Log Health Metric</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold block mb-1 text-muted-foreground uppercase">Metric Type</label>
                    <select
                      value={type}
                      onChange={(e) => handleTypeChange(e.target.value as any)}
                      className="w-full rounded-xl border-0 ring-1 ring-black/10 dark:ring-white/10 bg-muted/40 px-3 py-2 text-sm focus:outline-none"
                    >
                      <option value="sleep">Sleep</option>
                      <option value="weight">Weight</option>
                      <option value="water">Water</option>
                      <option value="steps">Steps</option>
                      <option value="exercise">Exercise</option>
                      <option value="mood">Mood</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold block mb-1 text-muted-foreground uppercase">Value ({unit})</label>
                    <Input type="number" step="0.1" value={value} onChange={(e) => setValue(Number(e.target.value))} required />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold block mb-1 text-muted-foreground uppercase">Notes (Optional)</label>
                  <Input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Feelings, sleep quality, workout type" />
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
                  <Button type="submit" className="bg-rose-600 hover:bg-rose-500">Log Metric</Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
