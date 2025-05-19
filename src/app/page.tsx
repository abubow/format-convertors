"use client";

import { ImageConverter } from '@/components/converters/image-converter';
import { VideoConverter } from '@/components/converters/video-converter';
import { AudioConverter } from '@/components/converters/audio-converter';
import { DocumentConverter } from '@/components/converters/document-converter';
import { FileImage, FileVideo, FileAudio, FileText, Zap, Sparkles, LayoutGrid, ArrowRight, Workflow, ChevronRight, Settings } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

function BentoCard({ 
  className, 
  children, 
  colSpan = 3, 
  rowSpan = 1,
  hoverEffect = true
}: { 
  className?: string; 
  children: React.ReactNode; 
  colSpan?: number; 
  rowSpan?: number;
  hoverEffect?: boolean;
}) {
  return (
    <div 
      className={`
        bento-card 
        ${hoverEffect ? 'hover:translate-y-[-3px] hover:shadow-xl' : ''}
        col-span-${colSpan} 
        row-span-${rowSpan}
        ${className || ''}
      `}
    >
      {children}
    </div>
  );
}

export default function Home() {
  const [activeConverter, setActiveConverter] = useState<string>('image');
  
  const renderConverter = () => {
    switch (activeConverter) {
      case 'image': return <ImageConverter />;
      case 'video': return <VideoConverter />;
      case 'audio': return <AudioConverter />;
      case 'document': return <DocumentConverter />;
      default: return <ImageConverter />;
    }
  };

  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="grid grid-cols-4 grid-rows-[auto_1fr_1fr_1fr_1fr_auto] gap-6 w-full max-w-[1100px] mx-auto p-6 max-h-[99vh]">
        {/* Logo - spans 1 column */}
        <div className="bento-card flex items-center gap-3 col-span-1 row-span-1 h-full" style={{ gridColumn: "1", gridRow: "1" }}>
          <div className="neomorphic-icon bg-gradient-to-br from-primary/40 to-primary shadow-[0_0_15px_rgba(var(--primary-rgb),0.7)] ring-1 ring-primary/40">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="text-white filter drop-shadow-[0_0_5px_rgba(255,255,255,0.9)] drop-shadow-[0_0_3px_rgba(var(--primary-rgb),1)] animate-pulse-subtle"
              viewBox="0 0 24 24"
            >
              <path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z" className='shadow-xl'></path>
            </svg>
          </div>
          <h1 className="text-lg font-bold">ConvertMaster</h1>
        </div>
        
        {/* Tag line - spans 2 columns */}
        <div className="bento-card col-span-2 row-span-1 flex items-center h-full" style={{ gridColumn: "2 / span 2", gridRow: "1" }}>
          <p className="text-foreground/70">Transform your files with our modern, intuitive UI</p>
        </div>
        
        {/* Empty space for asymmetry */}

        {/* Floating converter type buttons - spans 1 column, 4 rows */}
        <div className="bento-card col-span-1 row-span-4 flex flex-col gap-3 h-full" style={{ gridColumn: "1", gridRow: "2 / span 4" }}>
          <div className="flex items-center gap-2 mb-2">
            <div className="neomorphic-inset bg-primary/10">
              <Settings className="h-4 w-4 text-primary" />
            </div>
            <h3 className="text-sm font-medium">File Type</h3>
          </div>
          
          <Button 
            variant="secondary" 
            isActive={activeConverter === 'image'}
            onClick={() => setActiveConverter('image')}
            className="justify-start h-auto py-2"
          >
            <FileImage className="h-4 w-4 mr-2" />
            <span>Images</span>
          </Button>
          
          <Button 
            variant="secondary" 
            isActive={activeConverter === 'video'}
            onClick={() => setActiveConverter('video')}
            className="justify-start h-auto py-2"
          >
            <FileVideo className="h-4 w-4 mr-2" />
            <span>Videos</span>
          </Button>
          
          <Button 
            variant="secondary" 
            isActive={activeConverter === 'audio'}
            onClick={() => setActiveConverter('audio')}
            className="justify-start h-auto py-2"
          >
            <FileAudio className="h-4 w-4 mr-2" />
            <span>Audio</span>
          </Button>
          
          <Button 
            variant="secondary" 
            isActive={activeConverter === 'document'}
            onClick={() => setActiveConverter('document')}
            className="justify-start h-auto py-2"
          >
            <FileText className="h-4 w-4 mr-2" />
            <span>Documents</span>
          </Button>
        </div>
        
        {/* Main converter area - spans 3 columns, 4 rows */}
        <div className="bento-card col-span-3 row-span-4 flex flex-col h-full" style={{ gridColumn: "2 / span 3", gridRow: "2 / span 4" }}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="neomorphic-icon">
                {activeConverter === 'image' && <FileImage className="h-5 w-5 text-primary" />}
                {activeConverter === 'video' && <FileVideo className="h-5 w-5 text-primary" />}
                {activeConverter === 'audio' && <FileAudio className="h-5 w-5 text-primary" />}
                {activeConverter === 'document' && <FileText className="h-5 w-5 text-primary" />}
              </div>
              <h2 className="text-xl font-bold">{activeConverter.charAt(0).toUpperCase() + activeConverter.slice(1)} Converter</h2>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-primary animate-pulse"></div>
              <span className="text-sm text-foreground/70">Ready</span>
        </div>
      </div>
      
          <div className="flex-1">
            {renderConverter()}
          </div>
        </div>
        
        {/* Feature highlight - spans 1 column, 1 row, now in last row */}
        <div className="bento-card col-span-1 row-span-1 flex flex-col h-full" style={{ gridColumn: "1", gridRow: "6" }}>
          <div className="neomorphic-icon mb-3 bg-primary/10">
            <Sparkles className="h-5 w-5 text-primary" />
          </div>
          <h3 className="text-sm font-medium mb-2">High Quality</h3>
          <p className="text-xs text-foreground/70">Preserve the quality of your files during conversion</p>
        </div>
      
        {/* Info card - spans 2 columns, 1 row */}
        <div className="bento-card col-span-2 row-span-1 flex items-center justify-between h-full" style={{ gridColumn: "3 / span 2", gridRow: "6" }}>
          <div className="flex items-center gap-3">
            <div className="neomorphic-icon">
              <LayoutGrid className="h-4 w-4 text-primary" />
            </div>
            <span className="text-sm">Made with ❤️ by <Link href="https://hestiabyte.com" target="_blank" className="text-primary hover:underline">HestiaByte</Link></span>
          </div>
          <Button variant="ghost" size="sm" className="text-xs" onClick={() => window.open('https://hestiabyte.com', '_blank')}>
            Learn more
            <ArrowRight className="ml-1 h-3 w-3" />
          </Button>
        </div>
        
        {/* Batch conversion promo - spans 1 column */}
        <div className="bento-card col-span-1 flex flex-col h-full bg-gradient-to-br from-primary/10 via-primary/5 to-transparent" style={{ gridColumn: "2", gridRow: "6" }}>
          <div className="flex items-center gap-2 mb-2">
            <div className="neomorphic-icon bg-primary/10">
              <Workflow className="h-4 w-4 text-primary" />
            </div>
            <h3 className="text-sm font-medium">Batch Processing</h3>
          </div>
          <p className="text-xs text-foreground/70 mb-2">Convert multiple files at once with our premium plan</p>
          <Button variant="ghost" size="sm" className="text-xs p-0 h-auto">
            Upgrade
            <ChevronRight className="ml-1 h-3 w-3" />
          </Button>
        </div>
      </div>
    </div>
  );
}
