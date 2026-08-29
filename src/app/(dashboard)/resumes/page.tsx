"use client";

import { useRef, useState } from "react";
import {
  FileText, Upload, Trash2, Zap, CheckCircle, AlertCircle,
  BookOpen, Code2, GraduationCap, Award
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorFallback } from "@/components/shared/error-fallback";
import { useResumes, useUploadResume, useDeleteResume, useAnalyzeResume } from "@/hooks/use-resumes";
import { useProfileStore } from "@/store";
import { formatRelativeTime } from "@/lib/utils";
import type { Resume, ResumeAnalysis } from "@/types";

function ResumeCard({
  resume,
  onAnalyze,
  analyzing,
  analysis,
}: {
  resume: Resume;
  onAnalyze: () => void;
  analyzing: boolean;
  analysis?: ResumeAnalysis | null;
}) {
  const { mutate: deleteResume } = useDeleteResume();

  return (
    <Card glass className="hover:border-violet-500/20 transition-all duration-300">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center flex-shrink-0">
              <FileText className="w-5 h-5 text-violet-400" />
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold truncate">{resume.title}</h3>
              <p className="text-xs text-muted-foreground">
                {formatRelativeTime(resume.created_at)}
              </p>
            </div>
          </div>
          <div className="flex gap-1 flex-shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={onAnalyze}
              loading={analyzing}
              className="text-xs"
            >
              <Zap className="w-3.5 h-3.5" />
              {analyzing ? "Analyzing…" : "Analyze"}
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              className="text-destructive hover:text-destructive"
              onClick={() => deleteResume(resume.id)}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </CardHeader>

      {analysis && (
        <CardContent className="pt-0">
          <Tabs defaultValue="skills">
            <TabsList className="mb-4">
              <TabsTrigger value="skills">Skills ({analysis.skills.length})</TabsTrigger>
              <TabsTrigger value="projects">Projects ({analysis.projects.length})</TabsTrigger>
              <TabsTrigger value="experience">Experience ({analysis.experience.length})</TabsTrigger>
              <TabsTrigger value="education">Education ({analysis.education.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="skills">
              <div className="flex flex-wrap gap-2">
                {analysis.skills.map((skill) => (
                  <Badge key={skill.name} variant="violet" className="text-xs">
                    {skill.name}
                  </Badge>
                ))}
                {analysis.skills.length === 0 && (
                  <p className="text-sm text-muted-foreground">No skills extracted</p>
                )}
              </div>
            </TabsContent>

            <TabsContent value="projects">
              <div className="space-y-3">
                {analysis.projects.map((proj, i) => (
                  <div key={i} className="p-3 rounded-xl bg-secondary/50 border border-border/40">
                    <p className="font-medium text-sm">{proj.name}</p>
                    <p className="text-xs text-muted-foreground mt-1">{proj.description}</p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {proj.technologies.map((tech) => (
                        <Badge key={tech} variant="secondary" className="text-xs">{tech}</Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="experience">
              <div className="space-y-3">
                {analysis.experience.map((exp, i) => (
                  <div key={i} className="p-3 rounded-xl bg-secondary/50 border border-border/40">
                    <p className="font-medium text-sm">{exp.role}</p>
                    <p className="text-xs text-muted-foreground">{exp.company} · {exp.duration}</p>
                    <p className="text-xs mt-1">{exp.description}</p>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="education">
              <div className="space-y-3">
                {analysis.education.map((edu, i) => (
                  <div key={i} className="p-3 rounded-xl bg-secondary/50 border border-border/40">
                    <p className="font-medium text-sm">{edu.degree}</p>
                    {edu.field_of_study && (
                      <p className="text-xs text-muted-foreground">{edu.field_of_study}</p>
                    )}
                    <p className="text-xs text-muted-foreground">{edu.institution} {edu.duration && `· ${edu.duration}`}</p>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      )}
    </Card>
  );
}

export default function ResumesPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { activeProfile } = useProfileStore();
  const { data, isLoading, error, refetch } = useResumes();
  const { mutate: upload, isPending: uploading } = useUploadResume();
  const { mutate: analyze, isPending: analyzing, data: analysisData } = useAnalyzeResume();
  const [analysingId, setAnalysingId] = useState<string | null>(null);
  const [analysisMap, setAnalysisMap] = useState<Record<string, ResumeAnalysis>>({});

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    upload({ file, title: file.name.replace(".pdf", "") });
    e.target.value = "";
  };

  const handleAnalyze = (resumeId: string) => {
    if (!activeProfile) return;
    setAnalysingId(resumeId);
    analyze(resumeId, {
      onSuccess: (result) => {
        setAnalysisMap((prev) => ({ ...prev, [resumeId]: result }));
        setAnalysingId(null);
      },
      onError: () => setAnalysingId(null),
    });
  };

  const resumes = data?.items ?? [];

  if (!activeProfile) {
    return (
      <EmptyState
        icon={AlertCircle}
        title="No active profile"
        description="Select a profile first."
      />
    );
  }

  return (
    <div>
      <PageHeader
        title="Resumes"
        description={`Manage resumes for ${activeProfile.name}`}
        actions={
          <>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              className="hidden"
              onChange={handleFileChange}
            />
            <Button
              onClick={() => fileInputRef.current?.click()}
              loading={uploading}
            >
              <Upload className="w-4 h-4" />
              Upload PDF
            </Button>
          </>
        }
      />

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 2 }).map((_, i) => (
            <Card key={i} glass><CardContent className="p-6 space-y-3">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-4 w-64" />
            </CardContent></Card>
          ))}
        </div>
      ) : error ? (
        <ErrorFallback onRetry={() => refetch()} />
      ) : resumes.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No resumes yet"
          description="Upload a PDF resume to get started with analysis and skill extraction."
          action={{ label: "Upload Resume", onClick: () => fileInputRef.current?.click() }}
        />
      ) : (
        <div className="space-y-4">
          {resumes.map((resume) => (
            <ResumeCard
              key={resume.id}
              resume={resume}
              onAnalyze={() => handleAnalyze(resume.id)}
              analyzing={analysingId === resume.id}
              analysis={analysisMap[resume.id]}
            />
          ))}
        </div>
      )}
    </div>
  );
}
