import { NextRequest, NextResponse } from 'next/server';
import { videoQueue } from '@/lib/queue/videoQueue';

export const config = {
  api: {
    bodyParser: false,
    responseLimit: '50mb',
  },
};

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
    if (!fileType.startsWith('video/') && !fileType.startsWith('audio/')) {
      return NextResponse.json(
        { error: 'File must be a video or audio file' },
        { status: 400 }
      );
    }

    if (!videoQueue.isFormatSupported(outputFormat)) {
      return NextResponse.json(
        { error: `Output format '${outputFormat}' is not supported` },
        { status: 400 }
      );
    }

    let inputFormat = '';
    if (fileType.includes('/')) {
      inputFormat = fileType.split('/')[1];
    } else {
      const filenameParts = file.name.split('.');
      if (filenameParts.length > 1) {
        inputFormat = filenameParts[filenameParts.length - 1];
      }
    }
    
    if (!inputFormat) {
      return NextResponse.json(
        { error: 'Could not determine input format' },
        { status: 400 }
      );
    }
    
    const buffer = Buffer.from(await file.arrayBuffer());
    
    const jobId = await videoQueue.addJob(
      buffer,
      file.name, 
      inputFormat, 
      outputFormat
    );

    return NextResponse.json({ 
      jobId,
      message: 'Conversion job added to queue'
    });

  } catch (error) {
    console.error('Error processing conversion request:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Failed to process conversion request';
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
} 