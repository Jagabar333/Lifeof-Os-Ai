"use client";

import { useState } from "react";
import { Menu, Search, Bell, Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useSidebarStore } from "@/store/sidebar-store";
import { useTheme } from "@/components/theme-provider";
import { CommandPalette } from "./command-palette";

export function Topbar() {
  const toggle = useSidebarStore((s) => s.toggle);
  const { theme, setTheme } = useTheme();
  const [commandOpen, setCommandOpen] = useState(false);

  return (
    <>
      <header className="flex h-14 items-center gap-4 border-b bg-card px-4 lg:px-6">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={toggle}
          aria-label="Toggle sidebar"
        >
          <Menu className="h-5 w-5" />
        </Button>

        {/* Search trigger */}
        <button
          onClick={() => setCommandOpen(true)}
          className="flex flex-1 items-center gap-2 rounded-lg border bg-muted/50 px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted max-w-md"
        >
          <Search className="h-4 w-4" />
          <span className="hidden sm:inline">Search anything...</span>
          <kbd className="ml-auto hidden rounded border bg-background px-1.5 py-0.5 text-[10px] font-mono sm:inline">
            ⌘K
          </kbd>
        </button>

        <div className="flex items-center gap-1 ml-auto">
          {/* Theme toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>

          {/* Notifications */}
          <Button variant="ghost" size="icon" aria-label="Notifications" className="relative">
            <Bell className="h-4 w-4" />
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-primary" />
          </Button>

          {/* User avatar */}
          <Button variant="ghost" size="icon" className="rounded-full" aria-label="Profile">
            <Avatar className="h-8 w-8">
              <AvatarImage src="" alt="User" />
              <AvatarFallback className="text-xs">U</AvatarFallback>
            </Avatar>
          </Button>
        </div>
      </header>

      <CommandPalette open={commandOpen} onOpenChange={setCommandOpen} />
    </>
  );
}
