"use client";

import { type ReactNode } from "react";
import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";
import { useSidebarStore } from "@/store/sidebar-store";
import { cn } from "@/lib/utils";

import { MobileBottomNav } from "./mobile-bottom-nav";
import { AICopilot } from "./ai-copilot";

export function DashboardLayout({ children }: { children: ReactNode }) {
  const isCollapsed = useSidebarStore((s) => s.isCollapsed);

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div
        className={cn(
          "flex flex-1 flex-col transition-all duration-300",
          isCollapsed && "lg:ml-[68px]",
        )}
      >
        <Topbar />
        <main className="flex-1 overflow-y-auto bg-muted/30 p-4 lg:p-6 pb-20 lg:pb-6">
          {children}
        </main>
      </div>
      <MobileBottomNav />
      <AICopilot />
    </div>
  );
}
