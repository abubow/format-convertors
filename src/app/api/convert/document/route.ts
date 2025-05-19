import { NextRequest, NextResponse } from 'next/server';
import { writeFile, readFile } from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { exec } from 'child_process';
import { promisify } from 'util';
import { UPLOAD_DIR, OUTPUT_DIR, ensureDirectoriesExist } from './constants';
import { checkDependencies, createDependencyErrorResponse } from './middleware';

// Import libreoffice-convert with require to avoid TypeScript issues
const libre = require('libreoffice-convert');

const libreConvert = promisify(libre.convert);
const execPromise = promisify(exec);

// Map target formats to LibreOffice format strings
const formatMap: Record<string, string> = {
  'pdf': 'pdf',
  'docx': 'docx',
  'doc': 'doc',
  'txt': 'txt',
  'html': 'html',
  'odt': 'odt',
  'rtf': 'rtf',
  'md': 'md'
};

export async function POST(req: NextRequest) {
  try {
    // Ensure directories exist
    await ensureDirectoriesExist();

    // Check for dependencies
    const { isReady, missingDependencies } = await checkDependencies();
    if (!isReady) {
      return createDependencyErrorResponse(missingDependencies);
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;
    const targetFormat = formData.get('targetFormat') as string;
    
    if (!file || !targetFormat) {
      return NextResponse.json(
        { error: 'File and target format are required' },
        { status: 400 }
      );
    }

    // Generate a unique ID for this conversion
    const conversionId = uuidv4();
    
    // Get file extension
    const fileName = file.name;
    const fileExt = path.extname(fileName).slice(1).toLowerCase();
    const fileNameWithoutExt = path.basename(fileName, path.extname(fileName));
    
    // Create file paths
    const inputPath = path.join(UPLOAD_DIR, `${conversionId}-${fileName}`);
    const outputPath = path.join(OUTPUT_DIR, `${conversionId}-${fileNameWithoutExt}.${targetFormat}`);
    
    // Write the uploaded file to disk
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(inputPath, buffer);
    
    // Start conversion process
    try {
      await convertDocument(inputPath, outputPath, fileExt, targetFormat);
      
      // Return response with conversion ID
      return NextResponse.json({
        success: true,
        conversionId,
        originalName: fileName,
        targetFormat,
        downloadUrl: `/api/convert/document/download?id=${conversionId}&name=${fileNameWithoutExt}.${targetFormat}`
      });
      
    } catch (error) {
      console.error('Conversion error:', error);
      return NextResponse.json(
        { error: 'Document conversion failed', details: String(error) },
        { status: 500 }
      );
    }
    
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function convertDocument(
  inputPath: string,
  outputPath: string,
  sourceFormat: string,
  targetFormat: string
): Promise<void> {
  // Use LibreOffice for document conversion
  try {
    if (targetFormat === 'md' && sourceFormat !== 'html' && sourceFormat !== 'txt') {
      // For markdown conversion from non-text formats, convert to HTML first, then to Markdown
      const tempHtmlPath = outputPath.replace(/\.[^/.]+$/, '.html');
      await convertWithLibreOffice(inputPath, tempHtmlPath, 'html');
      await convertWithPandoc(tempHtmlPath, outputPath);
      return;
    }
    
    if ((sourceFormat === 'txt' || sourceFormat === 'md' || sourceFormat === 'html') &&
        (targetFormat === 'txt' || targetFormat === 'md' || targetFormat === 'html' || targetFormat === 'pdf')) {
      // For text-based formats, use pandoc
      await convertWithPandoc(inputPath, outputPath);
    } else {
      // For other formats, use LibreOffice
      await convertWithLibreOffice(inputPath, outputPath, targetFormat);
    }
  } catch (error) {
    console.error('Document conversion error:', error);
    throw error;
  }
}

async function convertWithLibreOffice(inputPath: string, outputPath: string, format: string): Promise<void> {
  const inputBuffer = await readFile(inputPath);
  const outputFormat = formatMap[format];
  
  if (!outputFormat) {
    throw new Error(`Unsupported output format: ${format}`);
  }
  
  // Convert using libreoffice-convert
  try {
    const outputBuffer = await libreConvert(inputBuffer, outputFormat, undefined);
    await writeFile(outputPath, outputBuffer);
  } catch (error: any) {
    console.error('LibreOffice conversion error:', error);
    // Fallback to command-line conversion if the library fails
    await execPromise(`soffice --headless --convert-to ${outputFormat} --outdir "${path.dirname(outputPath)}" "${inputPath}"`);
  }
}

async function convertWithPandoc(inputPath: string, outputPath: string): Promise<void> {
  try {
    await execPromise(`pandoc "${inputPath}" -o "${outputPath}"`);
  } catch (error: any) {
    console.error('Pandoc conversion error:', error);
    throw new Error(`Pandoc conversion failed: ${error.message}`);
  }
} 