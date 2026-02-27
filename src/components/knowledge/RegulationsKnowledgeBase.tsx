/**
 * 法规知识库组件
 * 提供法规文档的分类、检索和管理功能
 */

'use client';

import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  FileText,
  Search,
  Filter,
  Download,
  ExternalLink,
  BookOpen,
  Scale,
  ChevronRight
} from 'lucide-react';
import Link from 'next/link';

interface RegulationDocument {
  id: string;
  code: string;
  title: string;
  issuer: string;
  category: string;
  type: string;
  effectiveDate: string;
  pdfUrl: string;
  summary?: string;
}

export default function RegulationsKnowledgeBase() {
  const [documents, setDocuments] = useState<RegulationDocument[]>([]);
  const [filteredDocs, setFilteredDocs] = useState<RegulationDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedIssuer, setSelectedIssuer] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [issuers, setIssuers] = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>([]);

  // 加载法规数据
  useEffect(() => {
    fetchRegulations();
  }, []);

  // 加载法规列表
  const fetchRegulations = async () => {
    try {
      const response = await fetch('/api/regulations');
      const data = await response.json();

      if (data.data) {
        setDocuments(data.data);
        setFilteredDocs(data.data);

        // 提取发布机构和分类
        const uniqueIssuers: string[] = Array.from(new Set(data.data.map((doc: RegulationDocument) => doc.issuer)));
        const uniqueCategories: string[] = Array.from(new Set(data.data.map((doc: RegulationDocument) => doc.category)));

        setIssuers(uniqueIssuers);
        setCategories(uniqueCategories);
      }
    } catch (error) {
      console.error('Failed to fetch regulations:', error);
    } finally {
      setLoading(false);
    }
  };

  // 搜索和筛选
  useEffect(() => {
    let result = [...documents];

    // 关键词搜索
    if (searchKeyword) {
      const keyword = searchKeyword.toLowerCase();
      result = result.filter(doc =>
        doc.title.toLowerCase().includes(keyword) ||
        doc.summary?.toLowerCase().includes(keyword) ||
        doc.code.toLowerCase().includes(keyword)
      );
    }

    // 发布机构筛选
    if (selectedIssuer) {
      result = result.filter(doc => doc.issuer === selectedIssuer);
    }

    // 分类筛选
    if (selectedCategory) {
      result = result.filter(doc => doc.category === selectedCategory);
    }

    setFilteredDocs(result);
  }, [searchKeyword, selectedIssuer, selectedCategory, documents]);

  // 重置筛选
  const resetFilters = () => {
    setSearchKeyword('');
    setSelectedIssuer('');
    setSelectedCategory('');
  };

  // 获取发布机构的颜色
  const getIssuerColor = (issuer: string) => {
    switch (issuer) {
      case '证监会':
        return 'bg-red-100 text-red-700 border-red-300';
      case '上交所':
        return 'bg-blue-100 text-blue-700 border-blue-300';
      case '深交所':
        return 'bg-green-100 text-green-700 border-green-300';
      case '通用指引':
        return 'bg-purple-100 text-purple-700 border-purple-300';
      case '沪深交易所':
        return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  // 获取法规类型的颜色
  const getTypeColor = (type: string) => {
    switch (type) {
      case '试行':
        return 'bg-orange-100 text-orange-700';
      case '正式':
        return 'bg-blue-100 text-blue-700';
      case '通知':
        return 'bg-green-100 text-green-700';
      case '指引':
        return 'bg-purple-100 text-purple-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">加载法规知识库...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">法规总数</p>
                <p className="text-3xl font-bold text-purple-600">{documents.length}</p>
              </div>
              <BookOpen className="w-10 h-10 text-purple-200" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">证监会</p>
                <p className="text-3xl font-bold text-red-600">
                  {documents.filter(d => d.issuer === '证监会').length}
                </p>
              </div>
              <Scale className="w-10 h-10 text-red-200" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">上交所</p>
                <p className="text-3xl font-bold text-blue-600">
                  {documents.filter(d => d.issuer === '上交所').length}
                </p>
              </div>
              <FileText className="w-10 h-10 text-blue-200" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">深交所</p>
                <p className="text-3xl font-bold text-green-600">
                  {documents.filter(d => d.issuer === '深交所').length}
                </p>
              </div>
              <FileText className="w-10 h-10 text-green-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 搜索和筛选 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            法规检索
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* 搜索框 */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="搜索法规标题、编号或关键词..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* 筛选器 */}
            <div className="flex flex-wrap gap-3">
              {/* 发布机构筛选 */}
              <select
                value={selectedIssuer}
                onChange={(e) => setSelectedIssuer(e.target.value)}
                className="px-4 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">所有发布机构</option>
                {issuers.map(issuer => (
                  <option key={issuer} value={issuer}>{issuer}</option>
                ))}
              </select>

              {/* 分类筛选 */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">所有分类</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>

              {/* 重置按钮 */}
              {(searchKeyword || selectedIssuer || selectedCategory) && (
                <Button
                  variant="outline"
                  onClick={resetFilters}
                  className="text-sm"
                >
                  重置筛选
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 法规列表 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              法规列表
              <span className="text-sm font-normal text-muted-foreground ml-2">
                共 {filteredDocs.length} 份
              </span>
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {filteredDocs.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Search className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>未找到匹配的法规</p>
              <p className="text-sm mt-2">请调整搜索条件</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredDocs.map((doc) => (
                <div
                  key={doc.id}
                  className="p-4 border rounded-lg hover:shadow-md transition-shadow bg-white dark:bg-gray-800"
                >
                  {/* 法规头部 */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`px-2 py-0.5 text-xs font-medium rounded border ${getIssuerColor(doc.issuer)}`}>
                          {doc.issuer}
                        </span>
                        <span className={`px-2 py-0.5 text-xs font-medium rounded ${getTypeColor(doc.type)}`}>
                          {doc.type}
                        </span>
                      </div>
                      <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100">
                        {doc.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        编号: {doc.code} • 生效日期: {doc.effectiveDate}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => window.open(doc.pdfUrl, '_blank')}
                      title="查看PDF"
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* 法规摘要 */}
                  {doc.summary && (
                    <p className="text-sm text-muted-foreground mb-3">
                      {doc.summary}
                    </p>
                  )}

                  {/* 底部信息 */}
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-4">
                      <span className="text-muted-foreground">
                        <span className="font-medium">分类:</span> {doc.category}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-purple-600 hover:text-purple-700"
                      onClick={() => window.open(doc.pdfUrl, '_blank')}
                    >
                      查看全文
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 快速链接 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ExternalLink className="w-5 h-5" />
            相关链接
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link
              href="https://www.csrc.gov.cn/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <div className="w-10 h-10 rounded-lg bg-red-100 dark:bg-red-900 flex items-center justify-center">
                <Scale className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <div className="font-medium">中国证监会</div>
                <div className="text-sm text-muted-foreground">官方法规发布</div>
              </div>
            </Link>

            <Link
              href="https://www.sse.com.cn/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                <FileText className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <div className="font-medium">上海证券交易所</div>
                <div className="text-sm text-muted-foreground">REITs业务规则</div>
              </div>
            </Link>

            <Link
              href="https://www.szse.cn/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900 flex items-center justify-center">
                <FileText className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <div className="font-medium">深圳证券交易所</div>
                <div className="text-sm text-muted-foreground">REITs业务规则</div>
              </div>
            </Link>

            <Link
              href="/chat?agentId=legal"
              className="flex items-center gap-3 p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <div className="font-medium">法规问答</div>
                <div className="text-sm text-muted-foreground">智能法规咨询</div>
              </div>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
