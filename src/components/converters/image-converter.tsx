"use client"
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dropzone } from '@/components/ui/dropzone';
import { fileTypes } from '@/lib/utils';
import { Download, RefreshCw, Zap, Image, Check } from 'lucide-react';

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
                >
                  Start over
                </Button>
              </div>
              
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
              
              <div className="grid grid-cols-2 gap-4">
                {convertedUrls.map((url, index) => (
                  <div key={index} className="group relative bento-card p-4 overflow-hidden aspect-square">
                    <img
                      src={url}
                      alt={`Converted image ${index + 1}`}
                      className="object-cover absolute inset-0 w-full h-full p-2"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-end p-4">
                      <a
                        href={url}
                        download={`converted-${index + 1}.${outputFormat}`}
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
          )}
        </div>
      )}
    </div>
  );
} 