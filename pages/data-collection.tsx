'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Database,
  Play,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  FileText,
  Newspaper,
  ScrollText,
  Building2,
  Activity,
  BarChart3,
  Settings,
  Clock,
} from 'lucide-react';

// 数据类型
interface CollectionStatus {
  status: 'idle' | 'running' | 'success' | 'failed';
  progress: number;
  message: string;
  result?: any;
  startTime?: Date;
  endTime?: Date;
}

interface DataType {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  color: string;
}

const DATA_TYPES: DataType[] = [
  {
    id: 'reits',
    name: 'REITs 产品数据',
    icon: <Building2 className="w-5 h-5" />,
    description: '从深交所/上交所采集 REITs 基础数据',
    color: 'from-blue-500 to-blue-600',
  },
  {
    id: 'policies',
    name: '政策文件',
    icon: <ScrollText className="w-5 h-5" />,
    description: '从发改委/证监会采集政策法规',
    color: 'from-purple-500 to-purple-600',
  },
  {
    id: 'news',
    name: '财经新闻',
    icon: <Newspaper className="w-5 h-5" />,
    description: '采集最新的 REITs 相关新闻',
    color: 'from-green-500 to-green-600',
  },
  {
    id: 'announcements',
    name: '交易所公告',
    icon: <FileText className="w-5 h-5" />,
    description: '采集 REITs 产品公告信息',
    color: 'from-orange-500 to-orange-600',
  },
];

export default function DataCollectionPage() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [statuses, setStatuses] = useState<Record<string, CollectionStatus>>({
    reits: { status: 'idle', progress: 0, message: '等待采集' },
    policies: { status: 'idle', progress: 0, message: '等待采集' },
    news: { status: 'idle', progress: 0, message: '等待采集' },
    announcements: { status: 'idle', progress: 0, message: '等待采集' },
  });
  const [globalStatus, setGlobalStatus] = useState<CollectionStatus>({
    status: 'idle',
    progress: 0,
    message: '就绪',
  });
  const [logs, setLogs] = useState<string[]>([]);

  // 添加日志
  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString('zh-CN');
    setLogs(prev => [`[${timestamp}] ${message}`, ...prev].slice(0, 50));
  };

  // 开始采集单个数据类型
  const startCollection = async (dataType: string) => {
    addLog(`开始采集 ${DATA_TYPES.find(d => d.id === dataType)?.name}...`);

    setStatuses(prev => ({
      ...prev,
      [dataType]: {
        status: 'running',
        progress: 0,
        message: '初始化...',
        startTime: new Date(),
      },
    }));

    try {
      // 模拟进度更新
      for (let i = 0; i <= 100; i += 10) {
        await new Promise(resolve => setTimeout(resolve, 200));
        setStatuses(prev => ({
          ...prev,
          [dataType]: {
            ...prev[dataType],
            progress: i,
            message: i < 100 ? `采集中... ${i}%` : '采集完成',
          },
        }));
      }

      // 调用 API
      const response = await fetch('/api/v1/data-collection/pipeline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'collect',
          dataType,
          collectionType: 'full',
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setStatuses(prev => ({
          ...prev,
          [dataType]: {
            ...prev[dataType],
            status: 'success',
            progress: 100,
            message: '采集成功！',
            result,
            endTime: new Date(),
          },
        }));
        addLog(`${DATA_TYPES.find(d => d.id === dataType)?.name} 采集成功！`);
      } else {
        throw new Error('API 请求失败');
      }
    } catch (error) {
      setStatuses(prev => ({
        ...prev,
        [dataType]: {
          ...prev[dataType],
          status: 'failed',
          progress: 0,
          message: `采集失败: ${error instanceof Error ? error.message : '未知错误'}`,
          endTime: new Date(),
        },
      }));
      addLog(`${DATA_TYPES.find(d => d.id === dataType)?.name} 采集失败`);
    }
  };

  // 开始完整采集
  const startFullPipeline = async () => {
    addLog('启动完整数据采集管道...');
    setGlobalStatus({
      status: 'running',
      progress: 0,
      message: '初始化...',
      startTime: new Date(),
    });

    try {
      // 逐个采集
      for (let i = 0; i < DATA_TYPES.length; i++) {
        const dataType = DATA_TYPES[i];
        setGlobalStatus(prev => ({
          ...prev,
          progress: Math.round((i / DATA_TYPES.length) * 100),
          message: `正在采集: ${dataType.name}`,
        }));

        await startCollection(dataType.id);
      }

      setGlobalStatus(prev => ({
        ...prev,
        status: 'success',
        progress: 100,
        message: '完整采集完成！',
        endTime: new Date(),
      }));
      addLog('完整数据采集管道执行完成！');
    } catch (error) {
      setGlobalStatus(prev => ({
        ...prev,
        status: 'failed',
        progress: 0,
        message: `采集失败: ${error instanceof Error ? error.message : '未知错误'}`,
        endTime: new Date(),
      }));
      addLog('完整数据采集管道执行失败');
    }
  };

  // 重置所有状态
  const resetAll = () => {
    setStatuses({
      reits: { status: 'idle', progress: 0, message: '等待采集' },
      policies: { status: 'idle', progress: 0, message: '等待采集' },
      news: { status: 'idle', progress: 0, message: '等待采集' },
      announcements: { status: 'idle', progress: 0, message: '等待采集' },
    });
    setGlobalStatus({
      status: 'idle',
      progress: 0,
      message: '就绪',
    });
    addLog('状态已重置');
  };

  // 获取状态图标
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case 'failed':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'running':
        return <RefreshCw className="w-5 h-5 text-blue-500 animate-spin" />;
      default:
        return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  // 获取状态徽章
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <Badge className="bg-green-500/20 text-green-400 hover:bg-green-500/30">成功</Badge>;
      case 'failed':
        return <Badge className="bg-red-500/20 text-red-400 hover:bg-red-500/30">失败</Badge>;
      case 'running':
        return <Badge className="bg-blue-500/20 text-blue-400 hover:bg-blue-500/30">运行中</Badge>;
      default:
        return <Badge className="bg-gray-500/20 text-gray-400 hover:bg-gray-500/30">等待</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0B1E33] to-[#1A3B5E] p-6">
      <div className="max-w-7xl mx-auto">
        {/* 页面头部 */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                <Database className="w-8 h-8" />
                数据采集中心
              </h1>
              <p className="text-white/60 mt-2">
                一键采集 REITs 产品、政策、新闻、公告数据
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="default"
                size="sm"
                onClick={resetAll}
                className="bg-white/10 hover:bg-white/20"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                重置
              </Button>
            </div>
          </div>
        </div>

        <Tabs defaultValue="dashboard" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-white/10 border border-white/10">
            <TabsTrigger value="dashboard" className="data-[state=active]:bg-white/20">
              <BarChart3 className="w-4 h-4 mr-2" />
              仪表盘
            </TabsTrigger>
            <TabsTrigger value="collection" className="data-[state=active]:bg-white/20">
              <Activity className="w-4 h-4 mr-2" />
              数据采集
            </TabsTrigger>
            <TabsTrigger value="logs" className="data-[state=active]:bg-white/20">
              <FileText className="w-4 h-4 mr-2" />
              运行日志
            </TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-white/20">
              <Settings className="w-4 h-4 mr-2" />
              设置
            </TabsTrigger>
          </TabsList>

          {/* 仪表盘 */}
          <TabsContent value="dashboard" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* 全局状态 */}
              <Card className="lg:col-span-2 bg-white/10 backdrop-blur-sm border-white/10">
                <CardHeader>
                  <CardTitle className="text-white">全局状态</CardTitle>
                  <CardDescription className="text-white/60">完整数据采集管道</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(globalStatus.status)}
                      <div>
                        <p className="text-white font-medium">{globalStatus.message}</p>
                        <p className="text-white/60 text-sm">
                          {globalStatus.startTime &&
                            `开始: ${globalStatus.startTime.toLocaleTimeString('zh-CN')}`}
                        </p>
                      </div>
                    </div>
                    {getStatusBadge(globalStatus.status)}
                  </div>

                  {globalStatus.status !== 'idle' && (
                    <Progress value={globalStatus.progress} className="h-2" />
                  )}

                  <Button
                    className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                    disabled={globalStatus.status === 'running'}
                    onClick={startFullPipeline}
                  >
                    <Play className="w-4 h-4 mr-2" />
                    {globalStatus.status === 'running' ? '采集中...' : '启动完整采集'}
                  </Button>
                </CardContent>
              </Card>

              {/* 统计卡片 */}
              <Card className="bg-white/10 backdrop-blur-sm border-white/10">
                <CardHeader>
                  <CardTitle className="text-white">采集统计</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {DATA_TYPES.map((type) => {
                    const status = statuses[type.id];
                    return (
                      <div key={type.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {type.icon}
                          <span className="text-white/80 text-sm">{type.name}</span>
                        </div>
                        {getStatusBadge(status.status)}
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* 数据采集 */}
          <TabsContent value="collection" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {DATA_TYPES.map((type) => {
                const status = statuses[type.id];
                return (
                  <Card
                    key={type.id}
                    className="bg-white/10 backdrop-blur-sm border-white/10"
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-10 h-10 rounded-lg bg-gradient-to-br ${type.color} flex items-center justify-center`}
                          >
                            {type.icon}
                          </div>
                          <div>
                            <CardTitle className="text-white">{type.name}</CardTitle>
                            <CardDescription className="text-white/60">
                              {type.description}
                            </CardDescription>
                          </div>
                        </div>
                        {getStatusBadge(status.status)}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(status.status)}
                        <span className="text-white/80 text-sm">{status.message}</span>
                      </div>

                      {status.status !== 'idle' && (
                        <Progress value={status.progress} className="h-2" />
                      )}

                      {status.result && (
                        <div className="bg-white/5 rounded-lg p-3">
                          <p className="text-white/60 text-xs mb-2">采集结果</p>
                          <pre className="text-white/80 text-xs overflow-auto max-h-32">
                            {JSON.stringify(status.result, null, 2)}
                          </pre>
                        </div>
                      )}

                      <Button
                        className="w-full"
                        disabled={status.status === 'running'}
                        onClick={() => startCollection(type.id)}
                      >
                        <Play className="w-4 h-4 mr-2" />
                        {status.status === 'running' ? '采集中...' : '开始采集'}
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* 运行日志 */}
          <TabsContent value="logs" className="mt-6">
            <Card className="bg-white/10 backdrop-blur-sm border-white/10">
              <CardHeader>
                <CardTitle className="text-white">运行日志</CardTitle>
                <CardDescription className="text-white/60">实时显示采集日志</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-black/30 rounded-lg p-4 h-96 overflow-y-auto">
                  {logs.length === 0 ? (
                    <p className="text-white/40 text-center py-8">暂无日志</p>
                  ) : (
                    <div className="space-y-2">
                      {logs.map((log, index) => (
                        <p key={index} className="text-white/70 text-sm font-mono">
                          {log}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 设置 */}
          <TabsContent value="settings" className="mt-6">
            <Card className="bg-white/10 backdrop-blur-sm border-white/10">
              <CardHeader>
                <CardTitle className="text-white">采集设置</CardTitle>
                <CardDescription className="text-white/60">配置数据采集参数</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-white font-medium mb-2">数据源配置</h3>
                    <div className="bg-white/5 rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-white/70">Supabase 数据库</span>
                        <Badge variant="outline" className="text-white/60">
                          {process.env.NEXT_PUBLIC_SUPABASE_URL ? '已配置' : '未配置'}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-white/70">数据存储模式</span>
                        <Badge className="text-white/60">
                          {process.env.NEXT_PUBLIC_SUPABASE_URL ? '数据库' : 'Mock 数据'}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <Separator className="bg-white/10" />

                  <div>
                    <h3 className="text-white font-medium mb-2">说明</h3>
                    <div className="bg-white/5 rounded-lg p-4">
                      <ul className="text-white/60 text-sm space-y-2">
                        <li>• 未配置 Supabase 时，使用内置 Mock 数据</li>
                        <li>• 配置 Supabase 后，数据会存储到数据库</li>
                        <li>• Mock 数据包含 3 个 REITs、1 个政策、1 个新闻、1 个公告</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
