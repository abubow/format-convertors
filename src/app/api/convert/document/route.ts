import { NextRequest, NextResponse } from 'next/server';
import { writeFile, readFile } from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { UPLOAD_DIR, OUTPUT_DIR, ensureDirectoriesExist } from './constants';

// Remove LibreOffice and Pandoc dependencies
// const libre = require('libreoffice-convert');
// const libreConvert = promisify(libre.convert);
// const execPromise = promisify(exec);

// Map target formats to API format strings
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
    
    try {
      // Use cloud conversion API instead of local conversion
      await convertDocumentWithCloudService(inputPath, outputPath, fileExt, targetFormat);
      
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

async function convertDocumentWithCloudService(
  inputPath: string,
  outputPath: string,
  sourceFormat: string,
  targetFormat: string
): Promise<void> {
  // Read the input file
  const inputBuffer = await readFile(inputPath);
  
  try {
    // Example using CloudConvert API - you'll need to install their SDK and set up an account
    // Replace this with your chosen cloud conversion service
    
    // For implementation purposes, this is a placeholder
    // In a real implementation you would:
    // 1. Upload the file to the cloud service
    // 2. Initiate the conversion
    // 3. Download the result
    // 4. Write it to the output path
    
    // Simulation for example purposes only - REPLACE THIS WITH ACTUAL IMPLEMENTATION
    const response = await fetch('https://api.cloudconvert.com/v2/convert', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.CLOUD_CONVERT_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        tasks: {
          'import-my-file': {
            operation: 'import/upload'
          },
          'convert-my-file': {
            operation: 'convert',
            input: 'import-my-file',
            output_format: targetFormat,
            engine: 'libreoffice'
          },
          'export-my-file': {
            operation: 'export/url',
            input: 'convert-my-file'
          }
        }
      })
    });
    
    const result = await response.json();
    
    // Download the converted file
    const downloadResponse = await fetch(result.data.tasks.find((t: any) => t.name === 'export-my-file').result.files[0].url);
    const convertedBuffer = Buffer.from(await downloadResponse.arrayBuffer());
    
    // Write the converted file
    await writeFile(outputPath, convertedBuffer);
  } catch (error) {
    console.error('Cloud conversion error:', error);
    throw new Error(`Document conversion failed: ${error}`);
  }
} 