import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'com.tupotencial.app',
  appName: 'Tu Potencial',
  webDir: '.output/public',
  server: {
    // During development, point to your local Nuxt dev server:
    // url: 'http://192.168.x.x:3000',
    // cleartext: true,
  },
  plugins: {
    SplashScreen: {
      launchAutoHide: false,
      backgroundColor: '#282828',
      showSpinner: false,
    },
    StatusBar: {
      style: 'LIGHT',
      backgroundColor: '#282828',
    },
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
    ScreenOrientation: {
      // Locked to portrait globally; unlocked on media routes in-app
    },
  },
  ios: {
    scheme: 'Tu Potencial',
    contentInset: 'automatic',
  },
  android: {
    buildOptions: {
      keystorePath: undefined,
      keystoreAlias: undefined,
    },
  },
}

export default config
