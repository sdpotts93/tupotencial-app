// RevenueCat composable — handles native IAP (Capacitor) and paywall presentation
// Web purchases continue through Stripe; this composable only activates on native.

import { Capacitor } from '@capacitor/core'

const ENTITLEMENT_ID = 'Tu Potencial Pro'

/** Whether the SDK has been configured (once per app lifecycle). */
const configured = ref(false)

export function useRevenueCat() {
  const { isNative } = useNativePlatform()

  // ── Configure SDK (call once at app boot via plugin) ──
  async function configure(apiKey: string) {
    if (!isNative.value || configured.value) return

    const { Purchases, LOG_LEVEL } = await import('@revenuecat/purchases-capacitor')
    await Purchases.setLogLevel({ level: LOG_LEVEL.DEBUG })
    await Purchases.configure({ apiKey })
    configured.value = true
  }

  // ── Identify user (call after login) ──
  async function login(userId: string) {
    if (!isNative.value || !configured.value) return
    const { Purchases } = await import('@revenuecat/purchases-capacitor')
    await Purchases.logIn({ appUserID: userId })
  }

  // ── Log out (call on sign-out) ──
  async function logout() {
    if (!isNative.value || !configured.value) return
    const { Purchases } = await import('@revenuecat/purchases-capacitor')
    await Purchases.logOut()
  }

  // ── Check "Tu Potencial Pro" entitlement ──
  async function isProEntitled(): Promise<boolean> {
    if (!isNative.value || !configured.value) return false

    const { Purchases } = await import('@revenuecat/purchases-capacitor')
    try {
      const { customerInfo } = await Purchases.getCustomerInfo()
      return typeof customerInfo.entitlements.active[ENTITLEMENT_ID] !== 'undefined'
    } catch {
      console.error('[RevenueCat] Failed to fetch customer info')
      return false
    }
  }

  // ── Get full customer info ──
  async function getCustomerInfo() {
    if (!isNative.value || !configured.value) return null

    const { Purchases } = await import('@revenuecat/purchases-capacitor')
    try {
      const { customerInfo } = await Purchases.getCustomerInfo()
      return customerInfo
    } catch {
      console.error('[RevenueCat] Failed to fetch customer info')
      return null
    }
  }

  // ── Present RevenueCat paywall (native only) ──
  async function presentPaywall(): Promise<'purchased' | 'restored' | 'cancelled' | 'error'> {
    if (!isNative.value || !configured.value) return 'error'

    const { RevenueCatUI, PAYWALL_RESULT } = await import('@revenuecat/purchases-capacitor-ui')
    try {
      const { result } = await RevenueCatUI.presentPaywall()
      switch (result) {
        case PAYWALL_RESULT.PURCHASED:
          return 'purchased'
        case PAYWALL_RESULT.RESTORED:
          return 'restored'
        case PAYWALL_RESULT.NOT_PRESENTED:
        case PAYWALL_RESULT.ERROR:
          return 'error'
        case PAYWALL_RESULT.CANCELLED:
        default:
          return 'cancelled'
      }
    } catch (e) {
      console.error('[RevenueCat] Paywall error:', e)
      return 'error'
    }
  }

  // ── Present RevenueCat paywall for a specific offering ──
  async function presentPaywallForOffering(offeringId: string): Promise<'purchased' | 'restored' | 'cancelled' | 'error'> {
    if (!isNative.value || !configured.value) return 'error'

    const { Purchases } = await import('@revenuecat/purchases-capacitor')
    const { RevenueCatUI, PAYWALL_RESULT } = await import('@revenuecat/purchases-capacitor-ui')
    try {
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
        case PAYWALL_RESULT.PURCHASED:
          return 'purchased'
        case PAYWALL_RESULT.RESTORED:
          return 'restored'
        case PAYWALL_RESULT.NOT_PRESENTED:
        case PAYWALL_RESULT.ERROR:
          return 'error'
        case PAYWALL_RESULT.CANCELLED:
        default:
          return 'cancelled'
      }
    } catch (e) {
      console.error('[RevenueCat] Paywall error:', e)
      return 'error'
    }
  }

  // ── Get available offerings (products) ──
  async function getOfferings() {
    if (!isNative.value || !configured.value) return null

    const { Purchases } = await import('@revenuecat/purchases-capacitor')
    try {
      const { offerings } = await Purchases.getOfferings()
      return offerings
    } catch (e) {
      console.error('[RevenueCat] Failed to fetch offerings:', e)
      return null
    }
  }

  // ── Restore purchases ──
  async function restorePurchases() {
    if (!isNative.value || !configured.value) return null

    const { Purchases } = await import('@revenuecat/purchases-capacitor')
    try {
      const { customerInfo } = await Purchases.restorePurchases()
      return customerInfo
    } catch (e) {
      console.error('[RevenueCat] Restore failed:', e)
      return null
    }
  }

  // ── Present Customer Center (manage subscription, request refund) ──
  async function presentCustomerCenter(): Promise<void> {
    if (!isNative.value || !configured.value) return

    const { RevenueCatUI } = await import('@revenuecat/purchases-capacitor-ui')
    try {
      await RevenueCatUI.presentCustomerCenter()
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
