import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.ionic.starter',
  appName: 'Chale CRM',
  webDir: 'www',
  server: {
    androidScheme: 'https'
  },
  ios: {
    allowsLinkPreview: false
  },
  android: {
    allowMixedContent: true
  }
};

export default config;
