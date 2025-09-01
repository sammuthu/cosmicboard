import { NextRequest, NextResponse } from 'next/server'
import connectMongo from '@/lib/db'
import Reference from '@/models/Reference'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectMongo()
    
    const { id } = await params
    
    const reference = await Reference.findByIdAndDelete(id)
    
    if (!reference) {
      return NextResponse.json({ error: 'Reference not found' }, { status: 404 })
    }
    
    return NextResponse.json({ message: 'Reference deleted successfully' })
  } catch (error) {
    console.error('Error deleting reference:', error)
    return NextResponse.json({ error: 'Failed to delete reference' }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectMongo()
    
    const { id } = await params
    const data = await request.json()
    
    const reference = await Reference.findByIdAndUpdate(
      id,
      data,
      { new: true, runValidators: true }
    )
    
    if (!reference) {
      return NextResponse.json({ error: 'Reference not found' }, { status: 404 })
    }
    
    return NextResponse.json(reference)
  } catch (error) {
    console.error('Error updating reference:', error)
    return NextResponse.json({ error: 'Failed to update reference' }, { status: 500 })
  }
}