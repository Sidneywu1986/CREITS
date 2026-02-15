/**
 * 飞书文档服务
 *
 * 提供文档上传、创建、搜索等功能
 * 文档: https://open.feishu.cn/document/server-docs/docs/docs/
 */

import { getFeishuClient } from './client';

/**
 * 文件信息
 */
export interface FileInfo {
  file_token: string;
  name: string;
  size: number;
  url: string;
  create_time: number;
}

/**
 * 上传文件到飞书
 *
 * @param file 文件对象
 * @param fileName 文件名
 * @param folderToken 文件夹token（可选）
 */
export async function uploadFile(
  file: File | Blob,
  fileName: string,
  folderToken?: string
): Promise<FileInfo> {
  const client = getFeishuClient();
  const token = await client.getAccessToken();

  // 获取上传地址
  const uploadResp = await fetch('https://open.feishu.cn/open-apis/drive/v1/files/upload_all', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      file_name: fileName,
      parent_type: folderToken ? 'explorer' : 'file',
      parent_node: folderToken || 'root',
      size: file.size,
    }),
  });

  if (!uploadResp.ok) {
    throw new Error(`获取上传地址失败: ${uploadResp.statusText}`);
  }

  const uploadData = await uploadResp.json();

  // 上传文件
  const formData = new FormData();
  formData.append('file', file);

  const fileResp = await fetch(uploadData.data.upload_url, {
    method: 'PUT',
    body: file,
  });

  if (!fileResp.ok) {
    throw new Error(`文件上传失败: ${fileResp.statusText}`);
  }

  // 获取文件信息
  const fileResp2 = await fetch(`https://open.feishu.cn/open-apis/drive/v1/files/${uploadData.data.file_token}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!fileResp2.ok) {
    throw new Error(`获取文件信息失败: ${fileResp2.statusText}`);
  }

  const fileData = await fileResp2.json();
  return fileData.data as FileInfo;
}

/**
 * 创建文档
 *
 * @param title 文档标题
 * @param folderToken 文件夹token（可选）
 * @param content 文档内容（可选）
 */
export async function createDocument(
  title: string,
  folderToken?: string,
  content?: string
): Promise<any> {
  const client = getFeishuClient();

  try {
    // 创建空文档
    const response = await client.post<{
      document: { document_token: string; title: string };
    }>('/docx/v1/documents', {
      title,
      folder_token: folderToken,
    });

    // 如果有内容，添加到文档
    if (content) {
      await addDocumentBlocks(response.document.document_token, [
        {
          paragraph: {
            elements: [
              {
                text_run: {
                  content: content,
                },
              },
            ],
          },
        },
      ]);
    }

    return response.document;
  } catch (error) {
    console.error('创建文档失败:', error);
    throw error;
  }
}

/**
 * 添加文档块
 *
 * @param documentToken 文档token
 * @param blocks 块列表
 * @param index 插入位置（可选）
 */
export async function addDocumentBlocks(
  documentToken: string,
  blocks: any[],
  index?: number
): Promise<any> {
  const client = getFeishuClient();

  try {
    const response = await client.post<{ block_id: string }>(
      `/docx/v1/documents/${documentToken}/blocks`,
      {
        index: index || -1,
        children: blocks,
      }
    );
    return response;
  } catch (error) {
    console.error('添加文档块失败:', error);
    throw error;
  }
}

/**
 * 创建REITs申报材料文档
 *
 * @param reitCode REITs代码
 * @param reitName REITs名称
 * @param materialType 材料类型
 * @param materialContent 材料内容
 * @param folderToken 文件夹token（可选）
 */
export async function createREITsMaterialDocument({
  reitCode,
  reitName,
  materialType,
  materialContent,
  folderToken,
}: {
  reitCode: string;
  reitName: string;
  materialType: string;
  materialContent: string;
  folderToken?: string;
}): Promise<any> {
  const title = `${reitName}(${reitCode})-${materialType}`;

  return createDocument(title, folderToken, materialContent);
}

/**
 * 搜索文件
 *
 * @param query 搜索关键词
 * @param fileType 文件类型（可选）
 */
export async function searchFiles(
  query: string,
  fileType?: string
): Promise<FileInfo[]> {
  const client = getFeishuClient();

  try {
    const response = await client.get<{
      items: {
        file_token: string;
        name: string;
        size: number;
        url: string;
        create_time: number;
      }[];
      has_more: boolean;
      page_token: string;
    }>('/drive/v1/files', {
      query,
      type: fileType,
    });

    return response.items || [];
  } catch (error) {
    console.error('搜索文件失败:', error);
    return [];
  }
}

/**
 * 获取文件下载链接
 *
 * @param fileToken 文件token
 */
export async function getFileDownloadUrl(fileToken: string): Promise<string> {
  const client = getFeishuClient();

  try {
    const response = await client.get<{ url: string }>(
      `/drive/v1/files/${fileToken}/download`
    );
    return response.url;
  } catch (error) {
    console.error('获取下载链接失败:', error);
    throw error;
  }
}

/**
 * 删除文件
 *
 * @param fileToken 文件token
 */
export async function deleteFile(fileToken: string): Promise<boolean> {
  const client = getFeishuClient();

  try {
    await client.delete(`/drive/v1/files/${fileToken}`);
    return true;
  } catch (error) {
    console.error('删除文件失败:', error);
    return false;
  }
}

/**
 * 创建云文档链接
 *
 * @param fileToken 文件token
 */
export function createDocumentLink(fileToken: string): string {
  return `https://feishu.cn/docx/${fileToken}`;
}

/**
 * 批量上传申报材料
 *
 * @param files 文件列表
 * @param folderToken 文件夹token（可选）
 */
export async function batchUploadMaterials(
  files: { file: File | Blob; fileName: string }[],
  folderToken?: string
): Promise<{ success: FileInfo[]; failed: Array<{ fileName: string; error: string }> }> {
  const success: FileInfo[] = [];
  const failed: Array<{ fileName: string; error: string }> = [];

  for (const { file, fileName } of files) {
    try {
      const fileInfo = await uploadFile(file, fileName, folderToken);
      success.push(fileInfo);
    } catch (error) {
      failed.push({
        fileName,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  return { success, failed };
}
