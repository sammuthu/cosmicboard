import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { Priority, Status } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const projectId = searchParams.get('projectId');
    
    if (!projectId) {
      return NextResponse.json({ error: 'Project ID is required' }, { status: 400 });
    }
    
    const tasks = await prisma.task.findMany({
      where: { projectId },
      orderBy: { createdAt: 'desc' }
    });
    
    // Transform for backward compatibility
    const transformedTasks = tasks.map(task => ({
      ...task,
      _id: task.id,
      title: task.content, // Using content field as title
      contentHtml: task.metadata?.contentHtml || '',
      tags: task.metadata?.tags || [],
      dueDate: task.metadata?.dueDate || null
    }));
    
    return NextResponse.json(transformedTasks);
  } catch (error) {
    console.error('GET /api/tasks error:', error);
    return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { projectId, title, contentHtml, dueDate, priority, tags } = body;
    
    if (!projectId || !title) {
      return NextResponse.json(
        { error: 'Project ID and title are required' },
        { status: 400 }
      );
    }
    
    const task = await prisma.task.create({
      data: {
        projectId,
        content: title, // Store title as content
        priority: (priority || 'MEDIUM') as Priority,
        status: 'ACTIVE' as Status,
        metadata: {
          contentHtml,
          dueDate: dueDate ? new Date(dueDate).toISOString() : null,
          tags: tags || []
        }
      }
    });
    
    // Transform for backward compatibility
    const transformedTask = {
      ...task,
      _id: task.id,
      title: task.content,
      contentHtml: task.metadata?.contentHtml || '',
      tags: task.metadata?.tags || [],
      dueDate: task.metadata?.dueDate || null
    };
    
    return NextResponse.json(transformedTask, { status: 201 });
  } catch (error) {
    console.error('POST /api/tasks error:', error);
    return NextResponse.json({ error: 'Failed to create task' }, { status: 500 });
  }
}