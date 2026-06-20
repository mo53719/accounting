import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.family.accountbook',
  appName: '小余简单记',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    StatusBar: {
      style: 'LIGHT',
      backgroundColor: '#E8725C'
    },
    Network: {
      emitOnlineEvents: true
    }
  }
};

export default config;
