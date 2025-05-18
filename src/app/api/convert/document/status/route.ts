import { NextRequest, NextResponse } from 'next/server';
import { existsSync } from 'fs';
import path from 'path';
import { OUTPUT_DIR } from '../constants';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const name = searchParams.get('name');
    
    if (!id || !name) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }
    
    const outputPath = path.join(OUTPUT_DIR, `${id}-${name}`);
    const isComplete = existsSync(outputPath);
    
    return NextResponse.json({
      id,
      status: isComplete ? 'complete' : 'processing',
      downloadUrl: isComplete ? `/api/convert/document/download?id=${id}&name=${name}` : null,
    });
    
  } catch (error) {
    console.error('Status check error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 