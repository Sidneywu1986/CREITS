import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, ArrowRight, MessageSquare, ThumbsUp, MessageCircle } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// 模拟发行状态数据
const issuanceData = [
  {
    code: 'SZ202401',
    name: '中金安徽交控REIT',
    status: '已受理',
    date: '2024-01-15',
    broker: '中金公司',
    progress: 10,
    description: '中金安徽交通控股集团有限公司作为原始权益人，发行规模50亿元。',
    comments: [
      {
        id: 1,
        user: '投资者A',
        content: '这个项目看起来很有前景，期待进展！',
        time: '2024-01-16 10:30',
        likes: 12,
        replies: [
          { user: '投资者B', content: '同期待，交控类资产稳定性不错', time: '2024-01-16 11:00' }
        ]
      }
    ]
  },
  {
    code: 'SH202402',
    name: '华夏中交建高速REIT',
    status: '已反馈',
    date: '2024-01-20',
    broker: '华夏基金',
    progress: 30,
    description: '华夏基金管理有限公司作为基金管理人，发行规模80亿元。',
    comments: []
  },
  {
    code: 'SZ202403',
    name: '博时招商蛇口产业园REIT',
    status: '已通过',
    date: '2024-01-25',
    broker: '博时基金',
    progress: 50,
    description: '博时基金管理有限公司作为基金管理人，发行规模30亿元。',
    comments: []
  },
  {
    code: 'SH202404',
    name: '国泰君安东久新经济REIT',
    status: '已注册',
    date: '2024-02-01',
    broker: '国泰君安证券',
    progress: 70,
    description: '国泰君安资产管理有限公司作为管理人，发行规模60亿元。',
    comments: []
  },
  {
    code: 'SZ202405',
    name: '红土创新盐田港仓储物流REIT',
    status: '已定价',
    date: '2024-02-08',
    broker: '红土创新基金',
    progress: 90,
    description: '红土创新基金管理有限公司作为基金管理人，发行规模25亿元。',
    comments: []
  },
  {
    code: 'SH202406',
    name: '富国首创水务REIT',
    status: '上市/挂牌',
    date: '2024-02-15',
    broker: '富国基金',
    progress: 100,
    description: '富国基金管理有限公司作为基金管理人，发行规模45亿元。',
    comments: []
  }
];

// 状态颜色映射
const statusColors: Record<string, string> = {
  '已受理': 'bg-blue-500',
  '已反馈': 'bg-yellow-500',
  '已通过': 'bg-green-500',
  '已注册': 'bg-purple-500',
  '已定价': 'bg-orange-500',
  '上市/挂牌': 'bg-emerald-600'
};

export default function IssuanceStatusPage() {
  const [selectedStatus, setSelectedStatus] = useState('全部');
  const [expandedProject, setExpandedProject] = useState<string | null>(null);

  const statuses = ['全部', '已受理', '已反馈', '已通过', '已注册', '已定价', '上市/挂牌'];

  const filteredData = selectedStatus === '全部'
    ? issuanceData
    : issuanceData.filter(item => item.status === selectedStatus);

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="mb-6">
        <div className="flex items-center">
          <Link href="/">
            <Button variant="ghost" size="sm" className="mr-4">
              <ArrowRight className="mr-2 h-4 w-4 rotate-180" />
              返回
            </Button>
          </Link>
          <h1 className="text-3xl font-bold flex items-center">
            <Clock className="mr-3 text-[#667eea]" />
            发行状态跟踪
          </h1>
        </div>
      </div>

      <Tabs defaultValue="list" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="list">发行项目列表</TabsTrigger>
          <TabsTrigger value="progress">发行流程进度</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          <div className="mb-6">
            <div className="flex gap-2 flex-wrap">
              {statuses.map(status => (
                <Button
                  key={status}
                  variant={selectedStatus === status ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedStatus(status)}
                  className={selectedStatus === status ? 'bg-[#667eea]' : ''}
                >
                  {status}
                </Button>
              ))}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {filteredData.map(project => (
              <Card key={project.code} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{project.name}</CardTitle>
                    <Badge className={`${statusColors[project.status]} text-white`}>
                      {project.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">项目代码：</span>
                        {project.code}
                      </div>
                      <div>
                        <span className="text-muted-foreground">受理日期：</span>
                        {project.date}
                      </div>
                      <div>
                        <span className="text-muted-foreground">计划管理人：</span>
                        {project.broker}
                      </div>
                      <div>
                        <span className="text-muted-foreground">发行进度：</span>
                        {project.progress}%
                      </div>
                    </div>

                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-[#667eea] h-2 rounded-full transition-all"
                        style={{ width: `${project.progress}%` }}
                      />
                    </div>

                    <p className="text-sm text-muted-foreground">
                      {project.description}
                    </p>

                    {/* BBS 讨论区 */}
                    <div className="border-t pt-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start"
                        onClick={() => setExpandedProject(
                          expandedProject === project.code ? null : project.code
                        )}
                      >
                        <MessageSquare className="mr-2 h-4 w-4" />
                        讨论 ({project.comments.length})
                      </Button>

                      {expandedProject === project.code && (
                        <div className="mt-3 space-y-3">
                          {project.comments.length === 0 ? (
                            <p className="text-sm text-muted-foreground text-center py-4">
                              暂无评论，快来发表第一个观点吧！
                            </p>
                          ) : (
                            project.comments.map(comment => (
                              <div key={comment.id} className="pl-4 border-l-2 border-gray-200">
                                <div className="flex items-center justify-between">
                                  <span className="font-semibold text-sm">{comment.user}</span>
                                  <span className="text-xs text-muted-foreground">{comment.time}</span>
                                </div>
                                <p className="text-sm mt-1">{comment.content}</p>
                                <div className="flex items-center gap-4 mt-2">
                                  <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
                                    <ThumbsUp className="mr-1 h-3 w-3" />
                                    {comment.likes}
                                  </Button>
                                  <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
                                    <MessageCircle className="mr-1 h-3 w-3" />
                                    回复 ({comment.replies.length})
                                  </Button>
                                </div>
                                {comment.replies.length > 0 && (
                                  <div className="mt-2 pl-4 space-y-2">
                                    {comment.replies.map((reply, idx) => (
                                      <div key={idx} className="bg-gray-50 p-2 rounded">
                                        <div className="flex items-center justify-between">
                                          <span className="font-medium text-xs">{reply.user}</span>
                                          <span className="text-xs text-muted-foreground">{reply.time}</span>
                                        </div>
                                        <p className="text-xs mt-1">{reply.content}</p>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            ))
                          )}
                          <div className="space-y-2">
                            <Textarea
                              placeholder="发表你的看法..."
                              className="min-h-[80px]"
                            />
                            <div className="flex gap-2">
                              <Button size="sm" className="bg-[#667eea]">
                                发表评论
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="progress">
          <Card>
            <CardHeader>
              <CardTitle>REITs发行流程进度</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                {issuanceData.map((project, idx) => (
                  <div key={project.code} className="relative">
                    {idx !== issuanceData.length - 1 && (
                      <div className="absolute left-4 top-8 bottom-0 w-0.5 bg-gray-200" />
                    )}
                    <div className="flex items-start gap-4">
                      <div className={`w-8 h-8 rounded-full ${statusColors[project.status]} flex items-center justify-center text-white font-bold shrink-0`}>
                        {idx + 1}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-semibold">{project.name}</h3>
                          <Badge className={`${statusColors[project.status]} text-white`}>
                            {project.status}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground mb-2">
                          项目代码：{project.code} | 受理日期：{project.date}
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-[#667eea] h-2 rounded-full"
                            style={{ width: `${project.progress}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export const metadata = {
  title: '发行状态跟踪 - REITs 智能助手',
  description: '实时跟踪REITs发行状态',
};
