"use client";

import { useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  LayoutDashboard,
  CheckSquare,
  Calendar,
  FileText,
  Target,
  Repeat,
  Wallet,
  Heart,
  Bot,
  BarChart3,
  Settings,
  Moon,
  Sun,
  LogOut,
} from "lucide-react";
import { useTheme } from "@/components/theme-provider";

const pages = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Tasks", href: "/dashboard/tasks", icon: CheckSquare },
  { label: "Calendar", href: "/dashboard/calendar", icon: Calendar },
  { label: "Notes", href: "/dashboard/notes", icon: FileText },
  { label: "Goals", href: "/dashboard/goals", icon: Target },
  { label: "Habits", href: "/dashboard/habits", icon: Repeat },
  { label: "Finance", href: "/dashboard/finance", icon: Wallet },
  { label: "Health", href: "/dashboard/health", icon: Heart },
  { label: "AI Coach", href: "/dashboard/ai", icon: Bot },
  { label: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
];

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const router = useRouter();
  const { setTheme } = useTheme();

  const runCommand = useCallback(
    (command: () => void) => {
      onOpenChange(false);
      command();
    },
    [onOpenChange],
  );

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpenChange(!open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [open, onOpenChange]);

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>

        <CommandGroup heading="Navigation">
          {pages.map((page) => (
            <CommandItem
              key={page.href}
              value={page.label}
              onSelect={() => runCommand(() => router.push(page.href))}
            >
              <page.icon className="mr-2 h-4 w-4" />
              {page.label}
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Theme">
          <CommandItem
            onSelect={() => runCommand(() => setTheme("light"))}
          >
            <Sun className="mr-2 h-4 w-4" />
            Light Mode
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => setTheme("dark"))}
          >
            <Moon className="mr-2 h-4 w-4" />
            Dark Mode
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Actions">
          <CommandItem
            onSelect={() => runCommand(async () => {
              await fetch("/api/auth/logout", { method: "POST" });
              router.push("/login");
            })}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Log out
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
