"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { User2, Plus, Pencil, Trash2, Star, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { useProfiles, useCreateProfile, useUpdateProfile, useDeleteProfile } from "@/hooks/use-dashboard";
import { useProfileStore } from "@/store";
import { cn, formatRelativeTime } from "@/lib/utils";
import type { Profile } from "@/types";

const schema = z.object({
  name: z.string().min(2, "Name required"),
  headline: z.string().optional(),
  target_role: z.string().optional(),
  current_role: z.string().optional(),
  location: z.string().optional(),
  bio: z.string().optional(),
  is_default: z.boolean().optional(),
});
type FormData = z.infer<typeof schema>;

function ProfileFormDialog({
  open,
  onClose,
  profile,
}: {
  open: boolean;
  onClose: () => void;
  profile?: Profile;
}) {
  const { mutate: create, isPending: creating } = useCreateProfile();
  const { mutate: update, isPending: updating } = useUpdateProfile();
  const isPending = creating || updating;

  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: profile?.name ?? "",
      headline: profile?.headline ?? "",
      target_role: profile?.target_role ?? "",
      current_role: profile?.current_role ?? "",
      location: profile?.location ?? "",
      bio: profile?.bio ?? "",
      is_default: profile?.is_default ?? false,
    },
  });

  const onSubmit = (data: FormData) => {
    if (profile) {
      update({ id: profile.id, data }, { onSuccess: () => { onClose(); reset(); } });
    } else {
      create(data, { onSuccess: () => { onClose(); reset(); } });
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{profile ? "Edit Profile" : "Create Profile"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label>Profile Name *</Label>
            <Input placeholder="e.g. AI Engineer Profile" {...register("name")} />
            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Target Role</Label>
              <Input placeholder="AI Engineer" {...register("target_role")} />
            </div>
            <div className="space-y-2">
              <Label>Current Role</Label>
              <Input placeholder="Student" {...register("current_role")} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Headline</Label>
            <Input placeholder="AI/ML Engineer | Python | LangGraph" {...register("headline")} />
          </div>
          <div className="space-y-2">
            <Label>Location</Label>
            <Input placeholder="Greater Noida, India" {...register("location")} />
          </div>
          <div className="space-y-2">
            <Label>Bio</Label>
            <Textarea placeholder="Brief bio..." rows={3} {...register("bio")} />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" loading={isPending}>
              {profile ? "Save Changes" : "Create Profile"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function ProfilesPage() {
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Profile | undefined>();
  const { data, isLoading } = useProfiles();
  const { mutate: deleteProfile } = useDeleteProfile();
  const { activeProfile, setActiveProfile } = useProfileStore();

  const profiles = data?.items ?? [];

  return (
    <div>
      <PageHeader
        title="Profiles"
        description="Manage your career-track profiles. Each profile has its own resumes, JDs, and interviews."
        actions={
          <Button onClick={() => { setEditing(undefined); setFormOpen(true); }}>
            <Plus className="w-4 h-4" /> New Profile
          </Button>
        }
      />

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} glass><CardContent className="p-6 space-y-3">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-4 w-24" />
            </CardContent></Card>
          ))}
        </div>
      ) : profiles.length === 0 ? (
        <EmptyState
          icon={User2}
          title="No profiles yet"
          description='Create your first career profile, e.g. "AI Engineer Profile"'
          action={{ label: "Create Profile", onClick: () => setFormOpen(true) }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {profiles.map((profile) => {
            const isActive = activeProfile?.id === profile.id;
            return (
              <Card
                key={profile.id}
                glass
                className={cn(
                  "relative group hover:border-violet-500/30 transition-all duration-300 cursor-pointer",
                  isActive && "border-violet-500/50 bg-violet-500/5"
                )}
                onClick={() => setActiveProfile(profile)}
              >
                {isActive && (
                  <div className="absolute top-3 right-3">
                    <Badge variant="violet" className="text-xs">Active</Badge>
                  </div>
                )}
                {profile.is_default && (
                  <Star className="absolute top-3 right-3 w-4 h-4 text-yellow-400" />
                )}
                <CardContent className="p-6">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl gradient-brand flex items-center justify-center text-sm font-bold text-white flex-shrink-0">
                      {profile.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold truncate">{profile.name}</h3>
                      {profile.headline && (
                        <p className="text-xs text-muted-foreground truncate">{profile.headline}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-1.5 mb-4">
                    {profile.target_role && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Briefcase className="w-3.5 h-3.5" />
                        <span>Targeting: {profile.target_role}</span>
                      </div>
                    )}
                    {profile.location && (
                      <p className="text-xs text-muted-foreground">{profile.location}</p>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-border/40">
                    <span className="text-xs text-muted-foreground">
                      {formatRelativeTime(profile.created_at)}
                    </span>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={(e) => { e.stopPropagation(); setEditing(profile); setFormOpen(true); }}
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        className="text-destructive hover:text-destructive"
                        onClick={(e) => { e.stopPropagation(); deleteProfile(profile.id); }}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <ProfileFormDialog open={formOpen} onClose={() => { setFormOpen(false); setEditing(undefined); }} profile={editing} />
    </div>
  );
}
