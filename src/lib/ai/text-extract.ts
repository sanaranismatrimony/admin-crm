import type { ExtractedField } from '@/types';

const MAX_FILE_SIZE = 10 * 1024 * 1024;

export class ExtractionError extends Error {
  constructor(message: string, public readonly code: string) {
    super(message);
    this.name = 'ExtractionError';
  }
}

interface TextExtractionResult {
  text: string;
  isScanned: boolean;
}

export async function extractText(
  buffer: ArrayBuffer,
  mimeType: string,
  fileName: string,
): Promise<TextExtractionResult> {
  if (buffer.byteLength > MAX_FILE_SIZE) {
    throw new ExtractionError('File too large. Maximum size is 10MB.', 'FILE_TOO_LARGE');
  }

  const ext = fileName.split('.').pop()?.toLowerCase();
  const supported = ['pdf', 'docx', 'doc', 'jpg', 'jpeg', 'png', 'webp'];
  if (!ext || !supported.includes(ext)) {
    throw new ExtractionError(`Unsupported file type: .${ext}`, 'UNSUPPORTED_FORMAT');
  }

  if (ext === 'docx' || ext === 'doc') {
    return extractFromDocx(buffer);
  }

  if (ext === 'pdf') {
    return extractFromPdf(buffer);
  }

  return extractFromImage(buffer, ext, mimeType);
}

async function extractFromDocx(buffer: ArrayBuffer): Promise<TextExtractionResult> {
  try {
    const mammoth = await import('mammoth');
    const result = await mammoth.extractRawText({ buffer: Buffer.from(buffer) });
    const text = (result.value || '').trim();
    if (!text) {
      throw new ExtractionError('No text could be extracted from this document. It may contain only images.', 'EMPTY_DOCUMENT');
    }
    return { text, isScanned: false };
  } catch (err) {
    if (err instanceof ExtractionError) throw err;
    throw new ExtractionError('Failed to read DOCX file. The file may be corrupt.', 'CORRUPT_FILE');
  }
}

async function extractFromPdf(buffer: ArrayBuffer): Promise<TextExtractionResult> {
  try {
    const pdfParse = await import('pdf-parse/lib/pdf-parse.js');
    const data = await pdfParse.default(Buffer.from(buffer));
    const text = (data.text || '').trim();
    if (!text || text.length < 20) {
      return { text, isScanned: true };
    }
    return { text, isScanned: false };
  } catch (err) {
    if (err instanceof ExtractionError) throw err;
    throw new ExtractionError('Failed to read PDF file. The file may be corrupt or password-protected.', 'CORRUPT_FILE');
  }
}

const isVercel = !!process.env.VERCEL;

async function extractFromImage(buffer: ArrayBuffer, ext: string, mimeType: string): Promise<TextExtractionResult> {
  // Tesseract.js doesn't work on Vercel (WASM/traineddata unavailable), skip it
  if (!isVercel) {
    try {
      const text = await tesseractOcr(buffer);
      if (text) return { text, isScanned: true };
    } catch {
    }
  }

  // Fallback: use Groq vision
  try {
    const { ocrWithGroqVision } = await import('./groq');
    const text = await ocrWithGroqVision(buffer, mimeType);
    if (text) return { text, isScanned: true };
  } catch {
  }

  return { text: '', isScanned: true };
}

async function tesseractOcr(buffer: ArrayBuffer): Promise<string> {
  const { sep } = await import('node:path');
  const Tesseract = await import('tesseract.js');
  const workerPath = process.cwd() + sep + 'node_modules' + sep + 'tesseract.js' + sep + 'src' + sep + 'worker-script' + sep + 'node' + sep + 'index.js';
  const { data } = await Tesseract.recognize(Buffer.from(buffer), 'eng+tel', {
    workerPath,
    logger: () => {},
  });
  return (data.text || '').trim();
}

export function strField(value: string | null | undefined, confidence: 'high' | 'medium' | 'low' = 'medium'): ExtractedField<string> {
  if (!value || value.trim() === '') return { value: null, confidence: 'low' };
  return { value: value.trim(), confidence };
}

export function numField(value: number | null | undefined, confidence: 'high' | 'medium' | 'low' = 'medium'): ExtractedField<number> {
  if (value === null || value === undefined || isNaN(value)) return { value: null, confidence: 'low' };
  return { value, confidence };
}
