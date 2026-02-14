'use client';

import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FolderKanban, Plus, Search, Filter, MoreVertical, Edit, Trash2, Download } from 'lucide-react';

export default function ProjectsPage() {
  return (
    <MainLayout>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold flex items-center">
          <FolderKanban className="mr-3 text-[#667eea]" />
          项目管理
        </h1>
        <Button className="bg-gradient-to-r from-[#667eea] to-[#764ba2] hover:opacity-90">
          <Plus className="mr-2 h-4 w-4" />
          新建项目
        </Button>
      </div>

      {/* Filter Bar */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex items-center space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input placeholder="搜索项目..." className="pl-10" />
            </div>
            <Select>
              <SelectTrigger className="w-[180px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="项目状态" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部状态</SelectItem>
                <SelectItem value="preparation">准备中</SelectItem>
                <SelectItem value="reviewing">审核中</SelectItem>
                <SelectItem value="approved">已批准</SelectItem>
                <SelectItem value="launched">已发行</SelectItem>
              </SelectContent>
            </Select>
            <Select>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="时间排序" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">最新创建</SelectItem>
                <SelectItem value="oldest">最早创建</SelectItem>
                <SelectItem value="updated">最近更新</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Project List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card key={i} className="hover:shadow-xl transition-all duration-300">
            <CardHeader>
              <div className="flex items-center justify-between mb-2">
                <Badge variant={i % 3 === 0 ? 'default' : i % 2 === 0 ? 'secondary' : 'outline'}>
                  {i % 3 === 0 ? '已发行' : i % 2 === 0 ? '审核中' : '准备中'}
                </Badge>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </div>
              <CardTitle className="text-lg">商业不动产 REITs 项目 {i}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">创建时间</span>
                  <span>2024-01-{(10 + i).toString().padStart(2, '0')}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">项目规模</span>
                  <span>50.2 亿元</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">基础资产</span>
                  <span>商业地产</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">当前阶段</span>
                  <span className="font-medium">
                    {i % 3 === 0 ? '已发行' : i % 2 === 0 ? '审核中' : '准备中'}
                  </span>
                </div>
                <div className="flex space-x-2 mt-4">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Edit className="mr-2 h-3 w-3" />
                    编辑
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    <Download className="mr-2 h-3 w-3" />
                    导出
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </MainLayout>
  );
}
