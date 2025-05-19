import { v4 as uuidv4 } from 'uuid';
import sharp from 'sharp';

export interface ConversionJob {
  id: string;
  file: Buffer;
  originalName: string;
  inputFormat: string;
  outputFormat: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  result?: {
    dataUrl: string;
    filename: string;
  };
  error?: string;
  createdAt: Date;
  updatedAt: Date;
}

class ImageConversionQueue {
  private queue: ConversionJob[] = [];
  private processing: boolean = false;
  private results: Map<string, ConversionJob> = new Map();
  
  public async addJob(
    file: Buffer,
    originalName: string,
    inputFormat: string,
    outputFormat: string
  ): Promise<string> {
    const jobId = uuidv4();
    
    const job: ConversionJob = {
      id: jobId,
      file,
      originalName,
      inputFormat,
      outputFormat,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    this.queue.push(job);
    this.results.set(jobId, job);
    
    if (!this.processing) {
      this.processQueue();
    }
    
    return jobId;
  }
  
  public getJob(jobId: string): ConversionJob | undefined {
    return this.results.get(jobId);
  }
  
  private async processQueue() {
    if (this.processing || this.queue.length === 0) {
      return;
    }
    
    this.processing = true;
    
    const job = this.queue.shift();
    
    if (!job) {
      this.processing = false;
      return;
    }
    
    try {
      job.status = 'processing';
      job.updatedAt = new Date();
      this.results.set(job.id, job);
      
      const outputFilename = `${this.getFilenameWithoutExtension(job.originalName)}_${Date.now()}.${job.outputFormat}`;
      
      let transformer = sharp(job.file);
      
      switch (job.outputFormat.toLowerCase()) {
        case 'jpeg':
        case 'jpg':
          transformer = transformer.jpeg({ quality: 90 });
          break;
        case 'png':
          transformer = transformer.png();
          break;
        case 'webp':
          transformer = transformer.webp();
          break;
        case 'avif':
          transformer = transformer.avif();
          break;
        case 'gif':
          transformer = transformer.gif();
          break;
        default:
          throw new Error(`Unsupported output format: ${job.outputFormat}`);
      }
      
      // Convert to buffer instead of writing to file
      const outputBuffer = await transformer.toBuffer();
      
      // Convert buffer to base64 data URL
      const mimeType = `image/${job.outputFormat.toLowerCase()}`;
      const dataUrl = `data:${mimeType};base64,${outputBuffer.toString('base64')}`;
      
      job.status = 'completed';
      job.result = {
        dataUrl: dataUrl,
        filename: outputFilename
      };
      job.updatedAt = new Date();
      this.results.set(job.id, job);
      
    } catch (error) {
      job.status = 'failed';
      job.error = error instanceof Error ? error.message : 'Unknown error during conversion';
      job.updatedAt = new Date();
      this.results.set(job.id, job);
      console.error(`Error processing job ${job.id}:`, error);
    }
    
    this.processing = false;
    setTimeout(() => this.processQueue(), 100);
  }
  
  public cleanupResults(maxAgeMs: number = 3600000) { // Default: 1 hour
    const now = Date.now();
    
    for (const [jobId, job] of this.results.entries()) {
      if ((now - job.updatedAt.getTime()) > maxAgeMs && 
          (job.status === 'completed' || job.status === 'failed')) {
        this.results.delete(jobId);
        
      }
    }
  }
  
  private getFilenameWithoutExtension(filename: string): string {
    const lastDotIndex = filename.lastIndexOf('.');
    return lastDotIndex !== -1 ? filename.slice(0, lastDotIndex) : filename;
  }
}

export const imageQueue = new ImageConversionQueue();

setInterval(() => {
  imageQueue.cleanupResults();
}, 3600000); // Run hourly 