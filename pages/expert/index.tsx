import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Star, MessageSquare, TrendingUp } from 'lucide-react';

export default function ExpertIndexPage() {
  const [searchQuery, setSearchQuery] = useState('');

  // 模拟专家数据
  const experts = [
    {
      id: 1,
      name: '张三',
      title: 'REITs 估值专家',
      specialization: '房地产估值、资产定价',
      rating: 4.8,
      reviews: 128,
      consultations: 256,
      price: 200,
      avatar: '👨‍💼',
    },
    {
      id: 2,
      name: '李四',
      title: '法务风控专家',
      specialization: '法律合规、风险识别',
      rating: 4.9,
      reviews: 156,
      consultations: 312,
      price: 250,
      avatar: '👩‍💼',
    },
    {
      id: 3,
      name: '王五',
      title: '市场分析专家',
      specialization: '市场趋势、数据分析',
      rating: 4.7,
      reviews: 98,
      consultations: 198,
      price: 180,
      avatar: '👨‍💻',
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">专家智库</h1>
        <p className="text-gray-600">专业的 REITs 专家，为您提供专业的咨询和服务</p>
      </div>

      {/* 搜索栏 */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            type="text"
            placeholder="搜索专家..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* 专家列表 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {experts.map((expert) => (
          <Card key={expert.id}>
            <CardHeader>
              <div className="flex items-start gap-4">
                <div className="text-4xl">{expert.avatar}</div>
                <div className="flex-1">
                  <CardTitle>{expert.name}</CardTitle>
                  <CardDescription>{expert.title}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <Badge variant="outline" className="mb-2">
                    {expert.specialization}
                  </Badge>
                </div>

                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium">{expert.rating}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MessageSquare className="w-4 h-4" />
                    <span>{expert.reviews} 评价</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <TrendingUp className="w-4 h-4" />
                    <span>{expert.consultations} 咨询</span>
                  </div>
                </div>

                <div className="pt-3 border-t">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-2xl font-bold text-blue-600">
                      ¥{expert.price}
                    </span>
                    <span className="text-sm text-gray-500">/次</span>
                  </div>
                  <Button className="w-full">立即咨询</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
