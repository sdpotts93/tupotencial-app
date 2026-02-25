// ---------------------------------------------------------------------------
// Mock data: profiles + admin_users
// Matches Supabase schema sections 6.1 (Auth / Profiles / Roles)
// ---------------------------------------------------------------------------

export interface MockProfile {
  id: string;
  display_name: string;
  avatar_url: string | null;
  community_segment: 'gabriel' | 'carlotta' | 'conjunta';
  created_at: string;
}

export interface MockAdminUser {
  id: string;
  user_id: string;
  role: 'admin' | 'editor' | 'read_only';
  created_at: string;
}

// ---- Current signed-in user ------------------------------------------------
export const MOCK_CURRENT_USER_ID = 'mock-uuid-user-001';

// ---- Profiles --------------------------------------------------------------
export const mockProfiles: MockProfile[] = [
  {
    id: 'mock-uuid-user-001',
    display_name: 'Mariana López',
    avatar_url: 'https://i.pravatar.cc/150?u=mariana',
    community_segment: 'carlotta',
    created_at: '2025-11-10T08:00:00.000Z',
  },
  {
    id: 'mock-uuid-user-002',
    display_name: 'Diego Ramírez',
    avatar_url: 'https://i.pravatar.cc/150?u=diego',
    community_segment: 'gabriel',
    created_at: '2025-12-01T14:30:00.000Z',
  },
  {
    id: 'mock-uuid-user-003',
    display_name: 'Sofía Hernández',
    avatar_url: null,
    community_segment: 'conjunta',
    created_at: '2026-01-05T09:15:00.000Z',
  },
  {
    id: 'mock-uuid-user-004',
    display_name: 'Carlos Mendoza',
    avatar_url: 'https://i.pravatar.cc/150?u=carlos',
    community_segment: 'gabriel',
    created_at: '2026-01-20T11:45:00.000Z',
  },
  {
    id: 'mock-uuid-user-005',
    display_name: 'Valentina Torres',
    avatar_url: 'https://i.pravatar.cc/150?u=valentina',
    community_segment: 'carlotta',
    created_at: '2026-02-01T07:00:00.000Z',
  },
];

// ---- Admin users -----------------------------------------------------------
export const mockAdminUsers: MockAdminUser[] = [
  {
    id: 'mock-uuid-admin-001',
    user_id: 'mock-uuid-user-001',
    role: 'admin',
    created_at: '2025-11-10T08:05:00.000Z',
  },
  {
    id: 'mock-uuid-admin-002',
    user_id: 'mock-uuid-user-002',
    role: 'editor',
    created_at: '2025-12-01T14:35:00.000Z',
  },
  {
    id: 'mock-uuid-admin-003',
    user_id: 'mock-uuid-user-004',
    role: 'read_only',
    created_at: '2026-01-21T10:00:00.000Z',
  },
];
