// Composable for checking entitlement-based gating on programs & content
// Uses mock data; swap to Supabase queries later

interface AddonInfo {
  id: string
  title: string
  description: string | null
}

// Mock mapping: entitlement_key → addon info
// Mirrors mockAddonEntitlements + mockAddons from packages/shared/mock/addons.ts
const entitlementAddonMap: Record<string, AddonInfo> = {
  mentoria_grupal: {
    id: 'mock-uuid-addon-001',
    title: 'Mentoría grupal mensual',
    description: 'Sesión grupal de mentoría de 90 minutos una vez al mes con Carlotta o Gabriel.',
  },
  vip: {
    id: 'mock-uuid-addon-002',
    title: 'Acceso VIP: Contenido exclusivo',
    description: 'Desbloquea contenido premium que no está disponible en la membresía Core.',
  },
  bootcamp_liderazgo: {
    id: 'mock-uuid-addon-003',
    title: 'Bootcamp: Liderazgo Interior (acceso completo)',
    description: 'Acceso completo al bootcamp intensivo de 14 días.',
  },
  coaching_1on1: {
    id: 'mock-uuid-addon-004',
    title: 'Sesión 1:1 con coach certificado',
    description: 'Una sesión individual de 60 minutos con un coach certificado de Tu Potencial.',
  },
  retiro_marzo_2026: {
    id: 'mock-uuid-addon-005',
    title: 'Retiro presencial: Reconexión (marzo 2026)',
    description: 'Retiro de fin de semana en Valle de Bravo.',
  },
}

export function useEntitlementGating() {
  const { hasEntitlement } = useAuth()

  function isLocked(entitlementKey: string | null): boolean {
    if (!entitlementKey) return false
    return !hasEntitlement(entitlementKey)
  }

  function getAddonForEntitlement(entitlementKey: string): AddonInfo | null {
    return entitlementAddonMap[entitlementKey] ?? null
  }

  return { isLocked, getAddonForEntitlement }
}
