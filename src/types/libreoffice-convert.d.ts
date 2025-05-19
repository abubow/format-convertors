declare module 'libreoffice-convert' {
  interface ConvertOptions {
    [key: string]: unknown;
  }

  export function convert(
    buffer: Buffer,
    outputFormat: string,
    options: ConvertOptions,
    callback: (err: Error | null, resultBuffer: Buffer) => void
  ): void;

  const libreofficeFunctions = {
    convert: convert
  };
  
  export default libreofficeFunctions;
} 