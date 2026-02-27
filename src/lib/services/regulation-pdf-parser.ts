/**
 * REITs法规文档PDF解析服务
 * 使用pdfjs-dist提取PDF文本内容
 */

import * as pdfjsLib from 'pdfjs-dist';
import { RegulationDocument } from '@/lib/data/regulations-knowledge-base';

// 配置 PDF.js worker
if (typeof window === 'undefined') {
  // Node.js 环境
  pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
} else {
  // 浏览器环境
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
}

export interface ParsedRegulation {
  documentId: string;
  extractedText: string;
  sections: {
    title: string;
    content: string;
    pageNumber: number;
  }[];
  metadata: {
    pageCount: number;
    title?: string;
    author?: string;
    subject?: string;
    keywords?: string[];
  };
  parsedAt: string;
}

export interface ParseProgress {
  documentId: string;
  documentName: string;
  currentPage: number;
  totalPages: number;
  status: 'parsing' | 'completed' | 'failed';
  error?: string;
}

/**
 * 从URL获取PDF文档
 */
async function fetchPdfDocument(url: string): Promise<Buffer> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch PDF: ${response.statusText}`);
  }
  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

/**
 * 提取PDF页面的文本
 */
async function extractPageText(
  pdfDoc: pdfjsLib.PDFDocumentProxy,
  pageNum: number
): Promise<string> {
  const page = await pdfDoc.getPage(pageNum);
  const textContent = await page.getTextContent();

  // 按位置排序文本项
  textContent.items.sort((a: any, b: any) => {
    if (a.transform[5] !== b.transform[5]) {
      return b.transform[5] - a.transform[5]; // 按y坐标降序
    }
    return a.transform[4] - b.transform[4]; // 按x坐标升序
  });

  // 提取文本内容
  const textItems = textContent.items.map((item: any) => item.str).join(' ');
  return textItems;
}

/**
 * 解析PDF文档并提取文本内容
 */
export async function parseRegulationPdf(
  document: RegulationDocument,
  onProgress?: (progress: ParseProgress) => void
): Promise<ParsedRegulation> {
  try {
    // 通知开始解析
    if (onProgress) {
      onProgress({
        documentId: document.id,
        documentName: document.title,
        currentPage: 0,
        totalPages: 0,
        status: 'parsing'
      });
    }

    // 获取PDF文档
    const pdfData = await fetchPdfDocument(document.pdfUrl);

    // 加载PDF文档
    const loadingTask = pdfjsLib.getDocument({
      data: new Uint8Array(pdfData)
    });
    const pdfDoc = await loadingTask.promise;

    const totalPages = pdfDoc.numPages;

    // 获取文档元数据
    const metadata = await pdfDoc.getMetadata();
    const info = metadata.info as any;
    const documentMetadata = {
      pageCount: totalPages,
      title: info?.Title || document.title,
      author: info?.Author,
      subject: info?.Subject,
      keywords: info?.Keywords?.split(/[,\s;]+/).filter(Boolean) || []
    };

    // 提取所有页面的文本
    const allTexts: string[] = [];
    const sections: ParsedRegulation['sections'] = [];

    for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
      const pageText = await extractPageText(pdfDoc, pageNum);
      allTexts.push(pageText);

      // 尝试提取章节标题
      const sectionTitle = extractSectionTitle(pageText);
      if (sectionTitle) {
        sections.push({
          title: sectionTitle,
          content: pageText,
          pageNumber: pageNum
        });
      }

      // 通知进度
      if (onProgress) {
        onProgress({
          documentId: document.id,
          documentName: document.title,
          currentPage: pageNum,
          totalPages,
          status: 'parsing'
        });
      }
    }

    // 合并所有文本
    const extractedText = allTexts.join('\n\n');

    const result: ParsedRegulation = {
      documentId: document.id,
      extractedText,
      sections,
      metadata: documentMetadata,
      parsedAt: new Date().toISOString()
    };

    // 通知完成
    if (onProgress) {
      onProgress({
        documentId: document.id,
        documentName: document.title,
        currentPage: totalPages,
        totalPages,
        status: 'completed'
      });
    }

    return result;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    // 通知失败
    if (onProgress) {
      onProgress({
        documentId: document.id,
        documentName: document.title,
        currentPage: 0,
        totalPages: 0,
        status: 'failed',
        error: errorMessage
      });
    }

    throw new Error(`Failed to parse PDF for ${document.title}: ${errorMessage}`);
  }
}

/**
 * 提取章节标题（简单的启发式方法）
 */
function extractSectionTitle(pageText: string): string | null {
  // 查找可能的章节标题模式
  const patterns = [
    /^第[一二三四五六七八九十百千]+[章节篇条]/m,
    /^[一二三四五六七八九十百千]+[、．.]\s*/m,
    /^[A-Z][A-Z\s]+(?=\s)/m,
    /^[1-9][0-9]*[、．.]\s*[^\n]+/m
  ];

  const lines = pageText.split('\n');
  for (const line of lines) {
    const trimmedLine = line.trim();
    for (const pattern of patterns) {
      if (pattern.test(trimmedLine)) {
        return trimmedLine;
      }
    }
  }

  return null;
}

/**
 * 批量解析多个法规文档
 */
export async function parseMultipleRegulations(
  documents: RegulationDocument[],
  onProgress?: (progress: ParseProgress) => void
): Promise<ParsedRegulation[]> {
  const results: ParsedRegulation[] = [];

  for (const document of documents) {
    try {
      const parsed = await parseRegulationPdf(document, onProgress);
      results.push(parsed);
    } catch (error) {
      console.error(`Failed to parse ${document.title}:`, error);
      // 继续解析下一个文档
    }
  }

  return results;
}

/**
 * 搜索解析后的法规内容
 */
export function searchRegulationContent(
  parsedRegulations: ParsedRegulation[],
  keyword: string,
  options?: {
    caseSensitive?: boolean;
    wholeWord?: boolean;
    maxResults?: number;
  }
) {
  const {
    caseSensitive = false,
    wholeWord = false,
    maxResults = 100
  } = options || {};

  const results: {
    documentId: string;
    documentTitle: string;
    section?: string;
    pageNumber?: number;
    excerpt: string;
    context: string;
  }[] = [];

  const searchRegex = new RegExp(
    wholeWord ? `\\b${keyword}\\b` : keyword,
    caseSensitive ? 'g' : 'gi'
  );

  for (const parsed of parsedRegulations) {
    // 搜索全文
    const matches = parsed.extractedText.match(searchRegex);
    if (matches && matches.length > 0) {
      const context = getContextAroundKeyword(
        parsed.extractedText,
        keyword,
        searchRegex
      );

      results.push({
        documentId: parsed.documentId,
        documentTitle: parsed.metadata.title || parsed.documentId,
        excerpt: matches.slice(0, 3).join(', '),
        context
      });

      if (results.length >= maxResults) {
        break;
      }
    }

    // 搜索章节
    for (const section of parsed.sections) {
      const sectionMatches = section.content.match(searchRegex);
      if (sectionMatches && sectionMatches.length > 0) {
        results.push({
          documentId: parsed.documentId,
          documentTitle: parsed.metadata.title || parsed.documentId,
          section: section.title,
          pageNumber: section.pageNumber,
          excerpt: sectionMatches.slice(0, 3).join(', '),
          context: getContextAroundKeyword(section.content, keyword, searchRegex)
        });

        if (results.length >= maxResults) {
          break;
        }
      }
    }

    if (results.length >= maxResults) {
      break;
    }
  }

  return results;
}

/**
 * 获取关键词周围的上下文
 */
function getContextAroundKeyword(
  text: string,
  keyword: string,
  regex: RegExp,
  contextLength: number = 100
): string {
  const match = regex.exec(text);
  if (!match) {
    return '';
  }

  const index = match.index!;
  const start = Math.max(0, index - contextLength);
  const end = Math.min(text.length, index + keyword.length + contextLength);

  return '...' + text.slice(start, end) + '...';
}

/**
 * 提取法规的关键要点（基于章节和关键词）
 */
export function extractKeyPoints(parsedRegulation: ParsedRegulation): string[] {
  const keyPoints: string[] = [];

  // 从章节标题中提取要点
  for (const section of parsedRegulation.sections) {
    if (section.title && section.content.length > 50) {
      keyPoints.push(section.title);
    }
  }

  // 查找包含特定关键词的段落
  const keywords = [
    '应当', '必须', '禁止', '不得', '需要', '要求',
    '规定', '标准', '条件', '程序', '流程',
    '义务', '权利', '责任', '范围'
  ];

  for (const keyword of keywords) {
    const regex = new RegExp(`[^。！？\n]*${keyword}[^。！？\n]*[。！？]`, 'g');
    const matches = parsedRegulation.extractedText.match(regex);
    if (matches && matches.length > 0) {
      keyPoints.push(...matches.slice(0, 3));
    }
  }

  // 去重并限制数量
  const uniquePoints = [...new Set(keyPoints)];
  return uniquePoints.slice(0, 20);
}

/**
 * 将解析结果转换为知识库条目
 */
export function convertToKnowledgeBaseEntry(
  parsed: ParsedRegulation,
  originalDocument: RegulationDocument
): Partial<RegulationDocument> {
  return {
    ...originalDocument,
    extractedText: parsed.extractedText,
    keyPoints: extractKeyPoints(parsed),
    lastUpdated: new Date().toISOString()
  };
}
