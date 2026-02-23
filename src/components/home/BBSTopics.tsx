'use client';

import Link from 'next/link';

interface Topic {
  title: string;
  replies: number;
}

const topics: Topic[] = [
  { title: '估值参数怎么选？经验分享', replies: 23 },
  { title: '尽调中发现产权瑕疵怎么办？', replies: 15 },
];

export default function BBSTopics() {
  return (
    <div className="border border-gray-200 rounded-lg p-4 h-full">
      <h3 className="text-sm font-semibold text-gray-800 mb-2">
        匿名BBS · 热门讨论
      </h3>

      <div className="space-y-0">
        {topics.map((topic, index) => (
          <Link key={index} href="/bbs" className="block">
            <div className="flex justify-between items-center py-2 hover:bg-gray-50 transition-colors duration-200 group">
              <span className="text-sm text-gray-700 group-hover:text-blue-600 transition-colors">
                {topic.title}
              </span>
              <span className="text-xs text-gray-400">
                {topic.replies} 回复
              </span>
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-3 pt-3 border-t border-gray-100">
        <Link href="/bbs">
          <span className="text-sm text-blue-600 hover:underline">
            匿名参与
          </span>
        </Link>
      </div>
    </div>
  );
}
