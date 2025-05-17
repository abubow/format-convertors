import { ImageConverter } from '@/components/converters/image-converter';
import { VideoConverter } from '@/components/converters/video-converter';
import { AudioConverter } from '@/components/converters/audio-converter';
import { DocumentConverter } from '@/components/converters/document-converter';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { FileImage, FileVideo, FileAudio, FileText, Bolt, Workflow, Sparkles } from 'lucide-react';

export default function Home() {
  return (
    <div className="space-y-12">
      <header className="text-center space-y-4">
        <div className="inline-block p-3 rounded-xl bg-amber-100 shadow-[4px_4px_8px_rgba(0,0,0,0.05),-4px_-4px_8px_rgba(255,255,255,0.9)]">
          <Bolt className="h-10 w-10 text-amber-600" />
        </div>
        <h1 className="text-5xl font-extrabold text-amber-900 tracking-tight">ConvertMaster</h1>
        <p className="text-xl text-amber-700 max-w-2xl mx-auto">
          The modern way to convert your files with a beautiful, intuitive interface.
        </p>
      </header>

      <div className="bento-grid space-y-0">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="p-6 flex flex-col items-center text-center hover:shadow-[8px_8px_16px_rgba(0,0,0,0.07),-8px_-8px_16px_rgba(255,255,255,0.8)] transition-all duration-300">
            <div className="p-4 rounded-full bg-amber-100 shadow-[inset_2px_2px_4px_rgba(0,0,0,0.05),inset_-2px_-2px_4px_rgba(255,255,255,0.9)] mb-4">
              <FileImage className="h-6 w-6 text-amber-600" />
            </div>
            <h3 className="text-lg font-bold text-amber-900">Image Conversion</h3>
            <p className="text-amber-700 text-sm mt-2">
              Convert between JPG, PNG, WebP, and more formats.
            </p>
          </Card>
          
          <Card className="p-6 flex flex-col items-center text-center hover:shadow-[8px_8px_16px_rgba(0,0,0,0.07),-8px_-8px_16px_rgba(255,255,255,0.8)] transition-all duration-300">
            <div className="p-4 rounded-full bg-amber-100 shadow-[inset_2px_2px_4px_rgba(0,0,0,0.05),inset_-2px_-2px_4px_rgba(255,255,255,0.9)] mb-4">
              <FileVideo className="h-6 w-6 text-amber-600" />
            </div>
            <h3 className="text-lg font-bold text-amber-900">Video Conversion</h3>
            <p className="text-amber-700 text-sm mt-2">
              Convert between MP4, WebM, AVI, and more formats.
            </p>
          </Card>
          
          <Card className="p-6 flex flex-col items-center text-center hover:shadow-[8px_8px_16px_rgba(0,0,0,0.07),-8px_-8px_16px_rgba(255,255,255,0.8)] transition-all duration-300">
            <div className="p-4 rounded-full bg-amber-100 shadow-[inset_2px_2px_4px_rgba(0,0,0,0.05),inset_-2px_-2px_4px_rgba(255,255,255,0.9)] mb-4">
              <FileAudio className="h-6 w-6 text-amber-600" />
            </div>
            <h3 className="text-lg font-bold text-amber-900">Audio Conversion</h3>
            <p className="text-amber-700 text-sm mt-2">
              Convert between MP3, WAV, FLAC, and more formats.
            </p>
          </Card>
          
          <Card className="p-6 flex flex-col items-center text-center hover:shadow-[8px_8px_16px_rgba(0,0,0,0.07),-8px_-8px_16px_rgba(255,255,255,0.8)] transition-all duration-300">
            <div className="p-4 rounded-full bg-amber-100 shadow-[inset_2px_2px_4px_rgba(0,0,0,0.05),inset_-2px_-2px_4px_rgba(255,255,255,0.9)] mb-4">
              <FileText className="h-6 w-6 text-amber-600" />
            </div>
            <h3 className="text-lg font-bold text-amber-900">Document Conversion</h3>
            <p className="text-amber-700 text-sm mt-2">
              Convert between PDF, DOCX, TXT, and more formats.
            </p>
          </Card>
        </div>
      </div>
      
      <div className="rounded-2xl bg-gradient-to-br from-amber-100/50 to-amber-50/50 p-6 shadow-[8px_8px_16px_rgba(0,0,0,0.05),-8px_-8px_16px_rgba(255,255,255,0.8)]">
        <div className="flex items-center gap-4 mb-6">
          <div className="p-3 rounded-full bg-amber-100 shadow-[inset_2px_2px_4px_rgba(0,0,0,0.05),inset_-2px_-2px_4px_rgba(255,255,255,0.9)]">
            <Workflow className="h-6 w-6 text-amber-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-amber-900">Start Converting</h2>
            <p className="text-amber-700">Choose a converter and transform your files instantly</p>
          </div>
        </div>
        
        <Tabs defaultValue="image">
          <TabsList className="w-full justify-start mb-6 overflow-x-auto flex-nowrap">
            <TabsTrigger value="image" className="flex gap-2 items-center">
              <FileImage className="h-4 w-4" />
              <span>Images</span>
            </TabsTrigger>
            <TabsTrigger value="video" className="flex gap-2 items-center">
              <FileVideo className="h-4 w-4" />
              <span>Videos</span>
            </TabsTrigger>
            <TabsTrigger value="audio" className="flex gap-2 items-center">
              <FileAudio className="h-4 w-4" />
              <span>Audio</span>
            </TabsTrigger>
            <TabsTrigger value="document" className="flex gap-2 items-center">
              <FileText className="h-4 w-4" />
              <span>Documents</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="image">
            <ImageConverter />
          </TabsContent>
          
          <TabsContent value="video">
            <VideoConverter />
          </TabsContent>
          
          <TabsContent value="audio">
            <AudioConverter />
          </TabsContent>
          
          <TabsContent value="document">
            <DocumentConverter />
          </TabsContent>
        </Tabs>
      </div>
      
      <div className="bento-grid space-y-0">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6 hover:shadow-[8px_8px_16px_rgba(0,0,0,0.07),-8px_-8px_16px_rgba(255,255,255,0.8)] transition-all duration-300">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 rounded-full bg-amber-100 shadow-[inset_2px_2px_4px_rgba(0,0,0,0.05),inset_-2px_-2px_4px_rgba(255,255,255,0.9)]">
                <Bolt className="h-5 w-5 text-amber-600" />
              </div>
              <h3 className="text-xl font-bold text-amber-900">Lightning Fast</h3>
            </div>
            <p className="text-amber-700">
              Our optimized conversion engine processes your files with incredible speed, 
              so you don't have to wait. Get your converted files in seconds, not minutes.
            </p>
          </Card>
          
          <Card className="p-6 hover:shadow-[8px_8px_16px_rgba(0,0,0,0.07),-8px_-8px_16px_rgba(255,255,255,0.8)] transition-all duration-300">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 rounded-full bg-amber-100 shadow-[inset_2px_2px_4px_rgba(0,0,0,0.05),inset_-2px_-2px_4px_rgba(255,255,255,0.9)]">
                <Sparkles className="h-5 w-5 text-amber-600" />
              </div>
              <h3 className="text-xl font-bold text-amber-900">High Quality</h3>
            </div>
            <p className="text-amber-700">
              We maintain the highest quality during conversion. Your images stay sharp, 
              your videos remain clear, and your documents preserve their formatting.
            </p>
          </Card>
        </div>
      </div>
      
      <footer className="text-center text-amber-700 pt-10 border-t border-amber-200/50">
        <p>© {new Date().getFullYear()} ConvertMaster. Beautiful file conversion for everyone.</p>
      </footer>
    </div>
  );
}
