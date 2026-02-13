'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { AGENTS } from '@/types';
import { FileText, Bot, CheckCircle, AlertCircle, Play, Copy, ExternalLink, Loader2, Upload, File, X } from 'lucide-react';

export default function DocumentAnalysisPage() {
  const [documentUrl, setDocumentUrl] = useState('');
  const [selectedAgent, setSelectedAgent] = useState('policy');
  const [writeBack, setWriteBack] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [documentId, setDocumentId] = useState('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const addLog = (log: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [`[${timestamp}] ${log}`, ...prev].slice(0, 20));
  };

  const extractDocumentId = (url: string): string => {
    // 从飞书文档URL中提取documentId
    const match = url.match(/doc\/([a-zA-Z0-9_-]+)/);
    return match ? match[1] : url;
  };

  // 文件上传处理
  const handleFileUpload = async (file: File) => {
    setUploading(true);
    setUploadedFile(file);
    addLog(`📁 开始上传文件: ${file.name}`);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/feishu/document/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        setDocumentUrl(`https://feishu.cn/doc/${data.documentId}`);
        setDocumentId(data.documentId);
        addLog(`✓ 文件上传成功`);
        addLog(`📄 创建的飞书文档ID: ${data.documentId}`);
        addLog(`🔗 文档链接: ${documentUrl}`);
      } else {
        addLog(`✗ 文件上传失败: ${data.error}`);
        setUploadedFile(null);
      }
    } catch (error) {
      addLog(`✗ 上传失败: ${error}`);
      setUploadedFile(null);
    } finally {
      setUploading(false);
    }
  };

  // 拖拽上传处理
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
    if (!documentId) {
      addLog('✗ 请先上传文件或输入文档URL');
      return;
    }

    setLoading(true);
    setAnalysisResult(null);
    addLog('开始文档分析流程...');

    try {
      // 获取选中的Agent信息
      const agent = AGENTS.find(a => a.id === selectedAgent);
      addLog(`🤖 使用Agent: ${agent?.name}`);

      addLog('📖 正在读取文档内容...');
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
        addLog(`✓ 文档读取成功，内容长度: ${data.documentTextLength} 字符`);
        addLog('🤖 Agent正在分析...');
        addLog(`✓ 分析完成！`);

        setAnalysisResult(data);

        if (data.writeBack) {
          addLog('✓ 分析结果已写回文档');
          addLog(`🔗 块ID: ${data.analysisBlockId}`);
        }
      } else {
        addLog(`✗ 分析失败: ${data.error}`);
      }
    } catch (error) {
      addLog(`✗ 请求失败: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content);
    addLog('📋 分析结果已复制到剪贴板');
  };

  const clearUpload = () => {
    setUploadedFile(null);
    setDocumentUrl('');
    setDocumentId('');
    addLog('🗑️ 已清除上传的文件');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <div className="container mx-auto p-6">
        {/* 页面标题 */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            文档智能分析
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            将飞书文档或本地文件发送给Agent进行分析，获取专业反馈
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 左侧：控制面板 */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                  文档配置
                </CardTitle>
                <CardDescription>
                  上传本地文件或输入飞书文档URL
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* 文件上传区域 */}
                {!uploadedFile && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">上传文件</label>
                    <div
                      onDrop={handleDrop}
                      onDragOver={handleDragOver}
                      className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg p-8 text-center hover:border-blue-500 transition-colors cursor-pointer"
                    >
                      <input
                        type="file"
                        id="file-upload"
                        className="hidden"
                        accept=".pdf,.doc,.docx,.txt,.md"
                        onChange={(e) => {
                          if (e.target.files?.[0]) {
                            handleFileUpload(e.target.files[0]);
                          }
                        }}
                      />
                      <label htmlFor="file-upload" className="cursor-pointer">
                        <Upload className="w-8 h-8 mx-auto mb-2 text-slate-400" />
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          点击或拖拽文件到此处
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          支持 PDF, Word, TXT, MD
                        </p>
                      </label>
                    </div>
                    <div className="flex items-center justify-center text-xs text-muted-foreground">
                      <span className="mx-2">或者</span>
                    </div>
                  </div>
                )}

                {/* 已上传文件显示 */}
                {uploadedFile && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">已上传文件</label>
                    <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
                      <div className="flex items-center gap-2">
                        <File className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-medium truncate max-w-[150px]">
                          {uploadedFile.name}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          ({(uploadedFile.size / 1024).toFixed(2)} KB)
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearUpload}
                        className="text-red-600 hover:text-red-700"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}

                {/* 文档URL输入 */}
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
                  <p className="text-xs text-muted-foreground">
                    输入飞书文档的完整URL或文档ID
                  </p>
                </div>

                {/* Agent选择 */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">选择Agent</label>
                  <Select value={selectedAgent} onValueChange={setSelectedAgent}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {AGENTS.map(agent => (
                        <SelectItem key={agent.id} value={agent.id}>
                          <div className="flex items-center gap-2">
                            <span>{agent.icon}</span>
                            <span>{agent.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    {AGENTS.find(a => a.id === selectedAgent)?.description}
                  </p>
                </div>

                {/* 写回选项 */}
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="writeBack"
                    checked={writeBack}
                    onCheckedChange={(checked) => setWriteBack(checked as boolean)}
                  />
                  <label
                    htmlFor="writeBack"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    将分析结果写回文档
                  </label>
                </div>
                <p className="text-xs text-muted-foreground pl-6">
                  启用后，分析结果将自动追加到文档末尾
                </p>

                {/* 分析按钮 */}
                <Button
                  onClick={handleAnalyze}
                  disabled={loading || uploading || !documentId}
                  className="w-full bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600"
                >
                  {(loading || uploading) ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {uploading ? '上传中...' : '分析中...'}
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 mr-2" />
                      开始分析
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* 操作日志 */}
            {logs.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-slate-500" />
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
          </div>

          {/* 右侧：分析结果 */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Bot className="w-5 h-5 text-purple-600" />
                      分析结果
                    </CardTitle>
                    <CardDescription>
                      Agent对文档的专业分析
                    </CardDescription>
                  </div>
                  {analysisResult && (
                    <Badge className="bg-green-600">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      分析完成
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {!analysisResult ? (
                  <div className="flex flex-col items-center justify-center py-20 text-center text-muted-foreground">
                    <FileText className="w-16 h-16 mb-4 opacity-20" />
                    <p className="text-lg font-medium mb-2">等待分析</p>
                    <p className="text-sm">
                      上传文件或输入文档URL，选择Agent后点击"开始分析"
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* 文档信息 */}
                    <div className="p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <div className="text-muted-foreground mb-1">文档ID</div>
                          <code className="text-xs">{analysisResult.documentId}</code>
                        </div>
                        <div>
                          <div className="text-muted-foreground mb-1">内容长度</div>
                          <span>{analysisResult.documentTextLength} 字符</span>
                        </div>
                        <div>
                          <div className="text-muted-foreground mb-1">分析Agent</div>
                          <span>{analysisResult.agentName}</span>
                        </div>
                        <div>
                          <div className="text-muted-foreground mb-1">分析时间</div>
                          <span>{new Date(analysisResult.timestamp).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>

                    {/* 文档链接 */}
                    <div className="flex items-center gap-2">
                      <ExternalLink className="w-4 h-4 text-blue-600" />
                      <a
                        href={`https://feishu.cn/doc/${analysisResult.documentId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline"
                      >
                        查看原始文档
                      </a>
                    </div>

                    {/* 分析结果 */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold">分析内容</h3>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCopy(analysisResult.analysisResult)}
                        >
                          <Copy className="w-4 h-4 mr-2" />
                          复制
                        </Button>
                      </div>
                      <div className="p-4 bg-slate-50 dark:bg-slate-900 border rounded-lg">
                        <pre className="whitespace-pre-wrap text-sm font-mono">
                          {analysisResult.analysisResult}
                        </pre>
                      </div>
                    </div>

                    {/* 写回信息 */}
                    {analysisResult.writeBack && (
                      <div className="p-4 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
                        <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
                          <CheckCircle className="w-5 h-5" />
                          <span className="font-medium">已写回文档</span>
                        </div>
                        <p className="mt-2 text-sm text-green-600 dark:text-green-400">
                          分析结果已追加到文档末尾，请刷新文档查看
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* 使用说明 */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>使用说明</CardTitle>
            <CardDescription>
              如何使用文档智能分析功能
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2 text-sm">
              <div className="flex items-start gap-2">
                <Badge className="mt-0.5">1</Badge>
                <span>上传本地文件（PDF、Word、TXT、MD）或输入飞书文档URL</span>
              </div>
              <div className="flex items-start gap-2">
                <Badge className="mt-0.5">2</Badge>
                <span>选择要使用的Agent（政策解读、尽职调查、申报材料等）</span>
              </div>
              <div className="flex items-start gap-2">
                <Badge className="mt-0.5">3</Badge>
                <span>可选：勾选"将分析结果写回文档"</span>
              </div>
              <div className="flex items-start gap-2">
                <Badge className="mt-0.5">4</Badge>
                <span>点击"开始分析"，Agent将读取文档并提供专业反馈</span>
              </div>
            </div>
            <div className="p-4 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg">
              <p className="text-sm text-amber-800 dark:text-amber-400">
                <strong>提示：</strong> 确保已在环境变量中配置了飞书应用凭证（FEISHU_APP_ID 和 FEISHU_APP_SECRET），否则无法读取文档内容。
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
