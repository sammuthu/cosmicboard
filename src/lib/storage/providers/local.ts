import { StorageProvider, StorageFile, StorageResult, ThumbnailOptions } from '../types';
import { promises as fs } from 'fs';
import path from 'path';
import sharp from 'sharp';
import crypto from 'crypto';

export class LocalStorageProvider implements StorageProvider {
  name = 'local';
  private basePath: string;
  private baseUrl: string;
  
  constructor(basePath: string, baseUrl: string) {
    this.basePath = path.resolve(process.cwd(), basePath);
    this.baseUrl = baseUrl;
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
    const fullPath = path.join(this.basePath, key);
    const dir = path.dirname(fullPath);
    
    // Ensure directory exists
    await fs.mkdir(dir, { recursive: true });
    
    // Write file
    await fs.writeFile(fullPath, file.buffer);
    
    // Generate public URL
    const url = `${this.baseUrl}/${key}`.replace(/\/+/g, '/');
    
    return {
      url,
      key,
      size: file.size,
      mimeType: file.mimeType,
      metadata: {}
    };
  }
  
  async delete(key: string): Promise<void> {
    const fullPath = path.join(this.basePath, key);
    
    try {
      await fs.unlink(fullPath);
    } catch (error: any) {
      if (error.code !== 'ENOENT') {
        throw error;
      }
      // File doesn't exist, that's okay
    }
  }
  
  async exists(key: string): Promise<boolean> {
    const fullPath = path.join(this.basePath, key);
    
    try {
      await fs.access(fullPath);
      return true;
    } catch {
      return false;
    }
  }
  
  async getUrl(key: string): Promise<string> {
    const exists = await this.exists(key);
    if (!exists) {
      throw new Error(`File not found: ${key}`);
    }
    
    return `${this.baseUrl}/${key}`.replace(/\/+/g, '/');
  }
  
  async generateThumbnail(file: StorageFile, options: ThumbnailOptions): Promise<StorageResult> {
    // Only process images
    if (!file.mimeType.startsWith('image/')) {
      throw new Error('Can only generate thumbnails for images');
    }
    
    const thumbnailBuffer = await sharp(file.buffer)
      .resize(options.width, options.height, {
        fit: 'cover',
        position: 'center'
      })
      .jpeg({ quality: options.quality || 80 })
      .toBuffer();
    
    const thumbnailFile: StorageFile = {
      buffer: thumbnailBuffer,
      originalName: `thumb_${file.originalName}`,
      mimeType: 'image/jpeg',
      size: thumbnailBuffer.length
    };
    
    // Upload thumbnail to thumbnails folder
    const folderPath = 'thumbnails';
    return this.upload(thumbnailFile, folderPath);
  }
  
  async move(oldKey: string, newKey: string): Promise<void> {
    const oldPath = path.join(this.basePath, oldKey);
    const newPath = path.join(this.basePath, newKey);
    const newDir = path.dirname(newPath);
    
    // Ensure new directory exists
    await fs.mkdir(newDir, { recursive: true });
    
    // Move file
    await fs.rename(oldPath, newPath);
  }
  
  async copy(sourceKey: string, destKey: string): Promise<void> {
    const sourcePath = path.join(this.basePath, sourceKey);
    const destPath = path.join(this.basePath, destKey);
    const destDir = path.dirname(destPath);
    
    // Ensure destination directory exists
    await fs.mkdir(destDir, { recursive: true });
    
    // Copy file
    await fs.copyFile(sourcePath, destPath);
  }
  
  async list(prefix: string): Promise<string[]> {
    const dirPath = path.join(this.basePath, prefix);
    const files: string[] = [];
    
    async function readDir(dir: string) {
      try {
        const entries = await fs.readdir(dir, { withFileTypes: true });
        
        for (const entry of entries) {
          const fullPath = path.join(dir, entry.name);
          
          if (entry.isDirectory()) {
            await readDir(fullPath);
          } else {
            // Convert to relative path from basePath
            const relativePath = path.relative(dirPath, fullPath);
            files.push(path.join(prefix, relativePath));
          }
        }
      } catch (error: any) {
        if (error.code !== 'ENOENT') {
          throw error;
        }
      }
    }
    
    await readDir(dirPath);
    return files;
  }
}