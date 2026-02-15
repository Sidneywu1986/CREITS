'use client';

import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  Home,
  TrendingUp,
  Newspaper,
  Shield,
  DollarSign,
  FolderOpen,
  Users,
  Coins,
  MessageSquare,
  Calculator,
  Settings,
} from 'lucide-react';

export default function SimpleNavigation() {
  const router = useRouter();

  const navItems = [
    {
      title: '首页',
      href: '/',
      icon: Home,
    },
    {
      title: '发行状态',
      href: '/issuance-status',
      icon: TrendingUp,
    },
    {
      title: '已发行REITs',
      href: '/issued-reits',
      icon: DollarSign,
    },
    {
      title: '已发行ABS',
      href: '/issued-abs',
      icon: FolderOpen,
    },
    {
      title: '市场行情',
      href: '/market',
      icon: TrendingUp,
    },
    {
      title: '新闻资讯',
      href: '/news',
      icon: Newspaper,
    },
    {
      title: '法务风控',
      href: '/law',
      icon: Shield,
    },
    {
      title: '定价管理',
      href: '/pricing',
      icon: DollarSign,
    },
    {
      title: '项目管理',
      href: '/projects',
      icon: FolderOpen,
    },
    {
      title: '专家系统',
      href: '/expert',
      icon: Users,
    },
    {
      title: '积分中心',
      href: '/points',
      icon: Coins,
    },
    {
      title: '匿名BBS',
      href: '/bbs',
      icon: MessageSquare,
    },
    {
      title: '估值计算器',
      href: '/calculator',
      icon: Calculator,
    },
    {
      title: '设置',
      href: '/settings',
      icon: Settings,
    },
  ];

  return (
    <nav className="w-64 bg-white border-r border-gray-200 h-screen overflow-y-auto">
      <div className="p-4 border-b border-gray-200">
        <h1 className="text-xl font-bold text-gray-800">REITs 智能助手</h1>
      </div>

      <div className="p-4">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = router.pathname === item.href;

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-600 font-medium'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.title}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
