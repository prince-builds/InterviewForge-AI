"use client";

import { useRouter } from "next/navigation";
import {
  TrendingUp, FileText, Briefcase, MessageSquare,
  Map, Upload, Plus, Play, AlertCircle
} from "lucide-react";
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, BarChart, Bar, Cell
} from "recharts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/shared/stat-card";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { ScoreRing } from "@/components/shared/score-ring";
import { useDashboardSummary, useRecentActivity } from "@/hooks/use-dashboard";
import { useProfileStore } from "@/store";
import { formatRelativeTime, interviewStatusColor, cn } from "@/lib/utils";

const CHART_COLORS = ["#8b5cf6", "#6366f1", "#3b82f6", "#06b6d4"];

export default function DashboardPage() {
  const router = useRouter();
  const { activeProfile } = useProfileStore();
  const { data: summary, isLoading: summaryLoading } = useDashboardSummary();
  const { data: activity, isLoading: activityLoading } = useRecentActivity();

  if (!activeProfile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <EmptyState
          icon={AlertCircle}
          title="No profile selected"
          description="Create or select a profile to view your dashboard."
          action={{ label: "Go to Profiles", onClick: () => router.push("/profiles") }}
        />
      </div>
    );
  }

  const quickActions = [
    { label: "Upload Resume", icon: Upload, onClick: () => router.push("/resumes"), color: "violet" },
    { label: "Add Job Description", icon: Plus, onClick: () => router.push("/job-descriptions"), color: "indigo" },
    { label: "Start Interview", icon: Play, onClick: () => router.push("/interviews"), color: "blue" },
    { label: "Generate Roadmap", icon: Map, onClick: () => router.push("/roadmaps"), color: "cyan" },
  ] as const;

  // Derive mock trend data from summary
  const scoreHistory = [
    { name: "W1", score: (summary?.average_score ?? 60) - 15 },
    { name: "W2", score: (summary?.average_score ?? 60) - 8 },
    { name: "W3", score: (summary?.average_score ?? 60) - 3 },
    { name: "W4", score: summary?.average_score ?? 60 },
  ].map(d => ({ ...d, score: Math.max(0, Math.min(100, d.score)) }));

  const categoryData = [
    { name: "Technical", value: 72 },
    { name: "HR", value: 85 },
    { name: "System Design", value: 61 },
    { name: "Mixed", value: 78 },
  ];

  return (
    <div className="space-y-8">
      <PageHeader
        title={`Welcome back 👋`}
        description={`Active profile: ${activeProfile.name}`}
      />

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          title="Readiness Score"
          value={summary?.average_score != null ? `${Math.round(summary.average_score)}` : "—"}
          description="Based on latest skill gap"
          icon={TrendingUp}
          iconColor="text-violet-400"
          loading={summaryLoading}
        />
        <StatCard
          title="Interviews Completed"
          value={summary?.total_interviews ?? "—"}
          description="Across all sessions"
          icon={MessageSquare}
          iconColor="text-indigo-400"
          loading={summaryLoading}
        />
        <StatCard
          title="Resumes"
          value={summary?.total_resumes ?? "—"}
          description={`Under ${activeProfile.name}`}
          icon={FileText}
          iconColor="text-blue-400"
          loading={summaryLoading}
        />
        <StatCard
          title="Job Descriptions"
          value={summary?.total_job_descriptions ?? "—"}
          description="Active targets"
          icon={Briefcase}
          iconColor="text-cyan-400"
          loading={summaryLoading}
        />
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Score trend chart */}
        <Card glass className="xl:col-span-2">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Score Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={scoreHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(240,5%,14%)" />
                <XAxis dataKey="name" tick={{ fill: "hsl(240,5%,64%)", fontSize: 12 }} />
                <YAxis domain={[0, 100]} tick={{ fill: "hsl(240,5%,64%)", fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    background: "hsl(240,8%,6%)",
                    border: "1px solid hsl(240,5%,14%)",
                    borderRadius: 12,
                    color: "#fff",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="#8b5cf6"
                  strokeWidth={2.5}
                  dot={{ fill: "#8b5cf6", r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Readiness score ring */}
        <Card glass className="flex flex-col items-center justify-center py-6">
          <CardHeader className="pb-2 text-center">
            <CardTitle className="text-base font-semibold">Readiness Score</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
            {summaryLoading ? (
              <Skeleton className="w-32 h-32 rounded-full" />
            ) : (
              <ScoreRing score={summary?.average_score ?? 0} size="lg" />
            )}
            <p className="text-xs text-muted-foreground text-center max-w-[180px]">
              Based on your latest skill gap analysis
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push("/analytics")}
            >
              View Analytics
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Category performance + quick actions */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Category performance */}
        <Card glass className="xl:col-span-2">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Interview Category Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={categoryData} barSize={28}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(240,5%,14%)" />
                <XAxis dataKey="name" tick={{ fill: "hsl(240,5%,64%)", fontSize: 12 }} />
                <YAxis domain={[0, 100]} tick={{ fill: "hsl(240,5%,64%)", fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    background: "hsl(240,8%,6%)",
                    border: "1px solid hsl(240,5%,14%)",
                    borderRadius: 12,
                    color: "#fff",
                  }}
                />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {categoryData.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Quick actions */}
        <Card glass>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3">
            {quickActions.map(({ label, icon: Icon, onClick }) => (
              <button
                key={label}
                onClick={onClick}
                className="flex flex-col items-center gap-2 p-4 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors text-center group"
              >
                <div className="w-10 h-10 rounded-xl bg-violet-500/10 group-hover:bg-violet-500/20 flex items-center justify-center transition-colors">
                  <Icon className="w-5 h-5 text-violet-400" />
                </div>
                <span className="text-xs font-medium leading-tight">{label}</span>
              </button>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Recent activity */}
      <Card glass>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          {activityLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="w-9 h-9 rounded-xl flex-shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-3.5 w-48" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
              ))}
            </div>
          ) : !activity?.items?.length ? (
            <EmptyState
              icon={MessageSquare}
              title="No activity yet"
              description="Complete your first interview to see activity here."
            />
          ) : (
            <div className="divide-y divide-border/40">
              {activity.items.map((item) => {
                const typeIcon: Record<string, typeof FileText> = {
                  interview: MessageSquare,
                  resume: FileText,
                  job_description: Briefcase,
                  roadmap: Map,
                };
                const Icon = typeIcon[item.type] ?? FileText;

                return (
                  <div key={item.id} className="flex items-center gap-3 py-3">
                    <div className="w-9 h-9 rounded-xl bg-violet-500/10 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-4 h-4 text-violet-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{item.title}</p>
                      <p className="text-xs text-muted-foreground capitalize">
                        {item.type.replace("_", " ")}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {item.status && (
                        <Badge className={cn("text-xs", interviewStatusColor(item.status))}>
                          {item.status.replace("_", " ")}
                        </Badge>
                      )}
                      <span className="text-xs text-muted-foreground">
                        {formatRelativeTime(item.created_at)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
