"use client";

import { useState } from "react";
import {
  TrendingUp, AlertCircle, CheckCircle2, XCircle, Zap, BarChart3, ChevronDown, ChevronUp,
} from "lucide-react";
import {
  ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, Radar,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell,
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
import { useSkillGapReports, useRunSkillGap } from "@/hooks/use-skill-gap";
import { useProfileStore } from "@/store";
import { formatRelativeTime, cn } from "@/lib/utils";
import type { SkillGapReport } from "@/types";

function ReportDetail({ report }: { report: SkillGapReport }) {
  const [showAll, setShowAll] = useState(false);

  const missingRequired = report.missing_skills.filter((s) => s.is_required);
  const missingPreferred = report.missing_skills.filter((s) => !s.is_required);

  const radarData = [
    { subject: "Required Skills", score: report.score_explanation.matched_required_count / Math.max(report.score_explanation.required_skill_count, 1) * 100 },
    { subject: "Preferred Skills", score: report.score_explanation.matched_preferred_count / Math.max(report.score_explanation.preferred_skill_count, 1) * 100 },
    { subject: "Overall Readiness", score: report.readiness_score },
  ];

  const visibleMissing = showAll ? report.missing_skills : report.missing_skills.slice(0, 6);

  return (
    <div className="space-y-6">
      {/* Score + summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card glass className="flex flex-col items-center justify-center py-6 md:col-span-1">
          <ScoreRing score={report.readiness_score} size="lg" />
          <p className="text-xs text-muted-foreground mt-3 text-center px-4">{report.analysis_summary}</p>
        </Card>

        <Card glass className="md:col-span-2">
          <CardHeader><CardTitle className="text-sm">Score Breakdown</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span>Required Skills ({report.score_explanation.matched_required_count}/{report.score_explanation.required_skill_count})</span>
                <span className="font-medium">{report.score_explanation.weighted_required_score.toFixed(1)}/80</span>
              </div>
              <Progress value={(report.score_explanation.weighted_required_score / 80) * 100} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span>Preferred Skills ({report.score_explanation.matched_preferred_count}/{report.score_explanation.preferred_skill_count})</span>
                <span className="font-medium">{report.score_explanation.weighted_preferred_score.toFixed(1)}/20</span>
              </div>
              <Progress value={(report.score_explanation.weighted_preferred_score / 20) * 100} className="h-2" />
            </div>
            <p className="text-[11px] text-muted-foreground font-mono mt-2">{report.score_explanation.formula}</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs: matched, missing, recommendations */}
      <Tabs defaultValue="missing">
        <TabsList>
          <TabsTrigger value="matched">Matched ({report.matched_skills.length})</TabsTrigger>
          <TabsTrigger value="missing">Missing ({report.missing_skills.length})</TabsTrigger>
          <TabsTrigger value="recommendations">Top Picks ({report.recommended_skills.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="matched">
          <Card glass>
            <CardContent className="p-4 flex flex-wrap gap-2">
              {report.matched_skills.map((s) => (
                <div key={s.name} className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-2.5 py-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  <span className="text-xs font-medium text-emerald-300">{s.name}</span>
                  {s.is_required && <span className="text-[10px] text-muted-foreground">req</span>}
                </div>
              ))}
              {report.matched_skills.length === 0 && <p className="text-sm text-muted-foreground">No matched skills</p>}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="missing">
          <Card glass>
            <CardContent className="p-4">
              {missingRequired.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs font-semibold text-red-400 uppercase tracking-wide mb-2">Required — Missing</p>
                  <div className="flex flex-wrap gap-2">
                    {missingRequired.map((s) => (
                      <div key={s.name} className="flex items-center gap-1.5 bg-red-500/10 border border-red-500/20 rounded-lg px-2.5 py-1">
                        <XCircle className="w-3 h-3 text-red-400" />
                        <span className="text-xs font-medium text-red-300">{s.name}</span>
                        <span className="text-[10px] text-muted-foreground">{(s.importance_score * 10).toFixed(0)}/10</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {missingPreferred.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-yellow-400 uppercase tracking-wide mb-2">Preferred — Missing</p>
                  <div className="flex flex-wrap gap-2">
                    {visibleMissing.filter(s => !s.is_required).map((s) => (
                      <Badge key={s.name} variant="warning" className="text-xs">{s.name}</Badge>
                    ))}
                  </div>
                </div>
              )}
              {report.missing_skills.length > 6 && (
                <Button variant="ghost" size="sm" className="mt-3 w-full" onClick={() => setShowAll(!showAll)}>
                  {showAll ? <><ChevronUp className="w-3.5 h-3.5" />Show less</> : <><ChevronDown className="w-3.5 h-3.5" />Show all {report.missing_skills.length}</>}
                </Button>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recommendations">
          <div className="space-y-3">
            {report.recommended_skills.map((s, i) => (
              <Card key={s.name} glass className="p-4">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-lg gradient-brand flex items-center justify-center text-sm font-bold text-white flex-shrink-0">
                    {s.priority_rank}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{s.name}</span>
                      {s.is_required && <Badge variant="destructive" className="text-[10px]">Required</Badge>}
                    </div>
                    <Progress value={s.importance_score * 100} className="h-1.5 mt-2" />
                  </div>
                  <span className="text-xs text-muted-foreground">{(s.importance_score * 10).toFixed(1)}/10</span>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function SkillGapPage() {
  const { activeProfile } = useProfileStore();
  const { data, isLoading } = useSkillGapReports();
  const { mutate: runAnalysis, isPending } = useRunSkillGap();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const reports = data?.items ?? [];
  const selected = reports.find((r) => r.id === selectedId) ?? reports[0] ?? null;

  if (!activeProfile) {
    return <EmptyState icon={AlertCircle} title="No active profile" description="Select a profile first." />;
  }

  return (
    <div>
      <PageHeader
        title="Skill Gap Analysis"
        description="Compare your resume skills against job requirements"
        actions={
          <Button onClick={() => runAnalysis()} loading={isPending}>
            <Zap className="w-4 h-4" /> Run Analysis
          </Button>
        }
      />

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      ) : reports.length === 0 ? (
        <EmptyState
          icon={BarChart3}
          title="No skill gap reports yet"
          description="Run an analysis to compare your resume skills against your active job description."
          action={{ label: "Run Analysis", onClick: () => runAnalysis() }}
        />
      ) : (
        <div className="space-y-6">
          {/* Report selector */}
          {reports.length > 1 && (
            <div className="flex gap-2 flex-wrap">
              {reports.map((r) => (
                <button
                  key={r.id}
                  onClick={() => setSelectedId(r.id)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
                    (selectedId === r.id || (!selectedId && r.id === reports[0].id))
                      ? "gradient-brand text-white"
                      : "bg-secondary text-muted-foreground hover:text-foreground"
                  )}
                >
                  {formatRelativeTime(r.created_at)} — {r.readiness_score.toFixed(0)}/100
                </button>
              ))}
            </div>
          )}

          {selected && <ReportDetail report={selected as SkillGapReport} />}
        </div>
      )}
    </div>
  );
}
