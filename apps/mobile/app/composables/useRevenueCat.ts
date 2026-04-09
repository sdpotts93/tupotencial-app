// RevenueCat composable — unified purchases for native (Capacitor) and web (JS SDK).
// Native: uses @revenuecat/purchases-capacitor + purchases-capacitor-ui
// Web:    uses @revenuecat/purchases-js (Stripe-backed via RevenueCat)

import { Capacitor } from '@capacitor/core'
import type { Purchases as PurchasesWeb } from '@revenuecat/purchases-js'

const ENTITLEMENT_ID = 'core'
type PurchaseOutcome = 'purchased' | 'restored' | 'cancelled' | 'error'

/** Whether the SDK has been configured (once per app lifecycle). */
const configured = ref(false)

/** Web SDK instance (only populated on web). */
let webInstance: PurchasesWeb | null = null
let currentAppUserId: string | null = null
let currentEmail: string | null = null
let identitySyncQueue: Promise<void> = Promise.resolve()
let inFlightIdentityKey: string | null = null
let inFlightIdentityPromise: Promise<void> | null = null

function isNative() {
  return Capacitor.isNativePlatform()
}

function normalizeEmail(email?: string | null) {
  return email?.trim().toLowerCase() ?? null
}

export function useRevenueCat() {
  async function ensureWebSessionIdentity() {
    if (isNative() || !configured.value) return

    const client = useSupabaseClient()
    const { data: { session } } = await client.auth.getSession()
    const sessionUserId = session?.user?.id
    if (!sessionUserId) return

    const sessionEmail = normalizeEmail(session.user.email)
    await login(sessionUserId, sessionEmail)
  }

  async function syncAttributes(userId: string, email?: string | null) {
    const normalizedEmail = normalizeEmail(email)

    if (isNative()) {
      const { Purchases } = await import('@revenuecat/purchases-capacitor')
      await Purchases.setAttributes({ supabase_user_id: userId })
      if (normalizedEmail) {
        await Purchases.setEmail({ email: normalizedEmail })
      }
      return
    }

    if (!webInstance) return
    await webInstance.setAttributes({
      $email: normalizedEmail,
      supabase_user_id: userId,
    })
  }

  // ── Configure SDK (call once at app boot via plugin) ──
  async function configure(apiKey: string, appUserId?: string) {
    if (configured.value) return

    if (isNative()) {
      const { Purchases, LOG_LEVEL } = await import('@revenuecat/purchases-capacitor')
      await Purchases.setLogLevel({ level: LOG_LEVEL.DEBUG })
      await Purchases.configure({ apiKey })
    } else {
      const { Purchases } = await import('@revenuecat/purchases-js')
      const userId = appUserId ?? Purchases.generateRevenueCatAnonymousAppUserId()
      webInstance = Purchases.configure({ apiKey, appUserId: userId })
      currentAppUserId = userId
    }

    configured.value = true
  }

  // ── Identify user (call after login) ──
  async function login(userId: string, email?: string | null) {
    if (!configured.value) return

    const normalizedEmail = normalizeEmail(email)
    const identityKey = `${userId}::${normalizedEmail ?? ''}`

    if (currentAppUserId === userId && currentEmail === normalizedEmail) {
      return
    }

    if (inFlightIdentityPromise && inFlightIdentityKey === identityKey) {
      await inFlightIdentityPromise
      return
    }

    const nextTask = identitySyncQueue.catch(() => {}).then(async () => {
      if (currentAppUserId === userId && currentEmail === normalizedEmail) {
        return
      }

      if (isNative()) {
        const { Purchases } = await import('@revenuecat/purchases-capacitor')
        if (currentAppUserId !== userId) {
          await Purchases.logIn({ appUserID: userId })
        }
      } else if (!webInstance) {
        const { Purchases } = await import('@revenuecat/purchases-js')
        const config = useRuntimeConfig()
        const apiKey = config.public.revenueCatApiKey as string
        webInstance = Purchases.configure({ apiKey, appUserId: userId })
      } else if (currentAppUserId !== userId) {
        await webInstance.changeUser(userId)
      }

      if (currentAppUserId !== userId || currentEmail !== normalizedEmail) {
        await syncAttributes(userId, normalizedEmail)
      }

      currentAppUserId = userId
      currentEmail = normalizedEmail
    })

    identitySyncQueue = nextTask
    inFlightIdentityKey = identityKey
    const settledTask = nextTask.finally(() => {
      if (inFlightIdentityPromise === settledTask) {
        inFlightIdentityKey = null
        inFlightIdentityPromise = null
      }
    })
    inFlightIdentityPromise = settledTask
    await settledTask
  }

  // ── Log out (call on sign-out) ──
  async function logout() {
    if (!configured.value) return

    if (isNative()) {
      const { Purchases } = await import('@revenuecat/purchases-capacitor')
      await Purchases.logOut()
      currentAppUserId = null
      currentEmail = null
    } else {
      const { Purchases } = await import('@revenuecat/purchases-js')
      const config = useRuntimeConfig()
      const apiKey = config.public.revenueCatApiKey as string
      const anonId = Purchases.generateRevenueCatAnonymousAppUserId()
      webInstance = Purchases.configure({ apiKey, appUserId: anonId })
      currentAppUserId = anonId
      currentEmail = null
    }
  }

  // ── Check entitlement ──
  async function isProEntitled(): Promise<boolean> {
    if (!configured.value) return false

    try {
      if (isNative()) {
        const { Purchases } = await import('@revenuecat/purchases-capacitor')
        const { customerInfo } = await Purchases.getCustomerInfo()
        return typeof customerInfo.entitlements.active[ENTITLEMENT_ID] !== 'undefined'
      } else {
        await ensureWebSessionIdentity()
        if (!webInstance) return false
        const customerInfo = await webInstance.getCustomerInfo()
        return ENTITLEMENT_ID in customerInfo.entitlements.active
      }
    } catch {
      console.error('[RevenueCat] Failed to fetch customer info')
      return false
    }
  }

  // ── Get full customer info ──
  async function getCustomerInfo() {
    if (!configured.value) return null

    try {
      if (isNative()) {
        const { Purchases } = await import('@revenuecat/purchases-capacitor')
        const { customerInfo } = await Purchases.getCustomerInfo()
        return customerInfo
      } else {
        await ensureWebSessionIdentity()
        if (!webInstance) return null
        return await webInstance.getCustomerInfo()
      }
    } catch {
      console.error('[RevenueCat] Failed to fetch customer info')
      return null
    }
  }

  async function ensureWebPurchaseIdentity() {
    if (isNative() || !configured.value || !webInstance) return null

    const client = useSupabaseClient()
    const { data: { session } } = await client.auth.getSession()
    const sessionUserId = session?.user?.id
    const sessionEmail = normalizeEmail(session?.user?.email)

    if (sessionUserId) {
      await login(sessionUserId, sessionEmail)
      if (sessionEmail) {
        await client.from('profiles').update({ email: sessionEmail }).eq('id', sessionUserId)
      }
    }

    return { sessionEmail }
  }

  async function purchaseWebPackage(
    resolvePackage: (offerings: Awaited<ReturnType<PurchasesWeb['getOfferings']>>) => { rcPackage: any, expectedEntitlementId?: string | null } | null,
  ): Promise<PurchaseOutcome> {
    if (!webInstance) return 'error'

    const identity = await ensureWebPurchaseIdentity()
    const offerings = await webInstance.getOfferings()
    const purchaseTarget = resolvePackage(offerings)
    if (!purchaseTarget?.rcPackage) {
      console.error('[RevenueCat] No package available')
      return 'error'
    }

    const { customerInfo } = await webInstance.purchase({
      rcPackage: purchaseTarget.rcPackage,
      selectedLocale: 'es',
      customerEmail: identity?.sessionEmail ?? undefined,
    })

    if (!purchaseTarget.expectedEntitlementId) return 'purchased'
    return purchaseTarget.expectedEntitlementId in customerInfo.entitlements.active ? 'purchased' : 'cancelled'
  }

  // ── Purchase the current offering's first package ──
  // Native: opens App Store / Play Store purchase sheet directly
  // Web: calls purchase() directly with locale support
  async function purchaseCurrentOffering(): Promise<PurchaseOutcome> {
    if (!configured.value) return 'error'

    try {
      if (isNative()) {
        const { Purchases } = await import('@revenuecat/purchases-capacitor')
        const offerings = await Purchases.getOfferings()
        const pkg = offerings.current?.availablePackages[0]
        if (!pkg) {
          console.error('[RevenueCat] No package available')
          return 'error'
        }
        const { customerInfo } = await Purchases.purchasePackage({ aPackage: pkg })
        const hasPro = typeof customerInfo.entitlements.active[ENTITLEMENT_ID] !== 'undefined'
        return hasPro ? 'purchased' : 'cancelled'
      } else {
        return await purchaseWebPackage((offerings) => {
          const pkg = offerings.current?.availablePackages[0] ?? null
          return pkg ? { rcPackage: pkg, expectedEntitlementId: ENTITLEMENT_ID } : null
        })
      }
    } catch (e) {
      console.error('[RevenueCat] Purchase error:', e)
      return 'error'
    }
  }

  async function purchaseAddon(
    offeringId: string,
    packageId?: string | null,
    entitlementId?: string | null,
  ): Promise<PurchaseOutcome> {
    if (!configured.value || isNative()) return 'error'

    try {
      return await purchaseWebPackage((offerings) => {
        const offering = offerings.all[offeringId]
        if (!offering) {
          console.error(`[RevenueCat] Offering ${offeringId} not found`)
          return null
        }

        const pkg = packageId
          ? offering.packagesById[packageId] ?? null
          : offering.availablePackages[0] ?? null

        if (!pkg) {
          console.error(`[RevenueCat] Package ${packageId ?? '(default)'} not found in offering ${offeringId}`)
          return null
        }

        return {
          rcPackage: pkg,
          expectedEntitlementId: entitlementId ?? null,
        }
      })
    } catch (e) {
      console.error('[RevenueCat] Add-on purchase error:', e)
      return 'error'
    }
  }

  // ── Get available offerings (products) ──
  async function getOfferings() {
    if (!configured.value) return null

    try {
      if (isNative()) {
        const { Purchases } = await import('@revenuecat/purchases-capacitor')
        return await Purchases.getOfferings()
      } else {
        if (!webInstance) return null
        return await webInstance.getOfferings()
      }
    } catch (e) {
      console.error('[RevenueCat] Failed to fetch offerings:', e)
      return null
    }
  }

  // ── Restore purchases (native only — web doesn't need this) ──
  async function restorePurchases() {
    if (!configured.value || !isNative()) return null

    const { Purchases } = await import('@revenuecat/purchases-capacitor')
    try {
      const { customerInfo } = await Purchases.restorePurchases()
      return customerInfo
    } catch (e) {
      console.error('[RevenueCat] Restore failed:', e)
      return null
    }
  }

  // ── Present Customer Center (native: RevenueCatUI, web: management URL) ──
  async function presentCustomerCenter(): Promise<void> {
    if (!configured.value) return

    try {
      if (isNative()) {
        const { RevenueCatUI } = await import('@revenuecat/purchases-capacitor-ui')
        await RevenueCatUI.presentCustomerCenter()
      } else {
        await ensureWebSessionIdentity()
        if (!webInstance) return
        const customerInfo = await webInstance.getCustomerInfo()
        const managementUrl = customerInfo.managementURL
        if (managementUrl) {
          window.open(managementUrl, '_blank')
        }
      }
    } catch (e) {
      console.error('[RevenueCat] Customer Center error:', e)
    }
  }

  return {
    configured: readonly(configured),
    configure,
    login,
    logout,
    isProEntitled,
    getCustomerInfo,
    purchaseCurrentOffering,
    purchaseAddon,
    getOfferings,
    restorePurchases,
    presentCustomerCenter,
  }
}
