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
      { name: 'ABS数据中心', href: '/abs-dashboard', icon: Briefcase },
      { name: 'REITs 八张表', href: '/reits-data-tables', icon: Table2 },
      { name: 'REITs 八张表 (增强版)', href: '/reits-data-tables-enhanced', icon: Table2, badge: '新' },
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
  {
    title: '系统管理',
    icon: Settings,
    color: 'text-slate-400',
    items: [
      { name: '权限管理', href: '/admin/permissions', icon: User },
      { name: '审计日志', href: '/admin/audit-logs', icon: FileText },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-72 border-r border-white/10 bg-gradient-to-b from-[#0B1E33] to-[#1A3B5E] flex flex-col h-[calc(100vh-4rem)] overflow-y-auto">
      <nav className="flex-1 px-4 py-6 space-y-6">
        {navigation.map((group, groupIndex) => (
          <div key={group.title}>
            {/* 组标题 */}
            <h3 className="text-xs font-semibold uppercase tracking-wider text-white/40 mb-3">
              {group.title}
            </h3>

            {/* 导航项 */}
            <div className="space-y-1">
              {group.items.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'flex items-center py-1.5 text-sm transition-colors duration-200 group hover:text-white',
                      isActive
                        ? 'text-white font-medium border-l-2 border-white pl-2'
                        : 'text-white/70 pl-3'
                    )}
                  >
                    <item.icon
                      className={cn('mr-3 h-4 w-4', isActive ? '' : group.color)}
                    />
                    <span className="flex-1">{item.name}</span>
                    {item.badge && (
                      <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-white/20 text-white/80">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* 用户信息卡片 */}
      <div className="p-4 border-t border-white/10">
        <div className="flex items-center gap-3 p-3 bg-white/10 backdrop-blur-sm rounded-lg border border-white/10">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
            <User className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">用户名称</p>
            <p className="text-xs text-white/40 truncate">user@example.com</p>
          </div>
        </div>
        <Link
          href="/settings"
          className="flex items-center justify-center px-3 py-2 mt-2 text-sm font-medium text-white/70 rounded-lg hover:bg-white/10 transition-all duration-200"
        >
          <Settings className="mr-2 h-4 w-4" />
          设置
        </Link>
      </div>
    </aside>
  );
}
