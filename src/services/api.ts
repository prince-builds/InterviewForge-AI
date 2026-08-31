import { apiClient } from "@/lib/api-client";
import type {
  AnalyticsListResponse,
  AnalyticsSnapshot,
  AgentRunDetail,
  AgentRunListResponse,
  AnswerResponse,
  CurrentQuestionResponse,
  DashboardSummary,
  Evaluation,
  GeneratedQuestionsResponse,
  InterviewDetailResponse,
  InterviewGenerateResponse,
  InterviewListResponse,
  InterviewProgress,
  JDAnalysis,
  JobDescription,
  JobDescriptionListResponse,
  KnowledgeDocumentListResponse,
  KnowledgeSearchResponse,
  NavigationResponse,
  Profile,
  ProfileListResponse,
  RecentActivityResponse,
  Resume,
  ResumeAnalysis,
  ResumeListResponse,
  Roadmap,
  RoadmapListResponse,
  SkillGapReport,
  SkillGapReportListResponse,
  TokenPair,
  User,
} from "@/types";

// ── Auth ──────────────────────────────────────────────────────────────────────

export const authApi = {
  login: (email: string, password: string) =>
    apiClient.post<TokenPair>("/auth/login", { email, password }),

  register: (email: string, password: string, full_name?: string) =>
    apiClient.post<User>("/auth/register", { email, password, full_name }),

  refresh: (refresh_token: string) =>
    apiClient.post<TokenPair>("/auth/refresh", { refresh_token }),

  me: () => apiClient.get<User>("/auth/me"),
};

// ── Profiles ──────────────────────────────────────────────────────────────────

export const profilesApi = {
  list: () => apiClient.get<ProfileListResponse>("/profiles"),

  get: (profileId: string) =>
    apiClient.get<Profile>(`/profiles/${profileId}`),

  create: (data: Partial<Profile>) =>
    apiClient.post<Profile>("/profiles", data),

  update: (profileId: string, data: Partial<Profile>) =>
    apiClient.put<Profile>(`/profiles/${profileId}`, data),

  delete: (profileId: string) =>
    apiClient.delete<void>(`/profiles/${profileId}`),
};

// ── Dashboard ─────────────────────────────────────────────────────────────────

export const dashboardApi = {
  summary: (profileId: string) =>
    apiClient.get<DashboardSummary>(`/dashboard/summary?profile_id=${profileId}`),

  recentActivity: (profileId: string, limit = 10) =>
    apiClient.get<RecentActivityResponse>(
      `/dashboard/recent-activity?profile_id=${profileId}&limit=${limit}`
    ),
};

// ── Resumes ───────────────────────────────────────────────────────────────────

export const resumesApi = {
  list: (profileId: string) =>
    apiClient.get<ResumeListResponse>(`/profiles/${profileId}/resumes`),

  get: (profileId: string, resumeId: string) =>
    apiClient.get<Resume>(`/profiles/${profileId}/resumes/${resumeId}`),

  create: (profileId: string, data: { title: string; file_url?: string }) =>
    apiClient.post<Resume>(`/profiles/${profileId}/resumes`, data),

  update: (profileId: string, resumeId: string, data: Partial<Resume>) =>
    apiClient.put<Resume>(`/profiles/${profileId}/resumes/${resumeId}`, data),

  delete: (profileId: string, resumeId: string) =>
    apiClient.delete<void>(`/profiles/${profileId}/resumes/${resumeId}`),

  upload: (profileId: string, file: File, title?: string) => {
    const form = new FormData();
    form.append("file", file);
    if (title) form.append("title", title);
    return apiClient.postForm<Resume>(`/profiles/${profileId}/resumes/upload`, form);
  },

  analyze: (profileId: string, resumeId: string) =>
    apiClient.post<ResumeAnalysis>(
      `/profiles/${profileId}/resumes/${resumeId}/analyze`
    ),
};

// ── Job Descriptions ──────────────────────────────────────────────────────────

export const jobDescriptionsApi = {
  list: (profileId: string) =>
    apiClient.get<JobDescriptionListResponse>(
      `/profiles/${profileId}/job-descriptions`
    ),

  get: (profileId: string, jdId: string) =>
    apiClient.get<JobDescription>(
      `/profiles/${profileId}/job-descriptions/${jdId}`
    ),

  create: (profileId: string, data: Partial<JobDescription>) =>
    apiClient.post<JobDescription>(
      `/profiles/${profileId}/job-descriptions`,
      data
    ),

  update: (profileId: string, jdId: string, data: Partial<JobDescription>) =>
    apiClient.put<JobDescription>(
      `/profiles/${profileId}/job-descriptions/${jdId}`,
      data
    ),

  delete: (profileId: string, jdId: string) =>
    apiClient.delete<void>(`/profiles/${profileId}/job-descriptions/${jdId}`),

  activate: (profileId: string, jdId: string) =>
    apiClient.patch<JobDescription>(
      `/profiles/${profileId}/job-descriptions/${jdId}/activate`
    ),

  analyze: (profileId: string, jdId: string) =>
    apiClient.post<JDAnalysis>(
      `/profiles/${profileId}/job-descriptions/${jdId}/analyze`
    ),
};

// ── Skill Gap ─────────────────────────────────────────────────────────────────

export const skillGapApi = {
  analyze: (
    profileId: string,
    options?: { resume_id?: string; job_description_id?: string }
  ) =>
    apiClient.post<SkillGapReport>(
      `/profiles/${profileId}/skill-gap/analyze`,
      options ?? {}
    ),

  list: (profileId: string) =>
    apiClient.get<SkillGapReportListResponse>(
      `/profiles/${profileId}/skill-gap`
    ),

  get: (profileId: string, reportId: string) =>
    apiClient.get<SkillGapReport>(
      `/profiles/${profileId}/skill-gap/${reportId}`
    ),
};

// ── Interviews ────────────────────────────────────────────────────────────────

export const interviewsApi = {
  generate: (
    profileId: string,
    data: {
      count?: number;
      question_count?: number;
      interview_type?: string;
      difficulty?: string;
      categories?: string[];
      resume_id?: string;
      job_description_id?: string;
      skill_gap_report_id?: string;
    }
  ) => {
    const payload: {
      count: number;
      resume_id?: string;
      job_description_id?: string;
      difficulty?: string;
      categories?: string[];
    } = {
      count: data.count ?? data.question_count ?? 5,
    };
    if (data.resume_id) payload.resume_id = data.resume_id;
    if (data.job_description_id) payload.job_description_id = data.job_description_id;
    if (data.difficulty) payload.difficulty = data.difficulty;
    if (data.categories) payload.categories = data.categories;

    return apiClient.post<GeneratedQuestionsResponse | InterviewGenerateResponse>(
      `/profiles/${profileId}/interview-questions/generate`,
      payload
    );
  },

  list: (profileId: string) =>
    apiClient.get<InterviewListResponse>(`/profiles/${profileId}/interviews`),

  get: (profileId: string, interviewId: string) =>
    apiClient.get<InterviewDetailResponse>(
      `/profiles/${profileId}/interviews/${interviewId}`
    ),

  // Session navigation
  currentQuestion: (profileId: string, interviewId: string) =>
    apiClient.get<CurrentQuestionResponse>(
      `/profiles/${profileId}/interviews/${interviewId}/current-question`
    ),

  progress: (profileId: string, interviewId: string) =>
    apiClient.get<InterviewProgress>(
      `/profiles/${profileId}/interviews/${interviewId}/progress`
    ),

  submitAnswer: (
    profileId: string,
    interviewId: string,
    questionId: string,
    answer_text: string
  ) =>
    apiClient.post<NavigationResponse>(
      `/profiles/${profileId}/interviews/${interviewId}/questions/${questionId}/answer`,
      { answer_text }
    ),

  skipQuestion: (profileId: string, interviewId: string, questionId: string) =>
    apiClient.post<NavigationResponse>(
      `/profiles/${profileId}/interviews/${interviewId}/questions/${questionId}/skip`
    ),

  next: (profileId: string, interviewId: string) =>
    apiClient.post<NavigationResponse>(
      `/profiles/${profileId}/interviews/${interviewId}/next`
    ),

  previous: (profileId: string, interviewId: string) =>
    apiClient.post<NavigationResponse>(
      `/profiles/${profileId}/interviews/${interviewId}/previous`
    ),

  complete: (profileId: string, interviewId: string) =>
    apiClient.post<NavigationResponse>(
      `/profiles/${profileId}/interviews/${interviewId}/complete`
    ),
};

// ── Evaluation ────────────────────────────────────────────────────────────────

export const evaluationApi = {
  evaluate: (profileId: string, interviewId: string, answerId: string) =>
    apiClient.post<Evaluation>(
      `/profiles/${profileId}/interviews/${interviewId}/answers/${answerId}/evaluate`
    ),

  reEvaluate: (profileId: string, interviewId: string, answerId: string) =>
    apiClient.post<Evaluation>(
      `/profiles/${profileId}/interviews/${interviewId}/answers/${answerId}/re-evaluate`
    ),

  get: (profileId: string, interviewId: string, answerId: string) =>
    apiClient.get<Evaluation>(
      `/profiles/${profileId}/interviews/${interviewId}/answers/${answerId}/evaluation`
    ),
};

// ── Analytics ─────────────────────────────────────────────────────────────────

export const analyticsApi = {
  generate: (profileId: string) =>
    apiClient.post<AnalyticsSnapshot>(`/profiles/${profileId}/analytics/generate`),

  list: (profileId: string) =>
    apiClient.get<AnalyticsListResponse>(`/profiles/${profileId}/analytics`),
};

// ── Roadmaps ──────────────────────────────────────────────────────────────────

export const roadmapsApi = {
  generate: (profileId: string, roadmapType: string) =>
    apiClient.post<Roadmap>(`/profiles/${profileId}/roadmaps/${roadmapType}`),

  list: (profileId: string) =>
    apiClient.get<RoadmapListResponse>(`/profiles/${profileId}/roadmaps`),

  get: (profileId: string, roadmapId: string) =>
    apiClient.get<Roadmap>(`/profiles/${profileId}/roadmaps/${roadmapId}`),
};

// ── Knowledge ─────────────────────────────────────────────────────────────────

export const knowledgeApi = {
  ingest: (data: {
    document_type: string;
    title: string;
    content: string;
    source_url?: string;
    metadata?: Record<string, unknown>;
  }) => apiClient.post("/knowledge/ingest", data),

  search: (data: {
    query: string;
    document_types?: string[];
    company_name?: string;
    top_k?: number;
  }) => apiClient.post<KnowledgeSearchResponse>("/knowledge/search", data),

  listDocuments: (document_type?: string) =>
    apiClient.get<KnowledgeDocumentListResponse>(
      `/knowledge/documents${document_type ? `?document_type=${document_type}` : ""}`
    ),
};

// ── Agents ────────────────────────────────────────────────────────────────────

export const agentsApi = {
  run: (
    profileId: string,
    data: {
      workflow_type: string;
      interview_type?: string;
      question_count?: number;
      roadmap_type?: string;
      target_role?: string;
      company_name?: string;
    }
  ) => apiClient.post(`/profiles/${profileId}/agents/run`, data),

  listRuns: (profileId: string) =>
    apiClient.get<AgentRunListResponse>(`/profiles/${profileId}/agents/runs`),

  getRun: (profileId: string, runId: string) =>
    apiClient.get<AgentRunDetail>(
      `/profiles/${profileId}/agents/runs/${runId}`
    ),
};
