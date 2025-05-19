import path from 'path';
import fs from 'fs/promises';
import { existsSync } from 'fs';

// Use /tmp directory for Vercel serverless functions
export const getTempDir = () => {
  const isVercel = process.env.VERCEL === '1';
  return isVercel ? '/tmp' : path.join(process.cwd(), 'tmp');
};

// Create temporary directory if it doesn't exist
export const ensureTempDir = async () => {
  const tempDir = getTempDir();
  if (!existsSync(tempDir)) {
    try {
      await fs.mkdir(tempDir, { recursive: true });
      return true;
    } catch (error) {
      console.error('Error creating temp directory:', error);
      return false;
    }
  }
  return true;
};

// Write data to a temp file and return the path
export const writeTempFile = async (data: Buffer, filename: string): Promise<string> => {
  await ensureTempDir();
  const tempDir = getTempDir();
  const filePath = path.join(tempDir, filename);
  
  try {
    await fs.writeFile(filePath, data);
    return filePath;
  } catch (error) {
    console.error('Error writing temp file:', error);
    throw error;
  }
};

// Get a path to a temporary file
export const getTempFilePath = (filename: string): string => {
  const tempDir = getTempDir();
  return path.join(tempDir, filename);
};

// Clean up a temporary file
export const cleanupTempFile = async (filePath: string) => {
  try {
    if (existsSync(filePath)) {
      await fs.unlink(filePath);
    }
  } catch (error) {
    console.error('Error cleaning up temp file:', error);
  }
}; 