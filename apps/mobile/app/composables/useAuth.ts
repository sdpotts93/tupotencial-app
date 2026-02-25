// Dev-mode mock auth composable
// Shaped to match Supabase auth for easy swap later
import { useState } from '#app'

export interface AuthUser {
  id: string
  email: string
  display_name: string
  avatar_url: string | null
  community_segment: 'gabriel' | 'carlotta' | 'conjunta' | null
  is_subscriber: boolean
  subscription_status: string | null
  entitlements: string[]
  is_admin: boolean
}

export function useAuth() {
  const user = useState<AuthUser | null>('auth-user', () => ({
    id: 'mock-user-001',
    email: 'maria@ejemplo.com',
    display_name: 'María García',
    avatar_url: null,
    community_segment: 'carlotta',
    is_subscriber: true,
    subscription_status: 'active',
    entitlements: ['core'],
    is_admin: false,
  }))

  const isLoggedIn = computed(() => !!user.value)
  const isOnboarded = computed(() => !!user.value?.community_segment)
  const isSubscriber = computed(() => !!user.value?.is_subscriber)

  function hasEntitlement(key: string) {
    return user.value?.entitlements.includes(key) ?? false
  }

  async function login(email: string, _password: string) {
    // Mock login
    user.value = {
      id: 'mock-user-001',
      email,
      display_name: 'María García',
      avatar_url: null,
      community_segment: 'carlotta',
      is_subscriber: true,
      subscription_status: 'active',
      entitlements: ['core'],
      is_admin: false,
    }
  }

  async function register(email: string, _password: string) {
    user.value = {
      id: 'mock-user-new',
      email,
      display_name: '',
      avatar_url: null,
      community_segment: null,
      is_subscriber: false,
      subscription_status: null,
      entitlements: [],
      is_admin: false,
    }
  }

  function logout() {
    user.value = null
    navigateTo('/auth/login')
  }

  function setSegment(segment: 'gabriel' | 'carlotta' | 'conjunta') {
    if (user.value) {
      user.value = { ...user.value, community_segment: segment }
    }
  }

  function updateProfile(data: { display_name?: string; avatar_url?: string | null }) {
    if (user.value) {
      user.value = { ...user.value, ...data }
    }
  }

  return {
    user,
    isLoggedIn,
    isOnboarded,
    isSubscriber,
    hasEntitlement,
    login,
    register,
    logout,
    setSegment,
    updateProfile,
  }
}
