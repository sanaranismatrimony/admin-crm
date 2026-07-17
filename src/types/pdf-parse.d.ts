interface PDFData {
  text: string;
  numpages: number;
  numrender: number;
  info: Record<string, unknown>;
  metadata: Record<string, unknown>;
  version: string;
}

declare module 'pdf-parse' {
  function pdfParse(dataBuffer: Buffer | Uint8Array): Promise<PDFData>;
  export default pdfParse;
}

declare module 'pdf-parse/lib/pdf-parse.js' {
  function pdfParse(dataBuffer: Buffer | Uint8Array): Promise<PDFData>;
  export default pdfParse;
}
