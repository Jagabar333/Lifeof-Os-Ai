"use client";

import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, Loader2, Sparkles, Wand2, CheckCircle2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle } from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue } from "@/components/ui/select";
import { useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";

const categories = [
  "Career",
  "Education",
  "Finance",
  "Health",
  "Personal",
  "Relationships",
  "Other",
];

const statuses = [
  { value: "not_started", label: "Not Started" },
  { value: "in_progress", label: "In Progress" },
  { value: "completed", label: "Completed" },
  { value: "paused", label: "Paused" },
];

interface CreateGoalModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  goalToEdit?: any | null;
}

export function CreateGoalModal({ open, onOpenChange, goalToEdit }: CreateGoalModalProps) {
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [aiGenerated, setAiGenerated] = useState(false);

  const form = useForm({
    defaultValues: {
      title: "",
      description: "",
      category: "Personal",
      status: "not_started",
      targetDate: "",
      milestones: [] as { id: string; title: string; completed: boolean }[] } });

  const { fields, append, remove, replace } = useFieldArray({
    control: form.control,
    name: "milestones" });

  useEffect(() => {
    if (goalToEdit) {
      form.reset({
        title: goalToEdit.title || "",
        description: goalToEdit.description || "",
        category: goalToEdit.category || "Personal",
        status: goalToEdit.status || "not_started",
        targetDate: goalToEdit.targetDate ? goalToEdit.targetDate.substring(0, 10) : "",
        milestones: goalToEdit.milestones || [] });
    } else {
      form.reset({
        title: "",
        description: "",
        category: "Personal",
        status: "not_started",
        targetDate: "",
        milestones: [] });
    }
    setAiGenerated(false);
    setError(null);
  }, [goalToEdit, form, open]);

  const handleGenerateMilestones = async () => {
    const title = form.getValues("title");
    const description = form.getValues("description");
    const category = form.getValues("category");
    const targetDate = form.getValues("targetDate");

    if (!title.trim()) {
      form.setError("title", { message: "Please enter a goal title before generating milestones." });
      return;
    }

    setIsGeneratingAI(true);
    setError(null);
    try {
      const res = await apiClient.post<any>("/api/ai/goals/generate-milestones", { title, description, category, targetDate, count: 5 });
      const milestones = res.data || res;
      if (Array.isArray(milestones) && milestones.length > 0) {
        replace(milestones);
        setAiGenerated(true);
      }
    } catch (err: any) {
      setError(err.message || "Failed to generate milestones. Please check your AI API key configuration.");
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const onSubmit = async (values: any) => {
    setIsSubmitting(true);
    setError(null);
    try {
      const mappedMilestones = values.milestones.map((m: any) => ({
        ...m,
        id: m.id || crypto.randomUUID(),
        completed: m.completed || false }));

      const payload = { ...values, milestones: mappedMilestones };

      const url = goalToEdit ? `/api/goals/${goalToEdit._id || goalToEdit.id}` : `/api/goals`;
      if (goalToEdit) {
        await apiClient.patch(url, payload);
      } else {
        await apiClient.post(url, payload);
      }

      queryClient.invalidateQueries({ queryKey: ["goals"] });
      onOpenChange(false);
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[580px] max-h-[90vh] overflow-y-auto scrollbar-thin border-0 shadow-2xl ring-1 ring-black/10 dark:ring-white/10 bg-background/95 backdrop-blur-xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">{goalToEdit ? "Edit Goal" : "Create New Goal"}</DialogTitle>
          <DialogDescription>
            {goalToEdit
              ? "Update your goal details and milestones."
              : "Define your objective and let AI build a concrete action plan."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 pt-2">
            {error && (
              <div className="p-3 text-sm rounded-xl bg-destructive/10 text-destructive border border-destructive/20">
                {error}
              </div>
            )}

            <FormField
              control={form.control}
              name="title"
              rules={{ required: "Title is required" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-semibold">Goal Title</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g. Run a half marathon by December"
                      className="rounded-xl border-0 ring-1 ring-black/10 dark:ring-white/10 bg-muted/40 focus-visible:ring-primary"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-semibold">Description <span className="font-normal text-muted-foreground">(Optional)</span></FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Why is this goal important to you? What motivates you?"
                      className="resize-none rounded-xl border-0 ring-1 ring-black/10 dark:ring-white/10 bg-muted/40 focus-visible:ring-primary"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-semibold">Category</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="rounded-xl border-0 ring-1 ring-black/10 dark:ring-white/10 bg-muted/40">
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map((c) => (
                          <SelectItem key={c} value={c}>{c}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-semibold">Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="rounded-xl border-0 ring-1 ring-black/10 dark:ring-white/10 bg-muted/40">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {statuses.map((s) => (
                          <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="targetDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-semibold">Target Date <span className="font-normal text-muted-foreground">(Optional)</span></FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      className="rounded-xl border-0 ring-1 ring-black/10 dark:ring-white/10 bg-muted/40 focus-visible:ring-primary"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Milestones Section */}
            <div className="space-y-3 pt-2 border-t">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold">Milestones</h4>
                  <p className="text-xs text-muted-foreground">Break your goal into concrete steps</p>
                </div>
                <div className="flex gap-2">
                  {/* AI Generate Button */}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleGenerateMilestones}
                    disabled={isGeneratingAI}
                    className="rounded-xl border-primary/30 text-primary hover:bg-primary/10 hover:text-primary gap-1.5 relative overflow-hidden"
                  >
                    {isGeneratingAI ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        Generating…
                      </>
                    ) : (
                      <>
                        <Wand2 className="h-3.5 w-3.5" />
                        AI Generate
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => append({ id: crypto.randomUUID(), title: "", completed: false })}
                    className="rounded-xl"
                  >
                    <Plus className="h-3.5 w-3.5 mr-1" /> Add
                  </Button>
                </div>
              </div>

              {/* AI Generated Banner */}
              <AnimatePresence>
                {aiGenerated && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: "auto" }}
                    exit={{ opacity: 0, y: -8, height: 0 }}
                    className="flex items-center gap-2 text-xs rounded-xl bg-gradient-to-r from-purple-500/10 to-primary/10 border border-primary/20 px-3 py-2.5 text-primary font-medium"
                  >
                    <Sparkles className="h-3.5 w-3.5 shrink-0" />
                    AI generated 5 milestones for your goal. Review and customize them below!
                    <button onClick={() => setAiGenerated(false)} className="ml-auto text-muted-foreground hover:text-foreground">×</button>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="space-y-2">
                {fields.length === 0 ? (
                  <div className="text-center py-6 rounded-xl border border-dashed text-muted-foreground">
                    <Sparkles className="h-6 w-6 mx-auto mb-2 opacity-40" />
                    <p className="text-sm">No milestones yet.</p>
                    <p className="text-xs mt-0.5">Use <span className="font-medium text-primary">AI Generate</span> or add manually.</p>
                  </div>
                ) : (
                  <AnimatePresence initial={false}>
                    {fields.map((field, index) => (
                      <motion.div
                        key={field.id}
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="flex gap-2 items-start"
                      >
                        <div className="mt-2.5 flex h-5 w-5 shrink-0 items-center justify-center">
                          {form.watch(`milestones.${index}.completed`) ? (
                            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                          ) : (
                            <span className="h-4 w-4 rounded-full border-2 border-muted-foreground/30" />
                          )}
                        </div>
                        <FormField
                          control={form.control}
                          name={`milestones.${index}.title`}
                          rules={{ required: "Milestone title required" }}
                          render={({ field }) => (
                            <FormItem className="flex-1">
                              <FormControl>
                                <Input
                                  placeholder={`Milestone ${index + 1}`}
                                  className="rounded-xl border-0 ring-1 ring-black/10 dark:ring-white/10 bg-muted/40 focus-visible:ring-primary"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="shrink-0 mt-0.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl"
                          onClick={() => remove(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                )}
              </div>

              {fields.length > 0 && (
                <p className="text-xs text-muted-foreground">{fields.length} milestone{fields.length !== 1 ? "s" : ""} added</p>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting} className="rounded-xl">
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} className="rounded-xl shadow-lg shadow-primary/20 min-w-[120px]">
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {goalToEdit ? "Save Changes" : "Create Goal"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
