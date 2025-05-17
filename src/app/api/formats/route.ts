import { NextResponse } from 'next/server';
import { videoQueue } from '@/lib/queue/videoQueue';
import { fileTypes } from '@/lib/utils';

export async function GET() {
  try {
    const videoFormats = videoQueue.videoFormats;
    const audioFormats = videoQueue.audioFormats;
    
    const allFormats = {
      video: {
        formats: videoFormats,
        conversions: fileTypes.video.conversions
      },
      audio: {
        formats: audioFormats,
        conversions: fileTypes.audio.conversions
      },
      image: {
        formats: fileTypes.image.formats,
        conversions: fileTypes.image.conversions
      },
      document: {
        formats: fileTypes.document.formats,
        conversions: fileTypes.document.conversions
      }
    };

    return NextResponse.json(allFormats);
  } catch (error) {
    console.error('Error fetching supported formats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch supported formats' },
      { status: 500 }
    );
  }
} 