import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { jobDescriptionsApi } from "@/services/api";
import { useProfileStore } from "@/store";
import type { JobDescription } from "@/types";

export function useJobDescriptions() {
  const { activeProfile } = useProfileStore();
  return useQuery({
    queryKey: ["job-descriptions", activeProfile?.id],
    queryFn: () => jobDescriptionsApi.list(activeProfile!.id),
    enabled: !!activeProfile?.id,
  });
}

export function useCreateJobDescription() {
  const qc = useQueryClient();
  const { activeProfile } = useProfileStore();
  return useMutation({
    mutationFn: (data: Partial<JobDescription>) =>
      jobDescriptionsApi.create(activeProfile!.id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["job-descriptions", activeProfile?.id] });
      toast.success("Job description created");
    },
    onError: () => toast.error("Failed to create job description"),
  });
}

export function useUpdateJobDescription() {
  const qc = useQueryClient();
  const { activeProfile } = useProfileStore();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<JobDescription> }) =>
      jobDescriptionsApi.update(activeProfile!.id, id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["job-descriptions", activeProfile?.id] });
      toast.success("Job description updated");
    },
    onError: () => toast.error("Failed to update job description"),
  });
}

export function useDeleteJobDescription() {
  const qc = useQueryClient();
  const { activeProfile } = useProfileStore();
  return useMutation({
    mutationFn: (id: string) => jobDescriptionsApi.delete(activeProfile!.id, id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["job-descriptions", activeProfile?.id] });
      toast.success("Job description deleted");
    },
    onError: () => toast.error("Failed to delete job description"),
  });
}

export function useActivateJobDescription() {
  const qc = useQueryClient();
  const { activeProfile } = useProfileStore();
  return useMutation({
    mutationFn: (id: string) => jobDescriptionsApi.activate(activeProfile!.id, id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["job-descriptions", activeProfile?.id] });
      toast.success("Job description activated");
    },
    onError: () => toast.error("Failed to activate job description"),
  });
}

export function useAnalyzeJobDescription() {
  const { activeProfile } = useProfileStore();
  return useMutation({
    mutationFn: (jdId: string) =>
      jobDescriptionsApi.analyze(activeProfile!.id, jdId),
    onSuccess: () => toast.success("Job description analyzed"),
    onError: () => toast.error("Analysis failed"),
  });
}
