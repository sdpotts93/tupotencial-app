// ---------------------------------------------------------------------------
// packages/shared/mock/index.ts
// Central barrel export for all mock data
// ---------------------------------------------------------------------------

// ---- Profiles & Admin users ------------------------------------------------
export {
  MOCK_CURRENT_USER_ID,
  mockProfiles,
  mockAdminUsers,
} from './profiles';
export type { MockProfile, MockAdminUser } from './profiles';

// ---- Content library -------------------------------------------------------
export {
  mockContentCategories,
  mockContentItems,
  mockContentItemCategories,
} from './content';
export type {
  MockContentCategory,
  MockContentItem,
  MockContentItemCategory,
} from './content';

// ---- Programs / Challenges / Bootcamps -------------------------------------
export {
  mockPrograms,
  mockProgramDays,
  mockProgramDayItems,
  mockProgramEnrollments,
  mockProgramCheckins,
} from './programs';
export type {
  MockProgram,
  MockProgramDay,
  MockProgramDayItem,
  MockProgramEnrollment,
  MockProgramCheckin,
} from './programs';

// ---- Daily plans & check-ins -----------------------------------------------
export {
  mockDailyPlans,
  mockDailyCheckins,
  mockUserStreaks,
} from './daily';
export type {
  MockDailyPlan,
  MockDailyCheckin,
  MockUserStreak,
} from './daily';

// ---- Community (posts, comments, reactions) --------------------------------
export {
  mockPosts,
  mockPostComments,
  mockPostReactions,
} from './community';
export type {
  MockPost,
  MockPostComment,
  MockPostReaction,
} from './community';

// ---- Events / Lives --------------------------------------------------------
export { mockEvents } from './events';
export type { MockEvent } from './events';

// ---- Benefits --------------------------------------------------------------
export {
  mockBenefits,
  mockBenefitClicks,
} from './benefits';
export type { MockBenefit, MockBenefitClick } from './benefits';

// ---- Add-ons & Entitlements ------------------------------------------------
export {
  mockAddons,
  mockAddonEntitlements,
  mockUserEntitlements,
} from './addons';
export type {
  MockAddon,
  MockAddonEntitlement,
  MockUserEntitlement,
} from './addons';

// ---- AI Coach --------------------------------------------------------------
export {
  mockAiSessions,
  mockAiMessages,
  mockAiQuotas,
} from './ai';
export type {
  MockAiSession,
  MockAiMessage,
  MockAiQuota,
} from './ai';

// ---- Auth state & subscriptions --------------------------------------------
export {
  mockSubscriptions,
  mockCurrentAuthUser,
  mockAuthState,
  mockAuthStateAnonymous,
  mockAuthStateNotOnboarded,
  mockAuthStateFreeUser,
} from './auth';
export type {
  MockSubscription,
  MockAuthUser,
  MockAuthState,
} from './auth';
