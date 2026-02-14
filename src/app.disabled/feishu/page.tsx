'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { FileText, CheckCircle, AlertCircle, Send, ExternalLink, Plus } from 'lucide-react';

export default function FeishuPage() {
  const [documentTitle, setDocumentTitle] = useState('');
  const [documentContent, setDocumentContent] = useState('');
  const [documentUrl, setDocumentUrl] = useState('');

  const [projectName, setProjectName] = useState('');
  const [projectType, setProjectType] = useState('');
  const [projectAmount, setProjectAmount] = useState('');
  const [projectManager, setProjectManager] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [approvalUrl, setApprovalUrl] = useState('');

  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (log: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [`[${timestamp}] ${log}`, ...prev].slice(0, 10));
  };

  // 创建文档
  const handleCreateDocument = async () => {
    if (!documentTitle.trim()) return;

    setLoading(true);
    addLog('开始创建飞书文档...');

    try {
      const response = await fetch('/api/feishu/document/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: documentTitle,
          content: documentContent,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setDocumentUrl(data.document.url);
        addLog(`✓ 文档创建成功: ${data.document.title}`);
        addLog(`📄 文档链接: ${data.document.url}`);
      } else {
        addLog(`✗ 文档创建失败: ${data.error}`);
      }
    } catch (error) {
      addLog(`✗ 请求失败: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  // 创建审批
  const handleCreateApproval = async () => {
    if (!projectName || !projectType || !projectAmount || !projectManager) {
      addLog('✗ 请填写完整的项目信息');
      return;
    }

    setLoading(true);
    addLog('开始创建REITs项目审批...');

    try {
      const response = await fetch('/api/feishu/approval/reits', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectName,
          projectType,
          projectAmount: parseFloat(projectAmount),
          projectManager,
          description: projectDescription,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setApprovalUrl(data.instance.url);
        addLog(`✓ 审批创建成功: ${data.instance.title}`);
        addLog(`📋 审批链接: ${data.instance.url}`);
        addLog(`🆔 审批实例ID: ${data.instance.instanceId}`);
      } else {
        addLog(`✗ 审批创建失败: ${data.error}`);
      }
    } catch (error) {
      addLog(`✗ 请求失败: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <div className="container mx-auto p-6">
        {/* 页面标题 */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
            飞书集成
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            集成飞书文档和审批功能，实现REITs项目管理自动化
          </p>
        </div>

        <Tabs defaultValue="document" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="document">文档集成</TabsTrigger>
            <TabsTrigger value="approval">审批集成</TabsTrigger>
          </TabsList>

          {/* 文档集成 */}
          <TabsContent value="document">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="w-5 h-5 text-blue-600" />
                      创建飞书文档
                    </CardTitle>
                    <CardDescription>
                      自动生成REITs报告并推送到飞书文档
                    </CardDescription>
                  </div>
                  <Badge className="bg-blue-600">文档集成</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">文档标题</label>
                  <Input
                    placeholder="例如：REITs项目尽职调查报告"
                    value={documentTitle}
                    onChange={(e) => setDocumentTitle(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">文档内容</label>
                  <Textarea
                    placeholder="输入文档内容..."
                    value={documentContent}
                    onChange={(e) => setDocumentContent(e.target.value)}
                    rows={6}
                  />
                </div>
                <Button
                  onClick={handleCreateDocument}
                  disabled={loading || !documentTitle.trim()}
                  className="w-full bg-gradient-to-r from-blue-600 to-cyan-600"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  创建文档
                </Button>

                {documentUrl && (
                  <div className="mt-4 p-4 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
                    <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
                      <CheckCircle className="w-5 h-5" />
                      <span className="font-medium">文档创建成功</span>
                    </div>
                    <a
                      href={documentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 text-sm text-green-600 dark:text-green-400 hover:underline flex items-center gap-1"
                    >
                      <ExternalLink className="w-3 h-3" />
                      {documentUrl}
                    </a>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* 审批集成 */}
          <TabsContent value="approval">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-purple-600" />
                      创建REITs项目审批
                    </CardTitle>
                    <CardDescription>
                      发起REITs项目审批流程
                    </CardDescription>
                  </div>
                  <Badge className="bg-purple-600">审批集成</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">项目名称 *</label>
                    <Input
                      placeholder="例如：XX商业地产REITs"
                      value={projectName}
                      onChange={(e) => setProjectName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">项目类型 *</label>
                    <Input
                      placeholder="例如：C-REITs"
                      value={projectType}
                      onChange={(e) => setProjectType(e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">项目金额（万元）*</label>
                    <Input
                      type="number"
                      placeholder="例如：50000"
                      value={projectAmount}
                      onChange={(e) => setProjectAmount(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">项目负责人 *</label>
                    <Input
                      placeholder="例如：张三"
                      value={projectManager}
                      onChange={(e) => setProjectManager(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">项目描述</label>
                  <Textarea
                    placeholder="项目详细描述..."
                    value={projectDescription}
                    onChange={(e) => setProjectDescription(e.target.value)}
                    rows={4}
                  />
                </div>

                <Button
                  onClick={handleCreateApproval}
                  disabled={loading || !projectName || !projectType || !projectAmount || !projectManager}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600"
                >
                  <Send className="w-4 h-4 mr-2" />
                  发起审批
                </Button>

                {approvalUrl && (
                  <div className="mt-4 p-4 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
                    <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
                      <CheckCircle className="w-5 h-5" />
                      <span className="font-medium">审批创建成功</span>
                    </div>
                    <a
                      href={approvalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 text-sm text-green-600 dark:text-green-400 hover:underline flex items-center gap-1"
                    >
                      <ExternalLink className="w-3 h-3" />
                      {approvalUrl}
                    </a>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* 操作日志 */}
        {logs.length > 0 && (
          <Card className="mt-6">
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

        {/* 配置提示 */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>配置说明</CardTitle>
            <CardDescription>
              使用飞书集成前需要配置环境变量
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <Badge variant="outline">必需</Badge>
                <code>FEISHU_APP_ID</code>
                <span className="text-muted-foreground">飞书应用ID</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline">必需</Badge>
                <code>FEISHU_APP_SECRET</code>
                <span className="text-muted-foreground">飞书应用密钥</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline">可选</Badge>
                <code>FEISHU_REITS_APPROVAL_CODE</code>
                <span className="text-muted-foreground">REITs审批模板代码</span>
              </div>
            </div>
            <p className="mt-4 text-xs text-muted-foreground">
              在 .env.local 文件中配置这些变量。查看详细文档了解如何获取这些值。
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
