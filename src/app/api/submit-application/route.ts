import { NextResponse } from 'next/server'
import { submitApplication } from '@/lib/api'

export async function POST(request: Request) {
  try {
    const data = await request.json()
    const result = await submitApplication(data)
    
    return NextResponse.json({ 
      message: 'Application submitted successfully',
      data: result 
    })
  } catch (error) {
    return NextResponse.json(
      { message: 'Failed to submit application' }, 
      { status: 500 }
    )
  }
}