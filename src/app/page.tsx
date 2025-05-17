"use client";
import { ImageConverter } from '@/components/converters/image-converter';
import { VideoConverter } from '@/components/converters/video-converter';
import { AudioConverter } from '@/components/converters/audio-converter';
import { DocumentConverter } from '@/components/converters/document-converter';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { FileImage, FileVideo, FileAudio, FileText, Zap, Sparkles, Settings, ChevronRight, ArrowRight, Workflow } from 'lucide-react';
import { useState } from 'react';

// Base component for all bento cards
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
  // Active converter state
  const [activeConverter, setActiveConverter] = useState<string>('image');
  
  // Function to show appropriate converter based on active state
  const renderConverter = () => {
    switch (activeConverter) {
      case 'image':
        return <ImageConverter />;
      case 'video':
        return <VideoConverter />;
      case 'audio':
        return <AudioConverter />;
      case 'document':
        return <DocumentConverter />;
      default:
        return <ImageConverter />;
    }
  };

  // Function for converter type selection
  const ConverterTypeButton = ({ 
    type, 
    icon: Icon, 
    label 
  }: { 
    type: string; 
    icon: React.ElementType; 
    label: string 
  }) => (
    <button
      onClick={() => setActiveConverter(type)}
      className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
        activeConverter === type
          ? 'bg-primary/10 text-primary'
          : 'hover:bg-card/80 text-foreground/70'
      }`}
    >
      <div className={`neomorphic-${activeConverter === type ? 'icon' : 'inset'}`}>
        <Icon className="h-5 w-5" />
      </div>
      <span className="font-medium">{label}</span>
      {activeConverter === type && (
        <ChevronRight className="h-4 w-4 ml-auto text-primary" />
      )}
    </button>
  );

  return (
    <div className="bento-grid w-full">
      {/* Logo & App Title */}
      <BentoCard colSpan={3} rowSpan={1} className="flex items-center gap-4">
        <div className="neomorphic-icon bg-gradient-to-br from-primary/30 to-primary">
          <Zap className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">ConvertMaster</h1>
          <p className="text-foreground/70 text-sm">Ultra-modern file conversion</p>
        </div>
      </BentoCard>

      {/* Features Highlight */}
      <BentoCard colSpan={9} rowSpan={1} className="flex gap-6 items-center justify-between overflow-hidden group">
        <div className="flex items-center gap-6">
          <div className="neomorphic-icon">
            <Sparkles className="h-5 w-5 text-primary" />
          </div>
          <h2 className="text-lg font-medium">Modern, beautiful file conversion with a single-viewport experience</h2>
        </div>
        <div className="flex -space-x-2">
          <div className="h-12 w-12 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 border-2 border-white"></div>
          <div className="h-12 w-12 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 border-2 border-white"></div>
          <div className="h-12 w-12 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 border-2 border-white"></div>
          <div className="h-12 w-12 rounded-full flex items-center justify-center bg-primary border-2 border-white text-white text-xs font-bold">+5</div>
        </div>
      </BentoCard>

      {/* Converter Selection Sidebar */}
      <BentoCard colSpan={3} rowSpan={4} className="flex flex-col">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <Settings className="h-4 w-4" />
          Choose Converter
        </h3>
        
        <div className="space-y-2">
          <ConverterTypeButton 
            type="image" 
            icon={FileImage} 
            label="Image Converter" 
          />
          <ConverterTypeButton 
            type="video" 
            icon={FileVideo} 
            label="Video Converter" 
          />
          <ConverterTypeButton 
            type="audio" 
            icon={FileAudio} 
            label="Audio Converter" 
          />
          <ConverterTypeButton 
            type="document" 
            icon={FileText} 
            label="Document Converter" 
          />
        </div>
        
        <div className="mt-auto pt-6 relative">
          <div className="absolute inset-0 bg-gradient-to-t from-[hsl(var(--card))] via-transparent to-transparent" />
          <div className="relative">
            <div className="p-4 rounded-xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/10">
              <div className="neomorphic-icon bg-primary/10 mb-3">
                <Workflow className="h-5 w-5 text-primary" />
              </div>
              <h4 className="font-medium mb-1">Batch Processing</h4>
              <p className="text-sm text-foreground/70 mb-3">Convert multiple files at once with our premium plan</p>
              <button className="text-sm font-medium text-primary flex items-center gap-1 group">
                Learn more
                <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </BentoCard>

      {/* Main Converter Area */}
      <BentoCard colSpan={9} rowSpan={4} className="overflow-hidden p-0 flex flex-col">
        <div className="p-6 pb-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl font-bold">
              {activeConverter.charAt(0).toUpperCase() + activeConverter.slice(1)} Converter
            </h2>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-primary animate-pulse"></div>
              <span className="text-sm text-foreground/70">Ready to convert</span>
            </div>
          </div>
          <p className="text-foreground/70">
            Drop your files or select input and output formats to begin
          </p>
        </div>
        
        <div className="flex-1 bg-card/30 p-6 rounded-b-[var(--radius)]">
          {renderConverter()}
        </div>
      </BentoCard>
    </div>
  );
}
