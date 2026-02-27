'use client';

import { useState, useRef, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AGENTS } from '@/types';
import { ArrowLeft, Send, Paperclip, Bot, User, Copy, ThumbsUp, ThumbsDown } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function ChatPage() {
  const params = useParams();
  const router = useRouter();
  const agentId = params?.id as string;

  const agent = AGENTS.find((a) => a.id === agentId);

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentAssistantMessage, setCurrentAssistantMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isStreamingRef = useRef(false);

  // Scroll to bottom
  const scrollToBottom = (smooth = false) => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({
        behavior: smooth ? 'smooth' : 'auto',
        block: 'end',
      });
    }
  };

  // 消息列表变化时平滑滚动
  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom(true);
    }
  }, [messages]);

  // 流式输出时即时滚动（无动画，避免抖动）
  useEffect(() => {
    if (currentAssistantMessage) {
      isStreamingRef.current = true;
      scrollToBottom(false); // auto模式，无动画
    } else if (isStreamingRef.current) {
      // 流式输出结束，恢复标记
      isStreamingRef.current = false;
    }
  }, [currentAssistantMessage]);

  // Initialize with welcome message
  useEffect(() => {
    if (agent) {
      setMessages([
        {
          id: '1',
          role: 'assistant',
          content: `你好！我是 ${agent.name}。${agent.description}\n\n有什么我可以帮助您的吗？`,
          timestamp: new Date(),
        },
      ]);
    }
  }, [agent]);

  const handleSend = async () => {
    if (!input.trim() || isLoading || !agent) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    // 更新消息列表
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setCurrentAssistantMessage('');

    try {
      // 构建发送给API的消息数组（包含当前用户消息）
      const messagesToSend = [
        ...messages.map((m) => ({ role: m.role, content: m.content })),
        { role: 'user', content: input },
      ];

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: messagesToSend,
          agentId: agent.id,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (reader) {
        let fullContent = '';

        while (true) {
          const { done, value } = await reader.read();

          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);

              if (data === '[DONE]') {
                continue;
              }

              try {
                const parsed = JSON.parse(data);

                if (parsed.error) {
                  throw new Error(parsed.error);
                }

                if (parsed.content) {
                  fullContent += parsed.content;
                  setCurrentAssistantMessage(fullContent);
                }
              } catch (e) {
                console.error('Failed to parse SSE data:', e);
              }
            }
          }
        }

        if (fullContent) {
          const assistantMessage: Message = {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: fullContent,
            timestamp: new Date(),
          };
          setMessages((prev) => [...prev, assistantMessage]);
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: '抱歉，发送消息时出现错误。请稍后重试。',
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
      setCurrentAssistantMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content);
  };

  if (!agent) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Agent 不存在</h1>
          <Button onClick={() => router.push('/agents')}>返回 Agent 列表</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col">
      {/* Header */}
      <header className="h-16 border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50 dark:bg-gray-900/80 flex-shrink-0">
        <div className="container mx-auto px-4 h-full flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="sm" onClick={() => router.push('/')}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="w-10 h-10 rounded-lg flex items-center justify-center text-2xl" style={{ backgroundColor: `${agent.color}20`, border: `2px solid ${agent.color}` }}>
              {agent.icon}
            </div>
            <div>
              <h1 className="text-xl font-bold">{agent.name}</h1>
              <p className="text-xs text-muted-foreground">{agent.description}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              历史
            </Button>
            <Button variant="outline" size="sm">
              设置
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 container mx-auto px-4 flex flex-col" style={{ height: 'calc(100vh - 4rem)' }}>
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto">
          <div className="space-y-4 px-4 py-6">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <Card className={`max-w-[80%] ${message.role === 'user' ? 'bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white' : 'bg-white dark:bg-gray-800'}`}>
                  <div className="flex items-start space-x-3 p-4">
                    <div className="flex-shrink-0">
                      {message.role === 'assistant' ? (
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-lg" style={{ backgroundColor: `${agent.color}20` }}>
                          {agent.icon}
                        </div>
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#667eea] to-[#764ba2] flex items-center justify-center">
                          <User className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className={`text-sm ${message.role === 'user' ? 'text-white/90' : 'text-muted-foreground'} mb-1`}>
                        {message.role === 'assistant' ? agent.name : '你'}
                      </div>
                      <div className={`text-sm ${message.role === 'user' ? 'text-white' : 'text-foreground'} whitespace-pre-wrap break-words`}>
                        {message.content}
                      </div>
                      {message.role === 'assistant' && (
                        <div className="flex items-center space-x-2 mt-3">
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => handleCopy(message.content)}>
                            <Copy className="h-3 w-3" />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <ThumbsUp className="h-3 w-3" />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <ThumbsDown className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              </div>
            ))}
            {isLoading && currentAssistantMessage && (
              <div className="flex justify-start">
                <Card className="max-w-[80%] bg-white dark:bg-gray-800">
                  <div className="flex items-start space-x-3 p-4">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-lg" style={{ backgroundColor: `${agent.color}20` }}>
                      {agent.icon}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm text-muted-foreground mb-1">{agent.name}</div>
                      <div className="text-sm text-foreground whitespace-pre-wrap">
                        {currentAssistantMessage}
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            )}
            {isLoading && !currentAssistantMessage && (
              <div className="flex justify-start">
                <Card className="max-w-[80%] bg-white dark:bg-gray-800">
                  <div className="flex items-start space-x-3 p-4">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-lg" style={{ backgroundColor: `${agent.color}20` }}>
                      {agent.icon}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm text-muted-foreground mb-1">{agent.name}</div>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Fixed Input Area at Bottom */}
        <div className="border-t bg-white dark:bg-gray-900 p-4 flex-shrink-0">
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="icon" className="flex-shrink-0">
              <Paperclip className="h-5 w-5" />
            </Button>
            <Input
              placeholder="输入您的问题..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isLoading}
              className="flex-1"
            />
            <Button
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              className="flex-shrink-0 bg-gradient-to-r from-[#667eea] to-[#764ba2] hover:opacity-90"
            >
              <Send className="h-5 w-5" />
            </Button>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={() => setInput('请解读最新的REITs政策')} className="text-xs">
              请解读最新的REITs政策
            </Button>
            <Button variant="outline" size="sm" onClick={() => setInput('REITs发行需要哪些条件？')} className="text-xs">
              REITs发行需要哪些条件？
            </Button>
            <Button variant="outline" size="sm" onClick={() => setInput('如何进行尽职调查？')} className="text-xs">
              如何进行尽职调查？
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
