/**
 * API 客户端
 *
 * 封装 fetch 请求，自动注入 JWT，统一错误处理
 */

import { getAnonymousId } from '@/stores/userStore';

/**
 * API 响应类型
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
  code?: string;
}

/**
 * 请求配置
 */
interface RequestConfig extends RequestInit {
  skipAuth?: boolean;
}

/**
 * API 错误类
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public code?: string,
    public status?: number
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * API 基础 URL
 */
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '/api';

/**
 * 生成认证头
 */
function getAuthHeader(): Record<string, string> {
  const anonymousId = getAnonymousId();
  if (anonymousId) {
    return {
      'X-Anonymous-ID': anonymousId,
      'Content-Type': 'application/json',
    };
  }
  return {
    'Content-Type': 'application/json',
  };
}

/**
 * 处理响应
 */
async function handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
  const contentType = response.headers.get('content-type');

  if (!contentType?.includes('application/json')) {
    throw new ApiError(
      'Invalid response format',
      'INVALID_FORMAT',
      response.status
    );
  }

  const data = await response.json();

  if (!response.ok) {
    throw new ApiError(
      data.message || data.error || 'Request failed',
      data.code,
      response.status
    );
  }

  return data;
}

/**
 * GET 请求
 */
export async function get<T>(
  url: string,
  config: RequestConfig = {}
): Promise<ApiResponse<T>> {
  const headers = config.skipAuth
    ? config.headers || {}
    : { ...getAuthHeader(), ...(config.headers || {}) };

  const response = await fetch(`${API_BASE_URL}${url}`, {
    method: 'GET',
    headers,
    ...config,
  });

  return handleResponse<T>(response);
}

/**
 * POST 请求
 */
export async function post<T>(
  url: string,
  data?: any,
  config: RequestConfig = {}
): Promise<ApiResponse<T>> {
  const headers = config.skipAuth
    ? config.headers || {}
    : { ...getAuthHeader(), ...(config.headers || {}) };

  const response = await fetch(`${API_BASE_URL}${url}`, {
    method: 'POST',
    headers,
    body: data ? JSON.stringify(data) : undefined,
    ...config,
  });

  return handleResponse<T>(response);
}

/**
 * PUT 请求
 */
export async function put<T>(
  url: string,
  data?: any,
  config: RequestConfig = {}
): Promise<ApiResponse<T>> {
  const headers = config.skipAuth
    ? config.headers || {}
    : { ...getAuthHeader(), ...(config.headers || {}) };

  const response = await fetch(`${API_BASE_URL}${url}`, {
    method: 'PUT',
    headers,
    body: data ? JSON.stringify(data) : undefined,
    ...config,
  });

  return handleResponse<T>(response);
}

/**
 * DELETE 请求
 */
export async function del<T>(
  url: string,
  config: RequestConfig = {}
): Promise<ApiResponse<T>> {
  const headers = config.skipAuth
    ? config.headers || {}
    : { ...getAuthHeader(), ...(config.headers || {}) };

  const response = await fetch(`${API_BASE_URL}${url}`, {
    method: 'DELETE',
    headers,
    ...config,
  });

  return handleResponse<T>(response);
}

/**
 * PATCH 请求
 */
export async function patch<T>(
  url: string,
  data?: any,
  config: RequestConfig = {}
): Promise<ApiResponse<T>> {
  const headers = config.skipAuth
    ? config.headers || {}
    : { ...getAuthHeader(), ...(config.headers || {}) };

  const response = await fetch(`${API_BASE_URL}${url}`, {
    method: 'PATCH',
    headers,
    body: data ? JSON.stringify(data) : undefined,
    ...config,
  });

  return handleResponse<T>(response);
}

/**
 * 上传文件
 */
export async function upload<T>(
  url: string,
  file: File,
  onProgress?: (progress: number) => void
): Promise<ApiResponse<T>> {
  const formData = new FormData();
  formData.append('file', file);

  const anonymousId = getAnonymousId();
  const headers: Record<string, string> = {};

  if (anonymousId) {
    headers['X-Anonymous-ID'] = anonymousId;
  }

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    // 上传进度
    if (onProgress) {
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 100);
          onProgress(progress);
        }
      });
    }

    // 完成处理
    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const data = JSON.parse(xhr.responseText);
          resolve(data);
        } catch (error) {
          reject(new ApiError('Invalid response format'));
        }
      } else {
        reject(
          new ApiError(
            xhr.statusText || 'Upload failed',
            undefined,
            xhr.status
          )
        );
      }
    });

    // 错误处理
    xhr.addEventListener('error', () => {
      reject(new ApiError('Network error'));
    });

    xhr.open('POST', `${API_BASE_URL}${url}`);
    Object.entries(headers).forEach(([key, value]) => {
      xhr.setRequestHeader(key, value);
    });
    xhr.send(formData);
  });
}

/**
 * API 客户端对象
 */
export const apiClient = {
  get,
  post,
  put,
  delete: del,
  patch,
  upload,
};
