// Storage Provider Types and Interfaces

export interface StorageFile {
  buffer: Buffer;
  originalName: string;
  mimeType: string;
  size: number;
}

export interface StorageResult {
  url: string;
  key: string;
  size: number;
  mimeType: string;
  metadata?: Record<string, any>;
}

export interface ThumbnailOptions {
  width: number;
  height: number;
  quality?: number;
}

export interface StorageProvider {
  name: string;
  
  // Core operations
  upload(file: StorageFile, path: string): Promise<StorageResult>;
  delete(key: string): Promise<void>;
  exists(key: string): Promise<boolean>;
  getUrl(key: string): Promise<string>;
  
  // Optional operations
  generateThumbnail?(file: StorageFile, options: ThumbnailOptions): Promise<StorageResult>;
  move?(oldKey: string, newKey: string): Promise<void>;
  copy?(sourceKey: string, destKey: string): Promise<void>;
  list?(prefix: string): Promise<string[]>;
}

export interface StorageConfig {
  provider: 'local' | 's3' | 'cloudinary' | 'azure' | 'gcs';
  local?: {
    basePath: string;
    baseUrl: string;
    createDirectories?: boolean;
  };
  s3?: {
    bucket: string;
    region: string;
    accessKeyId: string;
    secretAccessKey: string;
    endpoint?: string; // For S3-compatible services
    cdn?: string; // CloudFront URL
  };
  cloudinary?: {
    cloudName: string;
    apiKey: string;
    apiSecret: string;
    folder?: string;
  };
  azure?: {
    connectionString: string;
    containerName: string;
  };
  gcs?: {
    projectId: string;
    keyFilename: string;
    bucketName: string;
  };
  
  // Global settings
  maxFileSize?: number;
  allowedMimeTypes?: string[];
  generateThumbnails?: boolean;
  thumbnailOptions?: ThumbnailOptions;
}

export type MediaType = 'photo' | 'screenshot' | 'pdf' | 'document' | 'video';

export interface MediaMetadata {
  width?: number;
  height?: number;
  duration?: number; // For videos
  pages?: number; // For PDFs
  format?: string;
  colorSpace?: string;
  hasAlpha?: boolean;
  orientation?: number;
  [key: string]: any;
}