# CosmicBoard Architecture

## 🏗 System Architecture Overview

CosmicBoard is a multi-platform task management system with AI-augmented features and a cosmic theme. The architecture follows a microservices pattern with clear separation between frontend, backend, and storage layers.

## 📋 Current Status (September 2025)

### ✅ **Running Services**

| Service | Repository | Port | Status | Description |
|---------|------------|------|--------|-------------|
| **Web Frontend** | `/cosmicboard` | 7777 | ✅ Running | Next.js 15.3.4 with Turbopack |
| **Backend API** | `/cosmicboard-backend` | 7779 | ✅ Running | Express.js with TypeScript |
| **Mobile App** | `/cosmicboard-mobile` | 8082 | ✅ Running | React Native (Expo) |
| **Database** | PostgreSQL | 5432 | ✅ Running | Primary data store |
| **MongoDB** | Legacy | 27017 | ⚠️ Phasing out | Legacy support |

### 🌐 **Access Points**

- **Web App**: https://cosmic.board (local domain via nginx)
- **API Health**: http://localhost:7779/api/health
- **Mobile Dev**: http://localhost:8082 (Expo DevTools)

## 🎨 Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              CLIENT LAYER                                │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐             │
│  │  Web Client  │    │ Mobile App   │    │  iOS/Android │             │
│  │   (Vercel)   │    │   (Expo)     │    │  (Stores)    │             │
│  │  Port: 7777  │    │  Port: 8082  │    │              │             │
│  └──────┬───────┘    └──────┬───────┘    └──────┬───────┘             │
│         │                   │                    │                      │
│         └───────────────────┴────────────────────┘                      │
│                             │                                           │
│                             ▼                                           │
│                    ┌─────────────────┐                                 │
│                    │   nginx Proxy   │                                 │
│                    │  cosmic.board   │                                 │
│                    └────────┬────────┘                                 │
└─────────────────────────────┼─────────────────────────────────────────┘
                              │
┌─────────────────────────────┼─────────────────────────────────────────┐
│                             ▼              API LAYER                    │
├─────────────────────────────────────────────────────────────────────────┤
│                    ┌─────────────────┐                                 │
│                    │  Backend API    │                                 │
│                    │  Express.js     │                                 │
│                    │  Port: 7779     │                                 │
│                    └────────┬────────┘                                 │
│                             │                                           │
│         ┌───────────────────┼───────────────────┐                      │
│         │                   │                   │                      │
│    ┌────▼────┐        ┌────▼────┐        ┌────▼────┐                 │
│    │Projects │        │  Media  │        │  Tasks  │                 │
│    │  API    │        │   API   │        │   API   │                 │
│    └─────────┘        └─────────┘        └─────────┘                 │
│                                                                         │
│    ┌─────────────────────────────────────────────┐                    │
│    │           Middleware Layer                   │                    │
│    ├───────────┬───────────┬────────────┬────────┤                    │
│    │   CORS    │   Auth    │  Validation│ Upload │                    │
│    └───────────┴───────────┴────────────┴────────┘                    │
└─────────────────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────┼─────────────────────────────────────────┐
│                             ▼           DATA LAYER                      │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│    ┌────────────────┐              ┌────────────────┐                  │
│    │  PostgreSQL    │              │    MongoDB     │                  │
│    │   (Primary)    │              │   (Legacy)     │                  │
│    │  Port: 5432    │              │  Port: 27017   │                  │
│    └───────┬────────┘              └────────────────┘                  │
│            │                                                            │
│            │         ┌──────────────────────┐                          │
│            └────────►│  Prisma ORM          │                          │
│                      │  Schema & Migrations │                          │
│                      └──────────────────────┘                          │
└─────────────────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────┼─────────────────────────────────────────┐
│                             ▼          STORAGE LAYER                    │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│    ┌────────────────┐              ┌────────────────┐                  │
│    │ Local Storage  │              │    AWS S3      │                  │
│    │ (Development)  │              │  (Production)  │                  │
│    │ /public/uploads│              │  s3://bucket   │                  │
│    └────────────────┘              └────────────────┘                  │
│                                                                          │
│    Storage Abstraction Layer:                                           │
│    ├── Photos (JPEG, PNG, WebP)                                        │
│    ├── Screenshots (Base64 upload)                                     │
│    ├── PDFs (Document storage)                                         │
│    └── Thumbnails (Auto-generated)                                     │
└─────────────────────────────────────────────────────────────────────────┘
```

## 🔧 Technology Stack

### Frontend (Web)
- **Framework**: Next.js 15.3.4 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **State Management**: Zustand, SWR
- **UI Components**: Custom PrismCard design system
- **Markdown**: react-markdown with syntax highlighting

### Backend
- **Framework**: Express.js
- **Language**: TypeScript
- **Database ORM**: Prisma (PostgreSQL), Mongoose (MongoDB - legacy)
- **Authentication**: JWT (prepared for passkey)
- **File Upload**: Multer
- **Image Processing**: Sharp
- **Logging**: Winston

### Mobile
- **Framework**: React Native (Expo)
- **Language**: TypeScript
- **Navigation**: React Navigation
- **Media**: expo-image-picker, expo-camera
- **State Management**: React Context
- **API Client**: Fetch with environment config

### Infrastructure
- **Container**: Docker
- **Proxy**: nginx
- **Process Manager**: PM2 (production)
- **Development**: nodemon, Turbopack

## 📁 Repository Structure

```
cosmicboard/                    # Web Frontend
├── src/
│   ├── app/                   # Next.js App Router
│   ├── components/            # React components
│   ├── config/                # Environment configuration
│   ├── lib/                   # Utilities and clients
│   └── styles/                # Global styles
├── prisma/                    # Database schema
└── public/                    # Static assets

cosmicboard-backend/            # Backend API
├── src/
│   ├── config/                # Configuration
│   ├── middleware/            # Express middleware
│   ├── routes/                # API routes
│   ├── services/              # Business logic
│   └── server.ts              # Main server
└── uploads/                   # Local file storage

cosmicboard-mobile/             # Mobile App
├── src/
│   ├── screens/               # Screen components
│   ├── components/            # Shared components
│   ├── navigation/            # Navigation setup
│   ├── services/              # API services
│   └── models/                # Data models
└── assets/                    # Images and fonts
```

## 🌐 Environment Configuration

### Development
```javascript
{
  name: 'development',
  apiUrl: 'http://localhost:7779/api',
  corsOrigins: ['http://localhost:7777', 'https://cosmic.board'],
  storage: 'local',
  features: {
    authentication: false,
    mediaStorage: 'local'
  }
}
```

### Staging
```javascript
{
  name: 'staging',
  apiUrl: 'https://api-staging.cosmicboard.com',
  corsOrigins: ['https://staging.cosmicboard.com'],
  storage: 's3',
  features: {
    authentication: true,
    mediaStorage: 's3'
  }
}
```

### Production
```javascript
{
  name: 'production',
  apiUrl: 'https://api.cosmicboard.com',
  corsOrigins: [
    'https://cosmicboard.com',
    'capacitor://localhost',  // iOS
    'http://localhost'         // Android
  ],
  storage: 's3',
  features: {
    authentication: true,
    mediaStorage: 's3'
  }
}
```

## 🔐 Security Architecture

### API Security
- **CORS**: Whitelist-based origin validation
- **Rate Limiting**: 100 requests/15min, 10 uploads/15min
- **Input Validation**: Joi schemas for all endpoints
- **File Validation**: MIME type and size checks
- **Headers**: Helmet.js security headers

### Authentication (Planned)
- **Passkey Registration**: WebAuthn support
- **JWT Tokens**: Stateless authentication
- **Email/Phone Verification**: Two-factor authentication
- **Session Management**: Redis-based sessions

### Data Security
- **Encryption**: TLS/SSL for all connections
- **Database**: Connection pooling with SSL
- **Storage**: S3 with IAM policies
- **Secrets**: Environment variables, never in code

## 📊 Database Schema

### PostgreSQL (Primary)
```prisma
model Project {
  id          String    @id @default(cuid())
  name        String    @unique
  description String?
  metadata    Json?
  tasks       Task[]
  references  Reference[]
  media       Media[]
}

model Task {
  id          String    @id @default(cuid())
  projectId   String
  content     String
  priority    Priority
  status      Status
  metadata    Json?
  project     Project   @relation(fields: [projectId])
}

model Media {
  id           String    @id @default(cuid())
  projectId    String
  type         MediaType
  name         String
  url          String
  thumbnailUrl String?
  size         Int
  mimeType     String
  metadata     Json?
  project      Project   @relation(fields: [projectId])
}
```

## 🚀 API Endpoints

### Core Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/projects` | List projects |
| POST | `/api/projects` | Create project |
| GET | `/api/projects/:id` | Get project |
| PUT | `/api/projects/:id` | Update project |
| DELETE | `/api/projects/:id` | Delete project |

### Media Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/media` | List media with filters |
| POST | `/api/media/upload` | Upload file (multipart) |
| POST | `/api/media/screenshot` | Upload screenshot (base64) |
| GET | `/api/media/:id` | Get media item |
| PUT | `/api/media/:id` | Update media (rename) |
| DELETE | `/api/media/:id` | Delete media |

### Task Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/tasks` | List tasks |
| POST | `/api/tasks` | Create task |
| PUT | `/api/tasks/:id` | Update task |
| POST | `/api/tasks/:id/complete` | Complete task |
| POST | `/api/tasks/:id/delete` | Soft delete |
| POST | `/api/tasks/:id/restore` | Restore task |

## 🎯 Deployment Strategy

### Web Frontend (Vercel)
```bash
# Automatic deployment on push to main
git push origin main
# Vercel builds and deploys automatically
```

### Backend API (AWS ECS)
```bash
# Build Docker image
docker build -t cosmicboard-backend .

# Push to ECR
aws ecr get-login-password | docker login --username AWS --password-stdin
docker tag cosmicboard-backend:latest [ECR_URI]:latest
docker push [ECR_URI]:latest

# Update ECS service
aws ecs update-service --cluster cosmic-cluster --service backend-service --force-new-deployment
```

### Mobile Apps
```bash
# iOS (App Store)
expo build:ios
expo upload:ios

# Android (Play Store)
expo build:android
expo upload:android
```

## 📈 Scaling Architecture

### Horizontal Scaling
- **Load Balancer**: AWS ALB for backend
- **Auto Scaling**: ECS/EKS with metrics-based scaling
- **CDN**: CloudFront for static assets
- **Database**: Read replicas for PostgreSQL

### Performance Optimization
- **Caching**: Redis for session and API cache
- **Image Optimization**: Automatic resizing and WebP conversion
- **Code Splitting**: Dynamic imports in Next.js
- **API Pagination**: Cursor-based pagination

### Monitoring
- **Logs**: CloudWatch Logs aggregation
- **Metrics**: Custom CloudWatch metrics
- **Alerts**: SNS notifications for errors
- **APM**: DataDog or New Relic integration

## 🔄 Migration Status

### Database Migration
- ✅ PostgreSQL schema created with Prisma
- ✅ Media model implemented
- ⚠️ MongoDB still used for some legacy routes
- 🔄 Gradual migration in progress

### Storage Migration
- ✅ Storage abstraction layer implemented
- ✅ Local storage working
- ✅ S3 provider ready
- ⏳ Awaiting production S3 bucket setup

### Authentication Migration
- ✅ JWT middleware prepared
- ⏳ Passkey registration UI needed
- ⏳ Email/phone verification service needed
- ⏳ User model and isolation needed

## 🚦 Development Workflow

### Local Development
```bash
# Start all services
cd cosmicboard && npm run dev           # Web on 7777
cd cosmicboard-backend && npm run dev   # API on 7779
cd cosmicboard-mobile && npm start      # Mobile on 8082

# Access points
https://cosmic.board                    # Web via nginx
http://localhost:7779/api/health        # API health
http://localhost:8082                   # Mobile Expo
```

### Git Workflow
```bash
# Feature branch
git checkout -b feature/media-upload

# Commit with conventional commits
git commit -m "feat: add photo upload to mobile app"

# Push and create PR
git push origin feature/media-upload
gh pr create
```

### Testing Strategy
- **Unit Tests**: Jest for all layers
- **Integration Tests**: Supertest for API
- **E2E Tests**: Playwright for web, Detox for mobile
- **Load Tests**: K6 for performance testing

## 📝 Future Enhancements

### Phase 1 (Current)
- ✅ Multi-platform architecture
- ✅ Media management (photos, screenshots, PDFs)
- ✅ Storage abstraction
- ✅ Environment configuration

### Phase 2 (Q4 2025)
- [ ] User authentication with passkeys
- [ ] User-isolated storage
- [ ] Real-time collaboration (WebSockets)
- [ ] AI-powered task suggestions

### Phase 3 (Q1 2026)
- [ ] Desktop app (Electron)
- [ ] Offline-first architecture
- [ ] End-to-end encryption
- [ ] Plugin system for extensions

### Phase 4 (Q2 2026)
- [ ] Multi-tenant SaaS platform
- [ ] Team collaboration features
- [ ] Advanced analytics dashboard
- [ ] API marketplace

## 🤝 Team Coordination

### Agent Responsibilities

**Cosmic Web Agent**
- Web UI development and updates
- Frontend performance optimization
- User experience improvements

**Cosmic Backend Agent**
- API development and maintenance
- Database management
- Infrastructure and DevOps

**Cosmic Mobile Agent**
- iOS and Android app development
- Native feature integration
- App store deployment

### Communication Protocol
- Agents coordinate through shared repositories
- Changes in one platform trigger updates in others
- Environment configuration shared across all platforms
- API contracts maintained in OpenAPI spec

## 📚 Documentation

- **API Documentation**: `/cosmicboard-backend/API.md`
- **Deployment Guide**: `/cosmicboard-backend/DEPLOYMENT.md`
- **Storage Configuration**: `/cosmicboard/docs/storage-configuration.md`
- **Mobile Setup**: `/cosmicboard-mobile/README.md`

---

*Last Updated: September 6, 2025*
*Version: 1.0.0*