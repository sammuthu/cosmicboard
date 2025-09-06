# CosmicBoard Backend Architecture

## Overview

CosmicBoard uses a modular backend architecture designed for scalability and flexibility. The system supports multiple storage providers and database systems to accommodate growth from MVP to millions of users.

## Storage Architecture

### Storage Abstraction Layer

The storage system implements a provider pattern that allows seamless switching between different storage backends without changing application code.

```typescript
// Storage provider interface
interface StorageProvider {
  upload(file: StorageFile, path: string): Promise<StorageResult>
  delete(key: string): Promise<void>
  exists(key: string): Promise<boolean>
  getUrl(key: string): Promise<string>
  generateThumbnail?(file: StorageFile, options: ThumbnailOptions): Promise<StorageResult>
}
```

### Supported Storage Providers

#### 1. Local Storage (Development/MVP)
- **Path**: `/public/uploads`
- **Configuration**: Environment variables
- **Features**:
  - Direct file system access
  - Automatic thumbnail generation
  - Directory structure organization
  - Suitable for development and small deployments

#### 2. AWS S3 (Production)
- **Configuration**: 
  - `AWS_S3_BUCKET`: Bucket name
  - `AWS_REGION`: AWS region
  - `AWS_ACCESS_KEY_ID`: Access credentials
  - `AWS_SECRET_ACCESS_KEY`: Secret key
  - `AWS_CLOUDFRONT_URL`: Optional CDN URL
- **Features**:
  - Unlimited scalability
  - CDN integration via CloudFront
  - Signed URLs for private content
  - Cross-region replication support

#### 3. Future Providers (Planned)
- **Cloudinary**: Image optimization and transformation
- **Azure Blob Storage**: Microsoft Azure integration
- **Google Cloud Storage**: GCP integration
- **MinIO**: Self-hosted S3-compatible storage

### Storage Configuration

Configuration is loaded from three sources in order of priority:
1. **Database**: Dynamic runtime configuration (future)
2. **Environment Variables**: Deployment-specific settings
3. **Defaults**: Fallback values

```typescript
// Example configuration structure
const config = {
  provider: 'local' | 's3' | 'cloudinary',
  maxFileSize: 50 * 1024 * 1024, // 50MB
  generateThumbnails: true,
  thumbnailOptions: {
    width: 200,
    height: 200,
    quality: 80
  }
}
```

### File Organization

Files are organized in a structured directory hierarchy:
```
{media-type}s/{project-id}/originals/
  - photos/{project-id}/originals/
  - screenshots/{project-id}/originals/
  - pdfs/{project-id}/originals/
  - documents/{project-id}/originals/
thumbnails/{generated-thumbs}
```

## Database Architecture

### Dual Database Support

The system supports both MongoDB (legacy) and PostgreSQL (modern) with Prisma ORM:

#### PostgreSQL (Primary)
- **ORM**: Prisma
- **Features**:
  - Strong consistency
  - ACID transactions
  - JSONB for flexible metadata
  - Full-text search capabilities

#### MongoDB (Legacy/Fallback)
- **ODM**: Mongoose
- **Migration**: Gradual transition to PostgreSQL
- **Usage**: Backward compatibility

### Media Schema

```prisma
model Media {
  id           String    @id @default(cuid())
  projectId    String
  type         MediaType // photo, screenshot, pdf, document, video
  name         String
  originalName String
  url          String
  thumbnailUrl String?
  size         Int
  mimeType     String
  metadata     Json?     // Flexible metadata storage
  uploadedBy   String?
  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt
  
  project      Project   @relation(...)
}
```

## API Architecture

### RESTful Endpoints

#### Media Upload
- **POST** `/api/media/upload`
  - Multipart form data handling
  - File validation and size limits
  - Automatic thumbnail generation
  - Metadata extraction

#### Screenshot Paste
- **POST** `/api/media/screenshot`
  - Base64 image data handling
  - Clipboard integration
  - Automatic naming with timestamps

#### Media Management
- **GET** `/api/media/list?projectId=xxx&type=photo`
- **GET** `/api/media/[id]`
- **DELETE** `/api/media/[id]`
- **PATCH** `/api/media/[id]` (rename)

### File Processing Pipeline

1. **Upload Reception**
   - Multipart parsing
   - MIME type validation
   - Size verification

2. **Processing**
   - Image optimization (Sharp)
   - PDF metadata extraction (pdf-lib)
   - Video thumbnail extraction (future)

3. **Storage**
   - Provider selection
   - Path generation
   - CDN URL creation

4. **Database**
   - Record creation
   - Metadata storage
   - Relationship linking

## Security Considerations

### File Upload Security
- **MIME Type Validation**: Strict whitelist per media type
- **File Size Limits**: Configurable per deployment
- **Path Traversal Protection**: Sanitized file names
- **Virus Scanning**: Integration ready (ClamAV, etc.)

### Access Control
- **Project-based Isolation**: Files scoped to projects
- **Signed URLs**: Temporary access for private content
- **Rate Limiting**: Upload throttling per user/IP
- **CORS Configuration**: Controlled cross-origin access

## Performance Optimization

### Caching Strategy
- **CDN Integration**: CloudFront, Cloudflare
- **Browser Caching**: Proper cache headers
- **Thumbnail Caching**: Pre-generated sizes
- **Database Query Cache**: 5-minute TTL

### Scalability Considerations
- **Horizontal Scaling**: Stateless API design
- **Async Processing**: Queue-based operations
- **Connection Pooling**: Database optimization
- **Load Balancing**: Multi-region deployment ready

## Monitoring and Maintenance

### Logging
- **Application Logs**: Winston/Pino integration
- **Access Logs**: Nginx/CloudFront logs
- **Error Tracking**: Sentry integration ready
- **Metrics Collection**: Prometheus/Grafana ready

### Backup Strategy
- **Database Backups**: Daily automated backups
- **File Backups**: S3 versioning/replication
- **Disaster Recovery**: Cross-region failover

## Migration Path

### From Local to Cloud
1. Enable S3 provider in environment
2. Run migration script to copy files
3. Update database records with new URLs
4. Switch provider configuration
5. Verify and cleanup local files

### Database Migration
1. Set up PostgreSQL alongside MongoDB
2. Run Prisma migrations
3. Dual-write to both databases
4. Gradually migrate read operations
5. Decommission MongoDB

## Environment Variables

```bash
# Storage Configuration
STORAGE_PROVIDER=local|s3|cloudinary
STORAGE_LOCAL_PATH=./public/uploads
STORAGE_LOCAL_URL=/uploads
MAX_FILE_SIZE_MB=50
GENERATE_THUMBNAILS=true

# AWS S3 (when STORAGE_PROVIDER=s3)
AWS_S3_BUCKET=your-bucket-name
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_CLOUDFRONT_URL=https://cdn.example.com

# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/cosmicboard
MONGODB_URI=mongodb://localhost:27017/cosmicboard
```

## Future Enhancements

### Planned Features
- **Video Processing**: FFmpeg integration for video thumbnails
- **Image Optimization**: Automatic format conversion (WebP, AVIF)
- **AI Processing**: Image tagging, OCR for documents
- **Collaborative Editing**: Real-time document collaboration
- **Version Control**: File versioning and history
- **Advanced Search**: Full-text search in documents
- **Analytics**: Usage statistics and insights
- **Webhooks**: Event notifications for integrations

### Infrastructure Evolution
- **Kubernetes Deployment**: Container orchestration
- **Microservices**: Service decomposition
- **Event-Driven Architecture**: Message queues (RabbitMQ/Kafka)
- **GraphQL API**: Alternative to REST
- **Edge Computing**: CDN-based processing

## API Documentation

For detailed API documentation, see the auto-generated OpenAPI specification at `/api/docs` (when implemented) or refer to the inline documentation in each API route file.