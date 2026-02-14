/**
 * 交易所公告查询组件
 * 提供上交所和深交所公告查询和下载功能
 */

'use client';

import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  ExternalLink,
  Download,
  FileText,
  Calendar,
  Search,
  Filter,
  BookOpen,
  ChevronRight,
} from 'lucide-react';
import {
  getAnnouncementQueryLink,
  getAnnouncementTypeIcon,
  getAnnouncementTypeDescription,
  ANNOUNCEMENT_TYPES,
  ANNOUNCEMENT_TIMELINE,
  getFundListUrl,
} from '@/lib/services/announcement-service';

interface AnnouncementQueryProps {
  code: string;
  name: string;
  exchange?: 'SSE' | 'SZSE';
}

export default function AnnouncementQuery({
  code,
  name,
  exchange: propExchange,
}: AnnouncementQueryProps) {
  const [selectedType, setSelectedType] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  // 确定交易所
  const exchange = propExchange || (code.startsWith('50') ? 'SSE' : 'SZSE');
  const exchangeName = exchange === 'SSE' ? '上海证券交易所' : '深圳证券交易所';
  const announcementLink = getAnnouncementQueryLink(code, name);

  // 跳转到交易所公告页面
  const handleGoToAnnouncementPage = () => {
    window.open(announcementLink.url, '_blank');
  };

  // 按类型跳转到交易所公告页面（带筛选）
  const handleFilterByType = (type: string) => {
    // 实际应用中应根据交易所API调整筛选参数
    window.open(announcementLink.url, '_blank');
  };

  // 跳转到基金列表页面
  const handleGoToFundList = () => {
    const fundListUrl = getFundListUrl(exchange);
    window.open(fundListUrl, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* 快速查询卡片 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#667eea]" />
            交易所公告查询
          </CardTitle>
          <CardDescription>
            通过交易所官方平台查询{exchangeName}的公告信息
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 产品信息 */}
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 rounded-lg">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline" className="bg-white dark:bg-gray-800">
                  {code}
                </Badge>
                <Badge className="bg-[#667eea]">{exchangeName}</Badge>
              </div>
              <h3 className="font-semibold text-lg">{name}</h3>
            </div>
            <Button
              onClick={handleGoToAnnouncementPage}
              className="bg-gradient-to-r from-[#667eea] to-[#764ba2]"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              查看公告
            </Button>
          </div>

          {/* 使用说明 */}
          <div className="space-y-3 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
            <h4 className="font-semibold flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              使用说明
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-start gap-2">
                <ChevronRight className="w-4 h-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                <div>
                  <strong className="text-gray-900 dark:text-white">上交所：</strong>
                  进入"公募REITs公告"页面后，在搜索框输入代码或简称，即可按公告类型和时间范围筛选。
                </div>
              </div>
              <div className="flex items-start gap-2">
                <ChevronRight className="w-4 h-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                <div>
                  <strong className="text-gray-900 dark:text-white">深交所：</strong>
                  进入"公告正文"页面，同样通过输入代码或简称，就能找到该产品从发售到上市后的所有历史公告。
                </div>
              </div>
              <div className="flex items-start gap-2">
                <ChevronRight className="w-4 h-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                <div>
                  <strong className="text-gray-900 dark:text-white">下载提示：</strong>
                  直接点击"公告下载"即可保存PDF文件。
                </div>
              </div>
            </div>
          </div>

          {/* 筛选工具 */}
          <div className="space-y-3">
            <h4 className="font-semibold flex items-center gap-2">
              <Filter className="w-4 h-4" />
              筛选条件
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <Label htmlFor="announcementType">公告类型</Label>
                <select
                  id="announcementType"
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="w-full mt-1 px-3 py-2 border rounded-md bg-white dark:bg-gray-800"
                >
                  <option value="">全部类型</option>
                  {Object.entries(ANNOUNCEMENT_TYPES).map(([key, value]) => (
                    <option key={key} value={value}>
                      {value}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor="startDate">开始日期</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="endDate">结束日期</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>
            </div>
            <Button
              onClick={() => {
                if (selectedType) {
                  handleFilterByType(selectedType);
                } else {
                  handleGoToAnnouncementPage();
                }
              }}
              variant="outline"
              className="w-full"
            >
              <Search className="w-4 h-4 mr-2" />
              应用筛选并查询
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 公告类型按时间线整理 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-[#667eea]" />
            按时间线整理的公告类型
          </CardTitle>
          <CardDescription>
            按产品生命周期整理的完整资料清单
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {ANNOUNCEMENT_TIMELINE.map((type) => (
              <div
                key={type}
                className="flex items-start gap-3 p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors cursor-pointer"
                onClick={() => handleFilterByType(type)}
              >
                <div className="text-2xl flex-shrink-0">
                  {getAnnouncementTypeIcon(type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h5 className="font-semibold">{type}</h5>
                    <Badge variant="outline" className="text-xs">
                      {type}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {getAnnouncementTypeDescription(type)}
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 查看所有REITs产品 */}
      <Card>
        <CardHeader>
          <CardTitle>查看所有REITs产品</CardTitle>
          <CardDescription>
            通过交易所基金列表功能查询所有79只产品代码
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            onClick={handleGoToFundList}
            variant="outline"
            className="w-full"
          >
            <BookOpen className="w-4 h-4 mr-2" />
            查看{exchangeName}基金列表
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
