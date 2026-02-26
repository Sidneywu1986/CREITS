'use client';

import { useState, useCallback } from 'react';
import { AES256, EncryptedData } from '@/lib/crypto/aes-256';

export interface UseCryptoState {
  encrypting: boolean;
  decrypting: boolean;
  error: string | null;
}

export function useCrypto() {
  const [state, setState] = useState<UseCryptoState>({
    encrypting: false,
    decrypting: false,
    error: null,
  });

  // 加密文本
  const encryptText = useCallback(
    async (plaintext: string, password: string): Promise<EncryptedData | null> => {
      setState((prev) => ({ ...prev, encrypting: true, error: null }));

      try {
        const result = AES256.encrypt(plaintext, password);
        setState((prev) => ({ ...prev, encrypting: false }));
        return result;
      } catch (error) {
        setState((prev) => ({
          ...prev,
          encrypting: false,
          error: error instanceof Error ? error.message : '加密失败',
        }));
        return null;
      }
    },
    []
  );

  // 解密文本
  const decryptText = useCallback(
    async (encryptedData: EncryptedData, password: string): Promise<string | null> => {
      setState((prev) => ({ ...prev, decrypting: true, error: null }));

      try {
        const result = AES256.decrypt(encryptedData, password);
        setState((prev) => ({ ...prev, decrypting: false }));
        return result;
      } catch (error) {
        setState((prev) => ({
          ...prev,
          decrypting: false,
          error: error instanceof Error ? error.message : '解密失败',
        }));
        return null;
      }
    },
    []
  );

  // 加密对象
  const encryptObject = useCallback(
    async (obj: any, password: string): Promise<EncryptedData | null> => {
      setState((prev) => ({ ...prev, encrypting: true, error: null }));

      try {
        const result = AES256.encryptObject(obj, password);
        setState((prev) => ({ ...prev, encrypting: false }));
        return result;
      } catch (error) {
        setState((prev) => ({
          ...prev,
          encrypting: false,
          error: error instanceof Error ? error.message : '加密失败',
        }));
        return null;
      }
    },
    []
  );

  // 解密对象
  const decryptObject = useCallback(
    async <T = any>(
      encryptedData: EncryptedData,
      password: string
    ): Promise<T | null> => {
      setState((prev) => ({ ...prev, decrypting: true, error: null }));

      try {
        const result = AES256.decryptObject<T>(encryptedData, password);
        setState((prev) => ({ ...prev, decrypting: false }));
        return result;
      } catch (error) {
        setState((prev) => ({
          ...prev,
          decrypting: false,
          error: error instanceof Error ? error.message : '解密失败',
        }));
        return null;
      }
    },
    []
  );

  // 生成随机密码
  const generatePassword = useCallback((length: number = 32): string => {
    return AES256.generatePassword(length);
  }, []);

  // 密码哈希
  const hashPassword = useCallback((password: string, salt?: string): string => {
    return AES256.hashPassword(password, salt);
  }, []);

  // 验证密码
  const verifyPassword = useCallback(
    (password: string, storedHash: string): boolean => {
      return AES256.verifyPassword(password, storedHash);
    },
    []
  );

  // 清除错误
  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  return {
    ...state,
    encryptText,
    decryptText,
    encryptObject,
    decryptObject,
    generatePassword,
    hashPassword,
    verifyPassword,
    clearError,
  };
}
