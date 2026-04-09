interface AdminAddonRelation {
  title?: string | null
  status?: string | null
}

interface AdminEntitlementRow {
  entitlement_key: string
  addons?: AdminAddonRelation | AdminAddonRelation[] | null
}

interface AdminEntitlementOption {
  value: string
  label: string
}

function normalizeAddon(addons: AdminEntitlementRow['addons']): AdminAddonRelation | null {
  if (Array.isArray(addons)) return addons[0] ?? null
  return addons ?? null
}

function addonScore(addon: AdminAddonRelation | null): number {
  if (!addon) return 0

  let score = 0
  if (addon.title) score += 2
  if (addon.status === 'active') score += 1
  return score
}

export async function useAdminEntitlements() {
  const client = useSupabaseClient()

  const { data, refresh, status, error } = await useAsyncData('admin-entitlements', async () => {
    const { data, error } = await client
      .from('addon_entitlements')
      .select('entitlement_key, addons(title, status)')

    if (error) throw error
    return (data ?? []) as AdminEntitlementRow[]
  })

  const entries = computed(() => {
    const byKey = new Map<string, { key: string; label: string; score: number }>()

    for (const row of data.value ?? []) {
      if (!row.entitlement_key) continue

      const addon = normalizeAddon(row.addons)
      const labelBase = addon?.title?.trim() || row.entitlement_key
      const label = addon?.status === 'inactive' ? `${labelBase} (inactivo)` : labelBase
      const score = addonScore(addon)
      const current = byKey.get(row.entitlement_key)

      if (!current || score > current.score) {
        byKey.set(row.entitlement_key, {
          key: row.entitlement_key,
          label,
          score,
        })
      }
    }

    return [...byKey.values()].sort((a, b) => a.label.localeCompare(b.label, 'es-MX'))
  })

  const entitlementOptions = computed<AdminEntitlementOption[]>(() => [
    { value: '', label: 'Sin restriccion (abierto)' },
    ...entries.value.map(entry => ({ value: entry.key, label: entry.label })),
  ])

  const entitlementLabels = computed<Record<string, string>>(() =>
    Object.fromEntries(entries.value.map(entry => [entry.key, entry.label])),
  )

  return {
    entitlementData: data,
    entitlementOptions,
    entitlementLabels,
    refreshEntitlements: refresh,
    entitlementsStatus: status,
    entitlementsError: error,
  }
}
