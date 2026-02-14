// hooks/useRealtimeQuotes.ts
/**
 * 实时行情WebSocket Hook
 */

import { useEffect, useState, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

export interface Quote {
  code: string;
  name: string;
  currentPrice: number;
  change: number;
  changePercent: number;
  volume: number;
  amount: number;
  timestamp: Date;
}

export function useRealtimeQuotes(codes: string[]) {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    // 连接WebSocket
    const socket = io('/api/socket', {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    socketRef.current = socket;

    // 连接成功
    socket.on('connect', () => {
      console.log('✅ WebSocket连接成功');
      setConnected(true);
      setError(null);
      
      // 订阅行情频道
      socket.emit('subscribe', codes.map(code => `quote:${code}`));
      socket.emit('subscribe', 'quotes');
    });

    // 接收行情更新
    socket.on('quote:update', (quote: Quote) => {
      setQuotes(prev => {
        const index = prev.findIndex(q => q.code === quote.code);
        if (index >= 0) {
          const updated = [...prev];
          updated[index] = { ...quote, timestamp: new Date(quote.timestamp) };
          return updated;
        }
        return [...prev, { ...quote, timestamp: new Date(quote.timestamp) }];
      });
    });

    // 接收批量行情更新
    socket.on('quotes:update', (newQuotes: Quote[]) => {
      setQuotes(newQuotes.map(q => ({ ...q, timestamp: new Date(q.timestamp) })));
    });

    // 连接断开
    socket.on('disconnect', (reason) => {
      console.log('❌ WebSocket断开:', reason);
      setConnected(false);
    });

    // 错误处理
    socket.on('connect_error', (err) => {
      console.error('❌ WebSocket连接错误:', err);
      setError(err.message);
      setConnected(false);
    });

    return () => {
      socket.disconnect();
    };
  }, [codes]);

  // 手动刷新行情
  const refreshQuotes = useCallback(async () => {
    try {
      const response = await fetch('/api/sync/quotes');
      const data = await response.json();
      
      if (data.success) {
        setQuotes(data.data);
      }
    } catch (err) {
      console.error('刷新行情失败:', err);
    }
  }, []);

  // 订阅新的代码
  const subscribe = useCallback((newCodes: string[]) => {
    if (socketRef.current && connected) {
      socketRef.current.emit('subscribe', newCodes.map(code => `quote:${code}`));
    }
  }, [connected]);

  // 取消订阅
  const unsubscribe = useCallback((removeCodes: string[]) => {
    if (socketRef.current && connected) {
      socketRef.current.emit('unsubscribe', removeCodes.map(code => `quote:${code}`));
    }
  }, [connected]);

  return {
    quotes,
    connected,
    error,
    refreshQuotes,
    subscribe,
    unsubscribe,
  };
}

// 使用示例：
/*
function QuotesTable() {
  const codes = ['508000', '508001', '508002'];
  const { quotes, connected, refreshQuotes } = useRealtimeQuotes(codes);

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <span className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`} />
        <span className="text-sm">
          {connected ? '已连接' : '未连接'}
        </span>
        <button onClick={refreshQuotes}>刷新</button>
      </div>
      
      <table>
        {quotes.map(quote => (
          <tr key={quote.code}>
            <td>{quote.code}</td>
            <td>{quote.currentPrice}</td>
            <td className={quote.changePercent >= 0 ? 'text-red-500' : 'text-green-500'}>
              {quote.changePercent.toFixed(2)}%
            </td>
          </tr>
        ))}
      </table>
    </div>
  );
}
*/
