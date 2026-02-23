'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Bot,
  FolderKanban,
  Clock,
  Building,
  Briefcase,
  Table2,
  TrendingUp,
  FileText,
  Calculator,
  Gamepad2,
  MessageSquare,
  Settings,
  ChevronRight,
  Dot,
} from 'lucide-react';

interface NavGroup {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  items: {
    name: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string;
  }[];
}

const navigation: NavGroup[] = [
  {
    title: 'Agent 中心',
    icon: Bot,
    color: 'text-blue-600',
    items: [
      { name: 'Agent 选择', href: '/agents', icon: Bot, badge: '6个' },
    ],
  },
  {
    title: '项目中心',
    icon: FolderKanban,
    color: 'text-purple-600',
    items: [
      { name: '项目管理', href: '/projects', icon: FolderKanban },
      { name: '发行状态', href: '/issuance-status', icon: Clock },
      { name: '已发行 REITs', href: '/issued-reits', icon: Building },
      { name: '已发行 ABS', href: '/abs-dashboard', icon: Briefcase },
      { name: 'REITs 八张表数据', href: '/reits-data-tables', icon: Table2 },
    ],
  },
  {
    title: '市场数据',
    icon: TrendingUp,
    color: 'text-green-600',
    items: [
      { name: '市场行情', href: '/market', icon: TrendingUp },
      { name: '资产证券化新闻', href: '/news', icon: FileText },
    ],
  },
  {
    title: '分析工具',
    icon: Calculator,
    color: 'text-orange-600',
    items: [
      { name: 'REITs 估值计算器', href: '/calculator', icon: Calculator },
    ],
  },
  {
    title: '休闲社区',
    icon: Gamepad2,
    color: 'text-pink-600',
    items: [
      { name: '休闲小游戏', href: '/games', icon: Gamepad2 },
      { name: '匿名 BBS', href: '/bbs', icon: MessageSquare, badge: '热门' },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-72 border-r bg-gray-50/50 dark:bg-gray-900/50 flex flex-col h-[calc(100vh-4rem)] overflow-y-auto">
      <nav className="flex-1 px-4 py-6 space-y-6">
        {navigation.map((group) => (
          <div key={group.title}>
            {/* 组标题 */}
            <div className="flex items-center gap-2 mb-3">
              <group.icon className={cn('h-4 w-4', group.color)} />
              <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                {group.title}
              </h3>
            </div>

            {/* 导航项 */}
            <div className="space-y-1">
              {group.items.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 group hover:bg-gray-50 dark:hover:bg-gray-800',
                      isActive
                        ? 'bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white shadow-md'
                        : 'text-gray-700 dark:text-gray-300'
                    )}
                  >
                    <div
                      className={cn('w-0.5 h-3 mr-2 rounded-full', group.color)}
                      style={{ backgroundColor: isActive ? 'rgba(255,255,255,0.3)' : '' }}
                    />
                    <item.icon
                      className={cn('mr-3 h-4 w-4', isActive ? 'text-white' : group.color)}
                    />
                    <span className="flex-1">{item.name}</span>
                    {item.badge && (
                      <span
                        className={cn(
                          'text-xs px-2 py-0.5 rounded-full font-medium',
                          isActive ? 'bg-white/20' : 'bg-red-100 text-red-600'
                        )}
                      >
                        {item.badge}
                      </span>
                    )}
                    {isActive && <ChevronRight className="h-4 w-4 ml-2" />}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="p-4 border-t">
        <Link
          href="/settings"
          className="flex items-center px-3 py-2.5 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-800 transition-all duration-200"
        >
          <Settings className="mr-3 h-4 w-4 text-gray-500" />
          <span>设置</span>
        </Link>
      </div>
    </aside>
  );
}
