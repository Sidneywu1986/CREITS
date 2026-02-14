/**
 * PDF下载服务
 * 提供PDF文件的下载和存储功能
 */

import fs from 'fs';
import path from 'path';

export interface PDFDownloadResult {
  success: boolean;
  filePath?: string;
  fileName?: string;
  error?: string;
}

export interface DownloadedPDF {
  id: string;
  code: string;
  name: string;
  title: string;
  type: string;
  publishDate: string;
  filePath: string;
  downloadDate: string;
  fileSize: number;
}

// 存储下载记录的目录
const DOWNLOADS_DIR = path.join(process.cwd(), 'public', 'downloads');
const RECORDS_FILE = path.join(DOWNLOADS_DIR, 'records.json');

// 确保目录存在
export function ensureDownloadsDirectory() {
  if (!fs.existsSync(DOWNLOADS_DIR)) {
    fs.mkdirSync(DOWNLOADS_DIR, { recursive: true });
  }
  
  if (!fs.existsSync(RECORDS_FILE)) {
    fs.writeFileSync(RECORDS_FILE, JSON.stringify([], null, 2));
  }
}

// 读取下载记录
export function getDownloadRecords(): DownloadedPDF[] {
  try {
    ensureDownloadsDirectory();
    const content = fs.readFileSync(RECORDS_FILE, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    return [];
  }
}

// 保存下载记录
export function saveDownloadRecord(record: DownloadedPDF) {
  try {
    ensureDownloadsDirectory();
    const records = getDownloadRecords();
    records.push(record);
    fs.writeFileSync(RECORDS_FILE, JSON.stringify(records, null, 2));
  } catch (error) {
    console.error('保存下载记录失败:', error);
  }
}

// 生成安全的文件名
export function generateSafeFileName(code: string, title: string, publishDate: string): string {
  // 移除特殊字符
  const safeTitle = title.replace(/[<>:"/\\|?*]/g, '_');
  // 组合文件名
  return `${code}_${publishDate}_${safeTitle}.pdf`;
}

// 下载PDF文件（模拟实现）
// 注意：实际应用中需要处理交易所的反爬虫机制和跨域问题
export async function downloadPDF(
  url: string,
  code: string,
  name: string,
  title: string,
  type: string,
  publishDate: string
): Promise<PDFDownloadResult> {
  try {
    ensureDownloadsDirectory();
    
    const fileName = generateSafeFileName(code, title, publishDate);
    const filePath = path.join(DOWNLOADS_DIR, fileName);
    
    // 检查文件是否已存在
    if (fs.existsSync(filePath)) {
      const stats = fs.statSync(filePath);
      
      // 记录已存在的文件
      const record: DownloadedPDF = {
        id: `${code}-${Date.now()}`,
        code,
        name,
        title,
        type,
        publishDate,
        filePath: `/downloads/${fileName}`,
        downloadDate: new Date().toISOString(),
        fileSize: stats.size,
      };
      
      saveDownloadRecord(record);
      
      return {
        success: true,
        filePath: `/downloads/${fileName}`,
        fileName,
      };
    }
    
    // 实际下载逻辑（需要根据交易所的具体实现调整）
    // 由于交易所网站可能有反爬虫机制，这里提供模拟实现
    // 在生产环境中，需要：
    // 1. 使用代理服务器避免跨域问题
    // 2. 处理验证码和反爬虫机制
    // 3. 添加重试机制
    // 4. 使用合适的User-Agent
    
    // 模拟下载成功
    console.log(`模拟下载: ${url} -> ${filePath}`);
    
    // 创建一个空文件作为占位符（实际应该下载PDF内容）
    fs.writeFileSync(filePath, `PDF文件占位符: ${title}\n来源: ${url}\n下载时间: ${new Date().toISOString()}`);
    
    // 记录下载
    const record: DownloadedPDF = {
      id: `${code}-${Date.now()}`,
      code,
      name,
      title,
      type,
      publishDate,
      filePath: `/downloads/${fileName}`,
      downloadDate: new Date().toISOString(),
      fileSize: 1024, // 模拟文件大小
    };
    
    saveDownloadRecord(record);
    
    return {
      success: true,
      filePath: `/downloads/${fileName}`,
      fileName,
    };
  } catch (error) {
    console.error('下载PDF失败:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '未知错误',
    };
  }
}

// 删除下载的PDF
export function deleteDownloadedPDF(fileName: string): boolean {
  try {
    const filePath = path.join(DOWNLOADS_DIR, fileName);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      
      // 更新记录
      const records = getDownloadRecords();
      const updatedRecords = records.filter(r => !r.filePath.endsWith(fileName));
      fs.writeFileSync(RECORDS_FILE, JSON.stringify(updatedRecords, null, 2));
      
      return true;
    }
    return false;
  } catch (error) {
    console.error('删除PDF失败:', error);
    return false;
  }
}

// 获取某个产品的所有下载记录
export function getProductDownloads(code: string): DownloadedPDF[] {
  const records = getDownloadRecords();
  return records.filter(r => r.code === code);
}

// 清理过期的下载文件（可选）
export function cleanupOldDownloads(daysOld: number = 30) {
  try {
    const records = getDownloadRecords();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);
    
    const validRecords: DownloadedPDF[] = [];
    const filesToDelete: string[] = [];
    
    for (const record of records) {
      const downloadDate = new Date(record.downloadDate);
      
      if (downloadDate < cutoffDate) {
        // 标记为删除
        filesToDelete.push(path.basename(record.filePath));
      } else {
        validRecords.push(record);
      }
    }
    
    // 删除过期文件
    filesToDelete.forEach(fileName => {
      deleteDownloadedPDF(fileName);
    });
    
    // 更新记录文件
    fs.writeFileSync(RECORDS_FILE, JSON.stringify(validRecords, null, 2));
    
    return {
      deletedCount: filesToDelete.length,
      remainingCount: validRecords.length,
    };
  } catch (error) {
    console.error('清理过期文件失败:', error);
    return { deletedCount: 0, remainingCount: 0 };
  }
}
