export interface AIPlannerRequest {
  userId: string;
  date: string;
  context: {
    tasks: Array<{ id: string; title: string; priority: string; dueDate: string | null }>;
    events: Array<{ id: string; title: string; startTime: string; endTime: string }>;
    habits: Array<{ id: string; name: string; frequency: string }>;
    goals: Array<{ id: string; title: string; progress: number }>;
    preferences: UserPreferences;
  };
}

export interface AIPlannerResponse {
  schedule: AIScheduleBlock[];
  recommendations: string[];
  priorities: string[];
  estimatedProductivity: number;
}

export interface AIScheduleBlock {
  id: string;
  startTime: string;
  endTime: string;
  title: string;
  type: "task" | "event" | "habit" | "break" | "focus";
  priority: string;
  notes: string | null;
}

export interface AIInsight {
  id: string;
  type: InsightType;
  title: string;
  description: string;
  actionable: string[];
  confidence: number;
  createdAt: string;
}

export type InsightType =
  | "productivity"
  | "habit"
  | "goal"
  | "finance"
  | "health"
  | "pattern"
  | "recommendation";

export interface DailyReport {
  date: string;
  productivityScore: number;
  tasksCompleted: number;
  tasksTotal: number;
  habitsCompleted: number;
  habitsTotal: number;
  goalsProgress: Array<{ goalId: string; title: string; progress: number }>;
  aiInsights: AIInsight[];
  mood: number | null;
  sleepHours: number | null;
  summary: string;
}

export interface AISearchResult {
  id: string;
  type: SearchResultType;
  title: string;
  excerpt: string;
  source: string;
  url: string | null;
  relevanceScore: number;
}

export type SearchResultType = "note" | "task" | "event" | "goal" | "habit" | "finance" | "health";

export interface UserPreferences {
  workStartTime: string;
  workEndTime: string;
  breakDuration: number;
  focusBlockLength: number;
  preferredTaskOrder: string;
  weekendWork: boolean;
}

export interface AIChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: string;
}
