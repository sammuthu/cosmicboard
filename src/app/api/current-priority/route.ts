import { NextResponse } from 'next/server';
import connectMongo from '@/lib/db';
import Task from '@/models/Task';

export async function GET() {
  try {
    await connectMongo();
    
    // Priority order: HIGH = 3, MEDIUM = 2, LOW = 1
    const priorityOrder = { HIGH: 3, MEDIUM: 2, LOW: 1 };
    
    // Find all active tasks
    const tasks = await Task.find({ status: 'ACTIVE' })
      .populate('projectId', 'name')
      .lean();
    
    if (tasks.length === 0) {
      return NextResponse.json(null);
    }
    
    // Sort tasks by priority (HIGH > MEDIUM > LOW), then by dueDate (earliest first, undefined last), then by createdAt
    tasks.sort((a, b) => {
      // First, sort by priority
      const priorityA = priorityOrder[a.priority as keyof typeof priorityOrder];
      const priorityB = priorityOrder[b.priority as keyof typeof priorityOrder];
      if (priorityA !== priorityB) {
        return priorityB - priorityA; // Higher priority first
      }
      
      // Then sort by dueDate
      if (a.dueDate && b.dueDate) {
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      }
      if (a.dueDate && !b.dueDate) return -1;
      if (!a.dueDate && b.dueDate) return 1;
      
      // Finally, sort by createdAt
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });
    
    // Return the top priority task
    return NextResponse.json(tasks[0]);
  } catch (error) {
    console.error('GET /api/current-priority error:', error);
    return NextResponse.json({ error: 'Failed to fetch current priority' }, { status: 500 });
  }
}