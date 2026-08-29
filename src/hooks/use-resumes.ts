import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { resumesApi } from "@/services/api";
import { useProfileStore } from "@/store";

export function useResumes() {
  const { activeProfile } = useProfileStore();
  return useQuery({
    queryKey: ["resumes", activeProfile?.id],
    queryFn: () => resumesApi.list(activeProfile!.id),
    enabled: !!activeProfile?.id,
  });
}

export function useResume(resumeId: string) {
  const { activeProfile } = useProfileStore();
  return useQuery({
    queryKey: ["resumes", activeProfile?.id, resumeId],
    queryFn: () => resumesApi.get(activeProfile!.id, resumeId),
    enabled: !!activeProfile?.id && !!resumeId,
  });
}

export function useUploadResume() {
  const qc = useQueryClient();
  const { activeProfile } = useProfileStore();

  return useMutation({
    mutationFn: ({ file, title }: { file: File; title?: string }) =>
      resumesApi.upload(activeProfile!.id, file, title),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["resumes", activeProfile?.id] });
      toast.success("Resume uploaded successfully");
    },
    onError: () => toast.error("Failed to upload resume"),
  });
}

export function useDeleteResume() {
  const qc = useQueryClient();
  const { activeProfile } = useProfileStore();

  return useMutation({
    mutationFn: (resumeId: string) => resumesApi.delete(activeProfile!.id, resumeId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["resumes", activeProfile?.id] });
      toast.success("Resume deleted");
    },
    onError: () => toast.error("Failed to delete resume"),
  });
}

export function useAnalyzeResume() {
  const qc = useQueryClient();
  const { activeProfile } = useProfileStore();

  return useMutation({
    mutationFn: (resumeId: string) => resumesApi.analyze(activeProfile!.id, resumeId),
    onSuccess: (_, resumeId) => {
      qc.invalidateQueries({ queryKey: ["resume-analysis", activeProfile?.id, resumeId] });
      toast.success("Resume analyzed successfully");
    },
    onError: () => toast.error("Analysis failed. Make sure the resume has an uploaded file."),
  });
}

export function useResumeAnalysis(resumeId: string | null) {
  const { activeProfile } = useProfileStore();
  return useQuery({
    queryKey: ["resume-analysis", activeProfile?.id, resumeId],
    queryFn: () => resumesApi.analyze(activeProfile!.id, resumeId!),
    enabled: false, // Only on demand
  });
}
