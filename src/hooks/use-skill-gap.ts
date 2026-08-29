import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { skillGapApi } from "@/services/api";
import { useProfileStore } from "@/store";

export function useSkillGapReports() {
  const { activeProfile } = useProfileStore();
  return useQuery({
    queryKey: ["skill-gap", activeProfile?.id],
    queryFn: () => skillGapApi.list(activeProfile!.id),
    enabled: !!activeProfile?.id,
  });
}

export function useSkillGapReport(reportId: string | null) {
  const { activeProfile } = useProfileStore();
  return useQuery({
    queryKey: ["skill-gap", activeProfile?.id, reportId],
    queryFn: () => skillGapApi.get(activeProfile!.id, reportId!),
    enabled: !!activeProfile?.id && !!reportId,
  });
}

export function useRunSkillGap() {
  const qc = useQueryClient();
  const { activeProfile } = useProfileStore();
  return useMutation({
    mutationFn: (opts?: { resume_id?: string; job_description_id?: string } | void) =>
      skillGapApi.analyze(activeProfile!.id, opts || undefined),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["skill-gap", activeProfile?.id] });
      toast.success("Skill gap analysis complete");
    },
    onError: () =>
      toast.error("Skill gap failed. Ensure resume and active JD have been analyzed first."),
  });
}
