# PostgreSQL Database Setup for CosmicBoard

## Overview

CosmicBoard uses PostgreSQL as its database, running in a Docker container. The backend API (this project) is the only service that connects directly to the database. Both the web frontend and mobile app communicate through the REST API.

## Database Configuration

### Docker Container Details
- **Container Name**: `cosmicboard_postgres`
- **Image**: `postgres:16-alpine`
- **Port**: `5432`
- **Database**: `cosmicboard`
- **Username**: `cosmicuser`
- **Password**: `cosmic123!`

### Connection String
```
postgresql://cosmicuser:cosmic123!@localhost:5432/cosmicboard?schema=public
```

## IntelliJ Database Tool Configuration

### Step 1: Open Database Tool Window
- **Method 1**: View → Tool Windows → Database
- **Method 2**: Click the Database tab on the right side
- **Method 3**: Press `Cmd+Shift+A` and search for "Database"

### Step 2: Add PostgreSQL Data Source
1. Click the `+` button in the Database tool window
2. Select **Data Source** → **PostgreSQL**

### Step 3: Configure Connection

#### Connection Settings:
- **Name**: CosmicBoard PostgreSQL (or any preferred name)
- **Host**: `localhost`
- **Port**: `5432`
- **Database**: `cosmicboard`
- **User**: `cosmicuser`
- **Password**: `cosmic123!`

#### JDBC URL (auto-generated):
```
jdbc:postgresql://localhost:5432/cosmicboard
```

#### Driver Settings:
- IntelliJ will automatically download the PostgreSQL JDBC driver if not present
- Driver class: `org.postgresql.Driver`

### Step 4: Test Connection
1. Click **Test Connection**
2. If successful, you'll see "Connected successfully"
3. If it fails, check:
   - Docker container is running: `docker ps | grep cosmicboard_postgres`
   - Port 5432 is accessible: `lsof -i :5432`

### Step 5: Apply and Save
1. Click **Apply**
2. Click **OK**

## Database Schema (Prisma)

### Tables

#### Projects
```sql
CREATE TABLE "Project" (
    "id" TEXT PRIMARY KEY,
    "name" TEXT UNIQUE NOT NULL,
    "description" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP
);
```

#### Tasks
```sql
CREATE TABLE "Task" (
    "id" TEXT PRIMARY KEY,
    "projectId" TEXT NOT NULL REFERENCES "Project"(id) ON DELETE CASCADE,
    "content" TEXT NOT NULL,
    "priority" "Priority" DEFAULT 'MEDIUM',
    "status" "Status" DEFAULT 'ACTIVE',
    "completedAt" TIMESTAMP,
    "deletedAt" TIMESTAMP,
    "metadata" JSONB,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP
);
```

#### References
```sql
CREATE TABLE "Reference" (
    "id" TEXT PRIMARY KEY,
    "projectId" TEXT NOT NULL REFERENCES "Project"(id) ON DELETE CASCADE,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "url" TEXT,
    "category" "Category" DEFAULT 'DOCUMENTATION',
    "priority" "Priority" DEFAULT 'MEDIUM',
    "tags" TEXT[],
    "metadata" JSONB,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP
);
```

### Enums
- **Priority**: LOW, MEDIUM, HIGH, URGENT
- **Status**: ACTIVE, COMPLETED, DELETED
- **Category**: DOCUMENTATION, SNIPPET, CONFIGURATION, TOOLS, API, TUTORIAL, REFERENCE

## Using PostgreSQL in IntelliJ

### Query Console
1. Right-click on the database connection
2. Select **Open Console** → **New Console**
3. Write SQL queries:

```sql
-- View all projects
SELECT * FROM "Project";

-- View active tasks
SELECT * FROM "Task" WHERE status = 'ACTIVE';

-- Count references by category
SELECT category, COUNT(*) 
FROM "Reference" 
GROUP BY category;

-- Tasks with their projects
SELECT t.*, p.name as project_name 
FROM "Task" t 
JOIN "Project" p ON t."projectId" = p.id;
```

### Working with JSONB
PostgreSQL's JSONB type allows flexible schema for metadata:

```sql
-- Query JSONB fields
SELECT * FROM "Task" 
WHERE metadata->>'contentHtml' IS NOT NULL;

-- Update JSONB field
UPDATE "Task" 
SET metadata = jsonb_set(metadata, '{tags}', '["urgent", "review"]'::jsonb)
WHERE id = 'task-id';
```

## Prisma CLI Commands

### Database Management
```bash
# View current database schema
npx prisma db pull

# Generate Prisma Client
npx prisma generate

# Create migration
npx prisma migrate dev --name <migration-name>

# Apply migrations to production
npx prisma migrate deploy

# Open Prisma Studio (GUI)
npx prisma studio
```

### Seeding Data
```bash
# Run seed script
npx prisma db seed

# Reset database (WARNING: Deletes all data)
npx prisma migrate reset
```

## Docker Commands

### Container Management
```bash
# Start container
docker start cosmicboard_postgres

# Stop container
docker stop cosmicboard_postgres

# View logs
docker logs cosmicboard_postgres

# Access PostgreSQL CLI
docker exec -it cosmicboard_postgres psql -U cosmicuser -d cosmicboard
```

### Backup and Restore
```bash
# Backup database
docker exec cosmicboard_postgres pg_dump -U cosmicuser cosmicboard > backup.sql

# Restore database
docker exec -i cosmicboard_postgres psql -U cosmicuser cosmicboard < backup.sql
```

## Environment Variables

The application uses these environment variables:

```env
# .env file
DATABASE_URL="postgresql://cosmicuser:cosmic123!@localhost:5432/cosmicboard?schema=public"
```

## Architecture Notes

1. **Single Database Connection Point**: Only the CosmicBoard backend (this Next.js API) connects to PostgreSQL
2. **API-First Design**: Mobile and web frontends communicate via REST API endpoints
3. **JSONB for Flexibility**: Using PostgreSQL's JSONB type for metadata allows schema flexibility
4. **Prisma ORM**: Type-safe database access with automatic migrations
5. **Docker Isolation**: Database runs in Docker for easy management and portability

## Troubleshooting

### Container Not Running
```bash
# Check if container exists
docker ps -a | grep cosmicboard_postgres

# Start if stopped
docker start cosmicboard_postgres

# If container doesn't exist, create it
docker run -d \
  --name cosmicboard_postgres \
  -e POSTGRES_DB=cosmicboard \
  -e POSTGRES_USER=cosmicuser \
  -e POSTGRES_PASSWORD=cosmic123! \
  -p 5432:5432 \
  postgres:16-alpine
```

### Port Conflicts
If port 5432 is already in use:
```bash
# Find what's using the port
lsof -i :5432

# Use a different port in docker run
docker run -d ... -p 5433:5432 ...

# Update DATABASE_URL accordingly
DATABASE_URL="postgresql://cosmicuser:cosmic123!@localhost:5433/cosmicboard"
```

### Prisma Errors
```bash
# Regenerate Prisma Client
npx prisma generate

# Sync database with schema
npx prisma db push

# Check migration status
npx prisma migrate status
```