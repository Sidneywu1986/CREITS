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
      <Card className="p-4 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer h-full group relative">
        <div className="absolute top-4 right-4 flex gap-1">
          {isHot && <Badge className="bg-orange-100 text-orange-600 hover:bg-orange-200 text-xs px-2 py-0">热门</Badge>}
          {isNew && <Badge className="bg-green-100 text-green-600 hover:bg-green-200 text-xs px-2 py-0">新</Badge>}
        </div>
        <div className="flex items-start gap-3">
          <div className="text-3xl group-hover:scale-110 transition-transform duration-200">
            {icon}
          </div>
          <div className="flex-1 pt-1">
            <h3 className="text-base font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">
              {title}
            </h3>
            <p className="text-sm text-gray-500 mt-1">{description}</p>
          </div>
        </div>
      </Card>
    </Link>
  );
}
