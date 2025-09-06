import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import sharp from 'sharp';
import { PDFDocument } from 'pdf-lib';

export interface UploadedFile {
  url: string;
  thumbnailUrl?: string;
  size: number;
  mimeType: string;
  originalName: string;
  metadata: {
    width?: number;
    height?: number;
    pages?: number;
  };
}

export const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');
export const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
export const THUMBNAIL_WIDTH = 200;
export const THUMBNAIL_HEIGHT = 200;

export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
export const ALLOWED_PDF_TYPES = ['application/pdf'];
export const ALLOWED_TYPES = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_PDF_TYPES];

async function ensureUploadDir(subPath: string): Promise<string> {
  const fullPath = path.join(UPLOAD_DIR, subPath);
  await mkdir(fullPath, { recursive: true });
  return fullPath;
}

export async function generateThumbnail(
  inputBuffer: Buffer,
  outputPath: string
): Promise<string | undefined> {
  try {
    await sharp(inputBuffer)
      .resize(THUMBNAIL_WIDTH, THUMBNAIL_HEIGHT, {
        fit: 'cover',
        position: 'center'
      })
      .toFile(outputPath);
    
    // Return relative URL for web access
    return outputPath.replace(path.join(process.cwd(), 'public'), '');
  } catch (error) {
    console.error('Error generating thumbnail:', error);
    return undefined;
  }
}

export async function processPDF(buffer: Buffer): Promise<{ pages: number }> {
  try {
    const pdfDoc = await PDFDocument.load(buffer);
    const pages = pdfDoc.getPages().length;
    return { pages };
  } catch (error) {
    console.error('Error processing PDF:', error);
    return { pages: 0 };
  }
}

export async function saveFile(
  buffer: Buffer,
  fileName: string,
  projectId: string,
  mediaType: 'photo' | 'screenshot' | 'pdf'
): Promise<UploadedFile> {
  const timestamp = Date.now();
  const ext = path.extname(fileName);
  const baseName = path.basename(fileName, ext);
  const safeFileName = `${baseName}-${timestamp}${ext}`;
  
  // Determine directory structure
  const typeDir = `${mediaType}s`;
  const projectDir = path.join(typeDir, projectId);
  
  // Ensure directories exist
  const uploadPath = await ensureUploadDir(path.join(projectDir, 'originals'));
  const filePath = path.join(uploadPath, safeFileName);
  
  // Save the original file
  await writeFile(filePath, buffer);
  
  // Generate relative URL for web access
  const url = `/uploads/${projectDir}/originals/${safeFileName}`;
  
  const result: UploadedFile = {
    url,
    size: buffer.length,
    mimeType: '',
    originalName: fileName,
    metadata: {}
  };
  
  // Process based on type
  if (ALLOWED_IMAGE_TYPES.includes(`image/${ext.slice(1).toLowerCase()}`)) {
    result.mimeType = `image/${ext.slice(1).toLowerCase()}`;
    
    // Get image metadata
    const metadata = await sharp(buffer).metadata();
    result.metadata.width = metadata.width;
    result.metadata.height = metadata.height;
    
    // Generate thumbnail for images
    const thumbnailPath = await ensureUploadDir(path.join(projectDir, 'thumbnails'));
    const thumbnailFilePath = path.join(thumbnailPath, safeFileName);
    const thumbnailUrl = await generateThumbnail(buffer, thumbnailFilePath);
    
    if (thumbnailUrl) {
      result.thumbnailUrl = thumbnailUrl;
    }
  } else if (mediaType === 'pdf') {
    result.mimeType = 'application/pdf';
    const pdfMetadata = await processPDF(buffer);
    result.metadata.pages = pdfMetadata.pages;
  }
  
  return result;
}

export function validateFile(
  file: { size: number; mimetype: string },
  mediaType: 'photo' | 'screenshot' | 'pdf'
): { valid: boolean; error?: string } {
  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB`
    };
  }
  
  // Check MIME type based on media type
  const allowedTypes = mediaType === 'pdf' ? ALLOWED_PDF_TYPES : ALLOWED_IMAGE_TYPES;
  
  if (!allowedTypes.includes(file.mimetype)) {
    return {
      valid: false,
      error: `Invalid file type. Allowed types: ${allowedTypes.join(', ')}`
    };
  }
  
  return { valid: true };
}

export async function deleteFile(url: string, thumbnailUrl?: string): Promise<void> {
  try {
    // Convert URL to file path
    const filePath = path.join(process.cwd(), 'public', url);
    const fs = await import('fs/promises');
    
    // Delete main file
    await fs.unlink(filePath).catch(() => {
      console.warn(`File not found: ${filePath}`);
    });
    
    // Delete thumbnail if exists
    if (thumbnailUrl) {
      const thumbnailPath = path.join(process.cwd(), 'public', thumbnailUrl);
      await fs.unlink(thumbnailPath).catch(() => {
        console.warn(`Thumbnail not found: ${thumbnailPath}`);
      });
    }
  } catch (error) {
    console.error('Error deleting file:', error);
  }
}