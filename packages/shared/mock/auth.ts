// ---------------------------------------------------------------------------
// Mock data: auth state, current user, subscription
// Matches Supabase schema sections 6.1 (profiles) + 6.9 (subscriptions)
// ---------------------------------------------------------------------------

export interface MockSubscription {
  id: string;
  user_id: string;
  status: 'active' | 'trialing' | 'past_due' | 'canceled' | 'incomplete';
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  current_period_end: string | null;
  updated_at: string;
}

export interface MockAuthUser {
  id: string;
  email: string;
  email_confirmed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface MockAuthState {
  user: MockAuthUser;
  isAuthenticated: boolean;
  isOnboarded: boolean;
  profile: {
    id: string;
    display_name: string;
    avatar_url: string | null;
    community_segment: 'gabriel' | 'carlotta' | 'conjunta';
  };
  subscription: MockSubscription | null;
  entitlements: string[];
}

// ---- Subscriptions (all users) ---------------------------------------------
export const mockSubscriptions: MockSubscription[] = [
  {
    id: 'mock-uuid-sub-001',
    user_id: 'mock-uuid-user-001',
    status: 'active',
    stripe_customer_id: 'cus_mock_mariana',
    stripe_subscription_id: 'sub_mock_mariana_001',
    current_period_end: '2026-03-10T08:00:00.000Z',
    updated_at: '2026-02-10T08:00:00.000Z',
  },
  {
    id: 'mock-uuid-sub-002',
    user_id: 'mock-uuid-user-002',
    status: 'active',
    stripe_customer_id: 'cus_mock_diego',
    stripe_subscription_id: 'sub_mock_diego_001',
    current_period_end: '2026-03-01T14:30:00.000Z',
    updated_at: '2026-02-01T14:30:00.000Z',
  },
  {
    id: 'mock-uuid-sub-003',
    user_id: 'mock-uuid-user-003',
    status: 'active',
    stripe_customer_id: 'cus_mock_sofia',
    stripe_subscription_id: 'sub_mock_sofia_001',
    current_period_end: '2026-03-05T09:15:00.000Z',
    updated_at: '2026-02-05T09:15:00.000Z',
  },
  {
    id: 'mock-uuid-sub-004',
    user_id: 'mock-uuid-user-004',
    status: 'canceled',
    stripe_customer_id: 'cus_mock_carlos',
    stripe_subscription_id: 'sub_mock_carlos_001',
    current_period_end: '2026-02-20T11:45:00.000Z',
    updated_at: '2026-02-10T11:45:00.000Z',
  },
  {
    id: 'mock-uuid-sub-005',
    user_id: 'mock-uuid-user-005',
    status: 'trialing',
    stripe_customer_id: 'cus_mock_valentina',
    stripe_subscription_id: 'sub_mock_valentina_001',
    current_period_end: '2026-03-01T07:00:00.000Z',
    updated_at: '2026-02-15T07:00:00.000Z',
  },
];

// ---- Current authenticated user state (Mariana) ----------------------------
export const mockCurrentAuthUser: MockAuthUser = {
  id: 'mock-uuid-user-001',
  email: 'mariana.lopez@example.com',
  email_confirmed_at: '2025-11-10T08:02:00.000Z',
  created_at: '2025-11-10T08:00:00.000Z',
  updated_at: '2026-02-20T10:00:00.000Z',
};

export const mockAuthState: MockAuthState = {
  user: mockCurrentAuthUser,
  isAuthenticated: true,
  isOnboarded: true,
  profile: {
    id: 'mock-uuid-user-001',
    display_name: 'Mariana Lopez',
    avatar_url: 'https://i.pravatar.cc/150?u=mariana',
    community_segment: 'carlotta',
  },
  subscription: mockSubscriptions[0], // active Core subscription
  entitlements: ['core', 'vip', 'mentoria_grupal'],
};

// ---- Helper: create alternate auth states for testing ----------------------

/** Unauthenticated visitor (no session) */
export const mockAuthStateAnonymous: MockAuthState = {
  user: {
    id: '',
    email: '',
    email_confirmed_at: null,
    created_at: '',
    updated_at: '',
  },
  isAuthenticated: false,
  isOnboarded: false,
  profile: {
    id: '',
    display_name: '',
    avatar_url: null,
    community_segment: 'carlotta', // placeholder — unused when not authenticated
  },
  subscription: null,
  entitlements: [],
};

/** Authenticated but not yet onboarded (no segment chosen) */
export const mockAuthStateNotOnboarded: MockAuthState = {
  user: {
    id: 'mock-uuid-user-new',
    email: 'nuevo.usuario@example.com',
    email_confirmed_at: '2026-02-24T10:00:00.000Z',
    created_at: '2026-02-24T10:00:00.000Z',
    updated_at: '2026-02-24T10:00:00.000Z',
  },
  isAuthenticated: true,
  isOnboarded: false,
  profile: {
    id: 'mock-uuid-user-new',
    display_name: '',
    avatar_url: null,
    community_segment: 'carlotta', // placeholder — not yet selected
  },
  subscription: null,
  entitlements: [],
};

/** Free tier user (authenticated + onboarded, no subscription) */
export const mockAuthStateFreeUser: MockAuthState = {
  user: {
    id: 'mock-uuid-user-004',
    email: 'carlos.mendoza@example.com',
    email_confirmed_at: '2026-01-20T11:50:00.000Z',
    created_at: '2026-01-20T11:45:00.000Z',
    updated_at: '2026-02-10T11:45:00.000Z',
  },
  isAuthenticated: true,
  isOnboarded: true,
  profile: {
    id: 'mock-uuid-user-004',
    display_name: 'Carlos Mendoza',
    avatar_url: 'https://i.pravatar.cc/150?u=carlos',
    community_segment: 'gabriel',
  },
  subscription: mockSubscriptions[3], // canceled
  entitlements: [],
};
