"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  User2,
  FileText,
  Briefcase,
  MessageSquare,
  BarChart3,
  Map,
  BookOpen,
  Bot,
  Settings,
  ChevronLeft,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useUIStore } from "@/store";
import { Button } from "@/components/ui/button";

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/profiles", icon: User2, label: "Profiles" },
  { href: "/resumes", icon: FileText, label: "Resumes" },
  { href: "/job-descriptions", icon: Briefcase, label: "Job Descriptions" },
  { href: "/interviews", icon: MessageSquare, label: "Interviews" },
  { href: "/analytics", icon: BarChart3, label: "Analytics" },
  { href: "/roadmaps", icon: Map, label: "Roadmaps" },
  { href: "/knowledge", icon: BookOpen, label: "Knowledge Base" },
  { href: "/agents", icon: Bot, label: "Agent Runs" },
  { href: "/settings", icon: Settings, label: "Settings" },
];

export function Sidebar() {
  const pathname = usePathname();
  const { isSidebarCollapsed, setSidebarCollapsed } = useUIStore();

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen sidebar-gradient border-r border-border/40 flex flex-col",
        "transition-all duration-300",
        isSidebarCollapsed ? "w-16" : "w-60"
      )}
    >
      {/* Logo */}
      <div className="flex items-center h-16 px-4 border-b border-border/40">
        <div className="w-8 h-8 rounded-xl gradient-brand flex items-center justify-center flex-shrink-0">
          <Zap className="w-4 h-4 text-white" />
        </div>
        {!isSidebarCollapsed && (
          <span className="ml-3 font-bold text-sm gradient-text whitespace-nowrap">
            InterviewForge AI
          </span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-0.5">
        {navItems.map(({ href, icon: Icon, label }) => {
          const isActive =
            pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group",
                isActive
                  ? "gradient-brand text-white shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-white/5"
              )}
            >
              <Icon
                className={cn(
                  "w-4 h-4 flex-shrink-0 transition-transform group-hover:scale-110",
                  isActive ? "text-white" : ""
                )}
              />
              {!isSidebarCollapsed && (
                <span className="truncate">{label}</span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Collapse toggle */}
      <div className="p-2 border-t border-border/40">
        <Button
          variant="ghost"
          size="icon-sm"
          className="w-full"
          onClick={() => setSidebarCollapsed(!isSidebarCollapsed)}
          aria-label={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <ChevronLeft
            className={cn(
              "w-4 h-4 transition-transform duration-300",
              isSidebarCollapsed && "rotate-180"
            )}
          />
        </Button>
      </div>
    </aside>
  );
}
