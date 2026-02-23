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
  User,
  ShieldCheck,
  FileSearch,
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

interface QuickAgent {
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  color: string;
}

const quickAgents: QuickAgent[] = [
  { name: '法务', icon: ShieldCheck, href: '/agents/legal', color: 'text-blue-600' },
  { name: '尽调', icon: FileSearch, href: '/agents/due-diligence', color: 'text-green-600' },
];

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
        {navigation.map((group, groupIndex) => (
          <div key={group.title}>
            {/* 组标题 */}
            <div className="flex items-center gap-2 mb-3">
              <group.icon className={cn('h-4 w-4', group.color)} />
              <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                {group.title}
              </h3>
            </div>

            {/* Agent快捷入口（仅Agent中心下显示） */}
            {group.title === 'Agent 中心' && (
              <div className="grid grid-cols-2 gap-2 mb-3">
                {quickAgents.map((agent) => (
                  <Link
                    key={agent.name}
                    href={agent.href}
                    className="flex flex-col items-center gap-1.5 p-3 bg-white rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all"
                  >
                    <div className={cn('p-2 bg-gray-50 rounded-lg', agent.color)}>
                      <agent.icon className="h-4 w-4" />
                    </div>
                    <span className="text-xs font-medium text-gray-700">{agent.name}</span>
                  </Link>
                ))}
              </div>
            )}

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

      {/* 用户信息卡片 */}
      <div className="p-4 border-t bg-gray-50/50">
        <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200">
          <div className="w-10 h-10 bg-gradient-to-br from-[#667eea] to-[#764ba2] rounded-full flex items-center justify-center text-white font-semibold">
            <User className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-800 truncate">用户名称</p>
            <p className="text-xs text-gray-500 truncate">user@example.com</p>
          </div>
        </div>
        <Link
          href="/settings"
          className="flex items-center justify-center px-3 py-2 mt-2 text-sm font-medium text-gray-600 rounded-lg hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 transition-all duration-200"
        >
          <Settings className="mr-2 h-4 w-4" />
          设置
        </Link>
      </div>
    </aside>
  );
}
