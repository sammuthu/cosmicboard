import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Task from '@/models/Task';
import Reference from '@/models/Reference';

export async function GET(request: Request) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const projectId = searchParams.get('projectId');
    const type = searchParams.get('type'); // 'tasks', 'references', or 'all'
    
    if (!query) {
      return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
    }
    
    const searchRegex = new RegExp(query, 'i');
    const results: any = {
      tasks: [],
      references: []
    };
    
    // Build base filter
    const baseFilter: any = {};
    if (projectId) {
      baseFilter.projectId = projectId;
    }
    
    // Search tasks
    if (type === 'tasks' || type === 'all' || !type) {
      const taskFilter = {
        ...baseFilter,
        $or: [
          { title: searchRegex },
          { contentHtml: searchRegex },
          { tags: { $in: [searchRegex] } }
        ]
      };
      
      results.tasks = await Task.find(taskFilter)
        .sort({ updatedAt: -1 })
        .limit(20);
    }
    
    // Search references
    if (type === 'references' || type === 'all' || !type) {
      const refFilter = {
        ...baseFilter,
        $or: [
          { title: searchRegex },
          { content: searchRegex },
          { description: searchRegex },
          { tags: { $in: [searchRegex] } },
          { codeSnippet: searchRegex }
        ]
      };
      
      results.references = await Reference.find(refFilter)
        .sort({ updatedAt: -1 })
        .limit(20);
    }
    
    // Calculate total results
    results.total = results.tasks.length + results.references.length;
    results.query = query;
    
    return NextResponse.json(results);
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: 'Failed to perform search' },
      { status: 500 }
    );
  }
}