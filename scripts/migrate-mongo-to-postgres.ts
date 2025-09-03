import mongoose from 'mongoose';
import { PrismaClient, Priority, Status, Category } from '@prisma/client';
import connectMongo from '../src/lib/db';

const prisma = new PrismaClient();

// Define MongoDB schemas to read from
const ProjectSchema = new mongoose.Schema({
  name: String,
  description: String,
  createdAt: Date,
  updatedAt: Date,
});

const TaskSchema = new mongoose.Schema({
  projectId: mongoose.Schema.Types.ObjectId,
  title: String,
  content: String,
  contentHtml: String,
  priority: String,
  status: String,
  tags: [String],
  dueDate: Date,
  completedAt: Date,
  deletedAt: Date,
  createdAt: Date,
  updatedAt: Date,
});

const ReferenceSchema = new mongoose.Schema({
  projectId: mongoose.Schema.Types.ObjectId,
  title: String,
  content: String,
  url: String,
  category: String,
  priority: String,
  tags: [String],
  createdAt: Date,
  updatedAt: Date,
});

async function migrateData() {
  console.log('🚀 Starting MongoDB to PostgreSQL migration...\n');

  try {
    // Connect to MongoDB
    await connectMongo();
    console.log('✅ Connected to MongoDB');

    // Get MongoDB models
    const MongoProject = mongoose.models.Project || mongoose.model('Project', ProjectSchema);
    const MongoTask = mongoose.models.Task || mongoose.model('Task', TaskSchema);
    const MongoReference = mongoose.models.Reference || mongoose.model('Reference', ReferenceSchema);

    // Fetch all data from MongoDB
    const mongoProjects = await MongoProject.find({}).lean();
    const mongoTasks = await MongoTask.find({}).lean();
    const mongoReferences = await MongoReference.find({}).lean();

    console.log(`\n📊 Found in MongoDB:`);
    console.log(`  - Projects: ${mongoProjects.length}`);
    console.log(`  - Tasks: ${mongoTasks.length}`);
    console.log(`  - References: ${mongoReferences.length}`);

    // Clear existing PostgreSQL data (optional - comment out if you want to keep existing data)
    console.log('\n🗑️  Clearing existing PostgreSQL data...');
    await prisma.reference.deleteMany({});
    await prisma.task.deleteMany({});
    await prisma.project.deleteMany({});

    // Create a mapping of MongoDB IDs to PostgreSQL IDs
    const projectIdMap = new Map<string, string>();

    // Migrate Projects
    console.log('\n📁 Migrating Projects...');
    for (const mongoProject of mongoProjects) {
      const pgProject = await prisma.project.create({
        data: {
          name: mongoProject.name,
          description: mongoProject.description || null,
          metadata: {},
          createdAt: mongoProject.createdAt || new Date(),
          updatedAt: mongoProject.updatedAt || new Date(),
        },
      });
      
      // Store the ID mapping
      projectIdMap.set(mongoProject._id.toString(), pgProject.id);
      console.log(`  ✓ Migrated project: ${mongoProject.name}`);
    }

    // Helper function to map priority
    const mapPriority = (priority: string | undefined): Priority => {
      const priorityMap: { [key: string]: Priority } = {
        'LOW': 'LOW',
        'MEDIUM': 'MEDIUM',
        'HIGH': 'HIGH',
        'URGENT': 'URGENT',
      };
      return priorityMap[priority?.toUpperCase() || ''] || 'MEDIUM';
    };

    // Helper function to map status
    const mapStatus = (status: string | undefined): Status => {
      const statusMap: { [key: string]: Status } = {
        'ACTIVE': 'ACTIVE',
        'COMPLETED': 'COMPLETED',
        'DELETED': 'DELETED',
      };
      return statusMap[status?.toUpperCase() || ''] || 'ACTIVE';
    };

    // Helper function to map category
    const mapCategory = (category: string | undefined): Category => {
      const categoryMap: { [key: string]: Category } = {
        'documentation': 'DOCUMENTATION',
        'snippet': 'SNIPPET',
        'configuration': 'CONFIGURATION',
        'tools': 'TOOLS',
        'api': 'API',
        'tutorial': 'TUTORIAL',
        'reference': 'REFERENCE',
      };
      return categoryMap[category?.toLowerCase() || ''] || 'DOCUMENTATION';
    };

    // Migrate Tasks
    console.log('\n📝 Migrating Tasks...');
    let taskCount = 0;
    for (const mongoTask of mongoTasks) {
      const projectId = projectIdMap.get(mongoTask.projectId?.toString() || '');
      
      if (!projectId) {
        console.log(`  ⚠️  Skipping task without valid project: ${mongoTask.title || mongoTask.content}`);
        continue;
      }

      await prisma.task.create({
        data: {
          projectId,
          content: mongoTask.title || mongoTask.content || 'Untitled Task',
          priority: mapPriority(mongoTask.priority),
          status: mapStatus(mongoTask.status),
          completedAt: mongoTask.completedAt || null,
          deletedAt: mongoTask.deletedAt || null,
          metadata: {
            contentHtml: mongoTask.contentHtml || null,
            dueDate: mongoTask.dueDate ? new Date(mongoTask.dueDate).toISOString() : null,
            tags: mongoTask.tags || [],
            originalMongoId: mongoTask._id.toString(),
          },
          createdAt: mongoTask.createdAt || new Date(),
          updatedAt: mongoTask.updatedAt || new Date(),
        },
      });
      taskCount++;
      
      if (taskCount % 10 === 0) {
        console.log(`  ✓ Migrated ${taskCount} tasks...`);
      }
    }
    console.log(`  ✓ Total tasks migrated: ${taskCount}`);

    // Migrate References
    console.log('\n📚 Migrating References...');
    let refCount = 0;
    for (const mongoRef of mongoReferences) {
      const projectId = projectIdMap.get(mongoRef.projectId?.toString() || '');
      
      if (!projectId) {
        console.log(`  ⚠️  Skipping reference without valid project: ${mongoRef.title}`);
        continue;
      }

      await prisma.reference.create({
        data: {
          projectId,
          title: mongoRef.title || 'Untitled Reference',
          content: mongoRef.content || '',
          url: mongoRef.url || null,
          category: mapCategory(mongoRef.category),
          priority: mapPriority(mongoRef.priority),
          tags: mongoRef.tags || [],
          metadata: {
            originalMongoId: mongoRef._id.toString(),
          },
          createdAt: mongoRef.createdAt || new Date(),
          updatedAt: mongoRef.updatedAt || new Date(),
        },
      });
      refCount++;
      
      if (refCount % 10 === 0) {
        console.log(`  ✓ Migrated ${refCount} references...`);
      }
    }
    console.log(`  ✓ Total references migrated: ${refCount}`);

    // Verify migration
    console.log('\n✅ Migration Complete! Verifying data...');
    
    const pgProjects = await prisma.project.count();
    const pgTasks = await prisma.task.count();
    const pgReferences = await prisma.reference.count();
    
    console.log(`\n📊 PostgreSQL Database now contains:`);
    console.log(`  - Projects: ${pgProjects}`);
    console.log(`  - Tasks: ${pgTasks}`);
    console.log(`  - References: ${pgReferences}`);

    console.log('\n🎉 Migration successful!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    await prisma.$disconnect();
  }
}

// Run the migration
migrateData().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});