import path from 'path';
import { mkdir } from 'fs/promises';
import { existsSync } from 'fs';

// Define the upload and output directories
export const UPLOAD_DIR = path.join(process.cwd(), 'uploads');
export const OUTPUT_DIR = path.join(process.cwd(), 'output');

// Ensure directories exist
export async function ensureDirectoriesExist() {
  if (!existsSync(UPLOAD_DIR)) {
    await mkdir(UPLOAD_DIR, { recursive: true });
  }
  if (!existsSync(OUTPUT_DIR)) {
    await mkdir(OUTPUT_DIR, { recursive: true });
  }
}

// Map of content types for different file extensions
export const contentTypeMap: Record<string, string> = {
  'pdf': 'application/pdf',
  'doc': 'application/msword',
  'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'txt': 'text/plain',
  'html': 'text/html',
  'md': 'text/markdown',
  'rtf': 'application/rtf',
  'odt': 'application/vnd.oasis.opendocument.text'
}; 