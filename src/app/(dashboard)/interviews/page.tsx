"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { MessageSquare, Plus, Play, AlertCircle, Clock, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { useInterviews, useGenerateInterview } from "@/hooks/use-interviews";
import { useProfileStore } from "@/store";
import {
  formatRelativeTime, interviewStatusColor, interviewTypeLabel, cn,
} from "@/lib/utils";

const schema = z.object({
  interview_type: z.enum(["technical", "hr", "system_design", "mixed"]),
  question_count: z.coerce.number().min(5).max(20),
});
type FormData = z.infer<typeof schema>;

function GenerateDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { mutate: generate, isPending } = useGenerateInterview();
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { interview_type: "technical", question_count: 10 },
  });

  const onSubmit = (data: FormData) => {
    generate(
      {
        count: data.question_count,
        question_count: data.question_count,
        interview_type: data.interview_type,
      },
      { onSuccess: () => onClose() }
    );
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>Generate Interview</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-2">
            <Label>Interview Type</Label>
            <Select
              defaultValue="technical"
              onValueChange={(v) => setValue("interview_type", v as FormData["interview_type"])}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="technical">Technical</SelectItem>
                <SelectItem value="hr">HR / Behavioral</SelectItem>
                <SelectItem value="system_design">System Design</SelectItem>
                <SelectItem value="mixed">Mixed</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Number of Questions: {watch("question_count")}</Label>
            <input
              type="range"
              min={5}
              max={20}
              step={1}
              className="w-full accent-violet-500"
              {...register("question_count")}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>5</span><span>20</span>
            </div>
          </div>
          <div className="p-3 rounded-xl bg-violet-500/10 border border-violet-500/20 text-xs text-muted-foreground">
            Interview uses your active resume and active job description for context.
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" loading={isPending}>Generate Interview</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function InterviewsPage() {
  const router = useRouter();
  const [genOpen, setGenOpen] = useState(false);
  const { activeProfile } = useProfileStore();
  const { data, isLoading } = useInterviews();

  const interviews = data?.items ?? [];

  if (!activeProfile) {
    return <EmptyState icon={AlertCircle} title="No active profile" description="Select a profile first." />;
  }

  return (
    <div>
      <PageHeader
        title="Interviews"
        description={`AI-generated mock interviews for ${activeProfile.name}`}
        actions={
          <Button onClick={() => setGenOpen(true)}>
            <Plus className="w-4 h-4" /> Generate Interview
          </Button>
        }
      />

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} glass><CardContent className="p-5 space-y-3">
              <Skeleton className="h-5 w-56" /><Skeleton className="h-4 w-32" />
            </CardContent></Card>
          ))}
        </div>
      ) : interviews.length === 0 ? (
        <EmptyState
          icon={MessageSquare}
          title="No interviews yet"
          description="Generate a personalized interview based on your resume and target job description."
          action={{ label: "Generate Interview", onClick: () => setGenOpen(true) }}
        />
      ) : (
        <div className="space-y-3">
          {interviews.map((iv) => (
            <Card key={iv.id} glass className="hover:border-violet-500/20 transition-all group">
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center flex-shrink-0">
                      <MessageSquare className="w-5 h-5 text-violet-400" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold truncate">{iv.title}</h3>
                      <div className="flex items-center gap-3 mt-1 flex-wrap">
                        <Badge className={cn("text-xs", interviewStatusColor(iv.status))}>
                          {iv.status.replace("_", " ")}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {interviewTypeLabel(iv.interview_type)}
                        </Badge>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {iv.estimated_duration_minutes} min
                        </span>
                        <span className="text-xs text-muted-foreground">{formatRelativeTime(iv.created_at)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    {iv.status === "completed" ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/interviews/${iv.id}/results`)}
                      >
                        <CheckCircle className="w-4 h-4" /> View Results
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => router.push(`/interviews/${iv.id}`)}
                      >
                        <Play className="w-4 h-4" />
                        {iv.status === "pending" ? "Start" : "Continue"}
                      </Button>
                    )}
                  </div>
                </div>
                {(iv.status === "in_progress" || iv.status === "pending") && (
                  <div className="mt-4">
                    <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
                      <span>Progress</span>
                      <span>{iv.current_question_index}/{iv.question_count}</span>
                    </div>
                    <Progress value={(iv.current_question_index / iv.question_count) * 100} className="h-1.5" />
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <GenerateDialog open={genOpen} onClose={() => setGenOpen(false)} />
    </div>
  );
}
