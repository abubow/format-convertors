import { NextResponse } from 'next/server';
import { videoQueue } from '@/lib/queue/videoQueue';

export async function GET() {
  try {
    const supportedFormats = {
      video: videoQueue.videoFormats,
      audio: videoQueue.audioFormats
    };

    return NextResponse.json(supportedFormats);
  } catch (error) {
    console.error('Error fetching supported formats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch supported formats' },
      { status: 500 }
    );
  }
} 