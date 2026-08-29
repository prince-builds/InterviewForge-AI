"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  CheckCircle, XCircle, SkipForward, Zap, RefreshCw, ChevronDown, ChevronUp,
  TrendingUp, MessageSquare,
} from "lucide-react";
import {
  ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Tooltip,
} from "recharts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/shared/page-header";
import { ScoreRing } from "@/components/shared/score-ring";
import { useInterview } from "@/hooks/use-interviews";
import { useEvaluateAnswer, useReEvaluateAnswer } from "@/hooks/use-evaluations";
import { useProfileStore } from "@/store";
import { categoryColor, difficultyColor, cn } from "@/lib/utils";
import type { GeneratedQuestion, Evaluation } from "@/types";
import { evaluationApi } from "@/services/api";
import { useQuery } from "@tanstack/react-query";

// Individual question evaluation card
function QuestionEvalCard({
  question,
  interviewId,
  answerMap,
}: {
  question: GeneratedQuestion;
  interviewId: string;
  answerMap: Record<string, { text: string; status: string; id: string }>;
}) {
  const { activeProfile } = useProfileStore();
  const [expanded, setExpanded] = useState(false);
  const answerInfo = answerMap[question.id];
  const [evalData, setEvalData] = useState<Evaluation | null>(null);
  const [loadingEval, setLoadingEval] = useState(false);
  const { mutate: evaluate, isPending: evaluating } = useEvaluateAnswer(interviewId);
  const { mutate: reEvaluate, isPending: reEvaluating } = useReEvaluateAnswer(interviewId);

  const handleEvaluate = () => {
    if (!answerInfo?.id) return;
    evaluate(answerInfo.id, {
      onSuccess: (result) => setEvalData(result),
    });
  };

  const handleReEvaluate = () => {
    if (!answerInfo?.id) return;
    reEvaluate(answerInfo.id, {
      onSuccess: (result) => setEvalData(result),
    });
  };

  const isSkipped = answerInfo?.status === "skipped";
  const isUnanswered = !answerInfo || answerInfo.status === "unanswered";

  return (
    <Card glass className="overflow-hidden">
      <CardContent className="p-5">
        {/* Question header */}
        <div className="flex items-start justify-between gap-4 mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <Badge className={cn("text-xs", categoryColor(question.question_category))}>
                {question.question_category.replace("_", " ")}
              </Badge>
              <Badge variant="outline" className={cn("text-xs", difficultyColor(question.difficulty))}>
                {question.difficulty}
              </Badge>
              {isSkipped && <Badge variant="warning" className="text-xs"><SkipForward className="w-3 h-3" />Skipped</Badge>}
              {isUnanswered && <Badge variant="outline" className="text-xs text-muted-foreground">Unanswered</Badge>}
              {evalData && (
                <Badge variant="success" className="text-xs">
                  {evalData.overall_score.toFixed(0)}/100
                </Badge>
              )}
            </div>
            <p className="text-sm font-medium">{question.text}</p>
          </div>
          <div className="flex gap-1 flex-shrink-0">
            {!isSkipped && !isUnanswered && (
              evalData ? (
                <Button variant="ghost" size="sm" onClick={handleReEvaluate} loading={reEvaluating} className="text-xs">
                  <RefreshCw className="w-3.5 h-3.5" /> Re-eval
                </Button>
              ) : (
                <Button size="sm" onClick={handleEvaluate} loading={evaluating} className="text-xs">
                  <Zap className="w-3.5 h-3.5" /> Evaluate
                </Button>
              )
            )}
            {(answerInfo?.text || evalData) && (
              <Button variant="ghost" size="icon-sm" onClick={() => setExpanded(!expanded)}>
                {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </Button>
            )}
          </div>
        </div>

        {/* Answer preview */}
        {answerInfo?.text && (
          <div className="p-3 rounded-xl bg-secondary/50 border border-border/40 text-sm mb-3">
            <p className="text-xs text-muted-foreground mb-1 font-medium">Your Answer</p>
            <p className={cn("text-sm", !expanded && "line-clamp-2")}>{answerInfo.text}</p>
          </div>
        )}

        {/* Evaluation result */}
        {evalData && expanded && (
          <div className="space-y-4 mt-4 pt-4 border-t border-border/40">
            {/* Scores */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: "Correctness", val: evalData.correctness_score, weight: "40%" },
                { label: "Depth", val: evalData.depth_score, weight: "30%" },
                { label: "Clarity", val: evalData.communication_score, weight: "15%" },
                { label: "Relevance", val: evalData.relevance_score, weight: "15%" },
              ].map(({ label, val, weight }) => (
                <div key={label} className="text-center p-3 rounded-xl bg-secondary/50">
                  <div className="text-xl font-bold gradient-text">{val.toFixed(1)}</div>
                  <div className="text-xs font-medium">{label}</div>
                  <div className="text-[10px] text-muted-foreground">{weight} weight</div>
                </div>
              ))}
            </div>

            {/* Strengths & Weaknesses */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-semibold text-emerald-400 uppercase tracking-wide mb-2">Strengths</p>
                <ul className="space-y-1">
                  {evalData.strengths.map((s, i) => (
                    <li key={i} className="flex gap-2 text-xs">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-xs font-semibold text-red-400 uppercase tracking-wide mb-2">Weaknesses</p>
                <ul className="space-y-1">
                  {evalData.weaknesses.map((w, i) => (
                    <li key={i} className="flex gap-2 text-xs">
                      <XCircle className="w-3.5 h-3.5 text-red-400 flex-shrink-0 mt-0.5" />
                      <span>{w}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Missing concepts */}
            {evalData.missing_concepts.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-yellow-400 uppercase tracking-wide mb-2">Missing Concepts</p>
                <div className="flex flex-wrap gap-1.5">
                  {evalData.missing_concepts.map((c, i) => (
                    <Badge key={i} variant="warning" className="text-xs">{c}</Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Improved answer */}
            <div>
              <p className="text-xs font-semibold text-violet-400 uppercase tracking-wide mb-2">Model Answer</p>
              <div className="p-3 rounded-xl bg-violet-500/10 border border-violet-500/20 text-sm">
                {evalData.improved_answer}
              </div>
            </div>

            <p className="text-xs text-muted-foreground italic">{evalData.evaluation_summary}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function InterviewResultsPage() {
  const { id: interviewId } = useParams<{ id: string }>();
  const router = useRouter();
  const { activeProfile } = useProfileStore();

  const { data: interview, isLoading } = useInterview(interviewId);

  if (!activeProfile) return null;

  if (isLoading) {
    return (
      <div className="space-y-4 max-w-4xl mx-auto">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  const questions = interview?.questions ?? [];
  // Build a simple answer map from question order — in production each question
  // would be fetched individually, but the detail endpoint gives us questions with IDs
  const answerMap: Record<string, { text: string; status: string; id: string }> = {};

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <PageHeader
        title="Interview Results"
        description={interview?.title}
        actions={
          <Button variant="outline" onClick={() => router.push("/interviews")}>
            ← Back
          </Button>
        }
      />

      {/* Summary card */}
      <Card glass>
        <CardContent className="p-6">
          <div className="flex items-center gap-6">
            <ScoreRing score={0} size="md" showLabel />
            <div className="flex-1 space-y-2">
              <p className="font-medium">
                {questions.length} questions · {interview?.estimated_duration_minutes} min estimated
              </p>
              <p className="text-sm text-muted-foreground">
                Click <strong>Evaluate</strong> on each answered question to get AI feedback and scores.
                Use <strong>Re-evaluate</strong> to refresh with updated context.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Questions */}
      <div className="space-y-4">
        {questions.map((q) => (
          <QuestionEvalCard
            key={q.id}
            question={q}
            interviewId={interviewId}
            answerMap={answerMap}
          />
        ))}
      </div>
    </div>
  );
}
