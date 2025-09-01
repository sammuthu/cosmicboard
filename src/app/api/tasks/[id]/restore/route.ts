import { NextRequest, NextResponse } from 'next/server';
import connectMongo from '@/lib/db';
import Task from '@/models/Task';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectMongo();
    
    const task = await Task.findByIdAndUpdate(
      params.id,
      { status: 'ACTIVE' },
      { new: true }
    ).populate('projectId', 'name');
    
    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }
    
    return NextResponse.json(task);
  } catch (error) {
    console.error('POST /api/tasks/[id]/restore error:', error);
    return NextResponse.json({ error: 'Failed to restore task' }, { status: 500 });
  }
}