"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import { Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";

export default function AIPlannerPage() {
  const [date, setDate] = useState(() => format(new Date(), "yyyy-MM-dd"));
  const [generatedPlan, setGeneratedPlan] = useState<string | null>(null);

  // Fetch or trigger plan mutation
  const planMutation = useMutation({
    mutationFn: async (dateStr: string) => {
      const res = await apiClient.post<any>("/api/ai/plan", { date: dateStr, context: {} });
      return res.data || res;
    },
    onSuccess: (data) => {
      const planText = data?.plan || data || "No plan returned.";
      setGeneratedPlan(planText);
    }
  });

  const handleGenerate = () => {
    planMutation.mutate(date);
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-10">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-600 via-primary to-purple-600 bg-clip-text text-transparent">
            AI Day Planner
          </h1>
          <p className="text-muted-foreground mt-0.5 text-lg">AI-optimized schedules aligning habits, tasks, and availability.</p>
        </div>

        <Button
          onClick={handleGenerate}
          disabled={planMutation.isPending}
          className="rounded-full bg-gradient-to-r from-primary to-purple-600 hover:scale-105 transition-all text-white shadow-xl shadow-primary/20"
        >
          {planMutation.isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="mr-2 h-4 w-4" />
          )}
          Generate Perfect Day
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Settings/Info Column */}
        <div className="space-y-4 md:col-span-1">
          <Card className="border-0 shadow-md ring-1 ring-black/5 dark:ring-white/5 bg-card/60 backdrop-blur-xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Planning Parameters</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-xs font-semibold block mb-1 text-muted-foreground">Target Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full rounded-xl border-0 ring-1 ring-black/10 dark:ring-white/10 bg-muted/40 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div className="pt-2 border-t text-xs text-muted-foreground leading-relaxed">
                The AI Planner processes your active Tasks, Goal Milestones, Calendar Availability, and Health Sleep data to propose a highly optimal timeblocked agenda.
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Plan Output Column */}
        <div className="md:col-span-2">
          {planMutation.isPending ? (
            <Card className="border-0 shadow-md ring-1 ring-black/5 bg-card/60 backdrop-blur-xl">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                  <p className="font-semibold text-sm">Processing context streams…</p>
                </div>
                <Skeleton className="h-6 w-3/4 rounded-md" />
                <Skeleton className="h-24 w-full rounded-2xl" />
                <Skeleton className="h-24 w-full rounded-2xl" />
              </CardContent>
            </Card>
          ) : generatedPlan ? (
            <Card className="border-0 shadow-md ring-1 ring-black/5 dark:ring-white/5 bg-card/60 backdrop-blur-xl overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-purple-600" />
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-bold flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                    AI Agenda Proposed
                  </CardTitle>
                  <Badge variant="secondary">Date: {date}</Badge>
                </div>
              </CardHeader>
              <CardContent className="text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap">
                {generatedPlan}
              </CardContent>
            </Card>
          ) : (
            <Card className="border-dashed flex flex-col justify-center items-center text-center p-10 h-64">
              <Sparkles className="h-10 w-10 text-primary/30 mb-3 animate-pulse" />
              <h3 className="font-bold text-base">No Agenda Projections</h3>
              <p className="text-xs text-muted-foreground max-w-sm mt-1">Select a target date and click "Generate Perfect Day" to create an AI-optimized schedule layout.</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
