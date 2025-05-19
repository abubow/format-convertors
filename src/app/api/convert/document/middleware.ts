import { NextResponse } from 'next/server';

// Since we're using pure Node.js packages for conversion,
// we no longer need to check for system dependencies

// Create a response if requested format is not supported
export function createUnsupportedFormatResponse(format: string): NextResponse {
  return NextResponse.json(
    {
      error: 'Unsupported format',
      details: `The requested format "${format}" is not supported by the Node.js packages we use. Only specific format conversions are available.`,
      supportedConversions: [
        'docx to html',
        'docx to txt', 
        'docx to md',
        'html to md',
        'txt to pdf',
        'md to pdf',
        'html to pdf'
      ]
    },
    { status: 400 }
  );
} 