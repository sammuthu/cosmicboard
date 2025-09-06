# Storage Configuration Guide

## Overview

CosmicBoard uses a flexible storage abstraction layer that supports multiple storage providers. This allows you to use local storage during development and seamlessly switch to cloud storage (AWS S3, Cloudinary, etc.) for production with millions of users.

## Current Implementation Status

✅ **Completed:**
- Storage abstraction layer with provider interface
- Local storage provider with automatic directory creation
- AWS S3 provider (ready for configuration)
- Automatic thumbnail generation for images
- Media upload API endpoints for photos, screenshots, and PDFs
- File organization by type and project

## Storage Providers

### 1. Local Storage (Default)

Perfect for development and small-scale deployments.

**Configuration (via environment variables):**
```bash
# .env
STORAGE_PROVIDER=local
STORAGE_LOCAL_PATH=./public/uploads
STORAGE_LOCAL_URL=/uploads
```

**Features:**
- Files stored in `public/uploads/` directory
- Automatic directory structure creation
- Direct file serving via Next.js

### 2. AWS S3 (Production Ready)

Ideal for production with user isolation and scalability.

**Configuration:**
```bash
# .env
STORAGE_PROVIDER=s3
AWS_S3_BUCKET=your-bucket-name
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key

# Optional: Custom S3 endpoint (for S3-compatible services)
AWS_S3_ENDPOINT=https://s3.amazonaws.com

# Optional: CloudFront CDN
AWS_CLOUDFRONT_URL=https://d1234567890.cloudfront.net
```

**AWS Setup Steps:**

1. **Create S3 Bucket:**
```bash
aws s3 mb s3://cosmicboard-media --region us-east-1
```

2. **Configure Bucket Policy for Public Read:**
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::cosmicboard-media/*"
    }
  ]
}
```

3. **Enable CORS:**
```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
    "AllowedOrigins": ["http://localhost:7777", "https://your-domain.com"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3000
  }
]
```

4. **Create IAM User with Programmatic Access:**
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::cosmicboard-media",
        "arn:aws:s3:::cosmicboard-media/*"
      ]
    }
  ]
}
```

## File Organization Structure

Files are organized for optimal user isolation and retrieval:

```
{storage_root}/
├── photos/
│   └── {projectId}/
│       └── originals/
│           └── {filename}_{timestamp}_{hash}.{ext}
├── screenshots/
│   └── {projectId}/
│       └── originals/
│           └── {filename}_{timestamp}_{hash}.{ext}
├── pdfs/
│   └── {projectId}/
│       └── originals/
│           └── {filename}_{timestamp}_{hash}.{ext}
└── thumbnails/
    └── thumb_{filename}_{timestamp}_{hash}.jpg
```

## User Isolation Strategy (Future Implementation)

When user authentication is implemented, the storage structure will be:

```
{storage_root}/
└── users/
    └── {userId}/
        └── projects/
            └── {projectId}/
                ├── photos/
                ├── screenshots/
                └── pdfs/
```

This ensures:
- Complete user data isolation
- Easy user data export/deletion (GDPR compliance)
- Efficient quota management per user
- Simplified backup and migration

## Configuration Options

### Global Settings

```bash
# Maximum file size (in MB)
MAX_FILE_SIZE_MB=50

# Thumbnail generation
GENERATE_THUMBNAILS=true
THUMBNAIL_WIDTH=200
THUMBNAIL_HEIGHT=200
THUMBNAIL_QUALITY=80
```

### Switching Providers

To switch from local to S3 storage:

1. Update `.env` file with S3 credentials
2. Change `STORAGE_PROVIDER=s3`
3. Restart the application
4. Optionally migrate existing files using the migration script (to be implemented)

## Testing Storage Configuration

### Test Local Storage
```bash
# Upload a test image
curl -X POST "http://localhost:7777/api/media/upload" \
  -F "file=@test.jpg" \
  -F "projectId=your-project-id" \
  -F "type=photo" \
  -F "name=Test Photo"
```

### Test S3 Storage
1. Configure AWS credentials in `.env`
2. Set `STORAGE_PROVIDER=s3`
3. Use the same upload command as above
4. Verify file appears in S3 bucket

## Future Enhancements

### Planned Features
1. **User Authentication & Isolation**
   - Passkey registration with email/phone verification
   - User-specific storage paths
   - Storage quota management

2. **Additional Providers**
   - Cloudinary (optimized image delivery)
   - Azure Blob Storage
   - Google Cloud Storage
   - DigitalOcean Spaces

3. **Advanced Features**
   - Automatic image optimization
   - Video transcoding support
   - CDN integration for global delivery
   - Signed URLs for private content
   - Bulk upload/download
   - Storage usage analytics

4. **Migration Tools**
   - Provider-to-provider migration scripts
   - Backup and restore utilities
   - Data export for GDPR compliance

## Troubleshooting

### Common Issues

**Issue: "Upload failed" error**
- Check file size limits in `.env`
- Verify storage provider credentials
- Ensure upload directory has write permissions (local storage)

**Issue: Thumbnails not generating**
- Verify Sharp package is installed: `npm install sharp`
- Check `GENERATE_THUMBNAILS=true` in `.env`

**Issue: S3 uploads failing**
- Verify AWS credentials are correct
- Check bucket permissions and CORS configuration
- Ensure bucket region matches configuration

**Issue: Files not accessible after upload**
- For local storage: Check Next.js public directory serving
- For S3: Verify bucket policy allows public read
- Check CDN configuration if using CloudFront

## Security Considerations

1. **File Type Validation**: Always validate MIME types before upload
2. **Size Limits**: Enforce reasonable file size limits
3. **User Quotas**: Implement per-user storage limits
4. **Virus Scanning**: Consider integrating virus scanning for uploads
5. **Access Control**: Use signed URLs for sensitive content
6. **Rate Limiting**: Implement upload rate limiting per user

## API Reference

### Upload File
```typescript
POST /api/media/upload
Content-Type: multipart/form-data

Fields:
- file: File (required)
- projectId: string (required)
- type: 'photo' | 'screenshot' | 'pdf' (required)
- name: string (optional)

Response:
{
  id: string,
  url: string,
  thumbnailUrl?: string,
  size: number,
  mimeType: string,
  metadata: object
}
```

### Get Media List
```typescript
GET /api/media?projectId={projectId}&type={type}&page={page}&limit={limit}

Response:
{
  media: Media[],
  pagination: {
    page: number,
    limit: number,
    total: number,
    pages: number
  }
}
```

### Delete Media
```typescript
DELETE /api/media/{id}

Response:
{
  success: boolean,
  message: string
}
```

## Development Tips

1. **Local Development**: Use local storage to avoid AWS costs
2. **Testing S3**: Use LocalStack for S3 emulation
3. **Performance**: Enable CDN for production deployments
4. **Monitoring**: Track storage usage and costs
5. **Backup**: Implement regular backup schedules for user data