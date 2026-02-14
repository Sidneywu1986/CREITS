'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../src/components/ui/card';
import { Button } from '../../../src/components/ui/button';
import { Badge } from '../../../src/components/ui/badge';
import { getREITsDetail } from '../../../src/lib/services/simple-real-data-service';
import {
  ArrowLeft,
  FileText,
  Download,
  Search,
  Filter,
} from 'lucide-react';

export default function DocumentsPage() {
  const router = useRouter();
  const { code } = router.query as { code?: string };

  const [projectData, setProjectData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');

  // 加载真实数据
  const loadData = async () => {
    try {
      if (!code) return;

      setLoading(true);
      const data = await getREITsDetail(code as string);

      if (data) {
        setProjectData(data);
      }
    } catch (error) {
      console.error('加载数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (code) {
      loadData();
    }
  }, [code]);

  // 模拟文档数据
  const issuanceDocuments = [
    { id: 1, title: '发起人承诺函', date: '2021-05-15', type: '承诺函', color: 'red' },
    { id: 2, title: '专项计划说明书', date: '2021-05-20', type: '说明书', color: 'blue' },
    { id: 3, title: '法律意见书', date: '2021-05-25', type: '法律文件', color: 'purple' },
    { id: 4, title: '评级报告', date: '2021-05-28', type: '评级报告', color: 'yellow' },
    { id: 5, title: '审计报告', date: '2021-05-30', type: '审计报告', color: 'green' },
    { id: 6, title: '资产评估报告', date: '2021-06-01', type: '评估报告', color: 'orange' },
  ];

  const operationDocuments = [
    { id: 1, title: '2024年第一季度报告', date: '2024-04-30', year: '2024', type: '季度报告' },
    { id: 2, title: '2024年半年度报告', date: '2024-08-31', year: '2024', type: '半年度报告' },
    { id: 3, title: '2024年第三季度报告', date: '2024-10-31', year: '2024', type: '季度报告' },
    { id: 4, title: '2024年年度报告', date: '2025-04-30', year: '2024', type: '年度报告' },
    { id: 5, title: '2023年半年度报告', date: '2023-08-31', year: '2023', type: '半年度报告' },
    { id: 6, title: '2023年年度报告', date: '2024-04-30', year: '2023', type: '年度报告' },
    { id: 7, title: '2022年半年度报告', date: '2022-08-31', year: '2022', type: '半年度报告' },
    { id: 8, title: '2022年年度报告', date: '2023-04-30', year: '2022', type: '年度报告' },
  ];

  // 筛选运营期文档
  const filteredOperationDocs = operationDocuments.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesYear = selectedYear === 'all' || doc.year === selectedYear;
    const matchesType = selectedType === 'all' || doc.type === selectedType;
    return matchesSearch && matchesYear && matchesType;
  });

  // 获取所有年份
  const years = Array.from(new Set(operationDocuments.map(doc => doc.year))).sort((a, b) => b.localeCompare(a));

  // 获取所有类型
  const types = Array.from(new Set(operationDocuments.map(doc => doc.type))).sort();

  const colorMap: Record<string, string> = {
    red: 'bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400',
    blue: 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400',
    purple: 'bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-400',
    yellow: 'bg-yellow-100 dark:bg-yellow-900 text-yellow-600 dark:text-yellow-400',
    green: 'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400',
    orange: 'bg-orange-100 dark:bg-orange-900 text-orange-600 dark:text-orange-400',
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-gray-100"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* 页面头部 */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.back()}
                className="gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                返回
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {projectData?.name || 'REITs产品'} - 全部文档
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  代码: {code} | 共 {issuanceDocuments.length + operationDocuments.length} 份文档
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 主要内容 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 发行期文档 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                发行期文档
              </CardTitle>
              <CardDescription>
                共 {issuanceDocuments.length} 份文档
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {issuanceDocuments.map((doc, index) => (
                  <div
                    key={doc.id}
                    className={`flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900 cursor-pointer transition-colors ${
                      index === 0 ? 'bg-gray-50 dark:bg-gray-900' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded ${colorMap[doc.color]} flex items-center justify-center flex-shrink-0`}>
                        <FileText className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-gray-900 dark:text-white text-sm">{doc.title}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{doc.date}</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 flex-shrink-0">
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 运营期文档 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-green-600" />
                运营期文档
              </CardTitle>
              <CardDescription>
                共 {operationDocuments.length} 份文档
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* 筛选器 */}
              <div className="mb-4 space-y-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="搜索文档..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                  />
                </div>
                <div className="flex gap-2">
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(e.target.value)}
                    className="flex-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                  >
                    <option value="all">全部年份</option>
                    {years.map(year => (
                      <option key={year} value={year}>{year}年</option>
                    ))}
                  </select>
                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="flex-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                  >
                    <option value="all">全部类型</option>
                    {types.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* 文档列表 */}
              <div className="space-y-3 max-h-[500px] overflow-y-auto">
                {filteredOperationDocs.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    没有找到匹配的文档
                  </div>
                ) : (
                  Object.entries(
                    filteredOperationDocs.reduce((acc: Record<string, typeof operationDocuments>, doc) => {
                      if (!acc[doc.year]) {
                        acc[doc.year] = [];
                      }
                      acc[doc.year].push(doc);
                      return acc;
                    }, {})
                  ).map(([year, docs]) => (
                    <div key={year}>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline">{year}年</Badge>
                        <span className="text-xs text-gray-500 dark:text-gray-400">{docs.length} 份文档</span>
                      </div>
                      <div className="space-y-1 ml-2">
                        {docs.map((doc) => (
                          <div
                            key={doc.id}
                            className="flex items-center justify-between p-3 border rounded hover:bg-gray-50 dark:hover:bg-gray-900 cursor-pointer transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded bg-blue-100 dark:bg-blue-900 flex items-center justify-center flex-shrink-0">
                                <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                              </div>
                              <div className="min-w-0">
                                <p className="font-medium text-gray-900 dark:text-white text-sm">{doc.title}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">{doc.date}</p>
                              </div>
                            </div>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 flex-shrink-0">
                              <Download className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
