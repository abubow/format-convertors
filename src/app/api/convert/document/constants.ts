import path from 'path';
import { mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { getTempDir } from '@/lib/serverless-utils';

// Define the upload and output directories using /tmp on Vercel
export const UPLOAD_DIR = path.join(getTempDir(), 'uploads');
export const OUTPUT_DIR = path.join(getTempDir(), 'output');

// Content type mapping for downloads
export const contentTypeMap: Record<string, string> = {
  'html': 'text/html',
  'txt': 'text/plain',
  'md': 'text/markdown',
  'pdf': 'application/pdf',
  'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
};

// Ensure directories exist
export async function ensureDirectoriesExist() {
  if (!existsSync(UPLOAD_DIR)) {
    await mkdir(UPLOAD_DIR, { recursive: true });
  }
  if (!existsSync(OUTPUT_DIR)) {
    await mkdir(OUTPUT_DIR, { recursive: true });
  }
} 