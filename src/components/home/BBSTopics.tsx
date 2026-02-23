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
    <div className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-xl p-4 h-full">
      <h3 className="text-sm font-semibold text-white mb-1.5">
        匿名BBS · 热门讨论
      </h3>

      <div className="space-y-0">
        {topics.map((topic, index) => (
          <Link key={index} href="/bbs" className="block">
            <div className="flex justify-between items-center py-1.5 hover:bg-white/5 transition-colors duration-200 group border-b border-white/10 last:border-0">
              <span className="text-sm text-white/80 group-hover:text-blue-400 transition-colors">
                {topic.title}
              </span>
              <span className="text-xs text-white/40">
                {topic.replies} 回复
              </span>
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-2 pt-2 border-t border-white/10">
        <Link href="/bbs">
          <span className="text-sm text-blue-400 hover:underline">
            匿名参与
          </span>
        </Link>
      </div>
    </div>
  );
}
