import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.forerunnersnetwork.fni',
  appName: 'FNI',
  webDir: 'dist',
  bundledWebRuntime: false,
  android: {
    backgroundColor: '#101b45',
  },
};

export default config;
