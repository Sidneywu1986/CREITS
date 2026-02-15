'use client';

import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface ABSSidebarProps {
  tabs: string[];
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function ABSSidebar({ tabs, activeTab, onTabChange }: ABSSidebarProps) {
  return (
    <div className="w-64 bg-gradient-to-b from-blue-50 to-blue-100 dark:from-gray-800 dark:to-gray-900 border-r border-gray-200 dark:border-gray-700 flex-shrink-0">
      <div className="p-4">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-[#667eea] to-[#764ba2] rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">A</span>
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">ABS系统</h2>
            <p className="text-xs text-gray-600 dark:text-gray-400">资产管理平台</p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={onTabChange} orientation="vertical" className="w-full">
          <TabsList className="h-auto bg-transparent flex-col items-start space-y-1">
            {tabs.map((tab) => (
              <TabsTrigger
                key={tab}
                value={tab}
                className={`w-full justify-start px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:text-[#667eea] dark:data-[state=active]:text-[#a78bfa] data-[state=active]:shadow-md ${
                  activeTab === tab
                    ? 'text-[#667eea] dark:text-[#a78bfa] bg-white dark:bg-gray-700 shadow-md'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-700/50'
                }`}
              >
                {tab}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {/* 底部信息 */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="text-xs text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>系统运行正常</span>
          </div>
          <div className="mt-1">
            数据更新: {new Date().toLocaleDateString('zh-CN')}
          </div>
        </div>
      </div>
    </div>
  );
}
