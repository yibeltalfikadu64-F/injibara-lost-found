import type { ExpoConfig, ConfigContext } from 'expo/config';
import appJson from './app.json';

const DEFAULT_API_URL = 'http://localhost:5000/api/v1';

export default ({ config }: ConfigContext): ExpoConfig => {
  // Preserve app.json settings if Expo does not provide config.
  const baseConfig: ExpoConfig = config ?? appJson.expo;

  const apiUrl =
    process.env.EXPO_PUBLIC_API_URL || DEFAULT_API_URL;

  const appEnvironment =
    process.env.EXPO_PUBLIC_APP_ENV || 'development';

  return {
    ...baseConfig,

    name: 'Injibara Campus Lost & Found',
    slug: 'injibara-campus-lost-found',
    version: '1.0.0',
    scheme: 'injibara-lost-found',
    orientation: 'portrait',
    userInterfaceStyle: 'automatic',
    newArchEnabled: true,

    extra: {
      ...(baseConfig.extra ?? {}),

      appName: 'Injibara Campus Lost & Found',
      appVersion: '1.0.0',
      apiUrl,
      appEnvironment,

      eas: {
        ...(baseConfig.extra?.eas ?? {}),
      },
    },
  };
};
