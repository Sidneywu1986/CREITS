'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
    <Link href={href}>
      <Card className="p-4 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 cursor-pointer h-full group">
        <div className="flex items-start gap-3">
          <div className="text-3xl group-hover:scale-110 transition-transform duration-200">
            {icon}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">
                {title}
              </h3>
              {isHot && <Badge className="bg-red-500 hover:bg-red-600 text-xs px-2 py-0">热门</Badge>}
              {isNew && <Badge className="bg-green-500 hover:bg-green-600 text-xs px-2 py-0">新</Badge>}
            </div>
            <p className="text-sm text-gray-500">{description}</p>
          </div>
        </div>
      </Card>
    </Link>
  );
}
