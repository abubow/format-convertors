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
    formats: ['mp4', 'webm', 'mov', 'avi', 'mkv', 'flv', 'wmv', 'mpg', 'mpeg', '3gp', 'm4v', 'ts', 'mts', 'ogg'],
    conversions: {
      'mp4': ['webm', 'mov', 'avi', 'mkv', 'flv', 'wmv', '3gp', 'm4v', 'ts', 'ogg'],
      'webm': ['mp4', 'mov', 'avi', 'mkv', 'flv', '3gp', 'm4v'],
      'mov': ['mp4', 'webm', 'avi', 'mkv', 'flv', 'm4v', 'ts'],
      'avi': ['mp4', 'webm', 'mov', 'mkv', 'flv', 'wmv'],
      'mkv': ['mp4', 'webm', 'mov', 'avi', 'flv'],
      'flv': ['mp4', 'webm', 'mov', 'avi', 'mkv'],
      'wmv': ['mp4', 'avi', 'mkv', 'flv'],
      'mpg': ['mp4', 'webm', 'avi', 'mkv'],
      'mpeg': ['mp4', 'webm', 'avi', 'mkv'],
      '3gp': ['mp4', 'webm', 'avi'],
      'm4v': ['mp4', 'webm', 'mov', 'avi'],
      'ts': ['mp4', 'mov', 'mkv'],
      'mts': ['mp4', 'mov', 'mkv', 'ts'],
      'ogg': ['mp4', 'webm']
    }
  },
  audio: {
    formats: ['mp3', 'wav', 'aac', 'flac', 'ogg', 'm4a', 'wma', 'opus', 'amr', 'aiff'],
    conversions: {
      'mp3': ['wav', 'ogg', 'aac', 'flac', 'm4a', 'wma', 'opus'],
      'wav': ['mp3', 'ogg', 'aac', 'flac', 'm4a', 'wma', 'opus', 'aiff'],
      'ogg': ['mp3', 'wav', 'aac', 'flac', 'm4a', 'opus'],
      'aac': ['mp3', 'wav', 'ogg', 'flac', 'm4a', 'wma'],
      'flac': ['mp3', 'wav', 'ogg', 'aac', 'm4a', 'wma', 'aiff'],
      'm4a': ['mp3', 'wav', 'ogg', 'aac', 'flac', 'wma'],
      'wma': ['mp3', 'wav', 'aac', 'flac', 'm4a'],
      'opus': ['mp3', 'wav', 'ogg', 'flac'],
      'amr': ['mp3', 'wav', 'aac', 'm4a'],
      'aiff': ['mp3', 'wav', 'flac', 'm4a']
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