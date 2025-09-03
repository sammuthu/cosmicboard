import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const projects = await prisma.project.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: {
            tasks: true,
            references: true
          }
        },
        tasks: {
          select: {
            status: true
          }
        },
        references: {
          select: {
            category: true
          }
        }
      }
    });
    
    // Transform the data to match the expected format
    const projectsWithCounts = projects.map(project => {
      const active = project.tasks.filter(t => t.status === 'ACTIVE').length;
      const completed = project.tasks.filter(t => t.status === 'COMPLETED').length;
      const deleted = project.tasks.filter(t => t.status === 'DELETED').length;
      
      const totalReferences = project._count.references;
      const snippets = project.references.filter(r => r.category === 'SNIPPET').length;
      const documentation = project.references.filter(r => r.category === 'DOCUMENTATION').length;
      
      // Remove the included relations from the response
      const { tasks, references, _count, ...projectData } = project;
      
      return {
        ...projectData,
        _id: project.id, // For backward compatibility
        counts: { 
          tasks: { active, completed, deleted },
          references: { total: totalReferences, snippets, documentation }
        }
      };
    });
    
    return NextResponse.json(projectsWithCounts);
  } catch (error) {
    console.error('GET /api/projects error:', error);
    return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description } = body;
    
    if (!name) {
      return NextResponse.json({ error: 'Project name is required' }, { status: 400 });
    }
    
    const project = await prisma.project.create({
      data: { 
        name, 
        description,
        metadata: {} // Initialize with empty JSON object
      }
    });
    
    return NextResponse.json({ ...project, _id: project.id }, { status: 201 });
  } catch (error: any) {
    console.error('POST /api/projects error:', error);
    
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Project name already exists' }, { status: 400 });
    }
    
    return NextResponse.json({ error: 'Failed to create project' }, { status: 500 });
  }
}