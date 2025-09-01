import { NextRequest, NextResponse } from 'next/server';
import connectMongo from '@/lib/db';
import Project from '@/models/Project';
import Task from '@/models/Task';

export async function GET() {
  try {
    await connectMongo();
    
    const projects = await Project.find().sort({ createdAt: -1 });
    
    // Get task counts for each project
    const projectsWithCounts = await Promise.all(
      projects.map(async (project) => {
        const tasks = await Task.find({ projectId: project._id });
        const active = tasks.filter(t => t.status === 'ACTIVE').length;
        const completed = tasks.filter(t => t.status === 'COMPLETED').length;
        const deleted = tasks.filter(t => t.status === 'DELETED').length;
        
        return {
          ...project.toObject(),
          counts: { active, completed, deleted }
        };
      })
    );
    
    return NextResponse.json(projectsWithCounts);
  } catch (error) {
    console.error('GET /api/projects error:', error);
    return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectMongo();
    
    const body = await request.json();
    const { name, description } = body;
    
    if (!name) {
      return NextResponse.json({ error: 'Project name is required' }, { status: 400 });
    }
    
    const project = await Project.create({ name, description });
    
    return NextResponse.json(project, { status: 201 });
  } catch (error: any) {
    console.error('POST /api/projects error:', error);
    
    if (error.code === 11000) {
      return NextResponse.json({ error: 'Project name already exists' }, { status: 400 });
    }
    
    return NextResponse.json({ error: 'Failed to create project' }, { status: 500 });
  }
}