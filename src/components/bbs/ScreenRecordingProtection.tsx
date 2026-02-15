/**
 * 屏幕录制保护组件
 * 防止截屏和录屏的辅助组件
 */

'use client';

import React, { useEffect, useState, useRef } from 'react';
import { AlertTriangle, Eye, Shield } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface ScreenRecordingProtectionProps {
  enabled?: boolean;
  userId?: string;
  onScreenCaptureDetected?: () => void;
}

export default function ScreenRecordingProtection({
  enabled = true,
  userId,
  onScreenCaptureDetected,
}: ScreenRecordingProtectionProps) {
  const [showWarning, setShowWarning] = useState(false);
  const [blurContent, setBlurContent] = useState(false);
  const warningTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!enabled) return;

    // 监听常见的截屏快捷键
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      const ctrlKey = e.ctrlKey;
      const altKey = e.altKey;
      const shiftKey = e.shiftKey;
      const metaKey = e.metaKey;

      // Windows截屏快捷键
      const isPrintScreen = key === 'printscreen';
      const isWindowsScreenCapture =
        (ctrlKey && shiftKey && key === 's') || // Ctrl+Shift+S (Windows截屏工具)
        (metaKey && shiftKey && key === 's') || // Cmd+Shift+S (Mac截屏)
        (metaKey && shiftKey && key === '4') || // Cmd+Shift+4 (Mac选区截屏)
        (metaKey && shiftKey && key === '5') || // Cmd+Shift+5 (Mac截屏工具)
        (metaKey && shiftKey && key === '3'); // Cmd+Shift+3 (Mac全屏截屏)

      // 浏览器开发者工具快捷键
      const isDevTools =
        (ctrlKey && shiftKey && key === 'i') || // Ctrl+Shift+I
        (ctrlKey && shiftKey && key === 'j') || // Ctrl+Shift+J
        (ctrlKey && shiftKey && key === 'c') || // Ctrl+Shift+C
        (metaKey && altKey && key === 'i') || // Cmd+Option+I
        (metaKey && altKey && key === 'j') || // Cmd+Option+J
        (metaKey && altKey && key === 'c') || // Cmd+Option+C
        key === 'f12'; // F12

      if (isPrintScreen || isWindowsScreenCapture || isDevTools) {
        e.preventDefault();
        handleScreenCaptureDetected();
      }
    };

    // 监听复制快捷键（防止直接复制敏感内容）
    const handleCopy = (e: ClipboardEvent) => {
      const selection = window.getSelection();
      if (selection && selection.toString().length > 50) {
        e.preventDefault();
        handleScreenCaptureDetected('内容复制被阻止');
      }
    };

    // 添加事件监听器
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('copy', handleCopy);

    // 页面失去焦点检测
    const handleBlur = () => {
      // 设置定时器，如果页面长时间失去焦点，可能正在进行录屏
      if (warningTimeoutRef.current) {
        clearTimeout(warningTimeoutRef.current);
      }
      warningTimeoutRef.current = setTimeout(() => {
        handleScreenCaptureDetected('检测到页面长时间失去焦点，可能正在进行录屏');
      }, 5000); // 5秒后警告
    };

    const handleFocus = () => {
      if (warningTimeoutRef.current) {
        clearTimeout(warningTimeoutRef.current);
        warningTimeoutRef.current = null;
      }
    };

    window.addEventListener('blur', handleBlur);
    window.addEventListener('focus', handleFocus);

    // 检测是否在录屏（浏览器API）
    const checkScreenRecording = async () => {
      try {
        // 尝试获取屏幕录制权限（如果用户已经授权）
        const stream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
        });
        
        // 如果成功获取，说明可能在录屏
        stream.getTracks().forEach(track => track.stop());
        handleScreenCaptureDetected('检测到屏幕录制活动');
      } catch (err) {
        // 没有录屏权限，正常情况
      }
    };

    // 定期检查
    const checkInterval = setInterval(checkScreenRecording, 30000); // 每30秒检查一次

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('copy', handleCopy);
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('focus', handleFocus);
      if (warningTimeoutRef.current) {
        clearTimeout(warningTimeoutRef.current);
      }
      clearInterval(checkInterval);
    };
  }, [enabled]);

  const handleScreenCaptureDetected = (message = '检测到截屏行为') => {
    // 显示警告
    setShowWarning(true);

    // 模糊内容
    setBlurContent(true);

    // 调用回调函数
    onScreenCaptureDetected?.();

    // 3秒后清除警告
    setTimeout(() => {
      setShowWarning(false);
      setBlurContent(false);
    }, 3000);
  };

  if (!enabled) return null;

  return (
    <>
      {/* 动态水印 */}
      <div
        className="fixed inset-0 pointer-events-none z-[9999] opacity-5 overflow-hidden"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3E%3Ctext x='50%25' y='50%25' font-size='14' fill='%2300ff00' text-anchor='middle' transform='rotate(-30 50 50)'%3EANONYMOUS - ${userId || 'USER'} - ${new Date().toLocaleString()}%3C/text%3E%3C/svg%3E")`,
          backgroundSize: '200px 200px',
        }}
      />

      {/* 内容模糊遮罩 */}
      {blurContent && (
        <div className="fixed inset-0 z-[9998] bg-black/80 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-black/95 border-2 border-green-500/30 rounded-lg p-8 max-w-md text-center">
            <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
            <h3 className="text-green-400 font-mono text-lg font-semibold mb-2">
              检测到可能的截屏行为
            </h3>
            <p className="text-green-600/70 text-sm mb-4">
              为了保护隐私，内容已暂时隐藏。截屏和录屏行为可能违反隐私协议。
            </p>
            <p className="text-green-600/50 text-xs">
              请在安全的环境中使用匿名BBS
            </p>
          </div>
        </div>
      )}

      {/* 警告对话框 */}
      <Dialog open={showWarning} onOpenChange={setShowWarning}>
        <DialogContent className="bg-black/95 border-green-500/30">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-yellow-500/10 flex items-center justify-center border border-yellow-500/30">
                <Eye className="w-5 h-5 text-yellow-500" />
              </div>
              <DialogTitle className="text-yellow-500 font-mono text-lg">
                隐私警告
              </DialogTitle>
            </div>
            <DialogDescription className="text-green-600/70">
              <div className="space-y-3">
                <p className="text-sm">
                  检测到可能的截屏或录屏行为。匿名BBS强调隐私保护，请遵守以下规则：
                </p>
                <ul className="text-xs space-y-2 text-green-600/60 list-disc list-inside">
                  <li>禁止截屏、录屏或复制敏感内容</li>
                  <li>所有数据仅存在于内存中，关闭浏览器后自动删除</li>
                  <li>违反隐私保护可能导致内容隐藏</li>
                  <li>请在安全的环境中使用匿名BBS</li>
                </ul>
              </div>
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center">
            <Button
              onClick={() => setShowWarning(false)}
              className="bg-green-600 hover:bg-green-700 text-black font-mono text-sm"
            >
              <Shield className="w-4 h-4 mr-2" />
              我理解了
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
