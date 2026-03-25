import Tesseract from 'tesseract.js';

export interface OCRResult {
  text: string;
  confidence: number;
  error?: string;
}

/**
 * Process an image file with OCR to extract text
 */
export async function processImageWithOCR(
  file: File,
  onProgress?: (progress: number) => void
): Promise<OCRResult> {
  try {
    const result = await Tesseract.recognize(file, 'eng', {
      logger: (m) => {
        if (m.status === 'recognizing text' && onProgress) {
          onProgress(Math.round(m.progress * 100));
        }
      },
    });

    return {
      text: result.data.text,
      confidence: result.data.confidence,
    };
  } catch (error) {
    console.error('OCR processing error:', error);
    return {
      text: '',
      confidence: 0,
      error: error instanceof Error ? error.message : 'OCR processing failed',
    };
  }
}

/**
 * Check if a file is an image that needs OCR
 */
export function isImageFile(file: File): boolean {
  const imageTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/bmp'];
  return imageTypes.includes(file.type);
}

/**
 * Check if a PDF might be scanned (image-based)
 * This is a heuristic - we try to extract text and if it's very short, assume it's scanned
 */
export async function isPDFScanned(pdfText: string): Promise<boolean> {
  // If extracted text is very short (less than 50 chars) or mostly whitespace, likely scanned
  const cleanText = pdfText.replace(/\s+/g, '').trim();
  return cleanText.length < 50;
}

/**
 * Convert PDF page to image for OCR processing
 * This would require pdf.js in a real implementation
 * For now, we return a placeholder indicating the limitation
 */
export async function convertPDFToImages(file: File): Promise<Blob[]> {
  // This is a placeholder - full implementation would use pdf.js
  console.warn('PDF to image conversion for OCR is not yet implemented');
  return [];
}
