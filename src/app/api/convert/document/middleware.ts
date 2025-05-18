import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execPromise = promisify(exec);

// Check if LibreOffice is installed
async function checkForLibreOffice(): Promise<boolean> {
  try {
    await execPromise('soffice --version');
    return true;
  } catch (error) {
    console.error('LibreOffice not found:', error);
    return false;
  }
}

// Check if Pandoc is installed
async function checkForPandoc(): Promise<boolean> {
  try {
    await execPromise('pandoc --version');
    return true;
  } catch (error) {
    console.error('Pandoc not found:', error);
    return false;
  }
}

// Check all dependencies
export async function checkDependencies(): Promise<{ 
  isReady: boolean; 
  missingDependencies: string[] 
}> {
  const missingDependencies: string[] = [];
  
  const hasLibreOffice = await checkForLibreOffice();
  const hasPandoc = await checkForPandoc();
  
  if (!hasLibreOffice) {
    missingDependencies.push('LibreOffice');
  }
  
  if (!hasPandoc) {
    missingDependencies.push('Pandoc');
  }
  
  return {
    isReady: missingDependencies.length === 0,
    missingDependencies
  };
}

// Create dependency check response
export function createDependencyErrorResponse(missingDependencies: string[]): NextResponse {
  return NextResponse.json(
    {
      error: 'Missing dependencies',
      details: `The following dependencies are required but not installed: ${missingDependencies.join(', ')}`,
      instructions: {
        libreoffice: 'Install LibreOffice from https://www.libreoffice.org/download/download-libreoffice/',
        pandoc: 'Install Pandoc from https://pandoc.org/installing.html'
      }
    },
    { status: 503 }
  );
} 