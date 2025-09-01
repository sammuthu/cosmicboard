import { NextRequest, NextResponse } from 'next/server';
import connectMongo from '@/lib/db';
import Task from '@/models/Task';

export async function GET(request: NextRequest) {
  try {
    await connectMongo();
    
    const url = new URL(request.url);
    const q = url.searchParams.get('q');
    const projectId = url.searchParams.get('projectId');
    const status = url.searchParams.get('status');
    const priority = url.searchParams.get('priority');
    const dueStart = url.searchParams.get('dueStart');
    const dueEnd = url.searchParams.get('dueEnd');
    
    const query: any = {};
    
    if (q) {
      query.$or = [
        { title: { $regex: q, $options: 'i' } },
        { contentHtml: { $regex: q, $options: 'i' } }
      ];
    }
    
    if (projectId) query.projectId = projectId;
    if (status) query.status = status;
    if (priority) query.priority = priority;
    
    if (dueStart || dueEnd) {
      query.dueDate = {};
      if (dueStart) query.dueDate.$gte = new Date(dueStart);
      if (dueEnd) query.dueDate.$lte = new Date(dueEnd);
    }
    
    const tasks = await Task.find(query)
      .populate('projectId', 'name')
      .sort({ priority: -1, dueDate: 1, createdAt: -1 });
    
    return NextResponse.json(tasks);
  } catch (error) {
    console.error('GET /api/tasks/search error:', error);
    return NextResponse.json({ error: 'Failed to search tasks' }, { status: 500 });
  }
}