'use client';

import { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AGENTS } from '@/types';
import { 
  Search,
  AlertTriangle,
  BookOpen,
  FileText,
  Loader2,
  Copy,
  Check,
  ArrowRight,
  Scale,
  Shield,
} from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  type?: 'regulation' | 'risk' | 'chat';
}

interface RegulationResult {
  source: string;
  level: string;
  article: string;
  content: string;
  relevance: number;
  effective_date: string;
  applicable_assets: string[];
  interpretation: string;
}

interface RiskDetail {
  risk_id: string;
  category: string;
  type: string;
  description: string;
  severity: string;
  probability: number;
  impact: string;
  regulatory_basis: string;
  suggested_actions: string[];
  estimated_resolution_time: string;
}

export default function LegalRiskChatPage() {
  const agent = AGENTS.find(a => a.id === 'legal-risk');
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  
  // 法规检索状态
  const [regulationQuery, setRegulationQuery] = useState('');
  const [regulationResults, setRegulationResults] = useState<RegulationResult[]>([]);
  const [regulationLoading, setRegulationLoading] = useState(false);
  
  // 风险识别状态
  const [projectInfo, setProjectInfo] = useState('');
  const [riskResults, setRiskResults] = useState<any>(null);
  const [riskLoading, setRiskLoading] = useState(false);

  const handleRegulationSearch = async () => {
    if (!regulationQuery.trim()) return;

    setRegulationLoading(true);
    try {
      const response = await fetch('/api/legal-risk/regulation-search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: regulationQuery }),
      });

      const data = await response.json();

      if (data.success && data.data && data.data.results) {
        setRegulationResults(data.data.results);
      }
    } catch (error) {
      console.error('法规检索失败:', error);
    } finally {
      setRegulationLoading(false);
    }
  };

  const handleRiskIdentification = async () => {
    if (!projectInfo.trim()) return;

    setRiskLoading(true);
    try {
      const response = await fetch('/api/legal-risk/risk-identification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ projectInfo }),
      });

      const data = await response.json();

      if (data.success && data.data) {
        setRiskResults(data.data);
      }
    } catch (error) {
      console.error('风险识别失败:', error);
    } finally {
      setRiskLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || loading) return;

    const userMessage = inputMessage.trim();
    setInputMessage('');
    setLoading(true);

    const newMessages = [
      ...messages,
      {
        role: 'user' as const,
        content: userMessage,
        timestamp: new Date(),
      },
    ];
    setMessages(newMessages);

    try {
      // TODO: 实现对话功能
      // 暂时返回模拟响应
      setTimeout(() => {
        setMessages([
          ...newMessages,
          {
            role: 'assistant' as const,
            content: '我是法务风控合规专家，很高兴为您服务！\n\n您可以：\n1. 使用左侧的"法规智能检索"功能查询相关法规\n2. 使用左侧的"合规风险识别"功能识别项目风险\n3. 在此处直接向我咨询REITs相关的法律问题\n\n请注意：本Agent提供的法律意见仅供参考，重大问题建议咨询专业律师。',
            timestamp: new Date(),
          },
        ]);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('发送消息失败:', error);
      setLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case '严重':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case '中等':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case '轻微':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case '法律':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case '行政法规':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case '部门规章':
        return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200';
      case '规范性文件':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  if (!agent) {
    return (
      <MainLayout>
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center py-20">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Agent不存在
            </h2>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* 页面标题 */}
        <div className="mb-8">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-red-500 to-pink-600 flex items-center justify-center text-3xl shadow-lg">
              {agent.icon}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {agent.name}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                {agent.description}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 左侧：功能入口 */}
          <div className="space-y-6">
            {/* 法规检索 */}
            <Card className="border-2 border-purple-200 dark:border-purple-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-purple-600" />
                  法规智能检索
                </CardTitle>
                <CardDescription>
                  从海量法规文件中精准定位相关条款
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex space-x-2">
                  <Input
                    placeholder="输入法规检索问题，例如：产业园资产的权属要求"
                    value={regulationQuery}
                    onChange={(e) => setRegulationQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleRegulationSearch()}
                    disabled={regulationLoading}
                  />
                  <Button
                    onClick={handleRegulationSearch}
                    disabled={regulationLoading || !regulationQuery.trim()}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    {regulationLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Search className="w-4 h-4" />
                    )}
                  </Button>
                </div>

                {regulationResults.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-semibold flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      检索结果 ({regulationResults.length})
                    </h4>
                    <ScrollArea className="h-[400px]">
                      <div className="space-y-3">
                        {regulationResults.map((result, index) => (
                          <div
                            key={index}
                            className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                          >
                            <div className="flex items-start justify-between mb-2">
                              <Badge className={getLevelColor(result.level)}>
                                {result.level}
                              </Badge>
                              <Badge variant="outline">
                                相关度: {(result.relevance * 100).toFixed(0)}%
                              </Badge>
                            </div>
                            <h5 className="font-semibold text-sm mb-2">
                              {result.source}
                            </h5>
                            <p className="text-sm font-medium text-purple-600 dark:text-purple-400 mb-2">
                              {result.article}
                            </p>
                            <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                              {result.content}
                            </p>
                            <div className="space-y-2 text-xs">
                              <div className="flex items-center gap-2">
                                <span className="font-medium">生效日期:</span>
                                <span>{result.effective_date}</span>
                              </div>
                              <div className="flex items-start gap-2">
                                <span className="font-medium">适用资产:</span>
                                <div className="flex flex-wrap gap-1">
                                  {result.applicable_assets.map((asset, idx) => (
                                    <Badge key={idx} variant="secondary" className="text-xs">
                                      {asset}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                              <div className="flex items-start gap-2">
                                <span className="font-medium">法理解释:</span>
                                <span className="text-gray-600 dark:text-gray-400">
                                  {result.interpretation}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 风险识别 */}
            <Card className="border-2 border-red-200 dark:border-red-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                  合规风险识别
                </CardTitle>
                <CardDescription>
                  基于项目信息自动识别合规风险点
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="输入项目信息，例如：
项目名称：XX产业园REIT
资产描述：位于上海浦东，建筑面积10万平方米，已运营5年
产权情况：存在银行抵押贷款8000万元
手续情况：缺少消防验收证明
运营情况：2023年发生一起安全生产事故，被处罚20万元"
                  value={projectInfo}
                  onChange={(e) => setProjectInfo(e.target.value)}
                  rows={6}
                  disabled={riskLoading}
                />
                <Button
                  onClick={handleRiskIdentification}
                  disabled={riskLoading || !projectInfo.trim()}
                  className="w-full bg-red-600 hover:bg-red-700"
                >
                  {riskLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      识别中...
                    </>
                  ) : (
                    <>
                      <Shield className="w-4 h-4 mr-2" />
                      开始识别风险
                    </>
                  )}
                </Button>

                {riskResults && (
                  <div className="space-y-4">
                    {/* 风险汇总 */}
                    <div className="p-4 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg">
                      <h4 className="font-semibold flex items-center gap-2 mb-3">
                        <Scale className="w-4 h-4" />
                        风险汇总
                      </h4>
                      <div className="grid grid-cols-4 gap-4 text-center">
                        <div>
                          <div className="text-2xl font-bold text-gray-900 dark:text-white">
                            {riskResults.risk_summary?.total_risks || 0}
                          </div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">
                            总风险数
                          </div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-red-600">
                            {riskResults.risk_summary?.severe_risks || 0}
                          </div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">
                            严重风险
                          </div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-yellow-600">
                            {riskResults.risk_summary?.medium_risks || 0}
                          </div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">
                            中等风险
                          </div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-green-600">
                            {riskResults.risk_summary?.minor_risks || 0}
                          </div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">
                            轻微风险
                          </div>
                        </div>
                      </div>
                      <div className="mt-3">
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span>风险评分</span>
                          <span className="font-bold">
                            {riskResults.risk_summary?.risk_score || 0}/100
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 h-2 rounded-full"
                            style={{ width: `${riskResults.risk_summary?.risk_score || 0}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* 风险详情 */}
                    {riskResults.risk_details && riskResults.risk_details.length > 0 && (
                      <div>
                        <h4 className="font-semibold flex items-center gap-2 mb-3">
                          <FileText className="w-4 h-4" />
                          风险详情 ({riskResults.risk_details.length})
                        </h4>
                        <ScrollArea className="h-[400px]">
                          <div className="space-y-3">
                            {riskResults.risk_details.map((risk: RiskDetail, index: number) => (
                              <div
                                key={index}
                                className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                              >
                                <div className="flex items-start justify-between mb-2">
                                  <div className="flex items-center gap-2">
                                    <Badge className={getSeverityColor(risk.severity)}>
                                      {risk.severity}
                                    </Badge>
                                    <Badge variant="outline">
                                      {risk.category}
                                    </Badge>
                                  </div>
                                  <Badge variant="outline">
                                    概率: {(risk.probability * 100).toFixed(0)}%
                                  </Badge>
                                </div>
                                <h5 className="font-semibold text-sm mb-2">
                                  {risk.type}
                                </h5>
                                <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                                  {risk.description}
                                </p>
                                <div className="space-y-2 text-xs">
                                  <div className="flex items-start gap-2">
                                    <span className="font-medium">监管依据:</span>
                                    <span className="text-purple-600 dark:text-purple-400">
                                      {risk.regulatory_basis}
                                    </span>
                                  </div>
                                  <div className="flex items-start gap-2">
                                    <span className="font-medium">影响分析:</span>
                                    <span className="text-gray-600 dark:text-gray-400">
                                      {risk.impact}
                                    </span>
                                  </div>
                                  <div className="flex items-start gap-2">
                                    <span className="font-medium">整改建议:</span>
                                    <ul className="list-disc list-inside text-gray-600 dark:text-gray-400">
                                      {risk.suggested_actions.map((action, idx) => (
                                        <li key={idx}>{action}</li>
                                      ))}
                                    </ul>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium">预计整改时间:</span>
                                    <span>{risk.estimated_resolution_time}</span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </ScrollArea>
                      </div>
                    )}

                    {/* 总体建议 */}
                    {riskResults.overall_recommendation && (
                      <div className="p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
                        <h4 className="font-semibold flex items-center gap-2 mb-2">
                          <Check className="w-4 h-4" />
                          总体建议
                        </h4>
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          {riskResults.overall_recommendation}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* 右侧：对话区域 */}
          <Card className="h-[calc(100vh-200px)] flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Scale className="w-5 h-5" />
                对话咨询
              </CardTitle>
              <CardDescription>
                与法务风控专家进行实时对话
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col overflow-hidden">
              <ScrollArea className="flex-1 mb-4">
                <div className="space-y-4">
                  {messages.length === 0 ? (
                    <div className="text-center py-10">
                      <Scale className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        开始与法务风控专家对话
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                        您可以咨询REITs相关的法律问题、合规要求、风险识别等
                      </p>
                    </div>
                  ) : (
                    messages.map((message, index) => (
                      <div
                        key={index}
                        className={`flex ${
                          message.role === 'user' ? 'justify-end' : 'justify-start'
                        }`}
                      >
                        <div
                          className={`max-w-[80%] rounded-lg p-3 ${
                            message.role === 'user'
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white'
                          }`}
                        >
                          <p className="text-sm whitespace-pre-wrap">
                            {message.content}
                          </p>
                          <p className="text-xs mt-1 opacity-70">
                            {new Date(message.timestamp).toLocaleTimeString('zh-CN', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>

              <div className="flex space-x-2">
                <Input
                  placeholder="输入您的问题..."
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && inputMessage.trim() && handleSendMessage()}
                  disabled={loading}
                />
                <Button
                  onClick={() => inputMessage.trim() && handleSendMessage()}
                  disabled={loading || !inputMessage.trim()}
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <ArrowRight className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
