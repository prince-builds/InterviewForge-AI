import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { dashboardApi, profilesApi } from "@/services/api";
import { useProfileStore } from "@/store";
import type { Profile } from "@/types";

export function useDashboardSummary() {
  const { activeProfile } = useProfileStore();
  return useQuery({
    queryKey: ["dashboard", "summary", activeProfile?.id],
    queryFn: () => dashboardApi.summary(activeProfile!.id),
    enabled: !!activeProfile?.id,
  });
}

export function useRecentActivity() {
  const { activeProfile } = useProfileStore();
  return useQuery({
    queryKey: ["dashboard", "activity", activeProfile?.id],
    queryFn: () => dashboardApi.recentActivity(activeProfile!.id),
    enabled: !!activeProfile?.id,
  });
}

export function useProfiles() {
  return useQuery({
    queryKey: ["profiles"],
    queryFn: () => profilesApi.list(),
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateProfile() {
  const qc = useQueryClient();
  const { setProfiles, setActiveProfile } = useProfileStore();

  return useMutation({
    mutationFn: (data: Partial<Profile>) => profilesApi.create(data),
    onSuccess: async (newProfile) => {
      const updated = await profilesApi.list();
      setProfiles(updated.items);
      setActiveProfile(newProfile);
      qc.invalidateQueries({ queryKey: ["profiles"] });
      toast.success(`Profile "${newProfile.name}" created`);
    },
    onError: () => toast.error("Failed to create profile"),
  });
}

export function useUpdateProfile() {
  const qc = useQueryClient();
  const { profiles, setProfiles, activeProfile, setActiveProfile } = useProfileStore();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Profile> }) =>
      profilesApi.update(id, data),
    onSuccess: (updated) => {
      setProfiles(profiles.map((p) => (p.id === updated.id ? updated : p)));
      if (activeProfile?.id === updated.id) setActiveProfile(updated);
      qc.invalidateQueries({ queryKey: ["profiles"] });
      toast.success("Profile updated");
    },
    onError: () => toast.error("Failed to update profile"),
  });
}

export function useDeleteProfile() {
  const qc = useQueryClient();
  const { profiles, setProfiles, activeProfile, setActiveProfile } = useProfileStore();

  return useMutation({
    mutationFn: (id: string) => profilesApi.delete(id),
    onSuccess: (_, id) => {
      const remaining = profiles.filter((p) => p.id !== id);
      setProfiles(remaining);
      if (activeProfile?.id === id) {
        setActiveProfile(remaining[0] ?? null);
      }
      qc.invalidateQueries({ queryKey: ["profiles"] });
      toast.success("Profile deleted");
    },
    onError: () => toast.error("Failed to delete profile. Must keep at least one profile."),
  });
}
