"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, CheckCircle2, Inbox, PlayCircle, Archive, Trash2, Edit2, LayoutList, Search, ListTodo, CircleDashed, Calendar
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { format, isPast, isToday } from "date-fns";
import { cn } from "@/lib/utils";
import { apiClient, ApiClientError } from "@/lib/api/client";

type TaskStatus = "inbox" | "todo" | "in_progress" | "done" | "archived";
type TaskPriority = "none" | "low" | "medium" | "high" | "urgent";

interface Task {
  _id?: string;
  id?: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string;
  tags?: string[];
}

const statusConfig = {
  inbox: { label: "Inbox", icon: Inbox, color: "text-slate-500", bg: "bg-slate-500/10" },
  todo: { label: "To Do", icon: CircleDashed, color: "text-blue-500", bg: "bg-blue-500/10" },
  in_progress: { label: "In Progress", icon: PlayCircle, color: "text-amber-500", bg: "bg-amber-500/10" },
  done: { label: "Done", icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-500/10" },
  archived: { label: "Archived", icon: Archive, color: "text-muted-foreground", bg: "bg-muted" }
};

const priorityConfig = {
  none: { label: "No Priority", color: "text-muted-foreground", bg: "bg-muted" },
  low: { label: "Low", color: "text-blue-500", bg: "bg-blue-500/10 border-blue-500/20" },
  medium: { label: "Medium", color: "text-amber-500", bg: "bg-amber-500/10 border-amber-500/20" },
  high: { label: "High", color: "text-orange-500", bg: "bg-orange-500/10 border-orange-500/20" },
  urgent: { label: "Urgent", color: "text-rose-500", bg: "bg-rose-500/10 border-rose-500/20" },
};

export default function TasksPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<TaskStatus>("todo");
  const [priority, setPriority] = useState<TaskPriority>("medium");
  const [dueDate, setDueDate] = useState("");
  const [tags, setTags] = useState("");
  const [formError, setFormError] = useState("");

  const { data: tasksResp, isLoading } = useQuery({
    queryKey: ["tasks", search],
    queryFn: async () => {
      const qs = search ? { search } : undefined;
      const res = await apiClient.get<Task[]>("/api/tasks", { params: qs });
      const items = (res as any)?.data ?? res;
      return Array.isArray(items) ? items : [];
    }
  });

  const tasks: Task[] = Array.isArray(tasksResp) ? tasksResp : [];

  const createMutation = useMutation({
    mutationFn: async (task: Partial<Task>) => {
      return apiClient.post<Task>("/api/tasks", task);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      setModalOpen(false);
      resetForm();
      alert("Task saved successfully!");
    },
    onError: (error) => {
      if (error instanceof ApiClientError) {
        if (error.statusCode === 401) setFormError("Authentication required. Please log in again.");
        else if (error.statusCode === 403) setFormError("You do not have permission to create this task.");
        else setFormError(error.message || "Validation error");
      } else {
        setFormError("Unable to connect to LifeOS API.");
      }
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, task }: { id: string; task: Partial<Task> }) => {
      return apiClient.patch<Task>(`/api/tasks/${id}`, task);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      setModalOpen(false);
      resetForm();
      alert("Task updated successfully!");
    },
    onError: (error) => {
      setFormError(error instanceof Error ? error.message : "Update failed");
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiClient.delete(`/api/tasks/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });

  const toggleMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiClient.post(`/api/tasks/${id}/toggle`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setStatus("todo");
    setPriority("medium");
    setDueDate("");
    setTags("");
    setEditingTask(null);
    setFormError("");
  };

  const handleOpenEdit = (t: Task) => {
    setEditingTask(t);
    setTitle(t.title);
    setDescription(t.description || "");
    setStatus(t.status);
    setPriority(t.priority);
    setDueDate(t.dueDate ? (t.dueDate.split("T")[0] || "") : "");
    setTags(t.tags?.join(", ") || "");
    setFormError("");
    setModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!title.trim()) {
      setFormError("Title is required.");
      return;
    }

    const payload: Partial<Task> = {
      title,
      description: description.trim() || undefined,
      status,
      priority,
      tags: tags.split(",").map(t => t.trim()).filter(Boolean),
    };
    if (dueDate) payload.dueDate = new Date(dueDate).toISOString();

    if (editingTask) {
      updateMutation.mutate({ id: editingTask._id || editingTask.id || "", task: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  // Group tasks by status
  const groupedTasks: Record<TaskStatus, Task[]> = {
    inbox: [],
    todo: [],
    in_progress: [],
    done: [],
    archived: []
  };

  tasks.forEach(t => {
    if (groupedTasks[t.status]) {
      groupedTasks[t.status].push(t);
    }
  });

  const boardColumns: TaskStatus[] = ["todo", "in_progress", "done"];

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] max-w-7xl mx-auto space-y-4">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between shrink-0">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
            Tasks
          </h1>
          <p className="text-muted-foreground mt-0.5 text-sm">Prioritize, manage, and execute.</p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search tasks..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 rounded-full border-0 shadow-sm ring-1 ring-black/10 dark:ring-white/10 bg-card/50 backdrop-blur-xl"
            />
          </div>
          <Button
            onClick={() => { resetForm(); setModalOpen(true); }}
            className="rounded-full shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 bg-blue-600 hover:bg-blue-500 shrink-0"
          >
            <Plus className="mr-2 h-4 w-4" /> Add Task
          </Button>
        </div>
      </div>

      {/* Board Layout */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden pb-4">
        <div className="flex h-full gap-4 min-w-[900px]">
          {boardColumns.map((colStatus) => {
            const colConfig = statusConfig[colStatus];
            const colTasks = groupedTasks[colStatus];
            return (
              <div key={colStatus} className="flex-1 flex flex-col bg-card/40 backdrop-blur-xl rounded-2xl border-0 shadow-sm ring-1 ring-black/5 dark:ring-white/5 overflow-hidden">
                <div className="p-4 border-b bg-background/30 flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-2">
                    <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center", colConfig.bg, colConfig.color)}>
                      <colConfig.icon className="h-4.5 w-4.5" />
                    </div>
                    <h3 className="font-bold">{colConfig.label}</h3>
                  </div>
                  <Badge variant="secondary" className="rounded-full">{colTasks.length}</Badge>
                </div>

                <div className="flex-1 overflow-y-auto p-3 space-y-3 scrollbar-thin">
                  {isLoading ? (
                    <Skeleton className="h-28 w-full rounded-xl" />
                  ) : colTasks.length === 0 ? (
                    <div className="h-32 flex flex-col items-center justify-center text-muted-foreground border-2 border-dashed rounded-xl opacity-60">
                      <colConfig.icon className="h-8 w-8 mb-2 opacity-20" />
                      <span className="text-xs font-medium">Empty</span>
                    </div>
                  ) : (
                    <AnimatePresence>
                      {colTasks.map((task) => {
                        const tId = task._id || task.id || "";
                        const pConfig = priorityConfig[task.priority];
                        return (
                          <motion.div
                            key={tId}
                            layout
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="group bg-background/80 hover:bg-background border rounded-xl p-3 shadow-sm hover:shadow-md transition-all relative overflow-hidden"
                          >
                            <div className={cn("absolute left-0 top-0 bottom-0 w-1", pConfig.bg)} />
                            <div className="flex items-start justify-between gap-2 pl-2">
                              <div className="flex-1">
                                <h4 className={cn("font-bold text-sm", task.status === "done" && "line-through text-muted-foreground")}>{task.title}</h4>
                                {task.description && <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{task.description}</p>}
                              </div>
                              <button
                                onClick={() => toggleMutation.mutate(tId)}
                                className={cn(
                                  "h-5 w-5 rounded-full flex items-center justify-center shrink-0 border transition-all",
                                  task.status === "done" ? "bg-emerald-500 border-emerald-500 text-white" : "border-muted-foreground/30 hover:border-primary text-transparent hover:text-primary/30"
                                )}
                              >
                                <CheckCircle2 className="h-3.5 w-3.5" />
                              </button>
                            </div>

                            <div className="flex flex-wrap items-center gap-2 mt-3 pl-2">
                              {task.priority !== "none" && (
                                <Badge variant="outline" className={cn("text-[10px] py-0 px-1.5 font-semibold", pConfig.color, pConfig.bg)}>
                                  {pConfig.label}
                                </Badge>
                              )}
                              {task.dueDate && (
                                <div className={cn(
                                  "flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-md",
                                  isPast(new Date(task.dueDate)) && !isToday(new Date(task.dueDate)) && task.status !== "done"
                                    ? "bg-rose-500/10 text-rose-600"
                                    : "bg-muted text-muted-foreground"
                                )}>
                                  <Calendar className="h-3 w-3" />
                                  {format(new Date(task.dueDate), "MMM d")}
                                </div>
                              )}
                              {task.tags?.map(t => (
                                <span key={t} className="text-[10px] text-muted-foreground bg-muted/50 px-1.5 py-0.5 rounded-md">#{t}</span>
                              ))}
                            </div>

                            {/* Quick Actions (Hover) */}
                            <div className="absolute top-2 right-2 flex opacity-0 group-hover:opacity-100 transition-opacity bg-background/90 backdrop-blur-sm rounded-md shadow-sm border p-0.5">
                              <Button variant="ghost" size="icon" className="h-6 w-6 rounded text-muted-foreground hover:text-primary" onClick={() => handleOpenEdit(task)}>
                                <Edit2 className="h-3.5 w-3.5" />
                              </Button>
                              <select
                                className="h-6 w-6 opacity-0 absolute inset-0 cursor-pointer"
                                value={task.status}
                                onChange={(e) => updateMutation.mutate({ id: tId, task: { status: e.target.value as TaskStatus } })}
                              >
                                <option value="todo">To Do</option>
                                <option value="in_progress">In Progress</option>
                                <option value="done">Done</option>
                                <option value="archived">Archived</option>
                              </select>
                              <Button variant="ghost" size="icon" className="h-6 w-6 rounded text-muted-foreground hover:text-primary pointer-events-none">
                                <LayoutList className="h-3.5 w-3.5" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-6 w-6 rounded text-muted-foreground hover:text-destructive" onClick={() => { if (confirm("Delete task?")) deleteMutation.mutate(tId); }}>
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Create / Edit Task Modal */}
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
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <ListTodo className="h-5 w-5 text-blue-500" />
                {editingTask ? "Edit Task" : "New Task"}
              </h2>
              
              {formError && (
                <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm font-medium border border-destructive/20">
                  {formError}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-xs font-bold block mb-1 text-muted-foreground uppercase">Title</label>
                  <Input value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="What needs to be done?" />
                </div>
                <div>
                  <label className="text-xs font-bold block mb-1 text-muted-foreground uppercase">Description</label>
                  <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Add details..." rows={2} className="resize-none" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold block mb-1 text-muted-foreground uppercase">Status</label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value as any)}
                      className="w-full rounded-xl border-0 ring-1 ring-black/10 dark:ring-white/10 bg-muted/40 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="inbox">Inbox</option>
                      <option value="todo">To Do</option>
                      <option value="in_progress">In Progress</option>
                      <option value="done">Done</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold block mb-1 text-muted-foreground uppercase">Priority</label>
                    <select
                      value={priority}
                      onChange={(e) => setPriority(e.target.value as any)}
                      className="w-full rounded-xl border-0 ring-1 ring-black/10 dark:ring-white/10 bg-muted/40 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="none">None</option>
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold block mb-1 text-muted-foreground uppercase">Due Date</label>
                    <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
                  </div>
                  <div>
                    <label className="text-xs font-bold block mb-1 text-muted-foreground uppercase">Tags (comma-separated)</label>
                    <Input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="work, urgent" />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <Button type="button" variant="outline" onClick={() => setModalOpen(false)} disabled={createMutation.isPending || updateMutation.isPending}>Cancel</Button>
                  <Button type="submit" className="bg-blue-600 hover:bg-blue-500" disabled={createMutation.isPending || updateMutation.isPending}>
                    {createMutation.isPending || updateMutation.isPending ? "Saving..." : "Save Task"}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
