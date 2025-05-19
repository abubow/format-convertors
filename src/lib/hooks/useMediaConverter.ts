import { useState, useEffect } from 'react';

export interface ServerFormats {
  video: string[];
  audio: string[];
}

export interface ConversionResult {
  url: string;
  filename: string;
  size?: number;
  duration?: number;
}

interface UseMediaConverterOptions {
  mediaType: 'video' | 'audio';
  getAvailableFormats: (formats: ServerFormats | null, inputFormat: string) => string[];
}

export function useMediaConverter({ mediaType, getAvailableFormats }: UseMediaConverterOptions) {
  const [files, setFiles] = useState<File[]>([]);
  const [outputFormat, setOutputFormat] = useState<string>('');
  const [converting, setConverting] = useState<boolean>(false);
  const [jobId, setJobId] = useState<string | null>(null);
  const [convertedUrls, setConvertedUrls] = useState<ConversionResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [serverFormats, setServerFormats] = useState<ServerFormats | null>(null);
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    fetch('/api/convert/formats')
      .then(response => response.json())
      .then(data => {
        setServerFormats(data);
      })
      .catch(err => {
        console.error('Error fetching formats:', err);
      });
  }, []);

  useEffect(() => {
    if (jobId && converting) {
      const interval = setInterval(checkStatus, 2000);
      setPollingInterval(interval);
      return () => clearInterval(interval);
    }
    
    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [jobId, converting]);

  const checkStatus = async () => {
    if (!jobId) return;
    
    try {
      const response = await fetch(`/api/convert/status?jobId=${jobId}&type=${mediaType}`);
      const data = await response.json();
      
      if (data.error) {
        setError(data.error);
        setConverting(false);
        clearPollingInterval();
        return;
      }
      
      if (data.status === 'completed' && data.result) {
        setConvertedUrls([{
          url: data.result.url,
          filename: data.result.filename,
          size: data.result.size,
          duration: data.result.duration
        }]);
        setConverting(false);
        clearPollingInterval();
      } else if (data.status === 'failed') {
        setError(data.error || 'Conversion failed');
        setConverting(false);
        clearPollingInterval();
      }
    } catch (err) {
      console.error('Error checking status:', err);
    }
  };

  const clearPollingInterval = () => {
    if (pollingInterval) {
      clearInterval(pollingInterval);
      setPollingInterval(null);
    }
  };

  const handleFileSelect = (selectedFiles: File[]) => {
    setFiles(selectedFiles);
    setConvertedUrls([]);
    setOutputFormat('');
    setError(null);
    setJobId(null);
  };

  const getFileExtension = (filename: string): string => {
    return filename.slice(((filename.lastIndexOf('.') - 1) >>> 0) + 2).toLowerCase();
  };
  
  const getFilenameWithoutExtension = (filename: string): string => {
    const lastDotIndex = filename.lastIndexOf('.');
    return lastDotIndex !== -1 ? filename.slice(0, lastDotIndex) : filename;
  };

  const formatFileSize = (bytes?: number): string => {
    if (bytes === undefined) return 'Unknown size';
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };
  
  const formatDuration = (seconds?: number): string => {
    if (seconds === undefined) return '';
    
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    let result = '';
    if (hrs > 0) {
      result += `${hrs}:${mins < 10 ? '0' : ''}`;
    }
    
    result += `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    return result;
  };

  const handleConvert = async () => {
    if (files.length === 0 || !outputFormat) return;
    
    setConverting(true);
    setError(null);
    
    try {
      const formData = new FormData();
      formData.append('file', files[0]);
      formData.append('outputFormat', outputFormat);
      
      const response = await fetch('/api/convert/video', {
        method: 'POST',
        body: formData,
      });
      
      const result = await response.json();
      
      if (result.error) {
        setError(result.error);
        setConverting(false);
      } else if (result.jobId) {
        setJobId(result.jobId);
        await checkStatus();
      }
    } catch (err) {
      setError('Error starting conversion process');
      setConverting(false);
      console.error(err);
    }
  };

  const availableFormats = files.length > 0 
    ? getAvailableFormats(
        serverFormats, 
        getFileExtension(files[0].name)
      ) 
    : [];

  return {
    files,
    outputFormat,
    converting,
    convertedUrls,
    error,
    serverFormats,
    availableFormats,
    handleFileSelect,
    setOutputFormat,
    handleConvert,
    resetConverter: () => setFiles([]),
    formatFileSize,
    formatDuration,
    getFilenameWithoutExtension,
    setError,
  };
} 