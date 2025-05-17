import { NextRequest, NextResponse } from 'next/server';
import { imageQueue } from '@/lib/queue/imageQueue';

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type') || '';
    if (!contentType.includes('multipart/form-data')) {
      return NextResponse.json(
        { error: 'Content type must be multipart/form-data' },
        { status: 400 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const outputFormat = formData.get('outputFormat') as string | null;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    if (!outputFormat) {
      return NextResponse.json(
        { error: 'Output format not specified' },
        { status: 400 }
      );
    }

    const fileType = file.type;
    if (!fileType.startsWith('image/')) {
      return NextResponse.json(
        { error: 'File must be an image' },
        { status: 400 }
      );
    }

    const inputFormat = file.type.split('/')[1];
    
    const buffer = Buffer.from(await file.arrayBuffer());
    
    const jobId = await imageQueue.addJob(
      buffer,
      file.name, 
      inputFormat, 
      outputFormat
    );

    return NextResponse.json({ 
      jobId,
      message: 'Image conversion job added to queue'
    });

  } catch (error) {
    console.error('Error processing image conversion request:', error);
    return NextResponse.json(
      { error: 'Failed to process conversion request' },
      { status: 500 }
    );
  }
} 