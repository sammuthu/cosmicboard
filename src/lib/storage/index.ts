import { StorageProvider, StorageConfig } from './types';
import { LocalStorageProvider } from './providers/local';
import { S3StorageProvider } from './providers/s3';
import { getStorageConfig } from './config';

let storageInstance: StorageProvider | null = null;

/**
 * Get the configured storage provider instance
 */
export async function getStorage(): Promise<StorageProvider> {
  if (storageInstance) {
    return storageInstance;
  }
  
  const config = await getStorageConfig();
  
  switch (config.provider) {
    case 'local':
      if (!config.local) {
        throw new Error('Local storage configuration missing');
      }
      storageInstance = new LocalStorageProvider(
        config.local.basePath,
        config.local.baseUrl
      );
      break;
      
    case 's3':
      if (!config.s3 || !config.s3.bucket) {
        throw new Error('S3 storage configuration missing');
      }
      storageInstance = new S3StorageProvider(config.s3);
      break;
      
    // Add more providers here as needed
    /*
    case 'cloudinary':
      storageInstance = new CloudinaryStorageProvider(config.cloudinary);
      break;
      
    case 'azure':
      storageInstance = new AzureStorageProvider(config.azure);
      break;
      
    case 'gcs':
      storageInstance = new GCSStorageProvider(config.gcs);
      break;
    */
      
    default:
      throw new Error(`Unknown storage provider: ${config.provider}`);
  }
  
  return storageInstance;
}

/**
 * Clear the cached storage instance
 * Useful when configuration changes
 */
export function clearStorageCache(): void {
  storageInstance = null;
}

// Re-export types for convenience
export * from './types';
export * from './config';