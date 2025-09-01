import { NextRequest, NextResponse } from 'next/server'
import connectMongo from '@/lib/db'
import Reference from '@/models/Reference'
import Project from '@/models/Project'

export async function GET(request: NextRequest) {
  try {
    await connectMongo()
    
    const searchParams = request.nextUrl.searchParams
    const projectId = searchParams.get('projectId')
    
    if (!projectId) {
      return NextResponse.json({ error: 'Project ID is required' }, { status: 400 })
    }
    
    const references = await Reference.find({ projectId })
      .sort({ createdAt: -1 })
    
    return NextResponse.json(references)
  } catch (error) {
    console.error('Error fetching references:', error)
    return NextResponse.json({ error: 'Failed to fetch references' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectMongo()
    
    const data = await request.json()
    const { projectId, title, content, category, priority, tags } = data
    
    if (!projectId || !title || !content) {
      return NextResponse.json(
        { error: 'Project ID, title, and content are required' },
        { status: 400 }
      )
    }
    
    // Verify project exists
    const project = await Project.findById(projectId)
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }
    
    const reference = new Reference({
      projectId,
      title,
      content,
      category: category || 'other',
      priority: priority || 'MEDIUM',
      tags: tags || []
    })
    
    await reference.save()
    
    return NextResponse.json(reference, { status: 201 })
  } catch (error) {
    console.error('Error creating reference:', error)
    return NextResponse.json({ error: 'Failed to create reference' }, { status: 500 })
  }
}