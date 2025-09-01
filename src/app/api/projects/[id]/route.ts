import { NextRequest, NextResponse } from 'next/server';
import connectMongo from '@/lib/db';
import Project from '@/models/Project';
import Task from '@/models/Task';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectMongo();
    
    const project = await Project.findById(params.id);
    
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }
    
    return NextResponse.json(project);
  } catch (error) {
    console.error('GET /api/projects/[id] error:', error);
    return NextResponse.json({ error: 'Failed to fetch project' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectMongo();
    
    const body = await request.json();
    const project = await Project.findByIdAndUpdate(
      params.id,
      { $set: body },
      { new: true, runValidators: true }
    );
    
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }
    
    return NextResponse.json(project);
  } catch (error) {
    console.error('PATCH /api/projects/[id] error:', error);
    return NextResponse.json({ error: 'Failed to update project' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectMongo();
    
    const url = new URL(request.url);
    const cascade = url.searchParams.get('cascade') === 'true';
    
    // Check if project has tasks
    const taskCount = await Task.countDocuments({ projectId: params.id });
    
    if (taskCount > 0 && !cascade) {
      return NextResponse.json(
        { error: 'Project has tasks. Use cascade=true to delete all tasks.' },
        { status: 400 }
      );
    }
    
    if (cascade) {
      await Task.deleteMany({ projectId: params.id });
    }
    
    const project = await Project.findByIdAndDelete(params.id);
    
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }
    
    return NextResponse.json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error('DELETE /api/projects/[id] error:', error);
    return NextResponse.json({ error: 'Failed to delete project' }, { status: 500 });
  }
}