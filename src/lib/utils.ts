import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatRelativeTime(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffDays > 7) return formatDate(dateString);
  if (diffDays > 0) return `${diffDays}d ago`;
  if (diffHours > 0) return `${diffHours}h ago`;
  if (diffMins > 0) return `${diffMins}m ago`;
  return "just now";
}

export function scoreToColor(score: number): string {
  if (score >= 80) return "text-emerald-400";
  if (score >= 60) return "text-yellow-400";
  if (score >= 40) return "text-orange-400";
  return "text-red-400";
}

export function scoreToLabel(score: number): string {
  if (score >= 80) return "Excellent";
  if (score >= 65) return "Good";
  if (score >= 50) return "Developing";
  return "Needs Work";
}

export function priorityToColor(priority: string): string {
  switch (priority.toLowerCase()) {
    case "critical": return "bg-red-500/20 text-red-400 border-red-500/30";
    case "high": return "bg-orange-500/20 text-orange-400 border-orange-500/30";
    case "medium": return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
    default: return "bg-muted text-muted-foreground border-border";
  }
}

export function interviewTypeLabel(type: string): string {
  const map: Record<string, string> = {
    technical: "Technical",
    hr: "HR",
    system_design: "System Design",
    mixed: "Mixed",
  };
  return map[type] ?? type;
}

export function difficultyColor(difficulty: string): string {
  switch (difficulty) {
    case "easy": return "text-emerald-400";
    case "medium": return "text-yellow-400";
    case "hard": return "text-red-400";
    default: return "text-muted-foreground";
  }
}

export function categoryColor(category: string): string {
  const map: Record<string, string> = {
    skill_gap: "bg-violet-500/20 text-violet-300",
    project: "bg-blue-500/20 text-blue-300",
    job_description: "bg-indigo-500/20 text-indigo-300",
    behavioral: "bg-pink-500/20 text-pink-300",
    resume: "bg-emerald-500/20 text-emerald-300",
  };
  return map[category] ?? "bg-muted text-muted-foreground";
}

export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength) + "…";
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function roadmapTypeLabel(type: string): string {
  const map: Record<string, string> = {
    "7_DAY": "7-Day",
    "14_DAY": "14-Day",
    "30_DAY": "30-Day",
  };
  return map[type] ?? type;
}

export function agentStatusColor(status: string): string {
  const map: Record<string, string> = {
    pending: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    running: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    completed: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    failed: "bg-red-500/20 text-red-400 border-red-500/30",
    partial: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  };
  return map[status] ?? "bg-muted text-muted-foreground";
}

export function interviewStatusColor(status: string): string {
  const map: Record<string, string> = {
    pending: "bg-muted text-muted-foreground",
    in_progress: "bg-blue-500/20 text-blue-400",
    completed: "bg-emerald-500/20 text-emerald-400",
    cancelled: "bg-red-500/20 text-red-400",
  };
  return map[status] ?? "bg-muted text-muted-foreground";
}

export function getApiErrorMessage(
  err: unknown,
  fallback = "An unexpected error occurred. Please try again."
): string {
  if (!err || typeof err !== "object") return fallback;
  const errorObj = err as {
    message?: string;
    response?: {
      data?: {
        error?: { message?: string; detail?: string };
        detail?: string | Array<{ msg?: string; message?: string }>;
        message?: string;
      };
    };
  };

  if (errorObj.message === "Network Error" || !errorObj.response) {
    return "Unable to connect to backend server. Please verify the backend is running.";
  }

  const data = errorObj.response?.data;
  if (data?.error?.message && typeof data.error.message === "string") {
    return data.error.message;
  }
  if (data?.error?.detail && typeof data.error.detail === "string") {
    return data.error.detail;
  }
  if (data?.detail) {
    if (typeof data.detail === "string") {
      return data.detail;
    }
    if (Array.isArray(data.detail) && data.detail.length > 0) {
      return data.detail
        .map((d) => (typeof d === "string" ? d : d.msg || d.message || JSON.stringify(d)))
        .join(", ");
    }
  }
  if (data?.message && typeof data.message === "string") {
    return data.message;
  }
  return fallback;
}

