// Composable for checking entitlement-based gating on programs & content
// Queries addon_entitlements + addons from Supabase

interface AddonInfo {
  id: string
  title: string
  description: string | null
}

export function useEntitlementGating() {
  const { hasEntitlement } = useAuth()
  const client = useSupabaseClient()
  const addonMap = useState<Record<string, AddonInfo>>('entitlement-addon-map', () => ({}))

  // Fetch addon entitlements once, cache in state
  async function ensureLoaded() {
    if (Object.keys(addonMap.value).length) return
    const { data } = await client
      .from('addon_entitlements')
      .select('entitlement_key, addon_id, addons(id, title, description)')
    for (const row of data ?? []) {
      const addon = row.addons as unknown as AddonInfo | null
      if (addon) {
        addonMap.value[row.entitlement_key] = addon
      }
    }
  }

  // Eagerly load on first use
  ensureLoaded()

  function isLocked(entitlementKey: string | null): boolean {
    if (!entitlementKey) return false
    return !hasEntitlement(entitlementKey)
  }

  function getAddonForEntitlement(entitlementKey: string): AddonInfo | null {
    return addonMap.value[entitlementKey] ?? null
  }

  return { isLocked, getAddonForEntitlement }
}
