'use client';

import { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AGENTS } from '@/types';
import Link from 'next/link';
import { 
  ArrowLeft, 
  ArrowRight, 
  Sparkles, 
  Bot, 
  FileText, 
  Upload, 
  File, 
  X,
  Loader2,
  Play,
  Send,
  User,
  CheckCircle,
  Copy,
} from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export default function AgentsPage() {
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [documentUrl, setDocumentUrl] = useState('');
  const [writeBack, setWriteBack] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [documentId, setDocumentId] = useState('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [documentText, setDocumentText] = useState('');
  const [showAnalysisModal, setShowAnalysisModal] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const addLog = (log: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [`[${timestamp}] ${log}`, ...prev].slice(0, 20));
  };

  const extractDocumentId = (url: string): string => {
    const match = url.match(/doc\/([a-zA-Z0-9_-]+)/);
    return match ? match[1] : url;
  };

  const handleFileUpload = async (file: File) => {
    setUploading(true);
    setUploadedFile(file);
    addLog('开始上传文件: ' + file.name);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/feishu/document/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        setDocumentUrl('https://feishu.cn/doc/' + data.documentId);
        setDocumentId(data.documentId);
        addLog('文件上传成功');
        addLog('文档ID: ' + data.documentId);
        setUploadError(null);
      } else {
        addLog('文件上传失败: ' + data.error);
        setUploadedFile(null);
        setUploadError(data.error);
        // 如果是权限错误，也打印到控制台便于调试
        if (data.error.includes('99991672') || data.error.includes('权限')) {
          console.error('飞书应用权限不足，错误代码: 99991672');
        }
      }
    } catch (error) {
      addLog('上传失败: ' + error);
      setUploadedFile(null);
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleAnalyze = async () => {
    if (!documentId || !selectedAgent) {
      addLog('请先上传文件并选择Agent');
      return;
    }

    setLoading(true);
    setAnalysisResult(null);
    setMessages([]);
    addLog('开始文档分析流程...');

    try {
      const agent = AGENTS.find(a => a.id === selectedAgent);
      addLog('使用Agent: ' + (agent?.name || ''));

      addLog('正在读取文档内容...');
      const response = await fetch('/api/feishu/document/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          documentId: documentId,
          agentId: selectedAgent,
          writeBack,
        }),
      });

      const data = await response.json();

      if (data.success) {
        addLog('文档读取成功，内容长度: ' + data.documentTextLength + ' 字符');
        addLog('分析完成！');

        setAnalysisResult(data);
        setDocumentText(data.documentText || '');

        setMessages([
          {
            role: 'assistant',
            content: '文档分析已完成！' + data.analysisResult.substring(0, 500) + '...' + '您可以问我任何关于这份文档的问题。',
            timestamp: new Date().toISOString(),
          },
        ]);
      } else {
        addLog('分析失败: ' + data.error);
      }
    } catch (error) {
      addLog('请求失败: ' + error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || chatLoading) return;

    const userMessage = inputMessage.trim();
    setInputMessage('');
    setChatLoading(true);

    const newMessages = [
      ...messages,
      {
        role: 'user' as const,
        content: userMessage,
        timestamp: new Date().toISOString(),
      },
    ];
    setMessages(newMessages);

    try {
      const response = await fetch('/api/feishu/document/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          documentId,
          documentText,
          analysisResult: analysisResult?.analysisResult || '',
          agentId: selectedAgent,
          message: userMessage,
          conversationHistory: messages.map(m => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      const data = await response.json();

      if (data.success) {
        setMessages([
          ...newMessages,
          {
            role: 'assistant',
            content: data.data.message,
            timestamp: new Date().toISOString(),
          },
        ]);
      }
    } catch (error) {
      console.error('发送消息失败:', error);
    } finally {
      setChatLoading(false);
    }
  };

  const clearUpload = () => {
    setUploadedFile(null);
    setDocumentUrl('');
    setDocumentId('');
    addLog('已清除上传的文件');
  };

  const openAnalysisModal = (agentId: string) => {
    setSelectedAgent(agentId);
    setShowAnalysisModal(true);
    const agentName = AGENTS.find(a => a.id === agentId)?.name;
    setLogs(['已选择Agent: ' + agentName]);
  };

  return (
    <MainLayout>
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center">
          <Link href="/">
            <Button variant="ghost" size="sm" className="mr-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              返回
            </Button>
          </Link>
          <h1 className="text-3xl font-bold flex items-center">
            <Bot className="mr-3 text-[#667eea]" />
            Agent 服务中心
          </h1>
        </div>
      </div>

      <div className="mb-8">
        <div className="rounded-2xl bg-gradient-to-r from-[#667eea] to-[#764ba2] p-6 text-white shadow-lg">
          <h2 className="text-2xl font-bold mb-2 flex items-center">
            <Sparkles className="mr-2" />
            智能Agent + 文档分析
          </h2>
          <p className="opacity-90">
            选择专业Agent进行对话，或上传文档让Agent进行分析。每个Agent都专注于特定领域，为您提供专业、精准的服务。
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {AGENTS.map((agent) => (
          <Card
            key={agent.id}
            className="h-full hover:shadow-2xl transition-all duration-300 border-2 hover:border-[#667eea] group"
          >
            <CardHeader>
              <div className="flex items-center justify-between mb-3">
                <div
                  className="w-14 h-14 rounded-xl flex items-center justify-center text-3xl shadow-md"
                  style={{ backgroundColor: agent.color + '20', border: '2px solid ' + agent.color }}
                >
                  {agent.icon}
                </div>
                <Badge
                  className="font-medium"
                  style={{
                    backgroundColor: agent.color + '20',
                    color: agent.color,
                    border: '1px solid ' + agent.color,
                  }}
                >
                  专业 Agent
                </Badge>
              </div>
              <CardTitle className="text-xl">{agent.name}</CardTitle>
              <CardDescription className="text-base">{agent.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex space-x-2">
                  <Link href={'/chat/' + agent.id} className="flex-1">
                    <Button 
                      variant="default" 
                      className="w-full"
                    >
                      开始对话
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => openAnalysisModal(agent.id)}
                >
                  文档分析
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-2 border-[#667eea] bg-gradient-to-br from-[#667eea]/5 to-[#764ba2]/5">
        <CardHeader>
          <div className="flex items-center mb-2">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#667eea] to-[#764ba2] flex items-center justify-center text-3xl shadow-lg mr-4">
              AI
            </div>
            <div>
              <CardTitle className="text-2xl">智能协作模式</CardTitle>
              <CardDescription className="text-base mt-1">
                多 Agent 协同工作，复杂任务交给 AI
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            通过智能协作模式，系统会自动协调多个专业Agent共同处理复杂任务，为您提供更全面、更深入的解决方案。
          </p>
          <Link href={'/chat/collaboration'}>
            <Button
              size="lg"
              className="w-full bg-gradient-to-r from-[#667eea] to-[#764ba2] hover:opacity-90 transition-opacity"
            >
              <Sparkles className="mr-2 h-5 w-5" />
              启动协作模式
            </Button>
          </Link>
        </CardContent>
      </Card>

      {showAnalysisModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
            <CardHeader className="border-b">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-blue-600" />
                    文档分析
                  </CardTitle>
                  <CardDescription>
                    上传文档，让AI Agent为您进行分析
                  </CardDescription>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setShowAnalysisModal(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden p-0">
              <div className="h-full flex flex-col lg:flex-row">
                <div className="w-full lg:w-1/3 p-4 border-r overflow-y-auto space-y-4">
                  {!uploadedFile ? (
                    <div className="space-y-2">
                      <label className="text-sm font-medium">上传文件</label>
                      <div
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                        className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg p-8 text-center hover:border-blue-500 transition-colors cursor-pointer"
                      >
                        <input
                          type="file"
                          id="file-upload-modal"
                          className="hidden"
                          accept=".pdf,.doc,.docx,.txt,.md"
                          onChange={(e) => {
                            if (e.target.files?.[0]) {
                              handleFileUpload(e.target.files[0]);
                            }
                          }}
                        />
                        <label htmlFor="file-upload-modal" className="cursor-pointer">
                          <Upload className="w-8 h-8 mx-auto mb-2 text-slate-400" />
                          <p className="text-sm text-slate-600 dark:text-slate-400">
                            点击或拖拽文件到此处
                          </p>
                        </label>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <File className="w-4 h-4 text-blue-600" />
                          <span className="text-sm">{uploadedFile.name}</span>
                        </div>
                        <Button variant="ghost" size="sm" onClick={clearUpload}>
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <label className="text-sm font-medium">文档URL或ID</label>
                    <Input
                      placeholder="https://feishu.cn/doc/doxxxxxxxxxxxx"
                      value={documentUrl}
                      onChange={(e) => {
                        setDocumentUrl(e.target.value);
                        setDocumentId(extractDocumentId(e.target.value));
                      }}
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="writeBack-modal"
                      checked={writeBack}
                      onCheckedChange={(checked) => setWriteBack(checked as boolean)}
                    />
                    <label htmlFor="writeBack-modal" className="text-sm">
                      将分析结果写回文档
                    </label>
                  </div>

                  <Button
                    onClick={handleAnalyze}
                    disabled={loading || uploading || !documentId}
                    className="w-full bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600"
                  >
                    {loading || uploading ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Play className="w-4 h-4 mr-2" />
                    )}
                    开始分析
                  </Button>

                  {uploadError && uploadError.includes('飞书应用ID和Secret未配置') && (
                    <div className="bg-amber-50 dark:bg-amber-950 p-4 rounded-lg border border-amber-200 dark:border-amber-800 mb-3">
                      <h4 className="font-semibold mb-2 flex items-center gap-2 text-amber-800 dark:text-amber-200">
                        需要配置飞书应用凭证
                      </h4>
                      <div className="text-sm text-amber-700 dark:text-amber-300 space-y-2">
                        <p>文档分析功能需要飞书应用配置才能正常使用。请按照以下步骤配置：</p>
                        <ol className="list-decimal list-inside space-y-1">
                          <li>登录飞书开放平台：<a href="https://open.feishu.cn/app" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">https://open.feishu.cn/app</a></li>
                          <li>创建应用（选择"企业自建应用"）</li>
                          <li>在应用凭证页面获取 App ID 和 App Secret</li>
                          <li>在项目根目录创建 `.env.local` 文件，添加以下配置：</li>
                        </ol>
                        <div className="bg-slate-900 text-green-400 p-3 rounded font-mono text-xs my-2">
                          FEISHU_APP_ID=你的应用ID<br/>
                          FEISHU_APP_SECRET=你的应用密钥
                        </div>
                        <p className="text-xs">配置完成后重启服务即可使用文档分析功能。</p>
                      </div>
                    </div>
                  )}
                  {uploadError && uploadError.includes('99991672') && (
                    <div className="bg-red-50 dark:bg-red-950 p-4 rounded-lg border border-red-200 dark:border-red-800 mb-3">
                      <h4 className="font-semibold mb-2 flex items-center gap-2 text-red-800 dark:text-red-200">
                        需要配置飞书应用权限
                      </h4>
                      <div className="text-sm text-red-700 dark:text-red-300 space-y-2">
                        <p>飞书应用缺少创建文档的权限。请按照以下步骤申请权限：</p>
                        <ol className="list-decimal list-inside space-y-2">
                          <li>登录飞书开放平台：<a href="https://open.feishu.cn/app" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">https://open.feishu.cn/app</a></li>
                          <li>找到应用：<code className="bg-slate-200 dark:bg-slate-800 px-1 rounded">{process.env.NEXT_PUBLIC_FEISHU_APP_ID || 'cli_a905db090c38dbb3'}</code></li>
                          <li>点击左侧"权限管理" → "权限申请"</li>
                          <li>搜索并申请以下权限：
                            <ul className="list-disc list-inside ml-4 mt-1 space-y-1">
                              <li><strong>docx:document:create</strong> - 创建文档（必需）</li>
                              <li><strong>docx:block:children:create</strong> - 创建文档块（必需）</li>
                              <li><strong>docx:block:children:list</strong> - 获取文档内容（必需）</li>
                              <li><strong>docx:document:delete</strong> - 删除文档（可选）</li>
                            </ul>
                          </li>
                          <li>点击"申请权限"，等待审核通过（通常需要几分钟到几小时）</li>
                          <li>审核通过后，重新上传文件即可</li>
                        </ol>
                        <div className="bg-slate-900 text-green-400 p-3 rounded font-mono text-xs my-2">
                          错误代码: 99991672<br/>
                          错误详情: permission_violations
                        </div>
                        <p className="text-xs mb-3">如果申请权限需要审核，可以联系企业管理员加速审核流程。</p>
                        <a 
                          href="/docs/FEISHU_PERMISSION_GUIDE.md" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-xs text-blue-600 hover:underline"
                        >
                          查看详细配置指南 →
                        </a>
                      </div>
                    </div>
                  )}
                  {logs.length > 0 && (
                    <div className="bg-slate-950 text-green-400 p-3 rounded-lg font-mono text-xs space-y-1 max-h-48 overflow-y-auto">
                      {logs.map((log, index) => (
                        <div key={index}>{log}</div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex-1 flex flex-col overflow-hidden">
                  {analysisResult && (
                    <div className="p-4 border-b max-h-1/2 overflow-y-auto">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          分析结果
                        </h3>
                        <Button variant="outline" size="sm" onClick={() => navigator.clipboard.writeText(analysisResult.analysisResult)}>
                          <Copy className="w-4 h-4 mr-1" />
                          复制
                        </Button>
                      </div>
                      <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded text-sm whitespace-pre-wrap">
                        {analysisResult.analysisResult}
                      </div>
                    </div>
                  )}

                  {analysisResult && (
                    <div className="flex-1 flex flex-col overflow-hidden p-4">
                      <h3 className="font-semibold mb-2 flex items-center gap-2">
                        <Bot className="w-4 h-4 text-purple-600" />
                        智能对话
                      </h3>
                      <ScrollArea className="flex-1 mb-2">
                        <div className="space-y-3">
                          {messages.map((message, index) => (
                            <div
                              key={index}
                              className={'flex gap-2 ' + (message.role === 'user' ? 'justify-end' : 'justify-start')}
                            >
                              {message.role === 'assistant' && (
                                <div className="w-6 h-6 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center flex-shrink-0">
                                  <Bot className="w-3 h-3 text-white" />
                                </div>
                              )}
                              <div
                                className={'max-w-[80%] rounded-lg px-3 py-2 text-sm ' + (
                                  message.role === 'user'
                                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                                    : 'bg-slate-100 dark:bg-slate-800'
                                )}
                              >
                                {message.content}
                              </div>
                              {message.role === 'user' && (
                                <div className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center flex-shrink-0">
                                  <User className="w-3 h-3 text-white" />
                                </div>
                              )}
                            </div>
                          ))}
                          {chatLoading && (
                            <div className="flex gap-2 justify-start">
                              <div className="w-6 h-6 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center">
                                <Bot className="w-3 h-3 text-white" />
                              </div>
                              <div className="bg-slate-100 dark:bg-slate-800 rounded-lg px-3 py-2">
                                <Loader2 className="w-4 h-4 animate-spin" />
                              </div>
                            </div>
                          )}
                        </div>
                      </ScrollArea>
                      <div className="flex gap-2">
                        <Input
                          placeholder="向Agent提问..."
                          value={inputMessage}
                          onChange={(e) => setInputMessage(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                          disabled={chatLoading}
                        />
                        <Button onClick={handleSendMessage} disabled={chatLoading || !inputMessage.trim()}>
                          <Send className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </MainLayout>
  );
}
