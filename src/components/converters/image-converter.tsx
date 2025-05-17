"use client"
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dropzone } from '@/components/ui/dropzone';
import { fileTypes } from '@/lib/utils';
import { Download, RefreshCw, Zap, Image, Check, AlertTriangle } from 'lucide-react';

interface ConversionResult {
  url: string;
  filename: string;
}

interface ConversionJob {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  originalName: string;
  outputFormat: string;
  result?: ConversionResult;
  error?: string;
}

export function ImageConverter() {
  const [files, setFiles] = useState<File[]>([]);
  const [outputFormat, setOutputFormat] = useState<string>('');
  const [converting, setConverting] = useState<boolean>(false);
  const [convertedUrls, setConvertedUrls] = useState<Array<{url: string, originalName: string}>>([]);
  const [activeJobs, setActiveJobs] = useState<ConversionJob[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (activeJobs.length === 0) return;

    const checkJobStatus = async () => {
      const updatedJobs = [...activeJobs];
      let hasChanges = false;
      let allCompleted = true;

      for (let i = 0; i < updatedJobs.length; i++) {
        const job = updatedJobs[i];
        if (job.status !== 'completed' && job.status !== 'failed') {
          allCompleted = false;
          
          try {
            const response = await fetch(`/api/convert/status?jobId=${job.id}`);
            if (!response.ok) {
              console.error(`Failed to check status for job ${job.id}`);
              continue;
            }

            const data = await response.json();
            if (data.status !== job.status || 
                (data.status === 'completed' && !job.result) ||
                (data.status === 'failed' && !job.error)) {
              updatedJobs[i] = {
                ...updatedJobs[i],
                status: data.status,
                result: data.result,
                error: data.error
              };
              hasChanges = true;
            }
          } catch (error) {
            console.error(`Error checking job status for ${job.id}:`, error);
          }
        }
      }

      if (hasChanges) {
        setActiveJobs(updatedJobs);
      }

      if (allCompleted) {
        setConverting(false);
        
        const successfulResults = updatedJobs
          .filter(job => job.status === 'completed' && job.result)
          .map(job => ({
            url: job.result!.url,
            originalName: job.originalName
          }));
        
        if (successfulResults.length > 0) {
          setConvertedUrls(successfulResults);
        }
        
        const failedJobs = updatedJobs.filter(job => job.status === 'failed');
        if (failedJobs.length > 0) {
          setError(`${failedJobs.length} conversion(s) failed. Please try again.`);
        }
      }
    };

    const intervalId = setInterval(checkJobStatus, 1000);
    return () => clearInterval(intervalId);
  }, [activeJobs]);

  const handleFileSelect = (selectedFiles: File[]) => {
    setFiles(selectedFiles);
    setConvertedUrls([]);
    setOutputFormat('');
    setError(null);
    setActiveJobs([]);
  };

  const getFileExtension = (filename: string): string => {
    return filename.slice(((filename.lastIndexOf('.') - 1) >>> 0) + 2).toLowerCase();
  };
  
  const getFilenameWithoutExtension = (filename: string): string => {
    const lastDotIndex = filename.lastIndexOf('.');
    return lastDotIndex !== -1 ? filename.slice(0, lastDotIndex) : filename;
  };

  const getAvailableFormats = (): string[] => {
    if (files.length === 0) return [];
    
    const inputFormat = getFileExtension(files[0].name);
    
    const allSameFormat = files.every(file => getFileExtension(file.name) === inputFormat);
    
    if (!allSameFormat) return [];
    
    return (fileTypes.image.conversions as Record<string, string[]>)[inputFormat] || [];
  };

  const handleConvert = async () => {
    if (files.length === 0 || !outputFormat) return;
    
    setConverting(true);
    setError(null);
    setActiveJobs([]);
    setConvertedUrls([]);
    
    try {
      const jobs: ConversionJob[] = [];
      
      for (const file of files) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('outputFormat', outputFormat);
        
        const response = await fetch('/api/convert/image', {
          method: 'POST',
          body: formData,
        });
        
        if (!response.ok) {
          throw new Error(`Failed to convert image: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        jobs.push({
          id: data.jobId,
          status: 'pending',
          originalName: file.name,
          outputFormat: outputFormat
        });
      }
      
      setActiveJobs(jobs);
      
    } catch (error) {
      console.error('Error starting conversion:', error);
      setError(error instanceof Error ? error.message : 'Failed to start conversion');
      setConverting(false);
    }
  };
  
  return (
    <div className="space-y-6">
      {files.length === 0 ? (
        <Dropzone
          onFileSelect={handleFileSelect}
          accept={{
            'image/*': fileTypes.image.formats.map(format => `.${format}`)
          }}
          className="h-[300px]"
        />
      ) : (
        <div className="space-y-6">
          {convertedUrls.length === 0 ? (
            <>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="neomorphic-icon">
                    <Image className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="font-medium">Select output format</h3>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setFiles([])}
                  disabled={converting}
                >
                  Start over
                </Button>
              </div>
              
              {error && (
                <div className="rounded-lg bg-red-50 p-3 flex items-start gap-2 text-red-600">
                  <AlertTriangle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                  <p className="text-sm">{error}</p>
                </div>
              )}
              
              <div className="bento-card p-4">
                <p className="text-sm text-foreground/70 mb-3">Convert to:</p>
                <div className="flex flex-wrap gap-2">
                  {getAvailableFormats().map((format) => (
                    <Button
                      key={format}
                      size="sm"
                      variant="secondary"
                      isActive={outputFormat === format}
                      onClick={() => setOutputFormat(format)}
                      className="capitalize"
                      disabled={converting}
                    >
                      {outputFormat === format && <Check className="mr-1.5 h-3 w-3" />}
                      {format}
                    </Button>
                  ))}
                </div>
              </div>
              
              <Button
                onClick={handleConvert}
                disabled={!outputFormat || converting}
                className="w-full"
              >
                {converting ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Converting... ({activeJobs.filter(job => job.status === 'completed').length}/{activeJobs.length})
                  </>
                ) : (
                  <>
                    <Zap className="mr-2 h-4 w-4" />
                    Convert now
                  </>
                )}
              </Button>
            </>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-500"></div>
                  <h3 className="font-medium text-green-600">Conversion complete</h3>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setFiles([])}
                >
                  Convert another
                </Button>
              </div>
              
              {/* Scrollable container to prevent overflow */}
              <div className="max-h-[320px] overflow-y-auto pr-1">
                <div className="grid grid-cols-2 gap-4">
                  {convertedUrls.map((item, index) => (
                    <div key={index} className="group relative bento-card p-4 overflow-hidden aspect-square">
                      <img
                        src={item.url}
                        alt={`Converted ${item.originalName}`}
                        className="object-cover absolute inset-0 w-full h-full p-2"
                      />
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent py-2 px-3">
                        <p className="text-white text-xs truncate">
                          {item.originalName}.{outputFormat}
                        </p>
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-end p-4">
                        <a
                          href={item.url}
                          download={`${item.originalName}.${outputFormat}`}
                          className="w-full"
                        >
                          <Button size="sm" className="w-full">
                            <Download className="mr-2 h-3.5 w-3.5" />
                            Download
                          </Button>
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 