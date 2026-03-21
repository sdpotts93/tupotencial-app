import { Capacitor } from '@capacitor/core'

/**
 * Detect native platform at runtime.
 * - `isNative`: true when running inside Capacitor (iOS/Android), false on web
 * - `platform`: 'ios' | 'android' | 'web'
 */
export function useNativePlatform() {
  const isNative = computed(() => Capacitor.isNativePlatform())
  const platform = computed(() => Capacitor.getPlatform() as 'ios' | 'android' | 'web')

  return {
    isNative,
    platform,
  }
}
