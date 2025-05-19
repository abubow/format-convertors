"use client"
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dropzone } from '@/components/ui/dropzone';
import { fileTypes } from '@/lib/utils';
import { Download, RefreshCw, Zap, FileText, AlertCircle, Check, Info } from 'lucide-react';

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

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
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
          throw new Error(errorData.details || errorData.error || 'Conversion failed');
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
        setError('One or more conversions failed. Please check the errors below.');
      }
    }

    setConverting(false);
  };

  const resetConverter = () => {
    setFiles([]);
    setConversionJobs([]);
    setOutputFormat('');
    setError(null);
  };

  const getDocumentIcon = (extension: string) => {
    switch (extension) {
      case 'pdf':
        return <FileText className="h-5 w-5 text-red-600" />;
      case 'doc':
      case 'docx':
        return <FileText className="h-5 w-5 text-blue-600" />;
      case 'txt':
        return <FileText className="h-5 w-5 text-gray-600" />;
      case 'html':
        return <FileText className="h-5 w-5 text-orange-600" />;
      case 'md':
        return <FileText className="h-5 w-5 text-purple-600" />;
      default:
        return <FileText className="h-5 w-5 text-primary" />;
    }
  };

  const availableFormats = getAvailableFormats();

  return (
    <div className="space-y-6">
      {files.length === 0 ? (
        <Dropzone 
          onFileSelect={handleFileSelect} 
          accept={{
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
            'text/html': ['.html'],
            'text/plain': ['.txt'],
            'text/markdown': ['.md']
          }}
          className="h-[35vh]"
        />
      ) : (
        <div className="space-y-6">
          {conversionJobs.length === 0 ? (
            <>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="neomorphic-icon">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="font-medium">Select output format</h3>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={resetConverter}
                  disabled={converting}
                >
                  Start over
                </Button>
              </div>
              
              <div className="bento-card p-4">
                <p className="text-sm text-foreground/70 mb-2">
                  Input file: <span className="font-medium">{files[0]?.name}</span> ({formatFileSize(files[0]?.size || 0)})
                </p>
                
                <div className="bg-blue-50 border border-blue-200 rounded-md p-3 flex items-start gap-2 mb-3">
                  <Info className="h-4 w-4 flex-shrink-0 text-blue-500 mt-0.5" />
                  <p className="text-xs text-blue-800">
                    Our document conversion now uses pure Node.js packages instead of system dependencies,
                    enabling deployments to environments like Vercel.
                  </p>
                </div>
                
                <p className="text-sm text-foreground/70 mb-3">Convert to:</p>
                
                {availableFormats.length === 0 ? (
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-yellow-500" />
                    <p className="text-sm text-yellow-800">
                      {files.length > 1 && !files.every(f => getFileExtension(f.name) === getFileExtension(files[0].name))
                        ? "All files must be of the same format to convert"
                        : `The format '${getFileExtension(files[0].name)}' isn't supported for conversion`}
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {availableFormats.map(format => (
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
                )}
              </div>
              
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md flex items-center gap-2 text-red-700">
                  <AlertCircle className="h-4 w-4" />
                  <p className="text-sm">{error}</p>
                </div>
              )}
              
              <Button
                onClick={handleConvert}
                disabled={!outputFormat || converting || availableFormats.length === 0}
                className="w-full"
              >
                {converting ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Converting...
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
                  <h3 className="font-medium text-green-600">Conversion results</h3>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={resetConverter}
                >
                  Convert another
                </Button>
              </div>
              
              <div className="max-h-[30vh] overflow-y-auto pr-1 space-y-2">
                {conversionJobs.map((job, index) => (
                  <div 
                    key={index} 
                    className={`bento-card p-4 ${
                      job.status === 'error' ? 'border-red-300 bg-red-50' : 
                      job.status === 'complete' ? 'border-green-300 bg-green-50' : 
                      ''
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 w-3/4">
                        {getDocumentIcon(job.status === 'complete' ? job.targetFormat : getFileExtension(job.originalName))}
                        <div className="overflow-hidden">
                          <p className="font-medium truncate">{job.originalName}</p>
                          <p className="text-xs text-gray-600">
                            {job.status === 'pending' && 'Waiting...'}
                            {job.status === 'processing' && 'Converting...'}
                            {job.status === 'complete' && `Converted to ${job.targetFormat.toUpperCase()}`}
                            {job.status === 'error' && job.error}
                          </p>
                        </div>
                      </div>
                      
                      {job.status === 'complete' && job.downloadUrl && (
                        <a 
                          href={job.downloadUrl} 
                          download
                          className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-8 px-3"
                        >
                          <Download className="h-4 w-4 mr-1" />
                          Download
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 