import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { cn } from '@/lib/utils';
import { Upload, FileIcon, X } from 'lucide-react';

interface DropzoneProps extends React.HTMLAttributes<HTMLDivElement> {
  onFileSelect: (files: File[]) => void;
  accept?: Record<string, string[]>;
  maxFiles?: number;
  maxSize?: number;
  disabled?: boolean;
}

export function Dropzone({
  onFileSelect,
  accept,
  maxFiles = 10,
  maxSize = 20971520, // 20MB
  disabled = false,
  className,
  ...props
}: DropzoneProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      onFileSelect(acceptedFiles);
    },
    [onFileSelect]
  );

  const removeFile = (file: File, event: React.MouseEvent) => {
    event.stopPropagation();
    const newFiles = acceptedFiles.filter(f => f !== file);
    onFileSelect(newFiles);
  };

  const { getRootProps, getInputProps, isDragActive, acceptedFiles } = useDropzone({
    onDrop,
    accept,
    maxFiles,
    maxSize,
    disabled,
  });

  return (
    <div
      {...getRootProps()}
      className={cn(
        'relative rounded-[var(--radius)] backdrop-blur-sm transition-all duration-300',
        isDragActive
          ? 'bg-primary/5 ring-2 ring-primary/50'
          : 'bento-card',
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
      {...props}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center justify-center p-8 h-full">
        {acceptedFiles.length === 0 ? (
          <div className="flex flex-col items-center justify-center space-y-4 text-center py-10">
            <div className="neomorphic-icon">
              <Upload className="h-6 w-6 text-primary" />
            </div>
            <div className="space-y-1">
              <p className="text-lg font-medium">
                {isDragActive ? 'Drop files here' : 'Drag & drop files here'}
              </p>
              <p className="text-sm text-foreground/60">or click to browse</p>
            </div>
          </div>
        ) : (
          <div className="w-full">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-primary"></div>
                <p className="font-medium">{acceptedFiles.length} file{acceptedFiles.length !== 1 ? 's' : ''} selected</p>
              </div>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  onFileSelect([]);
                }}
                className="text-xs text-foreground/60 hover:text-foreground"
              >
                Clear all
              </button>
            </div>
            <div className="space-y-2 max-h-[240px] overflow-y-auto pr-2">
              {acceptedFiles.map((file: File, index: number) => (
                <div
                  key={index}
                  className="flex items-center bg-card/80 p-3 rounded-xl text-sm"
                >
                  <FileIcon className="h-4 w-4 mr-3 text-primary/80" />
                  <span className="truncate flex-1">{file.name}</span>
                  <span className="mx-3 text-foreground/50 text-xs">{(file.size / 1024).toFixed(0)}KB</span>
                  <button
                    onClick={(e) => removeFile(file, e)}
                    className="neomorphic-inset p-1.5 hover:bg-red-100 hover:text-red-500 transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 