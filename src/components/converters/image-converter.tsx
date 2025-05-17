"use client"
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dropzone } from '@/components/ui/dropzone';
import { fileTypes } from '@/lib/utils';
import { Download, RefreshCw, Zap } from 'lucide-react';

export function ImageConverter() {
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
    
    return (fileTypes.image.conversions as Record<string, string[]>)[inputFormat] || [];
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
  
  return (
    <Card className="w-full">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-amber-900 mb-1">Image Converter</h2>
          <p className="text-amber-700">Convert your images to different formats with ease</p>
        </div>
        
        <Dropzone
          onFileSelect={handleFileSelect}
          accept={{
            'image/*': fileTypes.image.formats.map(format => `.${format}`)
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
                <div className="grid grid-cols-2 gap-3">
                  {convertedUrls.map((url, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={url}
                        alt={`Converted image ${index + 1}`}
                        className="rounded-lg w-full h-24 object-cover shadow-[4px_4px_8px_rgba(0,0,0,0.05),-4px_-4px_8px_rgba(255,255,255,0.9)]"
                      />
                      <a
                        href={url}
                        download={`converted-${index + 1}.${outputFormat}`}
                        className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg"
                      >
                        <Download className="h-6 w-6 text-white" />
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
} 