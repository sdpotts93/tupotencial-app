// ──────────────────────────────────────────────
// Auth-related types
// ──────────────────────────────────────────────

import type { CommunitySegment } from './database';

/** Authenticated user exposed to the client layer. */
export interface AuthUser {
  id: string;
  email: string;
  segment: CommunitySegment;
  isSubscriber: boolean;
  isAdmin: boolean;
  entitlements: string[];
}

/**
 * Flag used during early development to bypass auth / billing guards.
 * Should be `false` in production builds.
 */
export type DevMode = boolean;
