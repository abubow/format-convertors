import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs/promises';
import ffmpeg from 'fluent-ffmpeg';
import { existsSync } from 'fs';

export interface VideoConversionJob {
  id: string;
  originalFilePath: string;  
  originalName: string;
  inputFormat: string;
  outputFormat: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  result?: {
    url: string;
    filename: string;
    size?: number;
    duration?: number;
  };
  error?: string;
  createdAt: Date;
  updatedAt: Date;
}

class VideoConversionQueue {
  private queue: VideoConversionJob[] = [];
  private processing: boolean = false;
  private results: Map<string, VideoConversionJob> = new Map();
  private readonly uploadDir: string = path.join(process.cwd(), 'public', 'uploads');
  private readonly tempDir: string = path.join(process.cwd(), 'tmp');
  
  private readonly supportedVideoFormats = [
    'mp4', 'webm', 'mov', 'avi', 'mkv', 'flv', 'wmv', 'mpg', 'mpeg', '3gp', 'm4v', 'ts', 'mts', 'ogg'
  ];
  
  private readonly supportedAudioFormats = [
    'mp3', 'wav', 'aac', 'flac', 'ogg', 'm4a', 'wma', 'opus', 'amr', 'aiff'
  ];
  
  constructor() {
    this.ensureDirectories();
  }
  
  public get videoFormats(): string[] {
    return [...this.supportedVideoFormats];
  }
  
  public get audioFormats(): string[] {
    return [...this.supportedAudioFormats];
  }
  
  public isFormatSupported(format: string): boolean {
    const normalizedFormat = format.toLowerCase().replace('.', '');
    return this.supportedVideoFormats.includes(normalizedFormat) || 
           this.supportedAudioFormats.includes(normalizedFormat);
  }
  
  public isAudioFormat(format: string): boolean {
    const normalizedFormat = format.toLowerCase().replace('.', '');
    return this.supportedAudioFormats.includes(normalizedFormat);
  }
  
  private async ensureDirectories() {
    try {
      await fs.mkdir(this.uploadDir, { recursive: true });
      await fs.mkdir(this.tempDir, { recursive: true });
    } catch (error) {
      console.error('Failed to create necessary directories:', error);
    }
  }
  
  public async addJob(
    fileBuffer: Buffer,
    originalName: string,
    inputFormat: string,
    outputFormat: string
  ): Promise<string> {
    const normalizedInputFormat = inputFormat.toLowerCase().replace('.', '');
    const normalizedOutputFormat = outputFormat.toLowerCase().replace('.', '');
    
    if (!this.isFormatSupported(normalizedOutputFormat)) {
      throw new Error(`Unsupported output format: ${outputFormat}. Supported formats: ${
        [...this.supportedVideoFormats, ...this.supportedAudioFormats].join(', ')
      }`);
    }
    
    // Audio format check (for future use)
    // const isOutputAudio = this.isAudioFormat(normalizedOutputFormat);
    
    const jobId = uuidv4();
    
    const tempFilePath = path.join(this.tempDir, `${jobId}_input.${normalizedInputFormat}`);
    await fs.writeFile(tempFilePath, fileBuffer);
    
    const job: VideoConversionJob = {
      id: jobId,
      originalFilePath: tempFilePath,
      originalName,
      inputFormat: normalizedInputFormat,
      outputFormat: normalizedOutputFormat,
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
  
  public getJob(jobId: string): VideoConversionJob | undefined {
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
      const outputPath = path.join(this.uploadDir, outputFilename);
      
      await this.convertVideo(job.originalFilePath, outputPath, job.outputFormat);
      
      const stats = await fs.stat(outputPath);
      const fileSizeInBytes = stats.size;
      
      const fileDuration = await this.getFileDuration(outputPath);
      
      job.status = 'completed';
      job.result = {
        url: `/uploads/${outputFilename}`,
        filename: outputFilename,
        size: fileSizeInBytes,
        duration: fileDuration
      };
      job.updatedAt = new Date();
      this.results.set(job.id, job);
      
      await this.cleanupTempFile(job.originalFilePath);
      
    } catch (error) {
      job.status = 'failed';
      job.error = error instanceof Error ? error.message : 'Unknown error during conversion';
      job.updatedAt = new Date();
      this.results.set(job.id, job);
      console.error(`Error processing job ${job.id}:`, error);
      
      await this.cleanupTempFile(job.originalFilePath);
    }
    
    this.processing = false;
    setTimeout(() => this.processQueue(), 100);
  }
  
  private convertVideo(inputPath: string, outputPath: string, outputFormat: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!existsSync(inputPath)) {
        return reject(new Error(`Input file does not exist: ${inputPath}`));
      }
      
      const command = ffmpeg(inputPath);
      
      const isAudioFormat = this.supportedAudioFormats.includes(outputFormat.toLowerCase());
      
      command.ffprobe((err, data) => {
        if (err) {
          return reject(new Error(`Could not probe file: ${err.message}`));
        }
        
        const hasVideo = data.streams.some(stream => stream.codec_type === 'video');
        const hasAudio = data.streams.some(stream => stream.codec_type === 'audio');
        
        if (isAudioFormat || !hasVideo) {
          this.convertAudio(command, outputPath, outputFormat, resolve, reject);
        } else {
          this.convertVideoWithAudio(command, outputPath, outputFormat, hasAudio, resolve, reject);
        }
      });
    });
  }
  
  private convertAudio(
    command: ffmpeg.FfmpegCommand, 
    outputPath: string, 
    outputFormat: string,
    resolve: () => void,
    reject: (err: Error) => void
  ): void {
    switch (outputFormat.toLowerCase()) {
      case 'mp3':
        command.outputOptions(['-c:a libmp3lame', '-q:a 4']);
        break;
      case 'wav':
        command.outputOptions(['-c:a pcm_s16le']);
        break;
      case 'aac':
        command.outputOptions(['-c:a aac', '-b:a 192k']);
        break;
      case 'flac':
        command.outputOptions(['-c:a flac']);
        break;
      case 'ogg':
        command.outputOptions(['-c:a libvorbis', '-q:a 6']);
        break;
      case 'm4a':
        command.outputOptions(['-c:a aac', '-b:a 192k']);
        break;
      case 'wma':
        command.outputOptions(['-c:a wmav2', '-b:a 192k']);
        break;
      case 'opus':
        command.outputOptions(['-c:a libopus', '-b:a 128k']);
        break;
      case 'amr':
        command.outputOptions(['-c:a libopencore_amrnb', '-b:a 12.2k']);
        break;
      case 'aiff':
        command.outputOptions(['-c:a pcm_s16be']);
        break;
      default:
        command.outputOptions(['-c:a aac', '-b:a 192k']);
    }
    
    command.outputOptions(['-map_metadata 0']);
    
    command
      .noVideo()
      .output(outputPath)
      .on('end', () => {
        resolve();
      })
      .on('error', (err) => {
        reject(err);
      })
      .run();
  }
  
  private convertVideoWithAudio(
    command: ffmpeg.FfmpegCommand, 
    outputPath: string, 
    outputFormat: string,
    hasAudio: boolean,
    resolve: () => void,
    reject: (err: Error) => void
  ): void {
    const commonOptions = [
      '-map 0',
      '-map_metadata 0',
      '-sn'
    ];
    
    switch (outputFormat.toLowerCase()) {
      case 'mp4':
        command.outputOptions([
          ...commonOptions,
          '-c:v libx264', '-preset medium', '-crf 18',
          '-c:a aac', '-b:a 192k'
        ]);
        break;
      case 'webm':
        command.outputOptions([
          ...commonOptions,
          '-c:v libvpx-vp9', '-crf 30', '-b:v 0',
          '-c:a libopus', '-b:a 128k'
        ]);
        break;
      case 'mov':
        command.outputOptions([
          ...commonOptions,
          '-c:v prores_ks', '-profile:v 3',
          '-c:a pcm_s16le'
        ]);
        break;
      case 'avi':
        command.outputOptions([
          ...commonOptions,
          '-c:v mpeg4', '-q:v 3',
          '-c:a libmp3lame', '-q:a 4'
        ]);
        break;
      case 'mkv':
        command.outputOptions([
          ...commonOptions,
          '-c:v libx264', '-preset medium', '-crf 18',
          '-c:a aac', '-b:a 192k'
        ]);
        break;
      case 'flv':
        command.outputOptions([
          ...commonOptions,
          '-c:v libx264', '-preset medium', '-crf 22',
          '-c:a aac', '-b:a 128k'
        ]);
        break;
      case 'wmv':
        command.outputOptions([
          ...commonOptions,
          '-c:v wmv2', '-q:v 3',
          '-c:a wmav2', '-b:a 192k'
        ]);
        break;
      case 'mpg':
      case 'mpeg':
        command.outputOptions([
          ...commonOptions,
          '-c:v mpeg2video', '-q:v 5',
          '-c:a mp2', '-b:a 192k'
        ]);
        break;
      case '3gp':
        command.outputOptions([
          ...commonOptions,
          '-c:v libx264', '-preset medium', '-crf 28', '-b:v 256k',
          '-c:a aac', '-b:a 64k', '-ar 22050'
        ]);
        break;
      case 'm4v':
        command.outputOptions([
          ...commonOptions,
          '-c:v libx264', '-preset medium', '-crf 18',
          '-c:a aac', '-b:a 192k'
        ]);
        break;
      case 'ts':
      case 'mts':
        command.outputOptions([
          ...commonOptions,
          '-c:v libx264', '-preset medium', '-crf 20',
          '-c:a aac', '-b:a 192k'
        ]);
        break;
      case 'ogg':
        command.outputOptions([
          ...commonOptions,
          '-c:v libtheora', '-q:v 7',
          '-c:a libvorbis', '-q:a 5'
        ]);
        break;
      default:
        command.outputOptions([
          ...commonOptions,
          '-c:v libx264', '-preset medium', '-crf 18',
          '-c:a aac', '-b:a 192k'
        ]);
    }
    
    command
      .output(outputPath)
      .on('end', () => {
        resolve();
      })
      .on('error', (err) => {
        reject(err);
      })
      .run();
  }
  
  private async cleanupTempFile(filePath: string): Promise<void> {
    try {
      if (existsSync(filePath)) {
        await fs.unlink(filePath);
      }
    } catch (error) {
      console.error(`Failed to remove temporary file ${filePath}:`, error);
    }
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
  
  private getFileDuration(filePath: string): Promise<number> {
    return new Promise((resolve) => {
      ffmpeg.ffprobe(filePath, (err, metadata) => {
        if (err) {
          console.error('Error getting duration:', err);
          return resolve(0);
        }
        
        resolve(metadata.format.duration || 0);
      });
    });
  }
}

export const videoQueue = new VideoConversionQueue();

setInterval(() => {
  videoQueue.cleanupResults();
}, 3600000); // Run hourly 