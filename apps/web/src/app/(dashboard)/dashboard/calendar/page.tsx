"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import { motion, AnimatePresence } from "framer-motion";
import {
  format, startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths,
  addWeeks, subWeeks, addDays, subDays, isToday, parseISO,
  startOfDay, endOfDay, getHours, getMinutes, setHours, setMinutes
} from "date-fns";
import {
  ChevronLeft, ChevronRight, Plus, Calendar, Clock,
  MapPin, Trash2, Edit, X, Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type CalendarView = "month" | "week" | "day";

interface CalendarEvent {
  _id?: string;
  id?: string;
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  allDay?: boolean;
  color?: string;
  location?: string;
}

const EVENT_COLORS = [
  { value: "#6366f1", label: "Indigo" },
  { value: "#8b5cf6", label: "Purple" },
  { value: "#06b6d4", label: "Cyan" },
  { value: "#10b981", label: "Emerald" },
  { value: "#f59e0b", label: "Amber" },
  { value: "#ef4444", label: "Red" },
  { value: "#ec4899", label: "Pink" },
];

const HOURS = Array.from({ length: 24 }, (_, i) => i);

export default function CalendarPage() {
  const queryClient = useQueryClient();
  const [view, setView] = useState<CalendarView>("month");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [newEventDate, setNewEventDate] = useState<Date | null>(null);

  // Compute date range for fetching
  const dateRange = useMemo(() => {
    if (view === "month") {
      return {
        startDate: format(startOfWeek(startOfMonth(currentDate)), "yyyy-MM-dd"),
        endDate: format(endOfWeek(endOfMonth(currentDate)), "yyyy-MM-dd"),
      };
    }
    if (view === "week") {
      return {
        startDate: format(startOfWeek(currentDate), "yyyy-MM-dd"),
        endDate: format(endOfWeek(currentDate), "yyyy-MM-dd"),
      };
    }
    return {
      startDate: format(startOfDay(currentDate), "yyyy-MM-dd'T'HH:mm:ss"),
      endDate: format(endOfDay(currentDate), "yyyy-MM-dd'T'HH:mm:ss"),
    };
  }, [view, currentDate]);

  const { data: events = [], isLoading } = useQuery<CalendarEvent[]>({
    queryKey: ["calendar", dateRange],
    queryFn: async () => {
      const qs = new URLSearchParams(dateRange).toString();
      const res = await apiClient.get<any>(`/api/calendar?${qs}`);
      const items = res?.data ?? res;
      return Array.isArray(items) ? items : [];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: Partial<CalendarEvent>) => {
      const res = await apiClient.post<any>("/api/calendar", data);
      return res.data || res;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["calendar"] }),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<CalendarEvent> }) => {
      const res = await apiClient.patch<any>(`/api/calendar/${id}`, data);
      return res.data || res;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["calendar"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/api/calendar/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["calendar"] });
      setSelectedEvent(null);
    },
  });

  // Navigation
  const navigate = (dir: "prev" | "next" | "today") => {
    if (dir === "today") { setCurrentDate(new Date()); return; }
    const delta = dir === "next" ? 1 : -1;
    if (view === "month") setCurrentDate(delta > 0 ? addMonths(currentDate, 1) : subMonths(currentDate, 1));
    else if (view === "week") setCurrentDate(delta > 0 ? addWeeks(currentDate, 1) : subWeeks(currentDate, 1));
    else setCurrentDate(delta > 0 ? addDays(currentDate, 1) : subDays(currentDate, 1));
  };

  const getEventsForDay = (day: Date) =>
    events.filter((e) => isSameDay(parseISO(e.startTime), day));

  const getHeaderLabel = () => {
    if (view === "month") return format(currentDate, "MMMM yyyy");
    if (view === "week") {
      const start = startOfWeek(currentDate);
      const end = endOfWeek(currentDate);
      return `${format(start, "MMM d")} – ${format(end, "MMM d, yyyy")}`;
    }
    return format(currentDate, "EEEE, MMMM d, yyyy");
  };

  // Month view days
  const monthDays = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentDate));
    const end = endOfWeek(endOfMonth(currentDate));
    return eachDayOfInterval({ start, end });
  }, [currentDate]);

  // Week view days
  const weekDays = useMemo(() => {
    return eachDayOfInterval({ start: startOfWeek(currentDate), end: endOfWeek(currentDate) });
  }, [currentDate]);

  return (
    <div className="flex flex-col h-[calc(100vh-5rem)] max-w-7xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4 shrink-0"
      >
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-cyan-600 to-primary bg-clip-text text-transparent">
            Calendar
          </h1>
          <p className="text-muted-foreground mt-0.5">Your schedule, beautifully organized.</p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* View switcher */}
          <div className="flex gap-1 p-1 rounded-xl border-0 shadow-sm ring-1 ring-black/10 dark:ring-white/10 bg-card/50 backdrop-blur-xl">
            {(["month", "week", "day"] as CalendarView[]).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-sm font-medium capitalize transition-all",
                  view === v
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {v}
              </button>
            ))}
          </div>

          {/* Navigation */}
          <div className="flex items-center gap-1">
            <Button variant="outline" size="icon" onClick={() => navigate("prev")} className="h-9 w-9 rounded-xl">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => navigate("today")} className="rounded-xl px-3">
              Today
            </Button>
            <Button variant="outline" size="icon" onClick={() => navigate("next")} className="h-9 w-9 rounded-xl">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <Button
            onClick={() => { setEditingEvent(null); setNewEventDate(new Date()); setShowEventModal(true); }}
            className="rounded-full shadow-lg shadow-primary/20"
          >
            <Plus className="mr-2 h-4 w-4" /> Add Event
          </Button>
        </div>
      </motion.div>

      {/* Date Label */}
      <motion.div
        key={getHeaderLabel()}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-lg font-semibold mb-3 shrink-0"
      >
        {getHeaderLabel()}
      </motion.div>

      {/* Calendar Body */}
      <div className="flex-1 overflow-hidden rounded-2xl border-0 shadow-md ring-1 ring-black/5 dark:ring-white/5 bg-card/50 backdrop-blur-xl">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="flex flex-col items-center gap-3 text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin" />
              <p className="text-sm">Loading events…</p>
            </div>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={`${view}-${format(currentDate, "yyyy-MM-dd")}`}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.15 }}
              className="h-full overflow-auto"
            >
              {view === "month" && (
                <MonthView
                  days={monthDays}
                  currentDate={currentDate}
                  getEventsForDay={getEventsForDay}
                  onDayClick={(d) => { setNewEventDate(d); setEditingEvent(null); setShowEventModal(true); }}
                  onEventClick={(e) => setSelectedEvent(e)}
                />
              )}
              {view === "week" && (
                <WeekView
                  days={weekDays}
                  events={events}
                  onSlotClick={(d) => { setNewEventDate(d); setEditingEvent(null); setShowEventModal(true); }}
                  onEventClick={(e) => setSelectedEvent(e)}
                />
              )}
              {view === "day" && (
                <DayView
                  date={currentDate}
                  events={getEventsForDay(currentDate)}
                  onSlotClick={(d) => { setNewEventDate(d); setEditingEvent(null); setShowEventModal(true); }}
                  onEventClick={(e) => setSelectedEvent(e)}
                />
              )}
            </motion.div>
          </AnimatePresence>
        )}
      </div>

      {/* Event Detail Panel */}
      <AnimatePresence>
        {selectedEvent && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-50 w-80 rounded-2xl border-0 shadow-2xl ring-1 ring-black/10 dark:ring-white/10 bg-background/95 backdrop-blur-xl p-5"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <div
                  className="h-3 w-3 rounded-full shrink-0"
                  style={{ backgroundColor: selectedEvent.color || "#6366f1" }}
                />
                <h3 className="font-bold text-base leading-snug">{selectedEvent.title}</h3>
              </div>
              <button onClick={() => setSelectedEvent(null)} className="text-muted-foreground hover:text-foreground ml-2 shrink-0">
                <X className="h-4 w-4" />
              </button>
            </div>

            {selectedEvent.description && (
              <p className="text-sm text-muted-foreground mb-3 leading-relaxed">{selectedEvent.description}</p>
            )}

            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Clock className="h-3.5 w-3.5 shrink-0" />
                <span>
                  {format(parseISO(selectedEvent.startTime), "MMM d, h:mm a")} – {format(parseISO(selectedEvent.endTime), "h:mm a")}
                </span>
              </div>
              {selectedEvent.location && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5 shrink-0" />
                  <span>{selectedEvent.location}</span>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1 rounded-xl"
                onClick={() => { setEditingEvent(selectedEvent); setShowEventModal(true); setSelectedEvent(null); }}
              >
                <Edit className="h-3.5 w-3.5 mr-1.5" /> Edit
              </Button>
              <Button
                variant="destructive"
                size="sm"
                className="rounded-xl"
                onClick={() => deleteMutation.mutate(selectedEvent._id || selectedEvent.id || "")}
                disabled={deleteMutation.isPending}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create/Edit Modal */}
      <AnimatePresence>
        {showEventModal && (
          <EventModal
            editingEvent={editingEvent}
            defaultDate={newEventDate}
            onClose={() => { setShowEventModal(false); setEditingEvent(null); }}
            onSave={async (data) => {
              if (editingEvent) {
                await updateMutation.mutateAsync({ id: editingEvent._id || editingEvent.id || "", data });
              } else {
                await createMutation.mutateAsync(data);
              }
              setShowEventModal(false);
            }}
            isSaving={createMutation.isPending || updateMutation.isPending}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Month View ─────────────────────────────────────────────────────────────

function MonthView({
  days,
  currentDate,
  getEventsForDay,
  onDayClick,
  onEventClick,
}: {
  days: Date[];
  currentDate: Date;
  getEventsForDay: (d: Date) => CalendarEvent[];
  onDayClick: (d: Date) => void;
  onEventClick: (e: CalendarEvent) => void;
}) {
  const weekDayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="h-full flex flex-col">
      {/* Week day headers */}
      <div className="grid grid-cols-7 border-b">
        {weekDayLabels.map((d) => (
          <div key={d} className="py-3 text-center text-xs font-bold text-muted-foreground uppercase tracking-widest">
            {d}
          </div>
        ))}
      </div>
      {/* Days grid */}
      <div className="flex-1 grid grid-cols-7" style={{ gridTemplateRows: `repeat(${Math.ceil(days.length / 7)}, 1fr)` }}>
        {days.map((day, i) => {
          const dayEvents = getEventsForDay(day);
          const isCurrentMonth = isSameMonth(day, currentDate);
          const isTodayDay = isToday(day);
          return (
            <div
              key={i}
              onClick={() => onDayClick(day)}
              className={cn(
                "min-h-[80px] p-1.5 border-b border-r cursor-pointer transition-colors hover:bg-muted/30 relative",
                !isCurrentMonth && "opacity-40",
                i % 7 === 6 && "border-r-0",
              )}
            >
              <div className={cn(
                "h-6 w-6 flex items-center justify-center text-sm font-semibold rounded-full mb-1 mx-auto",
                isTodayDay ? "bg-primary text-primary-foreground" : "text-foreground"
              )}>
                {format(day, "d")}
              </div>
              <div className="space-y-0.5">
                {dayEvents.slice(0, 3).map((ev) => (
                  <button
                    key={ev._id || ev.id}
                    onClick={(e) => { e.stopPropagation(); onEventClick(ev); }}
                    className="w-full text-left text-[10px] font-medium px-1.5 py-0.5 rounded-md truncate text-white"
                    style={{ backgroundColor: ev.color || "#6366f1" }}
                  >
                    {ev.title}
                  </button>
                ))}
                {dayEvents.length > 3 && (
                  <p className="text-[10px] text-muted-foreground px-1">+{dayEvents.length - 3} more</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Week View ───────────────────────────────────────────────────────────────

function WeekView({
  days,
  events,
  onSlotClick,
  onEventClick,
}: {
  days: Date[];
  events: CalendarEvent[];
  onSlotClick: (d: Date) => void;
  onEventClick: (e: CalendarEvent) => void;
}) {
  return (
    <div className="h-full flex flex-col">
      {/* Header row */}
      <div className="grid border-b shrink-0" style={{ gridTemplateColumns: "56px repeat(7, 1fr)" }}>
        <div className="py-3" />
        {days.map((day) => (
          <div key={day.toISOString()} className="py-3 text-center border-l">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{format(day, "EEE")}</p>
            <p className={cn(
              "text-lg font-extrabold mt-0.5",
              isToday(day) ? "text-primary" : "text-foreground"
            )}>
              {format(day, "d")}
            </p>
          </div>
        ))}
      </div>

      {/* Time grid */}
      <div className="flex-1 overflow-auto">
        <div className="relative grid" style={{ gridTemplateColumns: "56px repeat(7, 1fr)", minHeight: `${HOURS.length * 56}px` }}>
          {/* Hour labels */}
          <div>
            {HOURS.map((h) => (
              <div key={h} className="h-14 pr-2 flex items-start justify-end pt-1">
                <span className="text-[10px] text-muted-foreground font-medium">{h === 0 ? "" : format(setHours(new Date(), h), "h a")}</span>
              </div>
            ))}
          </div>

          {/* Day columns */}
          {days.map((day) => {
            const dayEvents = events.filter((e) => isSameDay(parseISO(e.startTime), day));
            return (
              <div key={day.toISOString()} className="border-l relative">
                {HOURS.map((h) => (
                  <div
                    key={h}
                    className="h-14 border-b border-muted/40 hover:bg-muted/20 cursor-pointer transition-colors"
                    onClick={() => onSlotClick(setMinutes(setHours(day, h), 0))}
                  />
                ))}
                {/* Events overlay */}
                {dayEvents.map((ev) => {
                  const start = parseISO(ev.startTime);
                  const end = parseISO(ev.endTime);
                  const topPct = (getHours(start) + getMinutes(start) / 60) / 24 * 100;
                  const heightPct = Math.max(((getHours(end) - getHours(start) + (getMinutes(end) - getMinutes(start)) / 60)) / 24 * 100, 2);
                  return (
                    <button
                      key={ev._id || ev.id}
                      onClick={(e) => { e.stopPropagation(); onEventClick(ev); }}
                      className="absolute left-0.5 right-0.5 rounded-md px-1.5 py-1 text-left text-white shadow-sm hover:brightness-90 transition-all z-10 overflow-hidden"
                      style={{
                        top: `${topPct}%`,
                        height: `${heightPct}%`,
                        backgroundColor: ev.color || "#6366f1",
                      }}
                    >
                      <p className="text-[10px] font-bold leading-tight truncate">{ev.title}</p>
                      <p className="text-[9px] opacity-80">{format(parseISO(ev.startTime), "h:mm a")}</p>
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Day View ────────────────────────────────────────────────────────────────

function DayView({
  date,
  events,
  onSlotClick,
  onEventClick,
}: {
  date: Date;
  events: CalendarEvent[];
  onSlotClick: (d: Date) => void;
  onEventClick: (e: CalendarEvent) => void;
}) {
  return (
    <div className="h-full flex flex-col">
      <div className="py-4 px-6 border-b text-center shrink-0">
        <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">{format(date, "EEEE")}</p>
        <p className={cn("text-4xl font-extrabold mt-1", isToday(date) ? "text-primary" : "")}>{format(date, "d")}</p>
      </div>

      <div className="flex-1 overflow-auto">
        <div className="relative grid" style={{ gridTemplateColumns: "56px 1fr", minHeight: `${HOURS.length * 64}px` }}>
          {/* Hour labels */}
          <div>
            {HOURS.map((h) => (
              <div key={h} className="h-16 pr-2 flex items-start justify-end pt-1">
                <span className="text-[10px] text-muted-foreground">{h === 0 ? "" : format(setHours(new Date(), h), "h a")}</span>
              </div>
            ))}
          </div>

          {/* Time slots */}
          <div className="border-l relative">
            {HOURS.map((h) => (
              <div
                key={h}
                className="h-16 border-b border-muted/40 hover:bg-muted/20 cursor-pointer transition-colors"
                onClick={() => onSlotClick(setMinutes(setHours(date, h), 0))}
              />
            ))}
            {events.map((ev) => {
              const start = parseISO(ev.startTime);
              const end = parseISO(ev.endTime);
              const topPct = (getHours(start) + getMinutes(start) / 60) / 24 * 100;
              const heightPct = Math.max(((getHours(end) - getHours(start) + (getMinutes(end) - getMinutes(start)) / 60)) / 24 * 100, 2.5);
              return (
                <button
                  key={ev._id || ev.id}
                  onClick={(e) => { e.stopPropagation(); onEventClick(ev); }}
                  className="absolute left-1 right-2 rounded-xl px-3 py-2 text-left text-white shadow-md hover:brightness-90 transition-all z-10 overflow-hidden"
                  style={{ top: `${topPct}%`, height: `${heightPct}%`, backgroundColor: ev.color || "#6366f1" }}
                >
                  <p className="text-sm font-bold truncate">{ev.title}</p>
                  <p className="text-xs opacity-80">{format(start, "h:mm a")} – {format(end, "h:mm a")}</p>
                  {ev.location && <p className="text-xs opacity-70 flex items-center gap-1 mt-0.5"><MapPin className="h-3 w-3" />{ev.location}</p>}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Event Modal ─────────────────────────────────────────────────────────────

function EventModal({
  editingEvent,
  defaultDate,
  onClose,
  onSave,
  isSaving,
}: {
  editingEvent: CalendarEvent | null;
  defaultDate: Date | null;
  onClose: () => void;
  onSave: (data: Partial<CalendarEvent>) => Promise<void>;
  isSaving: boolean;
}) {
  const d = defaultDate || new Date();
  const defaultStart = format(setMinutes(setHours(d, getHours(d)), 0), "yyyy-MM-dd'T'HH:mm");
  const defaultEnd = format(setMinutes(setHours(d, getHours(d) + 1), 0), "yyyy-MM-dd'T'HH:mm");

  const [form, setForm] = useState({
    title: editingEvent?.title || "",
    description: editingEvent?.description || "",
    startTime: editingEvent?.startTime ? format(parseISO(editingEvent.startTime), "yyyy-MM-dd'T'HH:mm") : defaultStart,
    endTime: editingEvent?.endTime ? format(parseISO(editingEvent.endTime), "yyyy-MM-dd'T'HH:mm") : defaultEnd,
    location: editingEvent?.location || "",
    color: editingEvent?.color || "#6366f1",
    allDay: editingEvent?.allDay || false,
  });
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) { setError("Title is required"); return; }
    if (form.endTime <= form.startTime) { setError("End time must be after start time"); return; }
    setError("");
    await onSave({
      ...form,
      startTime: new Date(form.startTime).toISOString(),
      endTime: new Date(form.endTime).toISOString(),
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-2xl border-0 shadow-2xl ring-1 ring-black/10 dark:ring-white/10 bg-background p-6"
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            {editingEvent ? "Edit Event" : "New Event"}
          </h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-xl border border-destructive/20">{error}</div>
          )}

          <div>
            <label className="text-sm font-semibold block mb-1.5">Title</label>
            <input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Event title"
              className="w-full rounded-xl border-0 ring-1 ring-black/10 dark:ring-white/10 bg-muted/40 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-semibold block mb-1.5">Start</label>
              <input
                type="datetime-local"
                value={form.startTime}
                onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                className="w-full rounded-xl border-0 ring-1 ring-black/10 dark:ring-white/10 bg-muted/40 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="text-sm font-semibold block mb-1.5">End</label>
              <input
                type="datetime-local"
                value={form.endTime}
                onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                className="w-full rounded-xl border-0 ring-1 ring-black/10 dark:ring-white/10 bg-muted/40 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold block mb-1.5">Location <span className="font-normal text-muted-foreground">(optional)</span></label>
            <input
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              placeholder="Add a location"
              className="w-full rounded-xl border-0 ring-1 ring-black/10 dark:ring-white/10 bg-muted/40 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="text-sm font-semibold block mb-1.5">Description <span className="font-normal text-muted-foreground">(optional)</span></label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Add notes..."
              rows={2}
              className="w-full rounded-xl border-0 ring-1 ring-black/10 dark:ring-white/10 bg-muted/40 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            />
          </div>

          {/* Color picker */}
          <div>
            <label className="text-sm font-semibold block mb-2">Color</label>
            <div className="flex gap-2 flex-wrap">
              {EVENT_COLORS.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setForm({ ...form, color: c.value })}
                  className={cn(
                    "h-7 w-7 rounded-full transition-all",
                    form.color === c.value ? "ring-2 ring-offset-2 ring-primary scale-110" : "hover:scale-105"
                  )}
                  style={{ backgroundColor: c.value }}
                  title={c.label}
                />
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose} className="rounded-xl">Cancel</Button>
            <Button type="submit" disabled={isSaving} className="rounded-xl shadow-lg shadow-primary/20 min-w-[100px]">
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : editingEvent ? "Save Changes" : "Create Event"}
            </Button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}
