'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Clock, ArrowRight, Search, ChevronDown } from 'lucide-react';

// 模拟发行状态数据
const issuanceData = [
  {
    code: 'SZ202401',
    name: '中金安徽交控REIT',
    status: '已受理',
    date: '2024-01-15',
    broker: '中金公司',
    progress: 10,
    description: '中金安徽交通控股集团有限公司作为原始权益人，发行规模50亿元。',
  },
  {
    code: 'SH202402',
    name: '华夏中交建高速REIT',
    status: '已反馈',
    date: '2024-01-20',
    broker: '华夏基金',
    progress: 30,
    description: '华夏基金管理有限公司作为基金管理人，发行规模80亿元。',
  },
  {
    code: 'SZ202403',
    name: '博时招商蛇口产业园REIT',
    status: '已通过',
    date: '2024-01-25',
    broker: '博时基金',
    progress: 50,
    description: '博时基金管理有限公司作为基金管理人，发行规模30亿元。',
  },
  {
    code: 'SH202404',
    name: '国泰君安东久新经济REIT',
    status: '已注册',
    date: '2024-02-01',
    broker: '国泰君安证券',
    progress: 70,
    description: '国泰君安资产管理有限公司作为管理人，发行规模60亿元。',
  },
  {
    code: 'SZ202405',
    name: '红土创新盐田港仓储物流REIT',
    status: '已定价',
    date: '2024-02-08',
    broker: '红土创新基金',
    progress: 90,
    description: '红土创新基金管理有限公司作为基金管理人，发行规模25亿元。',
  },
  {
    code: 'SH202406',
    name: '富国首创水务REIT',
    status: '上市/挂牌',
    date: '2024-02-15',
    broker: '富国基金',
    progress: 100,
    description: '富国基金管理有限公司作为基金管理人，发行规模45亿元。',
  },
  {
    code: 'SZ202407',
    name: '华安张江产业园REIT',
    status: '已受理',
    date: '2024-02-18',
    broker: '华安基金',
    progress: 5,
    description: '华安基金管理有限公司作为基金管理人，发行规模35亿元。',
  },
  {
    code: 'SH202408',
    name: '易方达广州开发区物流园REIT',
    status: '已受理',
    date: '2024-02-20',
    broker: '易方达基金',
    progress: 15,
    description: '易方达资产管理有限公司作为管理人，发行规模40亿元。',
  },
  {
    code: 'SZ202409',
    name: '广发中关村产业园REIT',
    status: '已反馈',
    date: '2024-02-22',
    broker: '广发基金',
    progress: 25,
    description: '广发基金管理有限公司作为基金管理人，发行规模55亿元。',
  },
  {
    code: 'SH202410',
    name: '工银瑞信河北高速REIT',
    status: '已通过',
    date: '2024-02-25',
    broker: '工银瑞信基金',
    progress: 60,
    description: '工银瑞信基金管理有限公司作为基金管理人，发行规模70亿元。',
  },
];

// 状态顺序映射（用于排序）
const statusOrder: Record<string, number> = {
  '已受理': 1,
  '已反馈': 2,
  '已通过': 3,
  '已注册': 4,
  '已定价': 5,
  '上市/挂牌': 6,
};

// 进度颜色函数
function getProgressColor(progress: number): string {
  if (progress <= 30) return 'text-blue-400';
  if (progress <= 70) return 'text-yellow-400';
  if (progress <= 99) return 'text-green-400';
  return 'text-purple-400';
}

export default function IssuanceStatusPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('latest');
  const [selectedStatus, setSelectedStatus] = useState('全部');
  const [showSortDropdown, setShowSortDropdown] = useState(false);

  const statuses = ['全部', '已受理', '已反馈', '已通过', '已注册', '已定价', '上市/挂牌'];

  // 排序选项
  const sortOptions = [
    { value: 'latest', label: '最新受理' },
    { value: 'progress-high', label: '进度最高' },
    { value: 'progress-low', label: '进度最低' },
    { value: 'name-az', label: '名称A-Z' },
  ];

  // 过滤和排序数据
  const filteredData = useMemo(() => {
    let filtered = issuanceData;

    // 按状态筛选
    if (selectedStatus !== '全部') {
      filtered = filtered.filter(item => item.status === selectedStatus);
    }

    // 按搜索词筛选
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        item =>
          item.name.toLowerCase().includes(query) ||
          item.code.toLowerCase().includes(query) ||
          item.broker.toLowerCase().includes(query)
      );
    }

    // 排序
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'latest':
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        case 'progress-high':
          return b.progress - a.progress;
        case 'progress-low':
          return a.progress - b.progress;
        case 'name-az':
          return a.name.localeCompare(b.name, 'zh-CN');
        default:
          return 0;
      }
    });

    return sorted;
  }, [searchQuery, sortBy, selectedStatus]);

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-b from-[#0B1E33] to-[#1A3B5E]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 头部区域 */}
        <div className="mb-6 border-b border-white/10 pb-6">
          <div className="flex items-center">
            <Link href="/">
              <button className="flex items-center gap-2 text-white/70 hover:text-white transition-colors">
                <ArrowRight className="h-4 w-4 rotate-180" />
                返回
              </button>
            </Link>
            <div className="ml-6">
              <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                <Clock className="h-6 w-6 text-blue-400" />
                发行状态跟踪
              </h1>
              <p className="text-white/60 text-sm mt-1">
                跟踪REITs/ABS发行全流程进度
              </p>
            </div>
          </div>
        </div>

        {/* 搜索和排序工具栏 */}
        <div className="mb-6 flex flex-col sm:flex-row gap-3 items-center justify-between">
          {/* 搜索框 */}
          <div className="relative flex-1 w-full sm:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/50" />
            <input
              type="text"
              placeholder="搜索项目名称、代码或管理人..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg pl-10 pr-4 py-2 text-white placeholder-white/50 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
            />
          </div>

          {/* 排序下拉按钮 */}
          <div className="relative">
            <button
              onClick={() => setShowSortDropdown(!showSortDropdown)}
              className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg px-4 py-2 text-white flex items-center gap-2 hover:bg-white/20 transition-colors"
            >
              <span className="text-sm">
                {sortOptions.find(opt => opt.value === sortBy)?.label}
              </span>
              <ChevronDown className="h-4 w-4" />
            </button>

            {showSortDropdown && (
              <div className="absolute right-0 mt-2 bg-[#0B1E33] border border-white/20 rounded-lg shadow-xl z-50 min-w-[150px]">
                {sortOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      setSortBy(option.value);
                      setShowSortDropdown(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-white/80 hover:bg-white/10 transition-colors first:rounded-t-lg last:rounded-b-lg"
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 筛选标签区 */}
        <div className="mb-4">
          <div className="flex flex-wrap gap-2">
            {statuses.map(status => (
              <button
                key={status}
                onClick={() => setSelectedStatus(status)}
                className={`px-4 py-2 rounded-full text-sm transition-colors ${
                  selectedStatus === status
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-white/10 text-white/70 hover:bg-white/20'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* 结果计数 */}
        <div className="mb-4">
          <p className="text-white/60 text-sm">
            找到 <span className="text-white font-semibold">{filteredData.length}</span> 个项目
          </p>
        </div>

        {/* 项目卡片列表 */}
        {filteredData.length > 0 ? (
          <>
            <div className="flex flex-col gap-4 mb-6">
              {filteredData.map(project => (
                <div
                  key={project.code}
                  className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-5 hover:bg-white/20 transition"
                >
                  {/* 第一行：项目名称 + 进度百分比 */}
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-lg font-semibold text-white">{project.name}</h3>
                    <span className={`text-sm font-medium ${getProgressColor(project.progress)}`}>
                      {project.progress}%
                    </span>
                  </div>

                  {/* 第二行：项目代码 · 管理人 · 受理日期 */}
                  <div className="text-sm text-white/60 mb-3">
                    <span>{project.code}</span>
                    <span className="mx-2">·</span>
                    <span>{project.broker}</span>
                    <span className="mx-2">·</span>
                    <span>{project.date}</span>
                  </div>

                  {/* 第三行：进度条 */}
                  <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full transition-all duration-300"
                      style={{ width: `${project.progress}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* 加载更多按钮 */}
            <div className="flex justify-center">
              <button className="border border-white/30 text-white px-6 py-2 rounded-lg hover:bg-white/10 transition-colors">
                加载更多
              </button>
            </div>
          </>
        ) : (
          /* 空状态 */
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-12 text-center">
            <div className="text-white/40 text-5xl mb-4">🔍</div>
            <h3 className="text-white text-lg font-semibold mb-2">
              没有找到匹配的项目
            </h3>
            <p className="text-white/60 text-sm mb-4">
              尝试调整搜索词或筛选条件
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedStatus('全部');
              }}
              className="bg-white/10 border border-white/30 text-white px-6 py-2 rounded-lg hover:bg-white/20 transition-colors"
            >
              清除筛选
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export const metadata = {
  title: '发行状态跟踪 - REITs 智能助手',
  description: '实时跟踪REITs/ABS发行全流程进度',
};
