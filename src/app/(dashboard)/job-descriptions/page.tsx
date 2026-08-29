"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Briefcase, Plus, Pencil, Trash2, Zap, CheckCircle2, AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorFallback } from "@/components/shared/error-fallback";
import {
  useJobDescriptions, useCreateJobDescription, useUpdateJobDescription,
  useDeleteJobDescription, useActivateJobDescription, useAnalyzeJobDescription,
} from "@/hooks/use-job-descriptions";
import { useProfileStore } from "@/store";
import { formatRelativeTime, cn } from "@/lib/utils";
import type { JobDescription, JDAnalysis } from "@/types";

const schema = z.object({
  job_title: z.string().min(2, "Job title required"),
  company_name: z.string().optional(),
  location: z.string().optional(),
  employment_type: z.string().optional(),
  jd_text: z.string().min(20, "Job description text required (min 20 chars)"),
});
type FormData = z.infer<typeof schema>;

function JDFormDialog({
  open, onClose, jd,
}: { open: boolean; onClose: () => void; jd?: JobDescription }) {
  const { mutate: create, isPending: creating } = useCreateJobDescription();
  const { mutate: update, isPending: updating } = useUpdateJobDescription();

  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      job_title: jd?.job_title ?? "",
      company_name: jd?.company_name ?? "",
      location: jd?.location ?? "",
      employment_type: jd?.employment_type ?? "",
      jd_text: jd?.jd_text ?? "",
    },
  });

  const onSubmit = (data: FormData) => {
    if (jd) {
      update({ id: jd.id, data }, { onSuccess: () => { onClose(); reset(); } });
    } else {
      create(data, { onSuccess: () => { onClose(); reset(); } });
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{jd ? "Edit Job Description" : "Add Job Description"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Job Title *</Label>
              <Input placeholder="AI Engineer" {...register("job_title")} />
              {errors.job_title && <p className="text-xs text-destructive">{errors.job_title.message}</p>}
            </div>
            <div className="space-y-2">
              <Label>Company</Label>
              <Input placeholder="OpenAI" {...register("company_name")} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Location</Label>
              <Input placeholder="Remote / San Francisco" {...register("location")} />
            </div>
            <div className="space-y-2">
              <Label>Employment Type</Label>
              <Input placeholder="Full-time / Internship" {...register("employment_type")} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Job Description Text *</Label>
            <Textarea
              placeholder="Paste the full job description here…"
              rows={10}
              {...register("jd_text")}
            />
            {errors.jd_text && <p className="text-xs text-destructive">{errors.jd_text.message}</p>}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" loading={creating || updating}>
              {jd ? "Save Changes" : "Add Job Description"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function AnalysisPanel({ analysis }: { analysis: JDAnalysis }) {
  return (
    <Tabs defaultValue="required">
      <TabsList className="mb-4">
        <TabsTrigger value="required">Required Skills ({analysis.required_skills.length})</TabsTrigger>
        <TabsTrigger value="preferred">Preferred ({analysis.preferred_skills.length})</TabsTrigger>
        <TabsTrigger value="responsibilities">Responsibilities</TabsTrigger>
      </TabsList>
      <TabsContent value="required">
        <div className="flex flex-wrap gap-2">
          {analysis.required_skills.map((s) => (
            <div key={s.name} className="flex items-center gap-1.5 bg-violet-500/10 border border-violet-500/20 rounded-lg px-2.5 py-1">
              <span className="text-xs font-medium text-violet-300">{s.name}</span>
              <span className="text-[10px] text-muted-foreground">{(s.importance_score * 10).toFixed(0)}/10</span>
            </div>
          ))}
        </div>
      </TabsContent>
      <TabsContent value="preferred">
        <div className="flex flex-wrap gap-2">
          {analysis.preferred_skills.map((s) => (
            <Badge key={s.name} variant="secondary" className="text-xs">{s.name}</Badge>
          ))}
        </div>
      </TabsContent>
      <TabsContent value="responsibilities">
        <ul className="space-y-2">
          {analysis.responsibilities.map((r, i) => (
            <li key={i} className="flex gap-2 text-sm">
              <span className="text-violet-400 flex-shrink-0 mt-0.5">•</span>
              <span>{r}</span>
            </li>
          ))}
        </ul>
        {analysis.experience_level && (
          <div className="mt-4 flex items-center gap-2">
            <Badge variant="info">Level: {analysis.experience_level}</Badge>
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
}

export default function JobDescriptionsPage() {
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<JobDescription | undefined>();
  const [analysisMap, setAnalysisMap] = useState<Record<string, JDAnalysis>>({});
  const [analysingId, setAnalysingId] = useState<string | null>(null);

  const { activeProfile } = useProfileStore();
  const { data, isLoading, error, refetch } = useJobDescriptions();
  const { mutate: deleteJD } = useDeleteJobDescription();
  const { mutate: activate } = useActivateJobDescription();
  const { mutate: analyze } = useAnalyzeJobDescription();

  const jds = data?.items ?? [];

  const handleAnalyze = (jdId: string) => {
    setAnalysingId(jdId);
    analyze(jdId, {
      onSuccess: (result) => { setAnalysisMap((p) => ({ ...p, [jdId]: result })); setAnalysingId(null); },
      onError: () => setAnalysingId(null),
    });
  };

  if (!activeProfile) {
    return <EmptyState icon={AlertCircle} title="No active profile" description="Select a profile first." />;
  }

  return (
    <div>
      <PageHeader
        title="Job Descriptions"
        description={`Manage JDs for ${activeProfile.name}`}
        actions={
          <Button onClick={() => { setEditing(undefined); setFormOpen(true); }}>
            <Plus className="w-4 h-4" /> Add JD
          </Button>
        }
      />

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <Card key={i} glass><CardContent className="p-6 space-y-3">
              <Skeleton className="h-5 w-48" /><Skeleton className="h-4 w-32" />
            </CardContent></Card>
          ))}
        </div>
      ) : error ? (
        <ErrorFallback onRetry={() => refetch()} />
      ) : jds.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="No job descriptions yet"
          description="Add a job description to start skill gap analysis and interview generation."
          action={{ label: "Add Job Description", onClick: () => setFormOpen(true) }}
        />
      ) : (
        <div className="space-y-4">
          {jds.map((jd) => (
            <Card key={jd.id} glass className={cn("hover:border-violet-500/20 transition-all", jd.is_active && "border-violet-500/40 bg-violet-500/5")}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex-shrink-0 flex items-center justify-center">
                      <Briefcase className="w-5 h-5 text-violet-400" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold">{jd.job_title}</h3>
                        {jd.is_active && <Badge variant="violet" className="text-xs">Active</Badge>}
                        {jd.company_name && <span className="text-sm text-muted-foreground">@ {jd.company_name}</span>}
                      </div>
                      <div className="flex gap-3 text-xs text-muted-foreground mt-0.5">
                        {jd.location && <span>{jd.location}</span>}
                        {jd.employment_type && <span>{jd.employment_type}</span>}
                        <span>{formatRelativeTime(jd.created_at)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    {!jd.is_active && (
                      <Button variant="outline" size="sm" onClick={() => activate(jd.id)} className="text-xs">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Activate
                      </Button>
                    )}
                    <Button variant="outline" size="sm" onClick={() => handleAnalyze(jd.id)} loading={analysingId === jd.id} className="text-xs">
                      <Zap className="w-3.5 h-3.5" /> Analyze
                    </Button>
                    <Button variant="ghost" size="icon-sm" onClick={() => { setEditing(jd); setFormOpen(true); }}>
                      <Pencil className="w-3.5 h-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon-sm" className="text-destructive hover:text-destructive" onClick={() => deleteJD(jd.id)}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              {analysisMap[jd.id] && (
                <CardContent className="pt-0">
                  <AnalysisPanel analysis={analysisMap[jd.id]} />
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}

      <JDFormDialog open={formOpen} onClose={() => { setFormOpen(false); setEditing(undefined); }} jd={editing} />
    </div>
  );
}
