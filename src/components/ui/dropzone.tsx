import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { cn } from '@/lib/utils';
import { Upload, FileIcon } from 'lucide-react';

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
        'flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-xl transition-all',
        isDragActive
          ? 'bg-amber-50 border-amber-400 shadow-[inset_4px_4px_8px_rgba(0,0,0,0.05),inset_-4px_-4px_8px_rgba(255,255,255,0.9)]'
          : 'bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200 shadow-[4px_4px_8px_rgba(0,0,0,0.05),-4px_-4px_8px_rgba(255,255,255,0.9)]',
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
      {...props}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center justify-center space-y-4 text-center p-6">
        <div className="p-4 rounded-full bg-amber-100 shadow-[inset_2px_2px_4px_rgba(0,0,0,0.05),inset_-2px_-2px_4px_rgba(255,255,255,0.9)]">
          <Upload className="h-8 w-8 text-amber-600" />
        </div>
        <div className="space-y-1">
          <p className="text-lg font-medium text-amber-900">
            {isDragActive ? 'Drop files here' : 'Drag & drop files here'}
          </p>
          <p className="text-sm text-amber-600">or click to browse</p>
        </div>
        {acceptedFiles.length > 0 && (
          <div className="w-full max-w-xs mt-4">
            <p className="text-sm font-medium text-amber-800 mb-2">{acceptedFiles.length} file(s) selected</p>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {acceptedFiles.map((file: File, index: number) => (
                <div
                  key={index}
                  className="flex items-center bg-white/50 p-2 rounded-lg text-xs text-amber-800 shadow-[2px_2px_4px_rgba(0,0,0,0.05),-2px_-2px_4px_rgba(255,255,255,0.9)]"
                >
                  <FileIcon className="h-4 w-4 mr-2 text-amber-600" />
                  <span className="truncate">{file.name}</span>
                  <span className="ml-auto text-amber-500">{(file.size / 1024).toFixed(0)}KB</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 