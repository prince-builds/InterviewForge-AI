import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { analyticsApi } from "@/services/api";
import { useProfileStore } from "@/store";

export function useAnalytics() {
  const { activeProfile } = useProfileStore();
  return useQuery({
    queryKey: ["analytics", activeProfile?.id],
    queryFn: () => analyticsApi.list(activeProfile!.id),
    enabled: !!activeProfile?.id,
  });
}

export function useLatestAnalytics() {
  const { data, ...rest } = useAnalytics();
  return { data: data?.items?.[0] ?? null, ...rest };
}

export function useGenerateAnalytics() {
  const qc = useQueryClient();
  const { activeProfile } = useProfileStore();
  return useMutation({
    mutationFn: () => analyticsApi.generate(activeProfile!.id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["analytics", activeProfile?.id] });
      toast.success("Analytics snapshot generated");
    },
    onError: () => toast.error("Failed to generate analytics"),
  });
}
