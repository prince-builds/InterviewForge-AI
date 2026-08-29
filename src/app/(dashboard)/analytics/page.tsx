"use client";

import { useRouter } from "next/navigation";
import { BarChart3, Zap, TrendingUp, TrendingDown, AlertTriangle, AlertCircle } from "lucide-react";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Cell, LineChart, Line, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis,
} from "recharts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { ScoreRing } from "@/components/shared/score-ring";
import { StatCard } from "@/components/shared/stat-card";
import { useAnalytics, useLatestAnalytics, useGenerateAnalytics } from "@/hooks/use-analytics";
import { useProfileStore } from "@/store";
import { formatRelativeTime, priorityToColor, cn } from "@/lib/utils";

const CHART_COLORS = ["#8b5cf6", "#6366f1", "#3b82f6", "#06b6d4", "#10b981"];

function SkeletonAnalytics() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-28 rounded-2xl" />)}
      </div>
      <Skeleton className="h-64 rounded-2xl" />
      <div className="grid md:grid-cols-2 gap-4">
        <Skeleton className="h-64 rounded-2xl" />
        <Skeleton className="h-64 rounded-2xl" />
      </div>
    </div>
  );
}

export default function AnalyticsPage() {
  const { activeProfile } = useProfileStore();
  const { data: allData, isLoading } = useAnalytics();
  const { data: latest } = useLatestAnalytics();
  const { mutate: generate, isPending } = useGenerateAnalytics();
  const router = useRouter();

  if (!activeProfile) {
    return <EmptyState icon={AlertCircle} title="No active profile" description="Select a profile first." />;
  }

  const snapshots = allData?.items ?? [];

  // Build trend data from snapshots (oldest to newest)
  const trendData = [...snapshots].reverse().map((s, i) => ({
    name: `Snap ${i + 1}`,
    score: s.average_score ?? 0,
    interviews: s.interview_count,
  }));

  const strongestChartData = (latest?.strongest_skills ?? []).map((s) => ({
    name: s.name.length > 10 ? s.name.slice(0, 10) + "…" : s.name,
    score: s.average_score,
    count: s.occurrence_count,
  }));

  const weakestChartData = (latest?.weakest_skills ?? []).map((s) => ({
    name: s.name.length > 10 ? s.name.slice(0, 10) + "…" : s.name,
    score: s.average_score,
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Analytics"
        description="Performance insights across all your interview sessions"
        actions={
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push("/analytics/skill-gap")}
            >
              Skill Gap →
            </Button>
            <Button onClick={() => generate()} loading={isPending}>
              <Zap className="w-4 h-4" /> Generate Snapshot
            </Button>
          </div>
        }
      />

      {isLoading ? (
        <SkeletonAnalytics />
      ) : snapshots.length === 0 ? (
        <EmptyState
          icon={BarChart3}
          title="No analytics snapshots yet"
          description="Complete at least one interview, then generate a snapshot to see your performance analytics."
          action={{ label: "Generate Snapshot", onClick: () => generate() }}
        />
      ) : (
        <>
          {/* Summary stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="col-span-2 md:col-span-1 flex items-center justify-center">
              <ScoreRing score={latest?.average_score ?? 0} size="lg" />
            </div>
            <StatCard
              title="Interviews Completed"
              value={latest?.interview_count ?? 0}
              icon={BarChart3}
              iconColor="text-violet-400"
            />
            <StatCard
              title="Strong Categories"
              value={latest?.strongest_skills?.length ?? 0}
              icon={TrendingUp}
              iconColor="text-emerald-400"
            />
            <StatCard
              title="Weak Areas"
              value={latest?.weakest_skills?.length ?? 0}
              icon={TrendingDown}
              iconColor="text-red-400"
            />
          </div>

          {/* Summary text */}
          {latest?.trend_summary && (
            <Card glass>
              <CardContent className="p-4 text-sm text-muted-foreground">
                {latest.trend_summary}
              </CardContent>
            </Card>
          )}

          {/* Charts */}
          <Tabs defaultValue="trend">
            <TabsList>
              <TabsTrigger value="trend">Score Trend</TabsTrigger>
              <TabsTrigger value="strongest">Strengths</TabsTrigger>
              <TabsTrigger value="weakest">Weaknesses</TabsTrigger>
              <TabsTrigger value="improvements">Improvement Areas</TabsTrigger>
            </TabsList>

            <TabsContent value="trend">
              <Card glass>
                <CardHeader>
                  <CardTitle className="text-sm">Average Score Over Snapshots</CardTitle>
                </CardHeader>
                <CardContent>
                  {trendData.length < 2 ? (
                    <div className="flex items-center justify-center h-40 text-sm text-muted-foreground">
                      Generate more snapshots to see trends
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height={220}>
                      <LineChart data={trendData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(240,5%,14%)" />
                        <XAxis dataKey="name" tick={{ fill: "hsl(240,5%,64%)", fontSize: 12 }} />
                        <YAxis domain={[0, 100]} tick={{ fill: "hsl(240,5%,64%)", fontSize: 12 }} />
                        <Tooltip
                          contentStyle={{ background: "hsl(240,8%,6%)", border: "1px solid hsl(240,5%,14%)", borderRadius: 12, color: "#fff" }}
                        />
                        <Line type="monotone" dataKey="score" stroke="#8b5cf6" strokeWidth={2.5} dot={{ fill: "#8b5cf6", r: 4 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="strongest">
              <Card glass>
                <CardHeader><CardTitle className="text-sm">Strongest Skill Categories</CardTitle></CardHeader>
                <CardContent>
                  {strongestChartData.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">No strong skills detected yet</p>
                  ) : (
                    <ResponsiveContainer width="100%" height={220}>
                      <BarChart data={strongestChartData} barSize={32}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(240,5%,14%)" />
                        <XAxis dataKey="name" tick={{ fill: "hsl(240,5%,64%)", fontSize: 11 }} />
                        <YAxis domain={[0, 100]} tick={{ fill: "hsl(240,5%,64%)", fontSize: 11 }} />
                        <Tooltip contentStyle={{ background: "hsl(240,8%,6%)", border: "1px solid hsl(240,5%,14%)", borderRadius: 12, color: "#fff" }} />
                        <Bar dataKey="score" radius={[6, 6, 0, 0]}>
                          {strongestChartData.map((_, i) => (
                            <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="weakest">
              <Card glass>
                <CardHeader><CardTitle className="text-sm">Weakest Skill Categories</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  {(latest?.weakest_skills ?? []).length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">No weak areas detected</p>
                  ) : (
                    (latest?.weakest_skills ?? []).map((skill) => (
                      <div key={skill.name}>
                        <div className="flex justify-between text-sm mb-1.5">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{skill.name}</span>
                            {skill.is_required_by_jd && (
                              <Badge variant="destructive" className="text-[10px]">JD Required</Badge>
                            )}
                          </div>
                          <span className="text-muted-foreground">{skill.average_score.toFixed(1)}/100</span>
                        </div>
                        <Progress
                          value={skill.average_score}
                          className="h-2"
                          indicatorClassName={skill.average_score < 40 ? "bg-red-500" : "bg-orange-500"}
                        />
                        <p className="text-xs text-muted-foreground mt-0.5">{skill.occurrence_count} occurrence(s)</p>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="improvements">
              <div className="space-y-3">
                {(latest?.improvement_areas ?? []).length === 0 ? (
                  <Card glass>
                    <CardContent className="flex items-center justify-center py-16 text-sm text-muted-foreground">
                      No improvement areas identified yet
                    </CardContent>
                  </Card>
                ) : (
                  (latest?.improvement_areas ?? []).map((area, i) => (
                    <Card key={i} glass className="p-4">
                      <div className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center text-sm font-bold flex-shrink-0">
                          {i + 1}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className="font-medium text-sm capitalize">{area.topic}</span>
                            <Badge className={cn("text-xs", priorityToColor(area.priority))}>
                              {area.priority}
                            </Badge>
                            <Badge variant="outline" className="text-xs capitalize">{area.source.replace("_", " ")}</Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">Frequency: {area.frequency} occurrence(s)</p>
                        </div>
                        <AlertTriangle className={cn("w-4 h-4 flex-shrink-0", area.priority === "critical" ? "text-red-400" : "text-yellow-400")} />
                      </div>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>
          </Tabs>

          {/* Snapshot history */}
          {snapshots.length > 1 && (
            <Card glass>
              <CardHeader><CardTitle className="text-sm">Snapshot History</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {snapshots.map((s) => (
                    <div key={s.id} className="flex items-center justify-between py-2 border-b border-border/40 last:border-0">
                      <span className="text-xs text-muted-foreground">{formatRelativeTime(s.created_at)}</span>
                      <div className="flex items-center gap-4">
                        <span className="text-xs">{s.interview_count} interviews</span>
                        <Badge variant={s.average_score && s.average_score >= 70 ? "success" : "warning"} className="text-xs">
                          {s.average_score?.toFixed(1) ?? "—"}/100
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
