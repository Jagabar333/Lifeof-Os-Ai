"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  ChevronLeft,
  LayoutDashboard,
  CheckSquare,
  Calendar,
  FileText,
  Target,
  Repeat,
  Wallet,
  HeartPulse,
  Bot,
  BarChart3,
  Settings,
  LogOut,
  Sun,
  Bell,
  User,
  BookOpen
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSidebarStore } from "@/store/sidebar-store";
import { Separator } from "@/components/ui/separator";
import { useIsMobile } from "@/hooks/use-media-query";

const navGroups = [
  {
    title: "Overview",
    items: [
      { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { label: "Daily Summary", href: "/dashboard/daily-summary", icon: Sun },
      { label: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
    ]
  },
  {
    title: "Productivity",
    items: [
      { label: "AI Planner", href: "/dashboard/planner", icon: Sparkles },
      { label: "Calendar", href: "/dashboard/calendar", icon: Calendar },
      { label: "Tasks", href: "/dashboard/tasks", icon: CheckSquare },
      { label: "Notes", href: "/dashboard/notes", icon: FileText },
    ]
  },
  {
    title: "Personal Growth",
    items: [
      { label: "Goals", href: "/dashboard/goals", icon: Target },
      { label: "Habits", href: "/dashboard/habits", icon: Repeat },
      { label: "Journal", href: "/dashboard/journal", icon: BookOpen },
      { label: "AI Coach", href: "/dashboard/ai-coach", icon: Bot },
    ]
  },
  {
    title: "Life Management",
    items: [
      { label: "Finance", href: "/dashboard/finance", icon: Wallet },
      { label: "Health", href: "/dashboard/health", icon: HeartPulse },
    ]
  }
];

const systemItems = [
  { label: "Notifications", href: "/dashboard/notifications", icon: Bell },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
  { label: "Profile", href: "/dashboard/profile", icon: User },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const isMobile = useIsMobile();
  const { isCollapsed, isOpen, toggle, setCollapsed } = useSidebarStore();

  const showMobile = isMobile && isOpen;

  if (isMobile && !isOpen) return null;

  return (
    <>
      {/* Mobile backdrop */}
      <AnimatePresence>
        {showMobile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
            onClick={toggle}
          />
        )}
      </AnimatePresence>

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r bg-card transition-all duration-300",
          isCollapsed && !isMobile && "w-[68px]",
          isMobile && "w-64",
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center justify-between px-4 shrink-0">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary">
              <Sparkles className="h-4 w-4 text-primary-foreground" />
            </div>
            {!isCollapsed && (
              <span className="text-lg font-bold tracking-tight">LifeOS</span>
            )}
          </Link>
          {!isMobile && (
            <button
              onClick={() => setCollapsed(!isCollapsed)}
              className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              <ChevronLeft
                className={cn("h-4 w-4 transition-transform", isCollapsed && "rotate-180")}
              />
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 scrollbar-thin">
          <div className="space-y-8">
            {navGroups.map((group, idx) => (
              <div key={idx} className="space-y-1">
                {!isCollapsed && (
                  <h4 className="px-3 text-xs font-bold uppercase tracking-widest text-muted-foreground/60 mb-3">
                    {group.title}
                  </h4>
                )}
                <ul className="space-y-1.5">
                  {group.items.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                      <li key={item.href} className="relative">
                        {isActive && (
                          <motion.div
                            layoutId="sidebar-active"
                            className="absolute inset-0 bg-primary/10 rounded-lg dark:bg-primary/20"
                            transition={{ type: "spring", stiffness: 350, damping: 30 }}
                          />
                        )}
                        <Link
                          href={item.href}
                          prefetch={true}
                          className={cn(
                            "relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors z-10",
                            isActive
                              ? "text-primary"
                              : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
                          )}
                          title={isCollapsed ? item.label : undefined}
                        >
                          <item.icon className="h-5 w-5 shrink-0" />
                          {!isCollapsed && <span>{item.label}</span>}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        </nav>

        {/* Bottom section */}
        <div className="border-t px-3 py-2 shrink-0">
          <ul className="space-y-1">
            {systemItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <li key={item.href} className="relative">
                  {isActive && (
                    <motion.div
                      layoutId="sidebar-active"
                      className="absolute inset-0 bg-primary/10 rounded-lg dark:bg-primary/20"
                      transition={{ type: "spring", stiffness: 350, damping: 30 }}
                    />
                  )}
                  <Link
                    href={item.href}
                    prefetch={true}
                    className={cn(
                      "relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors z-10",
                      isActive
                        ? "text-primary"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
                    )}
                    title={isCollapsed ? item.label : undefined}
                  >
                    <item.icon className="h-5 w-5 shrink-0" />
                    {!isCollapsed && <span>{item.label}</span>}
                  </Link>
                </li>
              );
            })}
          </ul>

          {!isCollapsed && (
            <Separator className="my-2" />
          )}

          <button
            onClick={async () => {
              await fetch("/api/auth/logout", { method: "POST" });
              router.push("/login");
            }}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-all duration-200 hover:bg-destructive/10 hover:text-destructive text-left"
            title={isCollapsed ? "Log out" : undefined}
          >
            <LogOut className="h-5 w-5 shrink-0" />
            {!isCollapsed && <span>Log out</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
