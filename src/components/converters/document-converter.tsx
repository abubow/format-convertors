"use client"
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dropzone } from '@/components/ui/dropzone';
import { fileTypes } from '@/lib/utils';
import { Download, RefreshCw, Zap, FileText } from 'lucide-react';

export function DocumentConverter() {
  const [files, setFiles] = useState<File[]>([]);
  const [outputFormat, setOutputFormat] = useState<string>('');
  const [converting, setConverting] = useState<boolean>(false);
  const [convertedUrls, setConvertedUrls] = useState<string[]>([]);

  const handleFileSelect = (selectedFiles: File[]) => {
    setFiles(selectedFiles);
    setConvertedUrls([]);
    setOutputFormat('');
  };

  const getFileExtension = (filename: string): string => {
    return filename.slice(((filename.lastIndexOf('.') - 1) >>> 0) + 2).toLowerCase();
  };

  const getAvailableFormats = (): string[] => {
    if (files.length === 0) return [];
    
    const inputFormat = getFileExtension(files[0].name);
    
    // Check if all files have the same format
    const allSameFormat = files.every(file => getFileExtension(file.name) === inputFormat);
    
    if (!allSameFormat) return [];
    
    return (fileTypes.document.conversions as Record<string, string[]>)[inputFormat] || [];
  };

  const handleConvert = async () => {
    if (files.length === 0 || !outputFormat) return;
    
    setConverting(true);
    
    // In a real application, you would send the files to a server for conversion
    // For demo purposes, let's simulate conversion with a delay
    setTimeout(() => {
      // Create fake object URLs for demo
      const fakeUrls = files.map(file => URL.createObjectURL(file));
      setConvertedUrls(fakeUrls);
      setConverting(false);
    }, 2000);
  };

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
        <div>
          <h2 className="text-2xl font-bold text-amber-900 mb-1">Document Converter</h2>
          <p className="text-amber-700">Convert your documents to different formats with ease</p>
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
              disabled={!outputFormat || converting}
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
                  Convert
                </>
              )}
            </Button>
            
            {convertedUrls.length > 0 && (
              <div className="space-y-3">
                <p className="text-sm font-medium text-amber-800">Converted files:</p>
                <div className="grid grid-cols-1 gap-3">
                  {convertedUrls.map((url, index) => {
                    const originalExtension = getFileExtension(files[index]?.name || '');
                    
                    return (
                      <div key={index} className="relative group bg-white/30 rounded-lg p-4 shadow-[4px_4px_8px_rgba(0,0,0,0.05),-4px_-4px_8px_rgba(255,255,255,0.9)]">
                        <div className="flex items-center">
                          <div className="mr-4">
                            {getDocumentIcon(originalExtension)}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-amber-800 truncate">
                              {files[index]?.name || `Document ${index + 1}`}
                            </p>
                            <div className="flex items-center mt-1">
                              <span className="text-xs text-amber-600 bg-amber-100/50 px-2 py-0.5 rounded-full shadow-[inset_1px_1px_2px_rgba(0,0,0,0.05)]">
                                {originalExtension} → {outputFormat}
                              </span>
                            </div>
                          </div>
                          <a
                            href={url}
                            download={`converted-${index + 1}.${outputFormat}`}
                            className="p-2 rounded-full bg-amber-100 shadow-[inset_2px_2px_4px_rgba(0,0,0,0.05),inset_-2px_-2px_4px_rgba(255,255,255,0.9)] hover:bg-amber-200 transition-colors"
                          >
                            <Download className="h-4 w-4 text-amber-800" />
                          </a>
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