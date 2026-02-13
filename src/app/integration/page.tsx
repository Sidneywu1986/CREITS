'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bot, Zap, Webhook, ArrowRight, CheckCircle, AlertCircle, Code, Settings } from 'lucide-react';

export default function IntegrationPage() {
  const [sdkMessage, setSdkMessage] = useState('');
  const [botMessage, setBotMessage] = useState('');
  const [webhookMessage, setWebhookMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [origin, setOrigin] = useState('');

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const addLog = (log: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [`[${timestamp}] ${log}`, ...prev].slice(0, 20));
  };

  // 测试方案一：coze-coding-dev-sdk
  const testSdk = async () => {
    if (!sdkMessage.trim()) return;
    setLoading(true);
    addLog('测试方案一：coze-coding-dev-sdk');
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: sdkMessage }],
          agentId: 'policy',
        }),
      });

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let fullResponse = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value);
          const lines = chunk.split('\n\n');
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6));
                if (data.content) {
                  fullResponse += data.content;
                }
              } catch (e) {}
            }
          }
        }
      }

      addLog(`✓ SDK响应成功（${fullResponse.length}字符）`);
    } catch (error) {
      addLog(`✗ SDK请求失败: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  // 测试方案二：Bot API
  const testBot = async () => {
    if (!botMessage.trim()) return;
    setLoading(true);
    addLog('测试方案二：扣子Bot API');
    try {
      const response = await fetch('/api/bot/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          botKey: 'policy-bot',
          message: botMessage,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        addLog(`✓ Bot响应成功（${data.content.length}字符）`);
      } else {
        addLog(`✗ Bot请求失败: ${data.error}`);
      }
    } catch (error) {
      addLog(`✗ Bot请求失败: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  // 测试方案三：Webhook
  const testWebhook = async () => {
    if (!webhookMessage.trim()) return;
    setLoading(true);
    addLog('测试方案三：Webhook');
    try {
      const response = await fetch('/api/webhook/coze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'message',
          data: { message: webhookMessage },
        }),
      });

      if (response.ok) {
        addLog('✓ Webhook接收成功');
      } else {
        addLog('✗ Webhook接收失败');
      }
    } catch (error) {
      addLog(`✗ Webhook请求失败: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <div className="container mx-auto p-6">
        {/* 页面标题 */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-[#667eea] to-[#764ba2] bg-clip-text text-transparent">
            扣子平台集成指南
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            了解如何将REITs智能助手与扣子平台部署的智能体联动
          </p>
        </div>

        {/* 集成方式概览 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="border-2 border-blue-200 dark:border-blue-900 hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between mb-2">
                <Badge className="bg-blue-500">推荐</Badge>
                <Zap className="w-6 h-6 text-blue-500" />
              </div>
              <CardTitle>方案一</CardTitle>
              <CardDescription>coze-coding-dev-sdk</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  无需额外配置
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  支持流式输出
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  已在项目中实现
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-2 border-purple-200 dark:border-purple-900 hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between mb-2">
                <Badge className="bg-purple-500">API调用</Badge>
                <Bot className="w-6 h-6 text-purple-500" />
              </div>
              <CardTitle>方案二</CardTitle>
              <CardDescription>扣子Bot API</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  调用独立Bot
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  需要配置Bot ID
                </li>
                <li className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-yellow-500" />
                  不支持流式
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-2 border-green-200 dark:border-green-900 hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between mb-2">
                <Badge className="bg-green-500">推送</Badge>
                <Webhook className="w-6 h-6 text-green-500" />
              </div>
              <CardTitle>方案三</CardTitle>
              <CardDescription>Webhook</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  主动推送消息
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  事件驱动
                </li>
                <li className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-yellow-500" />
                  需要内网穿透
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* 测试界面 */}
        <Tabs defaultValue="sdk" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="sdk">方案一：SDK</TabsTrigger>
            <TabsTrigger value="bot">方案二：Bot API</TabsTrigger>
            <TabsTrigger value="webhook">方案三：Webhook</TabsTrigger>
          </TabsList>

          {/* 方案一：SDK */}
          <TabsContent value="sdk">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-blue-500" />
                  coze-coding-dev-sdk 测试
                </CardTitle>
                <CardDescription>
                  直接调用SDK，无需额外配置
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="输入测试消息..."
                    value={sdkMessage}
                    onChange={(e) => setSdkMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && testSdk()}
                  />
                  <Button onClick={testSdk} disabled={loading}>
                    <ArrowRight className="w-4 h-4 mr-2" />
                    发送
                  </Button>
                </div>
                <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Code className="w-4 h-4" />
                    代码示例
                  </h4>
                  <pre className="text-sm overflow-x-auto">
                    <code>{`const client = new LLMClient(config);
const stream = client.stream(messages, {
  temperature: 0.7
});

for await (const chunk of stream) {
  if (chunk.content) {
    process.stdout.write(chunk.content);
  }
}`}</code>
                  </pre>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 方案二：Bot API */}
          <TabsContent value="bot">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bot className="w-5 h-5 text-purple-500" />
                  扣子Bot API 测试
                </CardTitle>
                <CardDescription>
                  需要配置Bot ID和API Token
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="输入测试消息..."
                    value={botMessage}
                    onChange={(e) => setBotMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && testBot()}
                  />
                  <Button onClick={testBot} disabled={loading}>
                    <ArrowRight className="w-4 h-4 mr-2" />
                    发送
                  </Button>
                </div>
                <div className="bg-amber-50 dark:bg-amber-950 p-4 rounded-lg border border-amber-200 dark:border-amber-800">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Settings className="w-4 h-4" />
                    配置要求
                  </h4>
                  <ul className="text-sm space-y-1">
                    <li>1. 在.env.local中配置Bot ID和Token</li>
                    <li>2. 环境变量格式：COZE_POLICY_BOT_ID=xxx</li>
                    <li>3. 环境变量格式：COZE_POLICY_BOT_TOKEN=xxx</li>
                  </ul>
                </div>
                <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Code className="w-4 h-4" />
                    代码示例
                  </h4>
                  <pre className="text-sm overflow-x-auto">
                    <code>{`await callCozeBot('policy-bot', '消息');
// Bot配置：
// COZE_POLICY_BOT_ID=7384xxxxx
// COZE_POLICY_BOT_TOKEN=pat_xxxx`}</code>
                  </pre>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 方案三：Webhook */}
          <TabsContent value="webhook">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Webhook className="w-5 h-5 text-green-500" />
                  Webhook 测试
                </CardTitle>
                <CardDescription>
                  接收扣子平台的主动推送
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="输入测试消息..."
                    value={webhookMessage}
                    onChange={(e) => setWebhookMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && testWebhook()}
                  />
                  <Button onClick={testWebhook} disabled={loading}>
                    <ArrowRight className="w-4 h-4 mr-2" />
                    发送
                  </Button>
                </div>
                <div className="bg-amber-50 dark:bg-amber-950 p-4 rounded-lg border border-amber-200 dark:border-amber-800">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Settings className="w-4 h-4" />
                    配置要求
                  </h4>
                  <ul className="text-sm space-y-1">
                    <li>1. 本地开发需使用ngrok等内网穿透工具</li>
                    <li>2. Webhook地址：{origin}/api/webhook/coze</li>
                    <li>3. 在扣子平台Bot设置中配置Webhook</li>
                  </ul>
                </div>
                <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Code className="w-4 h-4" />
                    代码示例
                  </h4>
                  <pre className="text-sm overflow-x-auto">
                    <code>{`// Webhook端点
POST /api/webhook/coze
{
  "type": "message",
  "data": { "message": "xxx" }
}`}</code>
                  </pre>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* 日志 */}
        {logs.length > 0 && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="w-5 h-5 text-slate-500" />
                操作日志
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-slate-950 text-green-400 p-4 rounded-lg font-mono text-sm space-y-1 max-h-64 overflow-y-auto">
                {logs.map((log, index) => (
                  <div key={index}>{log}</div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* 文档链接 */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-slate-500" />
              详细文档
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              查看完整的集成指南和API文档：
            </p>
            <div className="flex gap-4">
              <Button variant="outline" onClick={() => window.open('/docs/COZE_INTEGRATION.md', '_blank')}>
                <ArrowRight className="w-4 h-4 mr-2" />
                查看集成文档
              </Button>
              <Button variant="outline" onClick={() => window.open('/chat/policy', '_blank')}>
                <ArrowRight className="w-4 h-4 mr-2" />
                体验对话功能
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function BookOpen({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </svg>
  );
}
