// ── Auth ──────────────────────────────────────────────────────────────────────

export interface User {
  id: string;
  email: string;
  full_name: string | null;
  is_active: boolean;
  is_superuser: boolean;
  created_at: string;
  updated_at: string;
}

export interface TokenPair {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

// ── Profile ───────────────────────────────────────────────────────────────────

export interface Profile {
  id: string;
  user_id: string;
  name: string;
  headline: string | null;
  bio: string | null;
  location: string | null;
  current_role: string | null;
  years_of_experience: number | null;
  target_role: string | null;
  linkedin_url: string | null;
  github_url: string | null;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProfileListResponse {
  items: Profile[];
  total: number;
}

// ── Resume ────────────────────────────────────────────────────────────────────

export interface Resume {
  id: string;
  profile_id: string;
  title: string;
  file_url: string | null;
  raw_text: string | null;
  created_at: string;
  updated_at: string;
}

export interface ResumeListResponse {
  items: Resume[];
  total: number;
}

export interface ResumeAnalysis {
  resume_id: string;
  skills: { name: string; category: string | null }[];
  projects: { name: string; description: string; technologies: string[] }[];
  experience: { company: string; role: string; duration: string; description: string }[];
  education: { institution: string; degree: string; field_of_study: string | null; duration: string | null }[];
  certifications: { name: string; issuer: string | null; date: string | null }[];
  analyzed_at: string;
}

// ── Job Description ───────────────────────────────────────────────────────────

export interface JobDescription {
  id: string;
  profile_id: string;
  job_title: string;
  company_name: string | null;
  jd_text: string;
  location: string | null;
  employment_type: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface JobDescriptionListResponse {
  items: JobDescription[];
  total: number;
}

export interface JDAnalysis {
  job_description_id: string;
  required_skills: { name: string; category: string | null; importance_score: number }[];
  preferred_skills: { name: string; category: string | null; importance_score: number }[];
  responsibilities: string[];
  experience_level: string | null;
  education_requirements: string | null;
  analyzed_at: string;
}

// ── Skill Gap ─────────────────────────────────────────────────────────────────

export interface MatchedSkillItem {
  name: string;
  importance_score: number;
  is_required: boolean;
}

export interface MissingSkillItem {
  name: string;
  importance_score: number;
  is_required: boolean;
}

export interface RecommendedSkillItem {
  name: string;
  importance_score: number;
  is_required: boolean;
  priority_rank: number;
}

export interface ScoreExplanation {
  total_jd_skills: number;
  required_skill_count: number;
  preferred_skill_count: number;
  matched_required_count: number;
  matched_preferred_count: number;
  required_weight: number;
  preferred_weight: number;
  weighted_required_score: number;
  weighted_preferred_score: number;
  formula: string;
}

export interface SkillGapReport {
  id: string;
  profile_id: string;
  resume_id: string | null;
  job_description_id: string | null;
  readiness_score: number;
  matched_skills: MatchedSkillItem[];
  missing_skills: MissingSkillItem[];
  recommended_skills: RecommendedSkillItem[];
  analysis_summary: string;
  score_explanation: ScoreExplanation;
  created_at: string;
}

export interface SkillGapReportSummary {
  id: string;
  profile_id: string;
  resume_id: string | null;
  job_description_id: string | null;
  readiness_score: number;
  analysis_summary: string;
  created_at: string;
}

export interface SkillGapReportListResponse {
  items: SkillGapReportSummary[];
  total: number;
}

// ── Interview ─────────────────────────────────────────────────────────────────

export type InterviewStatus = "pending" | "in_progress" | "completed" | "cancelled";
export type InterviewType = "technical" | "hr" | "system_design" | "mixed";
export type Difficulty = "easy" | "medium" | "hard";
export type QuestionCategory = "skill_gap" | "project" | "job_description" | "behavioral" | "resume";

export interface GeneratedQuestion {
  id: string;
  text: string;
  question_category: QuestionCategory;
  difficulty: Difficulty;
  order_index: number;
  topic: string | null;
}

export interface Interview {
  id: string;
  profile_id: string;
  blueprint_id: string | null;
  interview_type: InterviewType;
  title: string;
  status: InterviewStatus;
  question_count: number;
  estimated_duration_minutes: number;
  current_question_index: number;
  created_at: string;
  updated_at: string;
}

export interface InterviewDetailResponse extends Interview {
  resume_id: string | null;
  job_description_id: string | null;
  questions: GeneratedQuestion[];
}

export interface InterviewListResponse {
  items: Interview[];
  total: number;
}

export interface InterviewGenerateResponse {
  interview_id: string;
  profile_id: string;
  blueprint_id: string | null;
  interview_type: InterviewType;
  title: string;
  status: InterviewStatus;
  question_count: number;
  estimated_duration_minutes: number;
  current_question_index: number;
  question_distribution: Record<string, number>;
  difficulty_distribution: Record<string, number>;
  questions: GeneratedQuestion[];
  created_at: string;
}

export interface InterviewQuestionItem {
  id: string;
  profile_id: string;
  resume_id?: string | null;
  job_description_id?: string | null;
  skill_gap_analysis_id?: string | null;
  question: string;
  category: string;
  difficulty: string;
  skill?: string | null;
  expected_answer_points: string[];
  context_source?: string | null;
  created_at: string;
  updated_at: string;
}

export interface GeneratedQuestionsResponse {
  questions: InterviewQuestionItem[];
  total: number;
}


// ── Session ───────────────────────────────────────────────────────────────────

export type AnswerStatus = "unanswered" | "answered" | "skipped";

export interface AnswerResponse {
  id: string;
  interview_id: string;
  question_id: string;
  answer_text: string | null;
  answer_status: AnswerStatus;
  answered_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface InterviewProgress {
  interview_id: string;
  profile_id: string;
  title: string;
  interview_type: string;
  status: InterviewStatus;
  total_questions: number;
  answered_questions: number;
  skipped_questions: number;
  remaining_questions: number;
  completion_percentage: number;
  current_question_index: number;
  completed_at: string | null;
  estimated_duration_minutes: number;
}

export interface NavigationResponse {
  interview_id: string;
  current_question_index: number;
  total_questions: number;
  interview_status: InterviewStatus;
  completed_at: string | null;
  current_question: GeneratedQuestion | null;
  progress: InterviewProgress;
}

export interface CurrentQuestionResponse {
  interview_id: string;
  current_question_index: number;
  total_questions: number;
  question: GeneratedQuestion | null;
  existing_answer: AnswerResponse | null;
  interview_status: InterviewStatus;
}

// ── Evaluation ────────────────────────────────────────────────────────────────

export interface Evaluation {
  id: string;
  answer_id: string;
  correctness_score: number;
  depth_score: number;
  communication_score: number;
  relevance_score: number;
  overall_score: number;
  strengths: string[];
  weaknesses: string[];
  missing_concepts: string[];
  improved_answer: string;
  evaluation_summary: string;
  evaluated_at: string;
  model_name: string;
  model_version: string | null;
  created_at: string;
  updated_at: string;
}

// ── Analytics ─────────────────────────────────────────────────────────────────

export interface SkillStrengthItem {
  name: string;
  average_score: number;
  occurrence_count: number;
}

export interface WeakSkillItem {
  name: string;
  average_score: number;
  occurrence_count: number;
  is_required_by_jd: boolean;
}

export interface ImprovementArea {
  topic: string;
  frequency: number;
  source: string;
  priority: string;
}

export interface AnalyticsSnapshot {
  id: string;
  profile_id: string;
  interview_count: number;
  average_score: number | null;
  strongest_skills: SkillStrengthItem[];
  weakest_skills: WeakSkillItem[];
  improvement_areas: ImprovementArea[];
  trend_summary: string;
  created_at: string;
}

export interface AnalyticsListResponse {
  items: AnalyticsSnapshot[];
  total: number;
}

// ── Roadmap ───────────────────────────────────────────────────────────────────

export type RoadmapType = "7_DAY" | "14_DAY" | "30_DAY";

export interface DailyTask {
  day: number;
  focus_area: string;
  tasks: string[];
  estimated_hours: number;
}

export interface LearningObjective {
  objective: string;
  target_skill: string;
  priority: string;
}

export interface RecommendedResource {
  title: string;
  type: string;
  description: string;
  url: string | null;
}

export interface Roadmap {
  id: string;
  profile_id: string;
  roadmap_type: RoadmapType;
  learning_objectives: LearningObjective[];
  daily_tasks: DailyTask[];
  estimated_total_hours: number;
  recommended_resources: RecommendedResource[];
  generated_at: string;
  model_name: string;
  model_version: string | null;
  created_at: string;
}

export interface RoadmapSummary {
  id: string;
  profile_id: string;
  roadmap_type: RoadmapType;
  generated_at: string;
  model_name: string;
  created_at: string;
}

export interface RoadmapListResponse {
  items: RoadmapSummary[];
  total: number;
}

// ── Knowledge ─────────────────────────────────────────────────────────────────

export interface KnowledgeDocumentSummary {
  id: string;
  document_type: string;
  title: string;
  source_url: string | null;
  chunk_count: number;
  created_at: string;
}

export interface KnowledgeDocumentListResponse {
  items: KnowledgeDocumentSummary[];
  total: number;
}

export interface ChunkResult {
  chunk_text: string;
  relevance_score: number;
  document_title: string;
  document_type: string;
  source_url: string | null;
}

export interface KnowledgeSearchResponse {
  results: ChunkResult[];
  total: number;
}

// ── Agents ────────────────────────────────────────────────────────────────────

export type AgentRunStatus = "pending" | "running" | "completed" | "failed" | "partial";

export interface AgentRunSummary {
  id: string;
  profile_id: string;
  workflow_type: string;
  status: AgentRunStatus;
  completed_steps: string[];
  started_at: string | null;
  completed_at: string | null;
}

export interface StepLogEntry {
  node: string;
  status: string;
  started_at: string;
  completed_at: string;
  duration_seconds: number;
  error: string | null;
}

export interface AgentRunDetail {
  id: string;
  profile_id: string;
  workflow_type: string;
  status: AgentRunStatus;
  state_snapshot: Record<string, unknown> | null;
  step_log: StepLogEntry[];
  error_message: string | null;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
}

export interface AgentRunListResponse {
  items: AgentRunSummary[];
  total: number;
}

// ── Dashboard ─────────────────────────────────────────────────────────────────

export interface DashboardSummary {
  profile_id: string;
  total_interviews: number;
  average_score: number | null;
  total_roadmaps: number;
  total_resumes: number;
  total_job_descriptions: number;
}

export interface ActivityItem {
  id: string;
  type: "interview" | "resume" | "job_description" | "roadmap";
  title: string;
  status?: InterviewStatus;
  profile_id: string | null;
  created_at: string;
}

export interface RecentActivityResponse {
  items: ActivityItem[];
}

// ── API Errors ────────────────────────────────────────────────────────────────

export interface ApiError {
  error: {
    message: string;
    status_code: number;
    details?: unknown;
  };
}
