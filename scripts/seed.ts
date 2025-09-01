import mongoose from 'mongoose';
import '../src/models/Project';
import '../src/models/Task';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/cosmicboard';

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const Project = mongoose.model('Project');
    const Task = mongoose.model('Task');

    // Clear existing data
    await Project.deleteMany({});
    await Task.deleteMany({});
    console.log('Cleared existing data');

    // Create projects
    const sadhanaProject = await Project.create({
      name: 'Sādhanā',
      description: 'Daily spiritual practice and self-improvement'
    });

    const workProject = await Project.create({
      name: 'Work',
      description: 'Professional tasks and deliverables'
    });

    console.log('Created projects');

    // Create tasks for Sādhanā
    const sadhanaTasks = [
      {
        projectId: sadhanaProject._id,
        title: 'Morning meditation',
        contentHtml: '<p>20 minutes of <strong>mindfulness meditation</strong> focusing on breath</p>',
        priority: 'HIGH',
        status: 'ACTIVE',
        dueDate: new Date()
      },
      {
        projectId: sadhanaProject._id,
        title: 'Read Bhagavad Gita Chapter 2',
        contentHtml: '<p>Study the nature of the soul and karma yoga</p>',
        priority: 'MEDIUM',
        status: 'ACTIVE'
      },
      {
        projectId: sadhanaProject._id,
        title: 'Evening pranayama practice',
        contentHtml: '<p>Complete <em>Nadi Shodhana</em> and <em>Bhramari</em> breathing exercises</p>',
        priority: 'MEDIUM',
        status: 'COMPLETED'
      }
    ];

    // Create tasks for Work
    const workTasks = [
      {
        projectId: workProject._id,
        title: 'Review pull requests',
        contentHtml: '<p>Review and approve pending PRs in the <code>main</code> repository</p>',
        priority: 'HIGH',
        status: 'ACTIVE',
        dueDate: new Date(Date.now() - 86400000) // Yesterday (overdue)
      },
      {
        projectId: workProject._id,
        title: 'Update project documentation',
        contentHtml: '<p>Add API endpoints documentation and update README</p>',
        priority: 'LOW',
        status: 'ACTIVE',
        dueDate: new Date(Date.now() + 7 * 86400000) // Next week
      },
      {
        projectId: workProject._id,
        title: 'Fix authentication bug',
        contentHtml: '<p>Users reporting <strong>intermittent login failures</strong> on mobile devices</p>',
        priority: 'HIGH',
        status: 'COMPLETED'
      },
      {
        projectId: workProject._id,
        title: 'Refactor database queries',
        contentHtml: '<p>Optimize slow queries in the analytics module</p>',
        priority: 'MEDIUM',
        status: 'DELETED'
      }
    ];

    await Task.create([...sadhanaTasks, ...workTasks]);
    console.log('Created sample tasks');

    console.log('✅ Seed completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }
}

seed();