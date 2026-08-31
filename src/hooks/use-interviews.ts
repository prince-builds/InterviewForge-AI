import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { interviewsApi } from "@/services/api";
import { useProfileStore } from "@/store";
import { getApiErrorMessage } from "@/lib/utils";

export function useInterviews() {
  const { activeProfile } = useProfileStore();
  return useQuery({
    queryKey: ["interviews", activeProfile?.id],
    queryFn: () => interviewsApi.list(activeProfile!.id),
    enabled: !!activeProfile?.id,
  });
}

export function useInterview(interviewId: string | null) {
  const { activeProfile } = useProfileStore();
  return useQuery({
    queryKey: ["interviews", activeProfile?.id, interviewId],
    queryFn: () => interviewsApi.get(activeProfile!.id, interviewId!),
    enabled: !!activeProfile?.id && !!interviewId,
  });
}

export function useGenerateInterview() {
  const qc = useQueryClient();
  const { activeProfile } = useProfileStore();
  return useMutation({
    mutationFn: (data: {
      interview_type?: string;
      question_count?: number;
      count?: number;
      resume_id?: string;
      job_description_id?: string;
      difficulty?: string;
      categories?: string[];
    }) => interviewsApi.generate(activeProfile!.id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["interviews", activeProfile?.id] });
      qc.invalidateQueries({ queryKey: ["interview-questions", activeProfile?.id] });
      toast.success("Interview generated!");
    },
    onError: (err: unknown) => {
      const msg = getApiErrorMessage(
        err,
        "Failed to generate interview questions. Please try again."
      );
      toast.error(msg);
    },
  });
}

export function useCurrentQuestion(interviewId: string | null) {
  const { activeProfile } = useProfileStore();
  return useQuery({
    queryKey: ["interview-session", "current", activeProfile?.id, interviewId],
    queryFn: () => interviewsApi.currentQuestion(activeProfile!.id, interviewId!),
    enabled: !!activeProfile?.id && !!interviewId,
    refetchInterval: false,
  });
}

export function useInterviewProgress(interviewId: string | null) {
  const { activeProfile } = useProfileStore();
  return useQuery({
    queryKey: ["interview-session", "progress", activeProfile?.id, interviewId],
    queryFn: () => interviewsApi.progress(activeProfile!.id, interviewId!),
    enabled: !!activeProfile?.id && !!interviewId,
  });
}

export function useSubmitAnswer(interviewId: string) {
  const qc = useQueryClient();
  const { activeProfile } = useProfileStore();
  return useMutation({
    mutationFn: ({ questionId, text }: { questionId: string; text: string }) =>
      interviewsApi.submitAnswer(activeProfile!.id, interviewId, questionId, text),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["interview-session", "current", activeProfile?.id, interviewId] });
      qc.invalidateQueries({ queryKey: ["interview-session", "progress", activeProfile?.id, interviewId] });
    },
    onError: () => toast.error("Failed to submit answer"),
  });
}

export function useSkipQuestion(interviewId: string) {
  const qc = useQueryClient();
  const { activeProfile } = useProfileStore();
  return useMutation({
    mutationFn: (questionId: string) =>
      interviewsApi.skipQuestion(activeProfile!.id, interviewId, questionId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["interview-session", "current", activeProfile?.id, interviewId] });
      qc.invalidateQueries({ queryKey: ["interview-session", "progress", activeProfile?.id, interviewId] });
      toast.info("Question skipped");
    },
  });
}

export function useNavigateInterview(interviewId: string) {
  const qc = useQueryClient();
  const { activeProfile } = useProfileStore();
  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["interview-session", "current", activeProfile?.id, interviewId] });
    qc.invalidateQueries({ queryKey: ["interview-session", "progress", activeProfile?.id, interviewId] });
  };
  return {
    next: useMutation({
      mutationFn: () => interviewsApi.next(activeProfile!.id, interviewId),
      onSuccess: invalidate,
    }),
    previous: useMutation({
      mutationFn: () => interviewsApi.previous(activeProfile!.id, interviewId),
      onSuccess: invalidate,
    }),
    complete: useMutation({
      mutationFn: () => interviewsApi.complete(activeProfile!.id, interviewId),
      onSuccess: () => {
        invalidate();
        qc.invalidateQueries({ queryKey: ["interviews", activeProfile?.id] });
        toast.success("Interview completed!");
      },
    }),
  };
}
