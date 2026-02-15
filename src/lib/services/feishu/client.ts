/**
 * 飞书API客户端
 *
 * 提供飞书Open API的访问功能
 * 文档: https://open.feishu.cn/document/server-docs/
 */

/**
 * 飞书应用配置
 */
interface FeishuConfig {
  appId: string;
  appSecret: string;
  encryptKey?: string;
  verificationToken?: string;
}

/**
 * 访问令牌响应
 */
interface AccessTokenResponse {
  app_access_token: string;
  expire: number;
}

/**
 * 飞书客户端类
 */
export class FeishuClient {
  private config: FeishuConfig;
  private accessToken: string | null = null;
  private tokenExpireTime: number = 0;
  private baseURL = 'https://open.feishu.cn/open-apis';

  constructor(config: FeishuConfig) {
    this.config = config;
  }

  /**
   * 获取访问令牌
   */
  async getAccessToken(): Promise<string> {
    // 检查token是否有效
    if (this.accessToken && Date.now() < this.tokenExpireTime) {
      return this.accessToken;
    }

    // 请求新的访问令牌
    const response = await fetch(`${this.baseURL}/auth/v3/app_access_token/internal`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        app_id: this.config.appId,
        app_secret: this.config.appSecret,
      }),
    });

    if (!response.ok) {
      throw new Error(`获取访问令牌失败: ${response.statusText}`);
    }

    const data: AccessTokenResponse = await response.json();
    this.accessToken = data.app_access_token;
    this.tokenExpireTime = Date.now() + (data.expire - 60) * 1000; // 提前60秒过期

    return this.accessToken;
  }

  /**
   * 发送API请求
   */
  private async request<T>(
    path: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = await this.getAccessToken();

    const response = await fetch(`${this.baseURL}${path}`, {
      ...options,
      headers: {
        ...options.headers,
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`API请求失败: ${error.code} - ${error.msg}`);
    }

    const data = await response.json();
    return data.data as T;
  }

  /**
   * GET请求
   */
  async get<T>(path: string, params?: Record<string, any>): Promise<T> {
    const queryString = params ? `?${new URLSearchParams(params)}` : '';
    return this.request<T>(`${path}${queryString}`, { method: 'GET' });
  }

  /**
   * POST请求
   */
  async post<T>(path: string, body?: any): Promise<T> {
    return this.request<T>(path, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  /**
   * PUT请求
   */
  async put<T>(path: string, body?: any): Promise<T> {
    return this.request<T>(path, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  }

  /**
   * DELETE请求
   */
  async delete<T>(path: string): Promise<T> {
    return this.request<T>(path, { method: 'DELETE' });
  }

  /**
   * 上传文件
   */
  async uploadFile(
    file: File | Blob,
    fileName: string,
    parentType: 'file' | 'explorer' = 'file'
  ): Promise<any> {
    const token = await this.getAccessToken();

    // 先获取上传地址
    const uploadResp = await fetch(`${this.baseURL}/drive/v1/files/upload_all`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        file_name: fileName,
        parent_type: parentType,
        parent_node: 'root',
        size: file.size,
      }),
    });

    if (!uploadResp.ok) {
      throw new Error(`获取上传地址失败: ${uploadResp.statusText}`);
    }

    const uploadData = await uploadResp.json();

    // 上传文件
    const fileResp = await fetch(uploadData.data.upload_url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      body: file,
    });

    if (!fileResp.ok) {
      throw new Error(`文件上传失败: ${fileResp.statusText}`);
    }

    return uploadData.data;
  }
}

// 创建飞书客户端实例
let feishuClient: FeishuClient | null = null;

export function getFeishuClient(): FeishuClient {
  const appId = process.env.FEISHU_APP_ID;
  const appSecret = process.env.FEISHU_APP_SECRET;

  if (!appId || !appSecret) {
    throw new Error('飞书应用配置缺失，请检查环境变量 FEISHU_APP_ID 和 FEISHU_APP_SECRET');
  }

  if (!feishuClient) {
    feishuClient = new FeishuClient({
      appId,
      appSecret,
      encryptKey: process.env.FEISHU_ENCRYPT_KEY,
      verificationToken: process.env.FEISHU_VERIFICATION_TOKEN,
    });
  }

  return feishuClient;
}

/**
 * 检查飞书是否已配置
 */
export function isFeishuConfigured(): boolean {
  return !!(process.env.FEISHU_APP_ID && process.env.FEISHU_APP_SECRET);
}
