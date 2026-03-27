// Database types derived from SCHEMA.md

export type UserRole = "admin" | "member" | "child";
export type Household = "main" | "extended";
export type SprintStatus = "active" | "completed" | "abandoned";
export type ActivityType =
  | "question"
  | "photo"
  | "poll"
  | "dare"
  | "draw"
  | "story"
  | "confession"
  | "voice";
export type ActivityLayout =
  | "immersive-text"
  | "immersive-photo"
  | "immersive-video"
  | "proposal"
  | "survey";
export type MomentType = "reveal" | "vote_result" | "survey_summary" | "slideshow";
export type ResponseType = "text" | "image" | "audio" | "drawing" | "video";

export interface User {
  id: string;
  email: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  created_at: string;
}

export interface Family {
  id: string;
  name: string;
  created_by: string;
  created_at: string;
}

export interface FamilyMember {
  id: string;
  family_id: string;
  user_id: string;
  role: UserRole;
  household: Household;
  joined_at: string;
  // joined fields
  users?: User;
}

export interface Invite {
  id: string;
  family_id: string;
  created_by: string;
  token: string;
  email: string | null;
  expires_at: string | null;
  used_at: string | null;
}

export interface SprintTheme {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  is_active: boolean;
  sort_order: number;
}

export interface FamilySprint {
  id: string;
  family_id: string;
  theme_id: string;
  started_at: string;
  ends_at: string;
  status: SprintStatus;
  completed_at: string | null;
  current_week: number;
  // joined fields
  sprint_themes?: SprintTheme;
}

export interface Activity {
  id: string;
  theme_id: string;
  week_number: number;
  sort_order: number;
  type: ActivityType;
  prompt: string;
  is_anonymous: boolean;
  allow_comments: boolean;
  challenge_intro: string | null;
  layout: ActivityLayout | null;
  moment_type: MomentType | null;
  moment_description: string | null;
}

export interface ThemeWeek {
  id: string;
  theme_id: string;
  week_number: number;
  title: string;
  subtitle: string | null;
  icon: string | null;
  moment_label: string | null;
}

export interface Response {
  id: string;
  sprint_id: string;
  activity_id: string;
  user_id: string;
  type: ResponseType;
  content: string | null;
  is_anonymous: boolean;
  created_at: string;
  // joined fields
  users?: User;
  reactions?: Reaction[];
  comments?: Comment[];
}

export interface Comment {
  id: string;
  response_id: string;
  user_id: string;
  content: string;
  created_at: string;
  users?: User;
}

export interface Reaction {
  id: string;
  response_id: string;
  user_id: string;
  emoji: string;
  created_at: string;
}

export interface Badge {
  id: string;
  key: string;
  label: string;
  description: string | null;
  icon: string | null;
}

export interface UserBadge {
  id: string;
  user_id: string;
  family_id: string;
  badge_id: string;
  earned_at: string;
  badges?: Badge;
}

export interface Streak {
  id: string;
  family_id: string;
  user_id: string;
  current_streak: number;
  longest_streak: number;
  last_active_week: string | null;
}

export interface FamilyXP {
  id: string;
  family_id: string;
  total_xp: number;
  updated_at: string;
}

export interface MemoryBook {
  id: string;
  sprint_id: string;
  generated_at: string | null;
  pdf_url: string | null;
}

export interface WeekVote {
  id: string;
  sprint_id: string;
  user_id: string;
  week_number: number;
  created_at: string;
}

export interface DisbandVote {
  id: string;
  sprint_id: string;
  user_id: string;
  created_at: string;
}

export interface FamilyPhoto {
  id: string;
  family_id: string;
  user_id: string;
  image_url: string;
  caption: string | null;
  created_at: string;
  // joined fields
  users?: User;
}

// ── Proposals & Voting ──────────────────────────────────────

export interface Proposal {
  id: string;
  sprint_id: string;
  activity_id: string;
  user_id: string;
  title: string;
  description: string | null;
  photo_url: string | null;
  link_url: string | null;
  budget_note: string | null;
  servings: number | null;
  created_at: string;
  // joined / computed fields
  users?: User;
  vote_count?: number;
  user_voted?: boolean;
  proposal_votes?: ProposalVote[];
}

export interface ProposalVote {
  id: string;
  proposal_id: string;
  user_id: string;
  created_at: string;
}

// ── Survey ──────────────────────────────────────────────────

export interface SurveyAnswers {
  [questionKey: string]: string | string[];
}

// ── Sprint Summary ──────────────────────────────────────────

export interface SprintSummary {
  sprintId: string;
  themeName: string;
  themeIcon: string;
  weeks: {
    weekNumber: number;
    title: string;
    highlights: {
      topResponses: { content: string | null; userName: string; reactionCount: number }[];
      winningProposal?: { title: string; description: string | null; userName: string; voteCount: number };
      surveyResults?: Record<string, { label: string; counts: Record<string, number> }>;
    };
  }[];
}
