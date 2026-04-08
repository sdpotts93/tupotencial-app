// ──────────────────────────────────────────────
// Database table types — mirrors Supabase schema
// Source of truth: AGENTS.md
// ──────────────────────────────────────────────

// ── Enum-like unions ────────────────────────────

export type CommunitySegment = 'gabriel' | 'carlotta' | 'conjunta';

export type AdminRole = 'admin' | 'editor' | 'read_only';

export type CategoryStatus = 'active' | 'hidden';

export type ContentType = 'video' | 'audio' | 'article' | 'link';

export type ContentStatus = 'draft' | 'scheduled' | 'published' | 'archived';

export type ProgramType = 'program' | 'reto' | 'bootcamp';

export type ProgramStatus = 'draft' | 'published' | 'archived';

export type EnrollmentStatus = 'active' | 'completed' | 'cancelled';

export type DailyPlanActionType = 'content' | 'program_day' | 'custom' | 'ai_prompt' | 'form';

export type DailyPlanStatus = 'scheduled' | 'published' | 'archived';

export type PostStatus = 'draft' | 'published' | 'hidden';

export type CommentStatus = 'published' | 'hidden';

export type EventStatus = 'draft' | 'published' | 'hidden' | 'cancelled';

export type EventPlan = 'free' | 'core';

export type BenefitStatus = 'active' | 'inactive';

export type AddonStatus = 'active' | 'inactive';

export type AddonPlan = 'todos' | 'core';

export type ContentPlan = 'free' | 'core';

export type FormStatus = 'active' | 'inactive';

export type EventRegistrationStatus = 'registered' | 'cancelled' | 'attended';

export type ProgramDayItemType = 'content' | 'form' | 'ai_prompt';

export type EntitlementSource = 'subscription' | 'addon' | 'admin';

export type SubscriptionStatus =
  | 'active'
  | 'trialing'
  | 'past_due'
  | 'canceled'
  | 'incomplete';

export type AiTone = 'carlotta' | 'gabriel';

export type AiSessionStatus = 'active' | 'closed';

export type AiMessageRole = 'user' | 'assistant' | 'system';

// ── Table interfaces ────────────────────────────

export interface Profile {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  community_segment: CommunitySegment;
  created_at: string;
  updated_at: string | null;
}

export interface AdminUser {
  id: string;
  user_id: string;
  role: AdminRole;
  created_at: string;
}

export interface ContentObjective {
  id: string;
  title: string;
  slug: string;
  position: number;
}

export interface ContentCategory {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  icon_url: string | null;
  is_active: boolean;
  status: CategoryStatus;
  sort_order: number;
  created_at: string;
  updated_at: string | null;
}

export interface ContentItem {
  id: string;
  type: ContentType;
  title: string;
  subtitle: string | null;
  description: string | null;
  body: string | null;
  media_url: string | null;
  external_url: string | null;
  thumbnail_url: string | null;
  duration_seconds: number | null;
  status: ContentStatus;
  published_at: string | null;
  available_from: string | null;
  available_to: string | null;
  community_segment: CommunitySegment | null;
  entitlement_key: string | null;
  plan: ContentPlan;
  objective_id: string | null;
  created_by: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string | null;
}

export interface ContentItemCategory {
  id: string;
  content_item_id: string;
  category_id: string;
  position: number;
}

export interface ContentItemObjective {
  id: string;
  content_item_id: string;
  objective_id: string;
  position: number;
}

export interface Form {
  id: string;
  title: string;
  description: string | null;
  fields: Record<string, unknown>[];
  status: FormStatus;
  created_at: string;
  updated_at: string | null;
}

export interface Program {
  id: string;
  type: ProgramType;
  title: string;
  description: string | null;
  status: ProgramStatus;
  community_segment: CommunitySegment | null;
  entitlement_key: string | null;
  plan: ContentPlan;
  cover_url: string | null;
  is_active: boolean;
  start_date: string | null;
  end_date: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string | null;
}

export interface ProgramDay {
  id: string;
  program_id: string;
  day_index: number;
  title: string;
  description: string | null;
}

export interface ProgramDayItem {
  id: string;
  program_day_id: string;
  type: ProgramDayItemType;
  content_item_id: string | null;
  form_id: string | null;
  position: number;
}

export interface ProgramEnrollment {
  id: string;
  program_id: string;
  user_id: string;
  status: EnrollmentStatus;
  enrolled_at: string;
}

export interface ProgramCheckin {
  id: string;
  program_id: string;
  user_id: string;
  day_index: number;
  payload: Record<string, unknown> | null;
  created_at: string;
}

export interface DailyPlan {
  id: string;
  date: string;
  community_segment: CommunitySegment;
  title: string;
  message: string | null;
  primary_action_type: DailyPlanActionType;
  primary_action_ref: string | null;
  primary_action_payload: Record<string, unknown> | null;

  badge_title: string | null;
  badge_subtitle: string | null;
  status: DailyPlanStatus;
  created_by: string | null;
}

export interface DailyCheckin {
  id: string;
  date: string;
  user_id: string;
  payload: Record<string, unknown> | null;
  created_at: string;
}

export interface UserStreak {
  user_id: string;
  current_streak: number;
  best_streak: number;
  last_checkin_date: string | null;
  updated_at: string;
}

export interface Post {
  id: string;
  author_user_id: string;
  is_official: boolean;
  community_segment: CommunitySegment | null;
  title: string | null;
  body: string;
  media_url: string | null;
  status: PostStatus;
  created_at: string;
}

export interface PostComment {
  id: string;
  post_id: string;
  user_id: string;
  body: string;
  status: CommentStatus;
  created_at: string;
}

export interface PostReaction {
  id: string;
  post_id: string;
  user_id: string;
  reaction: string;
  created_at: string;
}

export interface Event {
  id: string;
  title: string;
  description: string | null;
  start_at: string | null;
  end_at: string | null;
  duration: string | null;
  community_segment: CommunitySegment | null;
  entitlement_key: string | null;
  plan: EventPlan;
  cover_url: string | null;
  vimeo_url: string | null;
  vimeo_id: string | null;
  vimeo_live_event_id: string | null;
  status: EventStatus;
  created_at: string;
  updated_at: string | null;
}

export interface Benefit {
  id: string;
  title: string;
  description: string | null;
  cover_url: string | null;
  url: string | null;
  utm_template: string | null;
  code: string | null;
  plan: EventPlan;
  status: BenefitStatus;
  position: number;
  created_at: string;
}

export interface BenefitClick {
  id: string;
  benefit_id: string;
  user_id: string;
  meta: Record<string, unknown> | null;
  created_at: string;
}

export interface Addon {
  id: string;
  title: string;
  description: string | null;
  cover_url: string | null;
  price: number;
  plan: AddonPlan;
  grants_core_months: number | null;
  stripe_price_id: string | null;
  status: AddonStatus;
  created_at: string;
  updated_at: string | null;
}

export interface AddonPurchase {
  id: string;
  addon_id: string;
  user_id: string;
  stripe_session_id: string | null;
  amount: number;
  created_at: string;
}

export interface AddonEntitlement {
  id: string;
  addon_id: string;
  entitlement_key: string;
}

export interface UserEntitlement {
  id: string;
  user_id: string;
  entitlement_key: string;
  source: EntitlementSource;
  source_ref: string | null;
  created_at: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  status: SubscriptionStatus;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  current_period_end: string | null;
  updated_at: string;
}

export interface Payment {
  id: string;
  user_id: string;
  stripe_event_id: string;
  stripe_object_id: string;
  type: string;
  amount: number;
  currency: string;
  meta: Record<string, unknown> | null;
  created_at: string;
}

export interface AiSession {
  id: string;
  user_id: string;
  tone: AiTone;
  status: AiSessionStatus;
  created_at: string;
}

export interface AiMessage {
  id: string;
  session_id: string;
  user_id: string;
  role: AiMessageRole;
  content: string;
  tokens_in: number | null;
  tokens_out: number | null;
  safety_category: string | null;
  created_at: string;
}

export interface AiQuota {
  user_id: string;
  day: string;
  messages_used: number;
  tokens_used: number;
}

export interface EventRegistration {
  id: string;
  event_id: string;
  user_id: string;
  status: EventRegistrationStatus;
  created_at: string;
}

export interface FormSubmission {
  id: string;
  form_id: string;
  user_id: string;
  answers: Record<string, unknown>;
  created_at: string;
}

export interface AppSetting {
  key: string;
  value: Record<string, unknown>;
  updated_at: string;
}
