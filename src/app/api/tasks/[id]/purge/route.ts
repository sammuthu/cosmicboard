import { NextRequest, NextResponse } from 'next/server';
import connectMongo from '@/lib/db';
import Task from '@/models/Task';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectMongo();
    
    const task = await Task.findById(params.id);
    
    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }
    
    if (task.status !== 'DELETED') {
      return NextResponse.json(
        { error: 'Only deleted tasks can be purged' },
        { status: 400 }
      );
    }
    
    await task.deleteOne();
    
    return NextResponse.json({ message: 'Task permanently purged' });
  } catch (error) {
    console.error('DELETE /api/tasks/[id]/purge error:', error);
    return NextResponse.json({ error: 'Failed to purge task' }, { status: 500 });
  }
}