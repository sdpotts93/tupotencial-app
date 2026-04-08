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
      webInstance = Purchases.configure(apiKey, userId)
    }

    configured.value = true
  }

  // ── Identify user (call after login) ──
  async function login(userId: string) {
    if (!configured.value) return

    if (isNative()) {
      const { Purchases } = await import('@revenuecat/purchases-capacitor')
      await Purchases.logIn({ appUserID: userId })
    } else {
      // Web SDK: reconfigure with the real user ID
      const { Purchases } = await import('@revenuecat/purchases-js')
      const config = useRuntimeConfig()
      const apiKey = config.public.revenueCatApiKey as string
      webInstance = Purchases.configure(apiKey, userId)
    }
  }

  // ── Log out (call on sign-out) ──
  async function logout() {
    if (!configured.value) return

    if (isNative()) {
      const { Purchases } = await import('@revenuecat/purchases-capacitor')
      await Purchases.logOut()
    } else {
      // Web SDK: reconfigure with anonymous user
      const { Purchases } = await import('@revenuecat/purchases-js')
      const config = useRuntimeConfig()
      const apiKey = config.public.revenueCatApiKey as string
      const anonId = Purchases.generateRevenueCatAnonymousAppUserId()
      webInstance = Purchases.configure(apiKey, anonId)
    }
  }

  // ── Check "Tu Potencial Pro" entitlement ──
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

  // ── Present RevenueCat paywall ──
  // Native: opens native paywall modal via RevenueCatUI
  // Web: opens RevenueCat web paywall overlay
  async function presentPaywall(): Promise<'purchased' | 'restored' | 'cancelled' | 'error'> {
    if (!configured.value) return 'error'

    try {
      if (isNative()) {
        const { RevenueCatUI, PAYWALL_RESULT } = await import('@revenuecat/purchases-capacitor-ui')
        const { result } = await RevenueCatUI.presentPaywall()
        switch (result) {
          case PAYWALL_RESULT.PURCHASED: return 'purchased'
          case PAYWALL_RESULT.RESTORED: return 'restored'
          case PAYWALL_RESULT.NOT_PRESENTED:
          case PAYWALL_RESULT.ERROR: return 'error'
          case PAYWALL_RESULT.CANCELLED:
          default: return 'cancelled'
        }
      } else {
        if (!webInstance) return 'error'
        const offerings = await webInstance.getOfferings()
        const currentOffering = offerings.current
        if (!currentOffering) {
          console.error('[RevenueCat] No current offering configured')
          return 'error'
        }
        const { customerInfo } = await webInstance.presentPaywall({ offering: currentOffering })
        const hasPro = ENTITLEMENT_ID in customerInfo.entitlements.active
        return hasPro ? 'purchased' : 'cancelled'
      }
    } catch (e) {
      console.error('[RevenueCat] Paywall error:', e)
      return 'error'
    }
  }

  // ── Present paywall for a specific offering ──
  async function presentPaywallForOffering(offeringId: string): Promise<'purchased' | 'restored' | 'cancelled' | 'error'> {
    if (!configured.value) return 'error'

    try {
      if (isNative()) {
        const { Purchases } = await import('@revenuecat/purchases-capacitor')
        const { RevenueCatUI, PAYWALL_RESULT } = await import('@revenuecat/purchases-capacitor-ui')
        const { offerings } = await Purchases.getOfferings()
        const offering = offerings.all[offeringId]
        if (!offering) {
          console.error(`[RevenueCat] Offering "${offeringId}" not found`)
          return 'error'
        }
        const { result } = await RevenueCatUI.presentPaywallIfNeeded({
          requiredEntitlementIdentifier: ENTITLEMENT_ID,
          offering,
        })
        switch (result) {
          case PAYWALL_RESULT.PURCHASED: return 'purchased'
          case PAYWALL_RESULT.RESTORED: return 'restored'
          case PAYWALL_RESULT.NOT_PRESENTED:
          case PAYWALL_RESULT.ERROR: return 'error'
          case PAYWALL_RESULT.CANCELLED:
          default: return 'cancelled'
        }
      } else {
        if (!webInstance) return 'error'
        const offerings = await webInstance.getOfferings()
        const offering = offerings.all[offeringId]
        if (!offering) {
          console.error(`[RevenueCat] Offering "${offeringId}" not found`)
          return 'error'
        }
        const { customerInfo } = await webInstance.presentPaywall({ offering })
        const hasPro = ENTITLEMENT_ID in customerInfo.entitlements.active
        return hasPro ? 'purchased' : 'cancelled'
      }
    } catch (e) {
      console.error('[RevenueCat] Paywall error:', e)
      return 'error'
    }
  }

  // ── Get available offerings (products) ──
  async function getOfferings() {
    if (!configured.value) return null

    try {
      if (isNative()) {
        const { Purchases } = await import('@revenuecat/purchases-capacitor')
        const { offerings } = await Purchases.getOfferings()
        return offerings
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

  // ── Present Customer Center (native: RevenueCatUI, web: RevenueCat billing portal) ──
  async function presentCustomerCenter(): Promise<void> {
    if (!configured.value) return

    try {
      if (isNative()) {
        const { RevenueCatUI } = await import('@revenuecat/purchases-capacitor-ui')
        await RevenueCatUI.presentCustomerCenter()
      } else {
        // Web: open RevenueCat's management URL (Stripe Customer Portal via RC)
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
    presentPaywall,
    presentPaywallForOffering,
    getOfferings,
    restorePurchases,
    presentCustomerCenter,
  }
}
