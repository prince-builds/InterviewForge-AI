"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ChevronLeft, ChevronRight, SkipForward, CheckCircle, Clock,
  MessageSquare, AlertCircle, Trophy,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  useInterview, useCurrentQuestion, useInterviewProgress,
  useSubmitAnswer, useSkipQuestion, useNavigateInterview,
} from "@/hooks/use-interviews";
import { useProfileStore } from "@/store";
import { difficultyColor, categoryColor, cn, interviewTypeLabel } from "@/lib/utils";

export default function InterviewSessionPage() {
  const { id: interviewId } = useParams<{ id: string }>();
  const router = useRouter();
  const { activeProfile } = useProfileStore();

  const [answerText, setAnswerText] = useState("");
  const [completeDialogOpen, setCompleteDialogOpen] = useState(false);

  const { data: interview } = useInterview(interviewId);
  const { data: currentQ, isLoading: loadingQ } = useCurrentQuestion(interviewId);
  const { data: progress } = useInterviewProgress(interviewId);
  const { mutate: submitAnswer, isPending: submitting } = useSubmitAnswer(interviewId);
  const { mutate: skipQuestion, isPending: skipping } = useSkipQuestion(interviewId);
  const { next, previous, complete } = useNavigateInterview(interviewId);

  // Pre-populate if question already has an answer
  useEffect(() => {
    if (currentQ?.existing_answer?.answer_text) {
      setAnswerText(currentQ.existing_answer.answer_text);
    } else {
      setAnswerText("");
    }
  }, [currentQ?.question?.id, currentQ?.existing_answer?.answer_text]);

  if (!activeProfile) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <p className="text-muted-foreground">No active profile</p>
    </div>
  );

  if ((interview as any)?.status === "completed") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
        <div className="w-20 h-20 rounded-2xl gradient-brand flex items-center justify-center shadow-glow-violet">
          <Trophy className="w-10 h-10 text-white" />
        </div>
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Interview Completed!</h2>
          <p className="text-muted-foreground">
            You answered {progress?.answered_questions ?? 0} of {progress?.total_questions ?? 0} questions.
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => router.push("/interviews")}>
            Back to Interviews
          </Button>
          <Button onClick={() => router.push(`/interviews/${interviewId}/results`)}>
            View Results & Evaluation
          </Button>
        </div>
      </div>
    );
  }

  const fallbackQuestion = (interview as any)?.question
    ? {
        id: interview!.id,
        text: (interview as any).question,
        question_category: (interview as any).category ?? "technical",
        difficulty: (interview as any).difficulty ?? "medium",
        topic: (interview as any).skill ?? null,
        order_index: 0,
      }
    : null;

  const question = currentQ?.question ?? fallbackQuestion;
  const questionIdx = currentQ?.current_question_index ?? 0;
  const totalQ = progress?.total_questions ?? (interview as any)?.question_count ?? 1;
  const pct = progress?.completion_percentage ?? (question ? 100 : 0);

  const handleSubmit = () => {
    if (!question || !answerText.trim()) return;
    submitAnswer({ questionId: question.id, text: answerText }, {
      onSuccess: () => setAnswerText(""),
    });
  };

  const handleSkip = () => {
    if (!question) return;
    skipQuestion(question.id, { onSuccess: () => setAnswerText("") });
  };

  const handleComplete = () => {
    complete.mutate(undefined, {
      onSuccess: () => {
        setCompleteDialogOpen(false);
        router.push(`/interviews/${interviewId}/results`);
      },
    });
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold line-clamp-2">
            {(interview as any)?.question ?? (interview as any)?.title ?? "Interview Question"}
          </h1>
          <div className="flex items-center gap-3 mt-1">
            <Badge variant="secondary" className="text-xs capitalize">
              {interviewTypeLabel((interview as any)?.category ?? (interview as any)?.interview_type ?? "technical")}
            </Badge>
            {(interview as any)?.estimated_duration_minutes && (
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="w-3 h-3" /> ~{(interview as any).estimated_duration_minutes} min
              </span>
            )}
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCompleteDialogOpen(true)}
          className="text-xs"
        >
          <CheckCircle className="w-3.5 h-3.5" /> End Interview
        </Button>
      </div>

      {/* Progress bar */}
      <div className="mb-6">
        <div className="flex justify-between text-xs text-muted-foreground mb-2">
          <span>Question {questionIdx + 1} of {totalQ}</span>
          <span>
            {progress?.answered_questions ?? 0} answered · {progress?.skipped_questions ?? 0} skipped
          </span>
        </div>
        <Progress value={pct} className="h-2" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Question navigator sidebar */}
        <div className="lg:col-span-1 order-2 lg:order-1">
          <Card glass>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs text-muted-foreground uppercase tracking-wide">
                Questions
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3">
              <div className="grid grid-cols-5 lg:grid-cols-3 gap-1.5">
                {Array.from({ length: totalQ }).map((_, i) => {
                  const isCurrentQ = i === questionIdx;
                  const isAnswered = (progress?.answered_questions ?? 0) > 0 && i < questionIdx;
                  return (
                    <button
                      key={i}
                      className={cn(
                        "w-full aspect-square rounded-lg text-xs font-medium transition-all",
                        isCurrentQ
                          ? "gradient-brand text-white shadow-sm"
                          : isAnswered
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/20"
                          : "bg-secondary text-muted-foreground hover:bg-secondary/80"
                      )}
                      onClick={() => {
                        // Navigate to specific question via next/previous chain
                      }}
                    >
                      {i + 1}
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main question area */}
        <div className="lg:col-span-3 order-1 lg:order-2 space-y-4">
          {loadingQ && !question ? (
            <Card glass>
              <CardContent className="p-6 space-y-4">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-32 w-full" />
              </CardContent>
            </Card>
          ) : !question ? (
            <Card glass>
              <CardContent className="flex flex-col items-center justify-center py-16">
                <AlertCircle className="w-8 h-8 text-muted-foreground mb-3" />
                <p className="text-muted-foreground">No question available</p>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Question card */}
              <Card glass>
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-4 flex-wrap">
                    <Badge className={cn("text-xs", categoryColor(question.question_category))}>
                      {question.question_category.replace("_", " ")}
                    </Badge>
                    <Badge variant="outline" className={cn("text-xs", difficultyColor(question.difficulty))}>
                      {question.difficulty}
                    </Badge>
                    {question.topic && (
                      <span className="text-xs text-muted-foreground"># {question.topic}</span>
                    )}
                  </div>
                  <p className="text-base leading-relaxed">{question.text}</p>
                </CardContent>
              </Card>

              {/* Answer area */}
              <Card glass>
                <CardContent className="p-6">
                  <label className="text-sm font-medium text-muted-foreground block mb-3">
                    Your Answer
                  </label>
                  <Textarea
                    value={answerText}
                    onChange={(e) => setAnswerText(e.target.value)}
                    placeholder="Type your answer here… Be specific and use examples where possible."
                    rows={7}
                    className="text-sm"
                  />
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-muted-foreground">
                      {answerText.length} characters
                    </span>
                    {currentQ?.existing_answer && (
                      <Badge variant="success" className="text-xs">Previously answered</Badge>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Navigation controls */}
              <div className="flex items-center justify-between gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => previous.mutate()}
                  disabled={questionIdx === 0 || previous.isPending}
                >
                  <ChevronLeft className="w-4 h-4" /> Previous
                </Button>

                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleSkip}
                    loading={skipping}
                    className="text-muted-foreground"
                  >
                    <SkipForward className="w-4 h-4" /> Skip
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    loading={submitting}
                    disabled={!answerText.trim()}
                  >
                    Save & Next
                  </Button>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => next.mutate()}
                  disabled={questionIdx >= totalQ - 1 || next.isPending}
                >
                  Next <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Complete confirmation dialog */}
      <Dialog open={completeDialogOpen} onOpenChange={setCompleteDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>End Interview?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            You have answered {progress?.answered_questions ?? 0} and skipped{" "}
            {progress?.skipped_questions ?? 0} questions. Remaining questions will be left
            unanswered. You can still view results and run evaluations after completion.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCompleteDialogOpen(false)}>
              Continue Interview
            </Button>
            <Button onClick={handleComplete} loading={complete.isPending}>
              End Interview
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
