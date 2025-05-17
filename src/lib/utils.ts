import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const fileTypes = {
  image: {
    formats: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'tiff', 'svg', 'ico'],
    conversions: {
      'jpg': ['png', 'webp', 'bmp', 'tiff'],
      'jpeg': ['png', 'webp', 'bmp', 'tiff'],
      'png': ['jpg', 'webp', 'bmp', 'tiff'],
      'gif': ['jpg', 'png', 'webp'],
      'webp': ['jpg', 'png', 'gif'],
      'bmp': ['jpg', 'png', 'webp'],
      'tiff': ['jpg', 'png', 'webp'],
      'svg': ['png', 'jpg'],
      'ico': ['png', 'jpg']
    }
  },
  video: {
    formats: ['mp4', 'mov', 'avi', 'webm', 'mkv', 'flv'],
    conversions: {
      'mp4': ['webm', 'mov', 'avi'],
      'mov': ['mp4', 'webm', 'avi'],
      'avi': ['mp4', 'webm', 'mov'],
      'webm': ['mp4', 'mov', 'avi'],
      'mkv': ['mp4', 'webm', 'avi'],
      'flv': ['mp4', 'webm', 'avi']
    }
  },
  audio: {
    formats: ['mp3', 'wav', 'ogg', 'aac', 'flac', 'm4a'],
    conversions: {
      'mp3': ['wav', 'ogg', 'aac', 'flac'],
      'wav': ['mp3', 'ogg', 'aac', 'flac'],
      'ogg': ['mp3', 'wav', 'aac', 'flac'],
      'aac': ['mp3', 'wav', 'ogg', 'flac'],
      'flac': ['mp3', 'wav', 'ogg', 'aac'],
      'm4a': ['mp3', 'wav', 'ogg', 'aac']
    }
  },
  document: {
    formats: ['pdf', 'doc', 'docx', 'txt', 'rtf', 'odt', 'html', 'md'],
    conversions: {
      'pdf': ['doc', 'docx', 'txt', 'html'],
      'doc': ['pdf', 'docx', 'txt', 'html'],
      'docx': ['pdf', 'doc', 'txt', 'html'],
      'txt': ['pdf', 'html', 'md'],
      'rtf': ['pdf', 'doc', 'docx', 'txt'],
      'odt': ['pdf', 'doc', 'docx', 'txt'],
      'html': ['pdf', 'txt', 'md'],
      'md': ['html', 'txt', 'pdf']
    }
  }
}; 