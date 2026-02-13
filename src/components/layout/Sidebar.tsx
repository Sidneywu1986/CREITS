'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  FileText,
  Bot,
  TrendingUp,
  FolderKanban,
  Settings,
  Building,
  Briefcase,
  Gamepad2,
  Zap,
} from 'lucide-react';

const navigation = [
  { name: '首页', href: '/', icon: LayoutDashboard },
  { name: 'Agent 选择', href: '/agents', icon: Bot },
  { name: '项目管理', href: '/projects', icon: FolderKanban },
  { name: '市场行情', href: '/market', icon: TrendingUp },
  { name: '资产证券化新闻', href: '/news', icon: FileText },
  { name: '已发行REITs项目', href: '/issued-reits', icon: Building },
  { name: '已发行ABS项目', href: '/issued-abs', icon: Briefcase },
  { name: '休闲小游戏', href: '/games', icon: Gamepad2 },
  { name: '集成指南', href: '/integration', icon: Zap },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r bg-gray-50/50 dark:bg-gray-900/50 flex flex-col h-[calc(100vh-4rem)]">
      <nav className="flex-1 px-3 py-6 space-y-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-all duration-200',
                isActive
                  ? 'bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white shadow-md'
                  : 'text-gray-700 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-800'
              )}
            >
              <item.icon className={cn('mr-3 h-5 w-5', isActive ? 'text-white' : 'text-gray-500')} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t">
        <Link
          href="/settings"
          className="flex items-center px-3 py-3 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-800 transition-all duration-200"
        >
          <Settings className="mr-3 h-5 w-5 text-gray-500" />
          设置
        </Link>
      </div>
    </aside>
  );
}
