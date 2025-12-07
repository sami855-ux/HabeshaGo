import { v2 as cloudinary, ConfigOptions } from 'cloudinary';

const CLOUDINARY = Symbol('CLOUDINARY');

export const CloudinaryProvider = {
  provide: CLOUDINARY,
  useFactory: (): ConfigOptions => {
    const config: ConfigOptions = {
      cloud_name: 'dxxovha85',
      api_key: '253875477551871',
      api_secret: 'WUyEAsjplIdnHM5QDvsYAEgc-Fw',
      secure: true,
    };

    // Safe, typed, ESLint approved:
    cloudinary.config(config);

    return config;
  },
};
