/**
 * 飞书文档服务
 * 提供创建、读取、更新飞书文档的功能
 */

import { createFeishuClient, FeishuDocument, FeishuDocumentBlock } from '@/config/feishu';

// 创建新文档
export async function createFeishuDocument(
  title: string,
  folderToken?: string
): Promise<FeishuDocument> {
  const client = createFeishuClient();

  try {
    // 创建文档
    const response = await client.docx.document.create({
      data: {
        title,
        folder_token: folderToken,
      },
    });

    const document = response.data;
    const documentId = document?.document?.document_id;

    if (!documentId) {
      throw new Error('创建文档失败：未返回文档ID');
    }

    // 获取文档链接
    const url = `https://feishu.cn/doc/${documentId}`;

    return {
      documentId,
      title,
      url,
    };
  } catch (error) {
    console.error('创建飞书文档失败:', error);
    throw new Error(`创建文档失败: ${error instanceof Error ? error.message : '未知错误'}`);
  }
}

// 添加文本块到文档
export async function addTextBlock(
  documentId: string,
  content: string,
  options?: {
    paragraphType?: 'text' | 'h1' | 'h2' | 'h3';
    textType?: 'text' | 'link' | 'hashtag' | 'mention';
  }
): Promise<string> {
  const client = createFeishuClient();

  try {
    const response = await client.docx.block.children.create({
      path: {
        document_id: documentId,
        block_id: documentId, // 使用document_id作为父block_id，表示添加到根节点
      },
      data: {
        block_type: 1, // 1表示paragraph类型
        paragraph: {
          elements: [
            {
              text_run: {
                content: content,
                style: {
                  paragraph_format: {
                    align: 1, // 1表示左对齐
                  },
                  text_style: {
                    ...getStyleByType(options?.paragraphType),
                  },
                },
              },
            },
          ],
        },
      },
    });

    const block = response.data;
    const blockId = block?.block?.block_id;

    if (!blockId) {
      throw new Error('添加文本块失败：未返回块ID');
    }

    return blockId;
  } catch (error) {
    console.error('添加文本块失败:', error);
    throw new Error(`添加文本块失败: ${error instanceof Error ? error.message : '未知错误'}`);
  }
}

// 获取文档内容
export async function getDocumentBlocks(documentId: string): Promise<FeishuDocumentBlock[]> {
  const client = createFeishuClient();

  try {
    const response = await client.docx.block.children.list({
      path: {
        document_id: documentId,
        block_id: documentId,
      },
      params: {
        page_size: 500, // 最大返回500个块
      },
    });

    const blocks = response.data?.items || [];
    return blocks;
  } catch (error) {
    console.error('获取文档内容失败:', error);
    throw new Error(`获取文档内容失败: ${error instanceof Error ? error.message : '未知错误'}`);
  }
}

// 删除文档
export async function deleteDocument(documentId: string): Promise<boolean> {
  const client = createFeishuClient();

  try {
    await client.docx.document.delete({
      path: {
        document_id: documentId,
      },
    });

    return true;
  } catch (error) {
    console.error('删除文档失败:', error);
    throw new Error(`删除文档失败: ${error instanceof Error ? error.message : '未知错误'}`);
  }
}

// 创建完整报告文档
export async function createReportDocument(
  title: string,
  sections: Array<{ title: string; content: string }>
): Promise<FeishuDocument> {
  // 创建新文档
  const document = await createFeishuDocument(title);

  // 添加报告标题
  await addTextBlock(document.documentId, title, { paragraphType: 'h1' });

  // 添加分隔线（空行）
  await addTextBlock(document.documentId, '');

  // 添加各个章节
  for (const section of sections) {
    // 添加章节标题
    await addTextBlock(document.documentId, section.title, { paragraphType: 'h2' });

    // 添加章节内容
    await addTextBlock(document.documentId, section.content);

    // 添加空行分隔
    await addTextBlock(document.documentId, '');
  }

  return document;
}

// 辅助函数：根据类型获取样式
function getStyleByType(type?: string): any {
  switch (type) {
    case 'h1':
      return {
        bold: true,
        font_size: 24,
        line_height: 1.5,
      };
    case 'h2':
      return {
        bold: true,
        font_size: 20,
        line_height: 1.5,
      };
    case 'h3':
      return {
        bold: true,
        font_size: 18,
        line_height: 1.5,
      };
    default:
      return {
        font_size: 14,
        line_height: 1.5,
      };
  }
}
