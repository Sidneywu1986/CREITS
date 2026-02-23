'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquare, Shield, Flame } from 'lucide-react';
import Link from 'next/link';

interface Topic {
  title: string;
  replies: number;
  isHot: boolean;
}

const topics: Topic[] = [
  { title: '估值参数怎么选？经验分享', replies: 23, isHot: true },
  { title: '尽调中发现产权瑕疵怎么办？', replies: 15, isHot: true },
];

export default function BBSTopics() {
  return (
    <Card className="shadow-sm h-full">
      <CardHeader className="p-4 pb-3">
        <CardTitle className="text-base font-semibold flex items-center">
          <MessageSquare className="mr-2 h-4 w-4 text-orange-600" />
          匿名BBS · 热门讨论
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="space-y-2">
          {topics.map((topic, index) => (
            <Link key={index} href="/bbs" className="block">
              <div className="py-2 px-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer group">
                <p className="text-sm text-gray-800 group-hover:text-blue-600 transition-colors mb-1 line-clamp-2">
                  {topic.title}
                </p>
                <div className="flex items-center gap-1.5 text-xs text-gray-400">
                  <MessageSquare className="h-3 w-3" />
                  <span>{topic.replies} 回复</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
        <div className="flex justify-end pt-3">
          <Link href="/bbs" className="text-xs text-gray-500 hover:text-blue-600 transition-colors">
            匿名参与 →
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
