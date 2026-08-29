import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { roadmapsApi } from "@/services/api";
import { useProfileStore } from "@/store";
import type { RoadmapType } from "@/types";

export function useRoadmaps() {
  const { activeProfile } = useProfileStore();
  return useQuery({
    queryKey: ["roadmaps", activeProfile?.id],
    queryFn: () => roadmapsApi.list(activeProfile!.id),
    enabled: !!activeProfile?.id,
    staleTime: 2 * 60 * 1000,
  });
}

export function useRoadmap(roadmapId: string | null) {
  const { activeProfile } = useProfileStore();
  return useQuery({
    queryKey: ["roadmaps", activeProfile?.id, roadmapId],
    queryFn: () => roadmapsApi.get(activeProfile!.id, roadmapId!),
    enabled: !!activeProfile?.id && !!roadmapId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useLatestRoadmapByType(type: RoadmapType) {
  const { data, ...rest } = useRoadmaps();
  const latest = data?.items.find((r) => r.roadmap_type === type) ?? null;
  return { data: latest, ...rest };
}

export function useGenerateRoadmap() {
  const qc = useQueryClient();
  const { activeProfile } = useProfileStore();

  return useMutation({
    mutationFn: (roadmapType: RoadmapType) =>
      roadmapsApi.generate(activeProfile!.id, roadmapType),
    onSuccess: (_, type) => {
      qc.invalidateQueries({ queryKey: ["roadmaps", activeProfile?.id] });
      toast.success(`${type.replace("_", "-")} roadmap generated`);
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.error?.message ?? "Failed to generate roadmap";
      // Friendly hint for missing analytics prerequisite
      if (msg.includes("analytics")) {
        toast.error("Generate an analytics snapshot first (Analytics → Generate Snapshot)");
      } else {
        toast.error(msg);
      }
    },
  });
}
