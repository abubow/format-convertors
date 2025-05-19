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
    <Card className="w-full h-[35vh] flex items-center justify-center">
      <div className="p-6">
        {/* Coming Soon Banner */}
        <div className="bg-amber-100 border border-amber-300 rounded-md p-4 flex items-center gap-3">
          <Clock className="h-6 w-6 flex-shrink-0 text-amber-600" />
          <div>
            <h3 className="text-amber-800 font-medium">Document Conversion Coming Soon</h3>
            <p className="text-amber-700 text-sm">We're working on implementing document conversion functionality. Please check back later!</p>
          </div>
        </div>
      </div>
    </Card>
  );
} 