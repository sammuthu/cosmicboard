import { StorageConfig } from './types';
import { prisma } from '@/lib/prisma';

// Default configuration from environment variables
const defaultConfig: StorageConfig = {
  provider: (process.env.STORAGE_PROVIDER as any) || 'local',
  
  local: {
    basePath: process.env.STORAGE_LOCAL_PATH || './public/uploads',
    baseUrl: process.env.STORAGE_LOCAL_URL || '/uploads',
    createDirectories: true,
  },
  
  s3: {
    bucket: process.env.AWS_S3_BUCKET || '',
    region: process.env.AWS_REGION || 'us-east-1',
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    endpoint: process.env.AWS_S3_ENDPOINT,
    cdn: process.env.AWS_CLOUDFRONT_URL,
  },
  
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
    apiKey: process.env.CLOUDINARY_API_KEY || '',
    apiSecret: process.env.CLOUDINARY_API_SECRET || '',
    folder: process.env.CLOUDINARY_FOLDER || 'cosmicboard',
  },
  
  maxFileSize: parseInt(process.env.MAX_FILE_SIZE_MB || '50') * 1024 * 1024,
  generateThumbnails: process.env.GENERATE_THUMBNAILS !== 'false',
  thumbnailOptions: {
    width: parseInt(process.env.THUMBNAIL_WIDTH || '200'),
    height: parseInt(process.env.THUMBNAIL_HEIGHT || '200'),
    quality: parseInt(process.env.THUMBNAIL_QUALITY || '80'),
  },
};

// Cache for database config
let cachedConfig: StorageConfig | null = null;
let cacheTimestamp: number = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Get storage configuration
 * Priority: Database > Environment > Defaults
 */
export async function getStorageConfig(): Promise<StorageConfig> {
  // Check cache
  if (cachedConfig && Date.now() - cacheTimestamp < CACHE_TTL) {
    return cachedConfig;
  }
  
  try {
    // Try to get config from database (future implementation)
    // This allows dynamic configuration without redeployment
    /*
    const dbConfig = await prisma.systemConfig.findFirst({
      where: { key: 'storage_config' }
    });
    
    if (dbConfig && dbConfig.value) {
      cachedConfig = {
        ...defaultConfig,
        ...JSON.parse(dbConfig.value as string)
      };
      cacheTimestamp = Date.now();
      return cachedConfig;
    }
    */
  } catch (error) {
    console.log('Using default storage config');
  }
  
  // Return default config from environment
  cachedConfig = defaultConfig;
  cacheTimestamp = Date.now();
  return cachedConfig;
}

/**
 * Update storage configuration in database
 * This allows runtime configuration changes
 */
export async function updateStorageConfig(config: Partial<StorageConfig>): Promise<void> {
  // Future implementation: Save to database
  /*
  await prisma.systemConfig.upsert({
    where: { key: 'storage_config' },
    create: {
      key: 'storage_config',
      value: JSON.stringify(config),
      description: 'Storage provider configuration'
    },
    update: {
      value: JSON.stringify(config),
      updatedAt: new Date()
    }
  });
  */
  
  // Clear cache
  cachedConfig = null;
  cacheTimestamp = 0;
}

// Allowed MIME types by media type
export const ALLOWED_MIME_TYPES = {
  photo: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'],
  screenshot: ['image/png', 'image/jpeg'],
  pdf: ['application/pdf'],
  document: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ],
  video: ['video/mp4', 'video/quicktime', 'video/webm'],
};

export function validateMimeType(mimeType: string, mediaType: keyof typeof ALLOWED_MIME_TYPES): boolean {
  return ALLOWED_MIME_TYPES[mediaType]?.includes(mimeType) || false;
}