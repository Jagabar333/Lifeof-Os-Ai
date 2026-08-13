export const APP_NAME = "LifeOS AI";
export const APP_DESCRIPTION = "The Intelligent Operating System For Your Life";
export const APP_URL = process.env["NEXT_PUBLIC_APP_URL"] ?? "http://localhost:3000";

export const NAV_ITEMS = [
  { label: "Dashboard", href: "/dashboard", icon: "LayoutDashboard" },
  { label: "Tasks", href: "/dashboard/tasks", icon: "CheckSquare" },
  { label: "Calendar", href: "/dashboard/calendar", icon: "Calendar" },
  { label: "Notes", href: "/dashboard/notes", icon: "FileText" },
  { label: "Goals", href: "/dashboard/goals", icon: "Target" },
  { label: "Habits", href: "/dashboard/habits", icon: "Repeat" },
  { label: "Finance", href: "/dashboard/finance", icon: "Wallet" },
  { label: "Health", href: "/dashboard/health", icon: "Heart" },
  { label: "AI Coach", href: "/dashboard/ai", icon: "Bot" },
  { label: "Analytics", href: "/dashboard/analytics", icon: "BarChart3" },
] as const;

export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
} as const;

export const RATE_LIMITS = {
  AUTH: { max: 5, windowMs: 60_000 },
  API: { max: 100, windowMs: 60_000 },
  AI: { max: 20, windowMs: 60_000 },
  SEARCH: { max: 30, windowMs: 60_000 },
} as const;

export const COLORS = {
  primary: "#2563EB",
  success: "#22C55E",
  warning: "#F59E0B",
  danger: "#EF4444",
} as const;

export const DAYS_OF_WEEK = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;

export const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

export const FINANCE_CATEGORIES = [
  "Food & Dining",
  "Transportation",
  "Housing",
  "Utilities",
  "Entertainment",
  "Shopping",
  "Healthcare",
  "Education",
  "Travel",
  "Subscriptions",
  "Income",
  "Investment",
  "Other",
] as const;

export const HEALTH_METRIC_UNITS: Record<string, string> = {
  weight: "kg",
  height: "cm",
  sleep_hours: "hours",
  steps: "steps",
  calories: "kcal",
  water: "ml",
  heart_rate: "bpm",
  blood_pressure_systolic: "mmHg",
  blood_pressure_diastolic: "mmHg",
  mood: "score (1-10)",
} as const;
