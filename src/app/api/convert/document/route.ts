import { NextRequest, NextResponse } from 'next/server';
import { writeFile, readFile } from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { UPLOAD_DIR, OUTPUT_DIR, ensureDirectoriesExist } from './constants';
import mammoth from 'mammoth';
import TurndownService from 'turndown';
import PDFDocument from 'pdfkit';
import { createUnsupportedFormatResponse } from './middleware';
import fs from 'fs';

// Define supported conversions
const supportedConversions = new Set([
  'docx:html', 'docx:txt', 'docx:md',
  'html:md', 
  'txt:pdf', 'md:pdf', 'html:pdf'
]);

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
    
    // Check if this conversion is supported
    const conversionPair = `${fileExt}:${targetFormat}`;
    if (!supportedConversions.has(conversionPair)) {
      return createUnsupportedFormatResponse(conversionPair);
    }
    
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
  try {
    // Handle various conversion paths based on source and target formats
    if (sourceFormat === 'docx' && (targetFormat === 'html' || targetFormat === 'txt' || targetFormat === 'md')) {
      // DOCX -> HTML/TXT/MD using mammoth
      await convertFromDocx(inputPath, outputPath, targetFormat);
    } else if (sourceFormat === 'html' && targetFormat === 'md') {
      // HTML -> MD using turndown
      await convertHtmlToMarkdown(inputPath, outputPath);
    } else if ((sourceFormat === 'txt' || sourceFormat === 'md' || sourceFormat === 'html') && targetFormat === 'pdf') {
      // TXT/MD/HTML -> PDF using PDFKit
      await convertToPdf(inputPath, outputPath);
    } else {
      throw new Error(`Conversion from ${sourceFormat} to ${targetFormat} is not supported without system dependencies`);
    }
  } catch (error) {
    console.error('Document conversion error:', error);
    throw error;
  }
}

async function convertFromDocx(inputPath: string, outputPath: string, targetFormat: string): Promise<void> {
  const buffer = await readFile(inputPath);
  
  if (targetFormat === 'html') {
    // Convert DOCX to HTML
    const result = await mammoth.convertToHtml({ buffer });
    await writeFile(outputPath, result.value);
  } else if (targetFormat === 'txt') {
    // Convert DOCX to plain text
    const result = await mammoth.extractRawText({ buffer });
    await writeFile(outputPath, result.value);
  } else if (targetFormat === 'md') {
    // Convert DOCX to HTML first, then HTML to Markdown
    const htmlResult = await mammoth.convertToHtml({ buffer });
    const turndownService = new TurndownService();
    const markdown = turndownService.turndown(htmlResult.value);
    await writeFile(outputPath, markdown);
  }
}

async function convertHtmlToMarkdown(inputPath: string, outputPath: string): Promise<void> {
  const html = await readFile(inputPath, 'utf8');
  const turndownService = new TurndownService();
  const markdown = turndownService.turndown(html);
  await writeFile(outputPath, markdown);
}

async function convertToPdf(inputPath: string, outputPath: string): Promise<void> {
  const content = await readFile(inputPath, 'utf8');
  
  // Create a PDF document
  const doc = new PDFDocument();
  
  // Create a write stream to the output path
  const writeStream = fs.createWriteStream(outputPath);
  doc.pipe(writeStream);
  
  // Add the content to the PDF
  doc.fontSize(12).text(content, {
    align: 'left'
  });
  
  // Finalize the PDF and end the stream
  doc.end();
  
  // Wait for the stream to finish
  await new Promise<void>((resolve, reject) => {
    writeStream.on('finish', resolve);
    writeStream.on('error', reject);
  });
} 