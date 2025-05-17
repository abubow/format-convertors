"use client"
import React from 'react';
import { Button } from '@/components/ui/button';
import { Dropzone } from '@/components/ui/dropzone';
import { fileTypes } from '@/lib/utils';
import { Download, RefreshCw, Zap, Music, Check, Clock, AlertCircle } from 'lucide-react';
import { useMediaConverter, ServerFormats } from '@/lib/hooks/useMediaConverter';

export function AudioConverter() {
  const getAudioAvailableFormats = (formats: ServerFormats | null, inputFormat: string): string[] => {
    if (!inputFormat) return [];
    
    if (formats) {
      return formats.audio;
    }
    
    return (fileTypes.audio.conversions as Record<string, string[]>)[inputFormat] || [];
  };

  const {
    files,
    outputFormat,
    converting,
    convertedUrls,
    error,
    availableFormats,
    handleFileSelect,
    setOutputFormat,
    handleConvert,
    resetConverter,
    formatFileSize,
    formatDuration,
  } = useMediaConverter({
    mediaType: 'audio',
    getAvailableFormats: getAudioAvailableFormats
  });
  
  return (
    <div className="space-y-6">
      {files.length === 0 ? (
        <Dropzone
          onFileSelect={handleFileSelect}
          accept={{
            'audio/*': fileTypes.audio.formats.map(format => `.${format}`)
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
                    <Music className="h-5 w-5 text-primary" />
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
                          <Music className="h-5 w-5 text-primary" />
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