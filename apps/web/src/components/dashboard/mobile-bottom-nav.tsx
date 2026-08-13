"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { LayoutDashboard, Sparkles, Calendar, CheckSquare, Bot } from "lucide-react";
import { cn } from "@/lib/utils";

const mobileNavItems = [
  { label: "Home", href: "/dashboard", icon: LayoutDashboard },
  { label: "Planner", href: "/dashboard/planner", icon: Sparkles },
  { label: "Calendar", href: "/dashboard/calendar", icon: Calendar },
  { label: "Tasks", href: "/dashboard/tasks", icon: CheckSquare },
  { label: "AI", href: "/dashboard/ai-coach", icon: Bot },
];

export function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex h-[72px] items-center justify-around border-t bg-background/80 px-2 backdrop-blur-xl lg:hidden pb-safe shadow-[0_-4px_24px_rgba(0,0,0,0.05)] dark:shadow-[0_-4px_24px_rgba(0,0,0,0.2)]">
      {mobileNavItems.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            prefetch={true}
            className={cn(
              "relative flex flex-col items-center justify-center gap-1 w-16 h-14 rounded-xl transition-colors",
              isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
            )}
          >
            {isActive && (
              <motion.div
                layoutId="mobile-active"
                className="absolute inset-0 bg-primary/10 rounded-xl"
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
              />
            )}
            <motion.div
              whileTap={{ scale: 0.9 }}
              className="relative z-10 flex h-7 w-7 items-center justify-center"
            >
              <item.icon className="h-5 w-5" />
            </motion.div>
            <span className="relative z-10 text-[10px] font-medium leading-none tracking-wide">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
