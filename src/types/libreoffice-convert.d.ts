declare module 'libreoffice-convert' {
  export function convert(
    buffer: Buffer,
    outputFormat: string,
    options: any,
    callback: (err: Error | null, resultBuffer: Buffer) => void
  ): void;

  export default {
    convert: convert
  };
} 