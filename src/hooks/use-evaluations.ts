import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { evaluationApi } from "@/services/api";
import { useProfileStore } from "@/store";

export function useEvaluation(interviewId: string, answerId: string | null) {
  const { activeProfile } = useProfileStore();
  return useQuery({
    queryKey: ["evaluation", activeProfile?.id, interviewId, answerId],
    queryFn: () => evaluationApi.get(activeProfile!.id, interviewId, answerId!),
    enabled: !!activeProfile?.id && !!interviewId && !!answerId,
    retry: false,
  });
}

export function useEvaluateAnswer(interviewId: string) {
  const qc = useQueryClient();
  const { activeProfile } = useProfileStore();
  return useMutation({
    mutationFn: (answerId: string) =>
      evaluationApi.evaluate(activeProfile!.id, interviewId, answerId),
    onSuccess: (_, answerId) => {
      qc.invalidateQueries({ queryKey: ["evaluation", activeProfile?.id, interviewId, answerId] });
      toast.success("Answer evaluated");
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.error?.message ?? "Evaluation failed";
      toast.error(msg);
    },
  });
}

export function useReEvaluateAnswer(interviewId: string) {
  const qc = useQueryClient();
  const { activeProfile } = useProfileStore();
  return useMutation({
    mutationFn: (answerId: string) =>
      evaluationApi.reEvaluate(activeProfile!.id, interviewId, answerId),
    onSuccess: (_, answerId) => {
      qc.invalidateQueries({ queryKey: ["evaluation", activeProfile?.id, interviewId, answerId] });
      toast.success("Re-evaluation complete");
    },
    onError: () => toast.error("Re-evaluation failed"),
  });
}
