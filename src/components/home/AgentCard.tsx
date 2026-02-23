'use client';

import Link from 'next/link';

interface AgentCardProps {
  icon: string;
  title: string;
  description: string;
  href: string;
  isHot?: boolean;
  isNew?: boolean;
}

export default function AgentCard({
  icon,
  title,
  description,
  href,
  isHot = false,
  isNew = false,
}: AgentCardProps) {
  return (
    <Link href={href} className="block">
      <div className="bg-white/5 border border-white/10 rounded-lg p-4 hover:bg-white/10 hover:border-white/20 transition-colors duration-200 cursor-pointer h-full group">
        <div className="flex justify-between items-start mb-2">
          <div className="text-3xl">{icon}</div>
          <div className="flex gap-1">
            {isHot && (
              <span className="bg-white/20 text-white/80 text-xs font-medium px-2 py-0.5 rounded">
                热门
              </span>
            )}
            {isNew && (
              <span className="bg-white/20 text-white/80 text-xs font-medium px-2 py-0.5 rounded">
                新
              </span>
            )}
          </div>
        </div>
        <h3 className="text-base font-semibold text-white group-hover:text-blue-400 transition-colors">
          {title}
        </h3>
        <p className="text-sm text-white/60 mt-1">{description}</p>
      </div>
    </Link>
  );
}
