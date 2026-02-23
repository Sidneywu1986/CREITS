'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquare, Shield, Flame, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface Topic {
  title: string;
  replies: number;
  isHot: boolean;
}

const topics: Topic[] = [
  { title: '估值参数怎么选？经验分享', replies: 23, isHot: true },
  { title: '尽调中发现产权瑕疵怎么办？', replies: 15, isHot: true },
  { title: '今日行情讨论：REITs集体回调', replies: 8, isHot: false },
];

export default function BBSTopics() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold flex items-center">
          <MessageSquare className="mr-2 h-5 w-5 text-orange-600" />
          匿名BBS · 隐私保护
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="bg-gradient-to-r from-orange-50 to-red-50 p-3 rounded-lg mb-4">
          <div className="flex items-center gap-2 mb-2">
            <Flame className="h-4 w-4 text-orange-600" />
            <span className="text-sm font-semibold text-gray-700">热门讨论</span>
          </div>
        </div>
        <div className="space-y-2">
          {topics.map((topic, index) => (
            <Link key={index} href="/bbs" className="block">
              <div className="p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer group">
                <div className="flex items-start gap-2">
                  {topic.isHot && <Flame className="h-4 w-4 text-orange-600 mt-0.5" />}
                  <p className="text-sm text-gray-800 group-hover:text-blue-600 transition-colors flex-1">
                    {topic.title}
                  </p>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <Shield className="h-3 w-3 text-green-600" />
                  <span className="text-xs text-gray-500">{topic.replies} 回复</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
        <Link href="/bbs" className="block mt-4">
          <Button variant="outline" className="w-full text-sm" size="sm">
            匿名参与
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
