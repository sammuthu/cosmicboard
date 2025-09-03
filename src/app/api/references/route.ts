import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { Priority, Category } from '@prisma/client'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const projectId = searchParams.get('projectId')
    
    if (!projectId) {
      return NextResponse.json({ error: 'Project ID is required' }, { status: 400 })
    }
    
    const references = await prisma.reference.findMany({
      where: { projectId },
      orderBy: { createdAt: 'desc' }
    })
    
    // Transform for backward compatibility
    const transformedReferences = references.map(ref => ({
      ...ref,
      _id: ref.id
    }))
    
    return NextResponse.json(transformedReferences)
  } catch (error) {
    console.error('Error fetching references:', error)
    return NextResponse.json({ error: 'Failed to fetch references' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const { projectId, title, content, url, category, priority, tags } = data
    
    if (!projectId || !title || !content) {
      return NextResponse.json(
        { error: 'Project ID, title, and content are required' },
        { status: 400 }
      )
    }
    
    // Verify project exists
    const project = await prisma.project.findUnique({
      where: { id: projectId }
    })
    
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }
    
    // Map category string to enum value
    const categoryMap: { [key: string]: Category } = {
      'documentation': 'DOCUMENTATION',
      'snippet': 'SNIPPET',
      'configuration': 'CONFIGURATION',
      'tools': 'TOOLS',
      'api': 'API',
      'tutorial': 'TUTORIAL',
      'reference': 'REFERENCE',
      'other': 'DOCUMENTATION' // Default fallback
    }
    
    const reference = await prisma.reference.create({
      data: {
        projectId,
        title,
        content,
        url,
        category: categoryMap[category?.toLowerCase()] || 'DOCUMENTATION',
        priority: (priority || 'MEDIUM') as Priority,
        tags: tags || [],
        metadata: {}
      }
    })
    
    // Transform for backward compatibility
    const transformedReference = {
      ...reference,
      _id: reference.id
    }
    
    return NextResponse.json(transformedReference, { status: 201 })
  } catch (error) {
    console.error('Error creating reference:', error)
    return NextResponse.json({ error: 'Failed to create reference' }, { status: 500 })
  }
}