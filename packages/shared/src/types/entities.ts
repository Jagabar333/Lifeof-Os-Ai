export interface Task {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string | null;
  dueTime: string | null;
  tags: string[];
  categoryId: string | null;
  recurrenceRule: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export type TaskStatus = "inbox" | "todo" | "in_progress" | "done" | "archived";
export type TaskPriority = "none" | "low" | "medium" | "high" | "urgent";

export interface CalendarEvent {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  startTime: string;
  endTime: string;
  allDay: boolean;
  color: string | null;
  location: string | null;
  reminderMinutes: number | null;
  recurrenceRule: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Note {
  id: string;
  userId: string;
  title: string;
  content: string;
  folderId: string | null;
  tags: string[];
  isPinned: boolean;
  isTrashed: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Goal {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  status: GoalStatus;
  progress: number;
  targetDate: string | null;
  category: GoalCategory;
  milestones: GoalMilestone[];
  createdAt: string;
  updatedAt: string;
}

export type GoalStatus = "not_started" | "in_progress" | "completed" | "abandoned";
export type GoalCategory =
  | "health"
  | "fitness"
  | "career"
  | "finance"
  | "education"
  | "personal"
  | "relationships"
  | "creative"
  | "spiritual"
  | "other";

export interface GoalMilestone {
  id: string;
  title: string;
  completed: boolean;
  completedAt: string | null;
}

export interface Habit {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  frequency: HabitFrequency;
  targetCount: number;
  category: string;
  color: string;
  icon: string;
  streak: number;
  bestStreak: number;
  createdAt: string;
  updatedAt: string;
}

export type HabitFrequency = "daily" | "weekly" | "monthly";

export interface HabitLog {
  id: string;
  habitId: string;
  date: string;
  count: number;
  completed: boolean;
}

export interface FinanceAccount {
  id: string;
  userId: string;
  name: string;
  type: FinanceAccountType;
  balance: number;
  currency: string;
  color: string | null;
  icon: string | null;
  createdAt: string;
  updatedAt: string;
}

export type FinanceAccountType = "checking" | "savings" | "credit" | "investment" | "cash" | "other";

export interface FinanceTransaction {
  id: string;
  userId: string;
  accountId: string;
  amount: number;
  type: "income" | "expense" | "transfer";
  category: string;
  description: string;
  date: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface HealthMetric {
  id: string;
  userId: string;
  type: HealthMetricType;
  value: number;
  unit: string;
  date: string;
  notes: string | null;
}

export type HealthMetricType =
  | "weight"
  | "height"
  | "sleep_hours"
  | "steps"
  | "calories"
  | "water"
  | "heart_rate"
  | "blood_pressure_systolic"
  | "blood_pressure_diastolic"
  | "mood";

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  actionUrl: string | null;
  createdAt: string;
}

export type NotificationType =
  | "task_reminder"
  | "event_reminder"
  | "habit_reminder"
  | "goal_milestone"
  | "system"
  | "ai_insight";

export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  resource: string;
  resourceId: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
}
