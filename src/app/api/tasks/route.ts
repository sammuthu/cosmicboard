import { NextRequest, NextResponse } from 'next/server';
import connectMongo from '@/lib/db';
import Task from '@/models/Task';

export async function GET(request: NextRequest) {
  try {
    await connectMongo();
    
    const searchParams = request.nextUrl.searchParams;
    const projectId = searchParams.get('projectId');
    
    if (!projectId) {
      return NextResponse.json({ error: 'Project ID is required' }, { status: 400 });
    }
    
    const tasks = await Task.find({ projectId }).sort({ createdAt: -1 });
    
    return NextResponse.json(tasks);
  } catch (error) {
    console.error('GET /api/tasks error:', error);
    return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectMongo();
    
    const body = await request.json();
    const { projectId, title, contentHtml, dueDate, priority, tags } = body;
    
    if (!projectId || !title) {
      return NextResponse.json(
        { error: 'Project ID and title are required' },
        { status: 400 }
      );
    }
    
    const task = await Task.create({
      projectId,
      title,
      contentHtml,
      dueDate: dueDate ? new Date(dueDate) : undefined,
      priority: priority || 'MEDIUM',
      tags: tags || [],
    });
    
    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    console.error('POST /api/tasks error:', error);
    return NextResponse.json({ error: 'Failed to create task' }, { status: 500 });
  }
}