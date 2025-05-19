import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { getTempDir } from '@/lib/serverless-utils';
import { videoQueue } from '@/lib/queue/videoQueue';

const mimeTypes: Record<string, string> = {
  'mp4': 'video/mp4',
  'webm': 'video/webm',
  'mov': 'video/quicktime',
  'avi': 'video/x-msvideo',
  'mkv': 'video/x-matroska',
  'flv': 'video/x-flv',
  'wmv': 'video/x-ms-wmv',
  'mpg': 'video/mpeg',
  'mpeg': 'video/mpeg',
  '3gp': 'video/3gpp',
  'm4v': 'video/x-m4v',
  'ts': 'video/mp2t',
  'mts': 'video/mp2t',
  'ogg': 'video/ogg',
  'mp3': 'audio/mpeg',
  'wav': 'audio/wav',
  'aac': 'audio/aac',
  'flac': 'audio/flac',
  'm4a': 'audio/mp4',
  'wma': 'audio/x-ms-wma',
  'opus': 'audio/opus',
  'amr': 'audio/amr',
  'aiff': 'audio/aiff'
};

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const filename = searchParams.get('filename');
    
    if (!id || !filename) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }
    
    // Check if the job exists
    const job = videoQueue.getJob(id);
    if (!job || job.status !== 'completed') {
      return NextResponse.json(
        { error: 'File not found or conversion not completed' },
        { status: 404 }
      );
    }
    
    const tempDir = getTempDir();
    const filePath = path.join(tempDir, filename);
    
    if (!existsSync(filePath)) {
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      );
    }
    
    const fileBuffer = await readFile(filePath);
    
    // Set appropriate content type based on file extension
    const fileExt = path.extname(filename).slice(1).toLowerCase();
    const contentType = mimeTypes[fileExt] || 'application/octet-stream';
    
    // Return file with appropriate headers
    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
    
  } catch (error) {
    console.error('Download error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 