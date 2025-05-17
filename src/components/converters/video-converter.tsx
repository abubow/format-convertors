"use client"
import React from 'react';
import { Button } from '@/components/ui/button';
import { Dropzone } from '@/components/ui/dropzone';
import { fileTypes } from '@/lib/utils';
import { Download, RefreshCw, Zap, Film, Check, Clock, AlertCircle } from 'lucide-react';
import { useMediaConverter, ServerFormats } from '@/lib/hooks/useMediaConverter';

export function VideoConverter() {
  const getVideoAvailableFormats = (formats: ServerFormats | null, inputFormat: string): string[] => {
    // Check if all files have the same format
    if (!inputFormat) return [];
    
    // If we have server formats, use them directly
    if (formats) {
      // For video-to-audio conversions, also show audio formats
      return [...formats.video, ...formats.audio];
    }
    
    // Fallback to client-side formats
    return (fileTypes.video.conversions as Record<string, string[]>)[inputFormat] || [];
  };

  const {
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
    resetConverter,
    formatFileSize,
    formatDuration,
  } = useMediaConverter({
    mediaType: 'video',
    getAvailableFormats: getVideoAvailableFormats
  });
  
  return (
    <div className="space-y-6">
      {files.length === 0 ? (
        <Dropzone
          onFileSelect={handleFileSelect}
          accept={{
            'video/*': fileTypes.video.formats.map(format => `.${format}`)
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
                    <Film className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="font-medium">Select output format</h3>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={resetConverter}
                >
                  Start over
                </Button>
              </div>
              
              <div className="bento-card p-4">
                <p className="text-sm text-foreground/70 mb-2">
                  Input file: <span className="font-medium">{files[0].name}</span> ({formatFileSize(files[0].size)})
                </p>
                <p className="text-sm text-foreground/70 mb-3">Convert to:</p>
                <div className="flex flex-wrap gap-2">
                  {availableFormats.map((format) => (
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
                
                {serverFormats && serverFormats.audio.includes(outputFormat) && (
                  <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded-md text-xs text-yellow-700">
                    Note: Converting to {outputFormat} will create an audio-only file.
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
                  onClick={resetConverter}
                >
                  Convert another
                </Button>
              </div>
              
              <div className="max-h-[320px] overflow-y-auto pr-1">
                <div className="space-y-3">
                  {convertedUrls.map((item, index) => (
                    <div key={index} className="bento-card p-3">
                      <div className="flex items-center">
                        <div className="neomorphic-icon mr-3">
                          <Film className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">
                            {item.filename}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-foreground/70">
                            <span>{outputFormat.toUpperCase()}</span>
                            {item.size && <span>• {formatFileSize(item.size)}</span>}
                            {item.duration && (
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {formatDuration(item.duration)}
                              </span>
                            )}
                          </div>
                        </div>
                        <a
                          href={item.url}
                          download={item.filename}
                          className="ml-2"
                        >
                          <Button size="sm" variant="secondary">
                            <Download className="h-4 w-4" />
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