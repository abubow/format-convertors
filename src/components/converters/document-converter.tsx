"use client"
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dropzone } from '@/components/ui/dropzone';
import { fileTypes } from '@/lib/utils';
import { Download, RefreshCw, Zap, FileText, AlertCircle, Clock } from 'lucide-react';

interface ConversionJob {
  id: string;
  file: File;
  originalName: string;
  targetFormat: string;
  status: 'pending' | 'processing' | 'complete' | 'error';
  downloadUrl?: string;
  error?: string;
}

export function DocumentConverter() {
  const [files, setFiles] = useState<File[]>([]);
  const [outputFormat, setOutputFormat] = useState<string>('');
  const [converting, setConverting] = useState<boolean>(false);
  const [conversionJobs, setConversionJobs] = useState<ConversionJob[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = (selectedFiles: File[]) => {
    setFiles(selectedFiles);
    setConversionJobs([]);
    setOutputFormat('');
    setError(null);
  };

  const getFileExtension = (filename: string): string => {
    return filename.slice(((filename.lastIndexOf('.') - 1) >>> 0) + 2).toLowerCase();
  };

  const getAvailableFormats = (): string[] => {
    if (files.length === 0) return [];

    const inputFormat = getFileExtension(files[0].name);

    const allSameFormat = files.every(file => getFileExtension(file.name) === inputFormat);

    if (!allSameFormat) return [];

    return (fileTypes.document.conversions as Record<string, string[]>)[inputFormat] || [];
  };

  const handleConvert = async () => {
    if (files.length === 0 || !outputFormat) return;

    setConverting(true);
    setError(null);

    // Create conversion jobs for each file
    const jobs: ConversionJob[] = files.map(file => ({
      id: '', // Will be set by the API
      file,
      originalName: file.name,
      targetFormat: outputFormat,
      status: 'pending'
    }));

    setConversionJobs(jobs);

    // Start processing each job
    for (let i = 0; i < jobs.length; i++) {
      try {
        const job = jobs[i];
        job.status = 'processing';
        setConversionJobs([...jobs]);

        // Create form data for the file
        const formData = new FormData();
        formData.append('file', job.file);
        formData.append('targetFormat', outputFormat);

        // Send to the API
        const response = await fetch('/api/convert/document', {
          method: 'POST',
          body: formData
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Conversion failed');
        }

        const data = await response.json();

        // Update job with conversion data
        job.id = data.conversionId;
        job.status = 'complete';
        job.downloadUrl = data.downloadUrl;

        setConversionJobs([...jobs]);
      } catch (error) {
        console.error('Conversion error:', error);
        jobs[i].status = 'error';
        jobs[i].error = error instanceof Error ? error.message : 'Unknown error';
        setConversionJobs([...jobs]);
        setError('One or more conversions failed. Please try again.');
      }
    }

    setConverting(false);
  };

  // Check status of processing jobs periodically
  useEffect(() => {
    const processingJobs = conversionJobs.filter(job => job.status === 'processing');

    if (processingJobs.length === 0) return;

    const checkInterval = setInterval(async () => {
      let updated = false;

      for (const job of processingJobs) {
        if (!job.id) continue;

        try {
          const response = await fetch(`/api/convert/document/status?id=${job.id}&name=${job.originalName.replace(/\.[^/.]+$/, '')}.${job.targetFormat}`);

          if (!response.ok) continue;

          const data = await response.json();

          if (data.status === 'complete') {
            // Update job
            const updatedJobs = conversionJobs.map(j =>
              j.id === job.id
                ? { ...j, status: 'complete' as const, downloadUrl: data.downloadUrl }
                : j
            );

            setConversionJobs(updatedJobs);
            updated = true;
          }
        } catch (error) {
          console.error('Status check error:', error);
        }
      }

      if (updated) {
        // If all jobs are done, clear the interval
        const stillProcessing = conversionJobs.some(job => job.status === 'processing');
        if (!stillProcessing) {
          clearInterval(checkInterval);
        }
      }
    }, 2000);

    return () => clearInterval(checkInterval);
  }, [conversionJobs]);

  const getDocumentIcon = (extension: string) => {
    switch (extension) {
      case 'pdf':
        return <FileText className="h-8 w-8 text-red-600" />;
      case 'doc':
      case 'docx':
        return <FileText className="h-8 w-8 text-blue-600" />;
      case 'txt':
        return <FileText className="h-8 w-8 text-gray-600" />;
      case 'html':
        return <FileText className="h-8 w-8 text-orange-600" />;
      default:
        return <FileText className="h-8 w-8 text-amber-600" />;
    }
  };

  return (
    <Card className="w-full">
      <div className="space-y-6">
        {/* Coming Soon Banner */}
        <div className="bg-amber-100 border border-amber-300 rounded-md p-4 flex items-center gap-3">
          <Clock className="h-6 w-6 text-amber-600" />
          <div>
            <h3 className="text-amber-800 font-medium">Document Conversion Coming Soon</h3>
            <p className="text-amber-700 text-sm">We're working on implementing document conversion functionality. Please check back later!</p>
          </div>
        </div>

        <Dropzone
          onFileSelect={handleFileSelect}
          accept={{
            'document/*': fileTypes.document.formats.map(format => `.${format}`)
          }}
        />

        {files.length > 0 && (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-3">
              <p className="text-sm font-medium text-amber-800 w-full mb-1">Convert to:</p>
              {getAvailableFormats().map((format) => (
                <Button
                  key={format}
                  size="sm"
                  variant={outputFormat === format ? 'primary' : 'secondary'}
                  onClick={() => setOutputFormat(format)}
                  className="capitalize"
                >
                  {format}
                </Button>
              ))}
            </div>

            <Button
              onClick={handleConvert}
              disabled={true}
              className="w-full"
              title="Document conversion coming soon"
            >
              <Zap className="mr-2 h-4 w-4" />
              Convert
            </Button>

            {error && (
              <div className="p-3 bg-red-50 text-red-700 rounded-md flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                <p className="text-sm">{error}</p>
              </div>
            )}

            {conversionJobs.length > 0 && (
              <div className="space-y-3">
                <p className="text-sm font-medium text-amber-800">Converted files:</p>
                <div className="grid grid-cols-1 gap-3">
                  {conversionJobs.map((job, index) => {
                    const originalExtension = getFileExtension(job.originalName);

                    return (
                      <div key={index} className="relative group bg-white/30 rounded-lg p-4 shadow-[4px_4px_8px_rgba(0,0,0,0.05),-4px_-4px_8px_rgba(255,255,255,0.9)]">
                        <div className="flex items-center">
                          <div className="mr-4">
                            {getDocumentIcon(originalExtension)}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-amber-800 truncate">
                              {job.originalName}
                            </p>
                            <div className="flex items-center mt-1">
                              <span className="text-xs text-amber-600 bg-amber-100/50 px-2 py-0.5 rounded-full shadow-[inset_1px_1px_2px_rgba(0,0,0,0.05)]">
                                {originalExtension} → {job.targetFormat}
                              </span>
                              <span className="ml-2 text-xs">
                                {job.status === 'pending' && 'Waiting...'}
                                {job.status === 'processing' && 'Converting...'}
                                {job.status === 'error' && 'Failed'}
                                {job.status === 'complete' && 'Complete'}
                              </span>
                            </div>
                          </div>
                          {job.status === 'complete' && job.downloadUrl && (
                            <a
                              href={job.downloadUrl}
                              className="p-2 rounded-full bg-amber-100 shadow-[inset_2px_2px_4px_rgba(0,0,0,0.05),inset_-2px_-2px_4px_rgba(255,255,255,0.9)] hover:bg-amber-200 transition-colors"
                            >
                              <Download className="h-4 w-4 text-amber-800" />
                            </a>
                          )}
                          {job.status === 'processing' && (
                            <div className="p-2 rounded-full">
                              <RefreshCw className="h-4 w-4 text-amber-600 animate-spin" />
                            </div>
                          )}
                          {job.status === 'error' && (
                            <div className="p-2 rounded-full">
                              <AlertCircle className="h-4 w-4 text-red-600" />
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
} 