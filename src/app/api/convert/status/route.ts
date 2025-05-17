import { NextRequest, NextResponse } from 'next/server';
import { imageQueue } from '@/lib/queue/imageQueue';
import { videoQueue } from '@/lib/queue/videoQueue';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const jobId = searchParams.get('jobId');
    const jobType = searchParams.get('type') || 'image';

    if (!jobId) {
      return NextResponse.json(
        { error: 'Job ID is required' },
        { status: 400 }
      );
    }

    const job = (jobType === 'video' || jobType === 'audio') 
      ? videoQueue.getJob(jobId) 
      : imageQueue.getJob(jobId);

    if (!job) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      );
    }

    const response: any = {
      id: job.id,
      status: job.status,
      originalName: job.originalName,
      inputFormat: job.inputFormat,
      outputFormat: job.outputFormat,
      createdAt: job.createdAt,
      updatedAt: job.updatedAt
    };

    if (job.status === 'completed' && job.result) {
      response.result = job.result;
    } else if (job.status === 'failed' && job.error) {
      response.error = job.error;
    }

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error checking conversion status:', error);
    return NextResponse.json(
      { error: 'Failed to check conversion status' },
      { status: 500 }
    );
  }
} 