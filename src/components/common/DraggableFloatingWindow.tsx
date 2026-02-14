'use client';

import { useState, useRef, useEffect, ReactNode } from 'react';
import { X, Maximize2, Minimize2, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DraggableFloatingWindowProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  initialPosition?: { x: number; y: number };
  initialSize?: { width: number; height: number };
  minSize?: { width: number; height: number };
  maxSize?: { width: number; height: number };
}

export default function DraggableFloatingWindow({
  isOpen,
  onClose,
  title,
  children,
  initialPosition = { x: 100, y: 100 },
  initialSize = { width: 600, height: 500 },
  minSize = { width: 400, height: 400 },
  maxSize = { width: window.innerWidth - 50, height: window.innerHeight - 50 },
}: DraggableFloatingWindowProps) {
  const [position, setPosition] = useState(initialPosition);
  const [size, setSize] = useState(initialSize);
  const [isMaximized, setIsMaximized] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeDirection, setResizeDirection] = useState<'se' | 'sw' | 'ne' | 'nw' | 'e' | 's' | 'w' | 'n' | null>(null);

  const windowRef = useRef<HTMLDivElement>(null);
  const dragOffset = useRef({ x: 0, y: 0 });
  const resizeStart = useRef({ x: 0, y: 0, width: 0, height: 0, posX: 0, posY: 0 });

  // 窗口拖拽
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.target instanceof HTMLElement && (e.target as HTMLElement).closest('.no-drag')) {
      return;
    }

    setIsDragging(true);
    dragOffset.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    };
  };

  // 窗口大小调整
  const handleResizeMouseDown = (
    e: React.MouseEvent,
    direction: 'se' | 'sw' | 'ne' | 'nw' | 'e' | 's' | 'w' | 'n'
  ) => {
    e.stopPropagation();
    setIsResizing(true);
    setResizeDirection(direction);
    resizeStart.current = {
      x: e.clientX,
      y: e.clientY,
      width: size.width,
      height: size.height,
      posX: position.x,
      posY: position.y,
    };
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        let newX = e.clientX - dragOffset.current.x;
        let newY = e.clientY - dragOffset.current.y;

        // 边界限制
        newX = Math.max(0, Math.min(newX, window.innerWidth - 50));
        newY = Math.max(0, Math.min(newY, window.innerHeight - 50));

        setPosition({ x: newX, y: newY });
      } else if (isResizing && resizeDirection) {
        const deltaX = e.clientX - resizeStart.current.x;
        const deltaY = e.clientY - resizeStart.current.y;

        let newWidth = resizeStart.current.width;
        let newHeight = resizeStart.current.height;
        let newX = resizeStart.current.posX;
        let newY = resizeStart.current.posY;

        // 根据调整方向计算新尺寸和位置
        if (resizeDirection.includes('e')) {
          newWidth = Math.max(minSize.width, Math.min(resizeStart.current.width + deltaX, maxSize.width));
        }
        if (resizeDirection.includes('w')) {
          const newWidthCalc = Math.max(minSize.width, Math.min(resizeStart.current.width - deltaX, maxSize.width));
          newWidth = newWidthCalc;
          newX = resizeStart.current.posX + (resizeStart.current.width - newWidth);
        }
        if (resizeDirection.includes('s')) {
          newHeight = Math.max(minSize.height, Math.min(resizeStart.current.height + deltaY, maxSize.height));
        }
        if (resizeDirection.includes('n')) {
          const newHeightCalc = Math.max(minSize.height, Math.min(resizeStart.current.height - deltaY, maxSize.height));
          newHeight = newHeightCalc;
          newY = resizeStart.current.posY + (resizeStart.current.height - newHeight);
        }

        // 边界限制
        newX = Math.max(0, Math.min(newX, window.innerWidth - 50));
        newY = Math.max(0, Math.min(newY, window.innerHeight - 50));

        setSize({ width: newWidth, height: newHeight });
        setPosition({ x: newX, y: newY });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(false);
      setResizeDirection(null);
    };

    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = 'none';
      document.body.style.cursor = isResizing ? 'nwse-resize' : 'move';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
    };
  }, [isDragging, isResizing, resizeDirection, position, size, minSize, maxSize]);

  // 最大化/还原
  const toggleMaximize = () => {
    if (isMaximized) {
      setSize(initialSize);
      setPosition(initialPosition);
    } else {
      setSize({
        width: window.innerWidth - 40,
        height: window.innerHeight - 40,
      });
      setPosition({ x: 20, y: 20 });
    }
    setIsMaximized(!isMaximized);
  };

  // 计算调整大小手柄的样式
  const getResizeHandleStyle = (direction: string) => {
    const baseStyle = 'absolute bg-transparent hover:bg-blue-500/30';
    const styles: Record<string, string> = {
      se: 'bottom-0 right-0 w-4 h-4 cursor-se-resize',
      sw: 'bottom-0 left-0 w-4 h-4 cursor-sw-resize',
      ne: 'top-0 right-0 w-4 h-4 cursor-ne-resize',
      nw: 'top-0 left-0 w-4 h-4 cursor-nw-resize',
      e: 'top-0 right-0 w-2 h-full cursor-e-resize',
      w: 'top-0 left-0 w-2 h-full cursor-w-resize',
      s: 'bottom-0 left-0 w-full h-2 cursor-s-resize',
      n: 'top-0 left-0 w-full h-2 cursor-n-resize',
    };
    return `${baseStyle} ${styles[direction]}`;
  };

  if (!isOpen) return null;

  return (
    <div
      ref={windowRef}
      className="fixed shadow-2xl rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 overflow-hidden z-[9999]"
      style={{
        left: position.x,
        top: position.y,
        width: size.width,
        height: size.height,
        minWidth: minSize.width,
        minHeight: minSize.height,
        maxWidth: maxSize.width,
        maxHeight: maxSize.height,
      }}
    >
      {/* 窗口标题栏 */}
      <div
        className="h-10 bg-gradient-to-r from-[#667eea] to-[#764ba2] flex items-center justify-between px-4 cursor-move select-none"
        onMouseDown={handleMouseDown}
      >
        <div className="flex items-center gap-2">
          <GripVertical className="w-4 h-4 text-white/70" />
          <span className="text-white font-medium text-sm">{title}</span>
        </div>
        <div className="flex items-center gap-1 no-drag">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-white hover:bg-white/20"
            onClick={toggleMaximize}
          >
            {isMaximized ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-white hover:bg-white/20"
            onClick={onClose}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* 窗口内容区域 */}
      <div
        className="no-drag"
        style={{
          height: 'calc(100% - 40px)',
          overflow: 'auto',
        }}
      >
        {children}
      </div>

      {/* 调整大小手柄 */}
      {!isMaximized && (
        <>
          <div
            className={getResizeHandleStyle('se')}
            onMouseDown={(e) => handleResizeMouseDown(e, 'se')}
          />
          <div
            className={getResizeHandleStyle('sw')}
            onMouseDown={(e) => handleResizeMouseDown(e, 'sw')}
          />
          <div
            className={getResizeHandleStyle('ne')}
            onMouseDown={(e) => handleResizeMouseDown(e, 'ne')}
          />
          <div
            className={getResizeHandleStyle('nw')}
            onMouseDown={(e) => handleResizeMouseDown(e, 'nw')}
          />
          <div
            className={getResizeHandleStyle('e')}
            onMouseDown={(e) => handleResizeMouseDown(e, 'e')}
          />
          <div
            className={getResizeHandleStyle('w')}
            onMouseDown={(e) => handleResizeMouseDown(e, 'w')}
          />
          <div
            className={getResizeHandleStyle('s')}
            onMouseDown={(e) => handleResizeMouseDown(e, 's')}
          />
          <div
            className={getResizeHandleStyle('n')}
            onMouseDown={(e) => handleResizeMouseDown(e, 'n')}
          />
        </>
      )}
    </div>
  );
}
