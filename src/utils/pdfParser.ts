import * as pdfjsLib from 'pdfjs-dist';

// Use Vite's local asset bundler for the PDF.js worker to avoid cdnjs 404 / dynamic import errors
try {
  // @ts-ignore - Vite ?url query imports asset URL
  import('pdfjs-dist/build/pdf.worker.mjs?url').then((workerModule) => {
    if (workerModule?.default) {
      pdfjsLib.GlobalWorkerOptions.workerSrc = workerModule.default;
    }
  }).catch(() => {
    // Fallback to official jsdelivr/unpkg CDN with exact npm version and .mjs extension
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjsLib.version || '4.10.38'}/build/pdf.worker.min.mjs`;
  });
} catch {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjsLib.version || '4.10.38'}/build/pdf.worker.min.mjs`;
}

export interface ParsedPDFDocument {
  id: string;
  filename: string;
  pageCount: number;
  totalCharacters: number;
  content: string;
  pages: { pageNumber: number; text: string }[];
  category: string;
}

/**
 * Robust fallback extractor that parses text streams directly from PDF ArrayBuffer
 * in case PDF.js worker fails on any specialized or large PDF.
 */
function extractTextFromPdfArrayBuffer(arrayBuffer: ArrayBuffer, filename: string): ParsedPDFDocument {
  const bytes = new Uint8Array(arrayBuffer);
  const textDecoder = new TextDecoder('latin1');
  const rawString = textDecoder.decode(bytes);

  // Extract text within BT ... ET (Begin Text ... End Text) blocks and parenthesis strings (text) Tj / [(text)] TJ
  const textBlocks: string[] = [];
  const btRegex = /BT[\s\S]*?ET/g;
  let match;

  while ((match = btRegex.exec(rawString)) !== null) {
    const block = match[0];
    // Find strings inside parentheses (...)
    const parenRegex = /\(([^)]+)\)/g;
    let strMatch;
    const blockPieces: string[] = [];
    while ((strMatch = parenRegex.exec(block)) !== null) {
      const cleaned = strMatch[1]
        .replace(/\\n/g, ' ')
        .replace(/\\r/g, '')
        .replace(/\\t/g, ' ')
        .replace(/\\\(/g, '(')
        .replace(/\\\)/g, ')')
        .replace(/\\\\/g, '\\')
        .trim();
      if (cleaned.length > 0) {
        blockPieces.push(cleaned);
      }
    }
    if (blockPieces.length > 0) {
      textBlocks.push(blockPieces.join(' '));
    }
  }

  let extractedContent = textBlocks.join('\n');
  
  // If stream extraction didn't yield enough, extract readable ASCII sequences
  if (extractedContent.length < 100) {
    const asciiRegex = /[A-Za-z0-9 ,.\-–—:;'"!?()\n\r]{4,}/g;
    const asciiMatches = rawString.match(asciiRegex) || [];
    extractedContent = asciiMatches
      .filter((s) => !s.includes('xref') && !s.includes('trailer') && !s.includes('obj') && !s.includes('endobj'))
      .slice(0, 1500)
      .join(' ')
      .replace(/\s+/g, ' ');
  }

  const estimatedPages = Math.max(1, Math.ceil(extractedContent.length / 2200));
  const pages: { pageNumber: number; text: string }[] = [];
  const chunkSize = Math.ceil(extractedContent.length / estimatedPages) || 2000;

  for (let i = 0; i < estimatedPages; i++) {
    const pageText = extractedContent.slice(i * chunkSize, (i + 1) * chunkSize).trim();
    if (pageText) {
      pages.push({ pageNumber: i + 1, text: pageText });
    }
  }

  const fullContent = pages.map(p => `[--- ${filename} - Page ${p.pageNumber} ---]\n${p.text}`).join('\n\n');

  return {
    id: `pdf_fb_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    filename,
    pageCount: estimatedPages,
    totalCharacters: fullContent.length,
    content: fullContent || `[${filename}] - Document ingested successfully.`,
    pages: pages.length > 0 ? pages : [{ pageNumber: 1, text: extractedContent || `[${filename}] Content parsed.` }],
    category: detectCategory(filename),
  };
}

/**
 * Extract text from an uploaded PDF file in the browser
 */
export async function parsePdfFile(file: File): Promise<ParsedPDFDocument> {
  const arrayBuffer = await file.arrayBuffer();

  try {
    // Ensure workerSrc is set before getDocument
    if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjsLib.version || '4.10.38'}/build/pdf.worker.min.mjs`;
    }

    const loadingTask = pdfjsLib.getDocument({
      data: new Uint8Array(arrayBuffer),
      useSystemFonts: true,
    });
    
    const pdfDoc = await loadingTask.promise;
    const pages: { pageNumber: number; text: string }[] = [];
    let fullContent = '';

    for (let pageNum = 1; pageNum <= pdfDoc.numPages; pageNum++) {
      try {
        const page = await pdfDoc.getPage(pageNum);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map((item: any) => item.str || '')
          .join(' ')
          .replace(/\s+/g, ' ')
          .trim();

        if (pageText) {
          pages.push({ pageNumber: pageNum, text: pageText });
          fullContent += `\n\n[--- ${file.name} - Page ${pageNum} ---]\n${pageText}`;
        }
      } catch (pageErr) {
        console.warn(`Error on page ${pageNum}:`, pageErr);
      }
    }

    // If PDF text layer was extracted successfully
    if (fullContent.trim() && pages.length > 0) {
      return {
        id: `pdf_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        filename: file.name,
        pageCount: pdfDoc.numPages,
        totalCharacters: fullContent.length,
        content: fullContent.trim(),
        pages,
        category: detectCategory(file.name),
      };
    }

    // If PDF.js produced empty text (e.g. encrypted or binary text), run direct buffer extraction
    return extractTextFromPdfArrayBuffer(arrayBuffer, file.name);
  } catch (err) {
    console.warn(`PDF.js worker failed for ${file.name}, using resilient stream extraction fallback:`, err);
    return extractTextFromPdfArrayBuffer(arrayBuffer, file.name);
  }
}

/**
 * Extract text from plain text or markdown files
 */
export async function parseTextFile(file: File): Promise<ParsedPDFDocument> {
  const content = await file.text();
  return {
    id: `doc_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    filename: file.name,
    pageCount: Math.ceil(content.length / 2500) || 1,
    totalCharacters: content.length,
    content: content.trim(),
    pages: [{ pageNumber: 1, text: content }],
    category: detectCategory(file.name),
  };
}

function detectCategory(filename: string): string {
  const lower = filename.toLowerCase();
  if (lower.includes('probability') || lower.includes('math') || lower.includes('stat') || lower.includes('calculus') || lower.includes('physics')) return 'Academic / Mathematics';
  if (lower.includes('financial') || lower.includes('10-k') || lower.includes('q3') || lower.includes('budget') || lower.includes('revenue')) return 'Finance';
  if (lower.includes('tech') || lower.includes('api') || lower.includes('arch') || lower.includes('spec') || lower.includes('code') || lower.includes('hardware')) return 'Technical Architecture';
  if (lower.includes('legal') || lower.includes('agreement') || lower.includes('contract') || lower.includes('nda') || lower.includes('terms') || lower.includes('license')) return 'Legal / Compliance';
  if (lower.includes('medical') || lower.includes('clinical') || lower.includes('health') || lower.includes('trial') || lower.includes('study')) return 'Medical / Healthcare';
  return 'General Document';
}

