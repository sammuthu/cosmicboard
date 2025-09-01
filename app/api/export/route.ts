import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Project from '@/models/Project';
import Task from '@/models/Task';
import Reference from '@/models/Reference';

export async function GET() {
  try {
    await dbConnect();
    
    // Fetch all data
    const projects = await Project.find({});
    const tasks = await Task.find({});
    const references = await Reference.find({});
    
    // Create export object
    const exportData = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      data: {
        projects,
        tasks,
        references
      },
      metadata: {
        projectCount: projects.length,
        taskCount: tasks.length,
        referenceCount: references.length
      }
    };
    
    // Return as downloadable JSON
    return new NextResponse(JSON.stringify(exportData, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="cosmicboard-backup-${Date.now()}.json"`
      }
    });
  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json(
      { error: 'Failed to export data' },
      { status: 500 }
    );
  }
}