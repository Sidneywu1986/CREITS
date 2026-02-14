import { useRouter } from 'next/router';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowRight, Bot, Send, User, Loader2 } from 'lucide-react';
import { AGENTS } from '@/types';
import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';

export default function ChatPage() {
  const router = useRouter();
  const { id: agentId } = router.query;
  const agent = AGENTS.find(a => a.id === agentId);

  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const initializedRef = useRef(false);

  // 初始化问候语
  useEffect(() => {
    if (agent && !initializedRef.current) {
      setMessages([
        { role: 'assistant', content: agent.greeting },
      ]);
      initializedRef.current = true;
    }
  }, [agent]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setLoading(true);

    setMessages([...messages, { role: 'user', content: userMessage }]);

    // 模拟AI回复
    setTimeout(() => {
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: '感谢您的提问，我正在为您分析...' },
      ]);
      setLoading(false);
    }, 1000);
  };

  if (!agent) {
    return (
      <div className="container mx-auto px-6 py-8">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">加载中或未找到对应的Agent</p>
            <Link href="/agents">
              <Button className="mx-auto mt-4">返回Agent列表</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="mb-6 flex items-center">
        <Link href="/agents">
          <Button variant="ghost" size="sm" className="mr-4">
            <ArrowRight className="mr-2 h-4 w-4 rotate-180" />
            返回
          </Button>
        </Link>
        <h1 className="text-3xl font-bold flex items-center">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center text-2xl mr-3"
            style={{ backgroundColor: agent.color + '20', border: '2px solid ' + agent.color }}
          >
            {agent.icon}
          </div>
          {agent.name}
        </h1>
      </div>

      <div className="max-w-4xl mx-auto">
        <Card className="h-[70vh] flex flex-col">
          <CardHeader className="border-b">
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center">
                <Bot className="w-5 h-5 mr-2 text-[#667eea]" />
                对话
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-hidden p-0">
            <div className="h-full flex flex-col">
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {message.role === 'assistant' && (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#667eea] to-[#764ba2] flex items-center justify-center flex-shrink-0">
                        <Bot className="w-4 h-4 text-white" />
                      </div>
                    )}
                    <div
                      className={`max-w-[70%] rounded-lg px-4 py-2 ${
                        message.role === 'user'
                          ? 'bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white'
                          : 'bg-gray-100 dark:bg-gray-800'
                      }`}
                    >
                      {message.content}
                    </div>
                    {message.role === 'user' && (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#667eea] to-[#764ba2] flex items-center justify-center flex-shrink-0">
                        <User className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </div>
                ))}
                {loading && (
                  <div className="flex gap-3 justify-start">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#667eea] to-[#764ba2] flex items-center justify-center">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                    <div className="bg-gray-100 dark:bg-gray-800 rounded-lg px-4 py-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                    </div>
                  </div>
                )}
              </div>
              <div className="border-t p-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="输入您的问题..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                    disabled={loading}
                  />
                  <Button onClick={handleSend} disabled={loading || !input.trim()}>
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export const metadata = {
  title: 'AI对话 - REITs 智能助手',
  description: '与AI Agent进行对话',
};
