import { StorageProvider, StorageFile, StorageResult, ThumbnailOptions } from '../types';
import crypto from 'crypto';
import path from 'path';

// S3 Provider implementation (requires @aws-sdk/client-s3)
// This is a template for when you're ready to use S3

export class S3StorageProvider implements StorageProvider {
  name = 's3';
  private bucket: string;
  private region: string;
  private cdnUrl?: string;
  // private s3Client: S3Client; // Uncomment when using @aws-sdk/client-s3
  
  constructor(config: {
    bucket: string;
    region: string;
    accessKeyId: string;
    secretAccessKey: string;
    endpoint?: string;
    cdn?: string;
  }) {
    this.bucket = config.bucket;
    this.region = config.region;
    this.cdnUrl = config.cdn;
    
    // Initialize S3 client when ready to use
    /*
    this.s3Client = new S3Client({
      region: config.region,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
      endpoint: config.endpoint, // For S3-compatible services like MinIO
    });
    */
  }
  
  private generateKey(originalName: string, prefix?: string): string {
    const timestamp = Date.now();
    const hash = crypto.randomBytes(8).toString('hex');
    const ext = path.extname(originalName);
    const name = path.basename(originalName, ext);
    const safeName = name.replace(/[^a-zA-Z0-9-_]/g, '_').substring(0, 50);
    
    if (prefix) {
      return `${prefix}/${safeName}_${timestamp}_${hash}${ext}`;
    }
    return `${safeName}_${timestamp}_${hash}${ext}`;
  }
  
  async upload(file: StorageFile, folderPath: string): Promise<StorageResult> {
    const key = this.generateKey(file.originalName, folderPath);
    
    // S3 upload implementation
    /*
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimeType,
      ContentLength: file.size,
      Metadata: {
        originalName: file.originalName,
      },
    });
    
    await this.s3Client.send(command);
    */
    
    // Generate URL (CDN if available, otherwise S3 URL)
    const url = this.cdnUrl
      ? `${this.cdnUrl}/${key}`
      : `https://${this.bucket}.s3.${this.region}.amazonaws.com/${key}`;
    
    return {
      url,
      key,
      size: file.size,
      mimeType: file.mimeType,
      metadata: {
        bucket: this.bucket,
        region: this.region,
      }
    };
  }
  
  async delete(key: string): Promise<void> {
    // S3 delete implementation
    /*
    const command = new DeleteObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });
    
    await this.s3Client.send(command);
    */
  }
  
  async exists(key: string): Promise<boolean> {
    // S3 head object implementation
    /*
    try {
      const command = new HeadObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });
      
      await this.s3Client.send(command);
      return true;
    } catch (error) {
      if (error.name === 'NotFound') {
        return false;
      }
      throw error;
    }
    */
    return false;
  }
  
  async getUrl(key: string): Promise<string> {
    // Generate signed URL for private buckets
    /*
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });
    
    const url = await getSignedUrl(this.s3Client, command, {
      expiresIn: 3600, // 1 hour
    });
    
    return url;
    */
    
    // For public buckets or CDN
    return this.cdnUrl
      ? `${this.cdnUrl}/${key}`
      : `https://${this.bucket}.s3.${this.region}.amazonaws.com/${key}`;
  }
  
  async generateThumbnail(file: StorageFile, options: ThumbnailOptions): Promise<StorageResult> {
    // For S3, you might want to use Lambda functions for thumbnail generation
    // or generate locally and upload
    throw new Error('Thumbnail generation not implemented for S3');
  }
  
  async list(prefix: string): Promise<string[]> {
    // S3 list objects implementation
    /*
    const command = new ListObjectsV2Command({
      Bucket: this.bucket,
      Prefix: prefix,
    });
    
    const response = await this.s3Client.send(command);
    return response.Contents?.map(obj => obj.Key!) || [];
    */
    return [];
  }
}

// Instructions for enabling S3:
// 1. Install AWS SDK: npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
// 2. Set environment variables:
//    - AWS_S3_BUCKET
//    - AWS_REGION
//    - AWS_ACCESS_KEY_ID
//    - AWS_SECRET_ACCESS_KEY
//    - AWS_CLOUDFRONT_URL (optional)
// 3. Uncomment the S3 client code above
// 4. Update STORAGE_PROVIDER=s3 in .env