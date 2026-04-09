// RevenueCat composable — unified purchases for native (Capacitor) and web (JS SDK).
// Native: uses @revenuecat/purchases-capacitor + purchases-capacitor-ui
// Web:    uses @revenuecat/purchases-js (Stripe-backed via RevenueCat)

import { Capacitor } from '@capacitor/core'
import type { Purchases as PurchasesWeb } from '@revenuecat/purchases-js'

const ENTITLEMENT_ID = 'core'

/** Whether the SDK has been configured (once per app lifecycle). */
const configured = ref(false)

/** Web SDK instance (only populated on web). */
let webInstance: PurchasesWeb | null = null

function isNative() {
  return Capacitor.isNativePlatform()
}

export function useRevenueCat() {
  async function syncAttributes(userId: string, email?: string | null) {
    if (isNative()) {
      const { Purchases } = await import('@revenuecat/purchases-capacitor')
      await Purchases.setAttributes({ supabase_user_id: userId })
      if (email) {
        await Purchases.setEmail({ email })
      }
      return
    }

    if (!webInstance) return
    await webInstance.setAttributes({
      $email: email ?? null,
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
    }

    configured.value = true
  }

  // ── Identify user (call after login) ──
  async function login(userId: string, email?: string | null) {
    if (!configured.value) return

    if (isNative()) {
      const { Purchases } = await import('@revenuecat/purchases-capacitor')
      await Purchases.logIn({ appUserID: userId })
    } else {
      if (!webInstance) {
        const { Purchases } = await import('@revenuecat/purchases-js')
        const config = useRuntimeConfig()
        const apiKey = config.public.revenueCatApiKey as string
        webInstance = Purchases.configure({ apiKey, appUserId: userId })
      } else {
        await webInstance.changeUser(userId)
      }
    }

    await syncAttributes(userId, email)
  }

  // ── Log out (call on sign-out) ──
  async function logout() {
    if (!configured.value) return

    if (isNative()) {
      const { Purchases } = await import('@revenuecat/purchases-capacitor')
      await Purchases.logOut()
    } else {
      const { Purchases } = await import('@revenuecat/purchases-js')
      const config = useRuntimeConfig()
      const apiKey = config.public.revenueCatApiKey as string
      const anonId = Purchases.generateRevenueCatAnonymousAppUserId()
      webInstance = Purchases.configure({ apiKey, appUserId: anonId })
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
        if (!webInstance) return null
        return await webInstance.getCustomerInfo()
      }
    } catch {
      console.error('[RevenueCat] Failed to fetch customer info')
      return null
    }
  }

  // ── Purchase the current offering's first package ──
  // Native: opens App Store / Play Store purchase sheet directly
  // Web: calls purchase() directly with locale support
  async function purchaseCurrentOffering(): Promise<'purchased' | 'restored' | 'cancelled' | 'error'> {
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
        if (!webInstance) return 'error'
        const client = useSupabaseClient()
        const { data: { session } } = await client.auth.getSession()
        const sessionUserId = session?.user?.id
        const sessionEmail = session?.user?.email?.trim().toLowerCase() ?? null

        // Ensure web purchases are always made against the signed-in Supabase user,
        // not an anonymous RevenueCat customer created earlier in the app lifecycle.
        if (sessionUserId) {
          await login(sessionUserId, sessionEmail)
          if (sessionEmail) {
            await client.from('profiles').update({ email: sessionEmail }).eq('id', sessionUserId)
          }
        }

        const offerings = await webInstance.getOfferings()
        const pkg = offerings.current?.availablePackages[0]
        if (!pkg) {
          console.error('[RevenueCat] No package available')
          return 'error'
        }
        const { customerInfo } = await webInstance.purchase({
          rcPackage: pkg,
          selectedLocale: 'es',
          customerEmail: sessionEmail ?? undefined,
        })
        const hasPro = ENTITLEMENT_ID in customerInfo.entitlements.active
        return hasPro ? 'purchased' : 'cancelled'
      }
    } catch (e) {
      console.error('[RevenueCat] Purchase error:', e)
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
    getOfferings,
    restorePurchases,
    presentCustomerCenter,
  }
}
