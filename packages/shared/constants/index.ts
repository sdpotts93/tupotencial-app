// ──────────────────────────────────────────────
// Shared constants — Tu Potencial
// ──────────────────────────────────────────────

import type {
  CommunitySegment,
  ContentType,
  ContentStatus,
  ProgramType,
  ProgramStatus,
  EnrollmentStatus,
  DailyPlanActionType,
  DailyPlanStatus,
  PostStatus,
  CommentStatus,
  EventStatus,
  BenefitStatus,
  AddonStatus,
  EntitlementSource,
  SubscriptionStatus,
  AiTone,
  AiSessionStatus,
  AiMessageRole,
  AdminRole,
  CategoryStatus,
} from '../types/database';

// ── Community segments ──────────────────────────

export const SEGMENTS: readonly CommunitySegment[] = [
  'gabriel',
  'carlotta',
  'conjunta',
] as const;

export const SEGMENT_LABELS: Record<CommunitySegment, string> = {
  gabriel: 'Gabriel',
  carlotta: 'Carlotta',
  conjunta: 'Conjunta',
};

// ── Content ─────────────────────────────────────

export const CONTENT_TYPES: readonly ContentType[] = [
  'video',
  'text',
  'link',
  'audio',
] as const;

export const CONTENT_STATUSES: readonly ContentStatus[] = [
  'draft',
  'scheduled',
  'published',
  'archived',
] as const;

// ── Categories ──────────────────────────────────

export const CATEGORY_STATUSES: readonly CategoryStatus[] = [
  'active',
  'hidden',
] as const;

// ── Programs ────────────────────────────────────

export const PROGRAM_TYPES: readonly ProgramType[] = [
  'program',
  'reto',
  'bootcamp',
] as const;

export const PROGRAM_STATUSES: readonly ProgramStatus[] = [
  'draft',
  'published',
  'archived',
] as const;

export const ENROLLMENT_STATUSES: readonly EnrollmentStatus[] = [
  'active',
  'completed',
  'cancelled',
] as const;

// ── Daily plan ──────────────────────────────────

export const DAILY_PLAN_ACTION_TYPES: readonly DailyPlanActionType[] = [
  'content',
  'program_day',
  'custom',
  'ai_prompt',
] as const;

export const DAILY_PLAN_STATUSES: readonly DailyPlanStatus[] = [
  'scheduled',
  'published',
  'archived',
] as const;

// ── Posts / Community ───────────────────────────

export const POST_STATUSES: readonly PostStatus[] = [
  'draft',
  'published',
  'hidden',
] as const;

export const COMMENT_STATUSES: readonly CommentStatus[] = [
  'published',
  'hidden',
] as const;

// ── Events ──────────────────────────────────────

export const EVENT_STATUSES: readonly EventStatus[] = [
  'draft',
  'published',
  'hidden',
] as const;

// ── Benefits ────────────────────────────────────

export const BENEFIT_STATUSES: readonly BenefitStatus[] = [
  'draft',
  'published',
  'hidden',
] as const;

// ── Addons / Entitlements ───────────────────────

export const ADDON_STATUSES: readonly AddonStatus[] = [
  'active',
  'inactive',
] as const;

export const ENTITLEMENT_SOURCES: readonly EntitlementSource[] = [
  'subscription',
  'addon',
  'admin',
] as const;

// ── Subscriptions ───────────────────────────────

export const SUBSCRIPTION_STATUSES: readonly SubscriptionStatus[] = [
  'active',
  'trialing',
  'past_due',
  'canceled',
  'incomplete',
] as const;

// ── Admin ───────────────────────────────────────

export const ADMIN_ROLES: readonly AdminRole[] = [
  'admin',
  'editor',
  'read_only',
] as const;

// ── AI ──────────────────────────────────────────

export const AI_TONES: readonly AiTone[] = [
  'carlotta',
  'gabriel',
] as const;

export const AI_SESSION_STATUSES: readonly AiSessionStatus[] = [
  'active',
  'closed',
] as const;

export const AI_MESSAGE_ROLES: readonly AiMessageRole[] = [
  'user',
  'assistant',
  'system',
] as const;
