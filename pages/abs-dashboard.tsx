import Head from 'next/head';
import { ABSCenterPanel } from '@/components/abs/ABSCenterPanel';
import { ABSSidebar } from '@/components/abs/ABSSidebar';

export default function ABSDashboardPage() {
  return (
    <>
      <Head>
        <title>ABS数据中心 - REITs智能助手</title>
        <meta name="description" content="资产支持证券（ABS）数据中心，聚焦REITs相关ABS和城投平台ABS，提供统计分析、数据筛选、可视化图表等功能" />
      </Head>

      <div className="flex h-screen bg-slate-900">
        {/* 左侧侧边栏 */}
        <ABSSidebar />

        {/* 右侧内容区 */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* 顶部标题栏 */}
          <div className="bg-slate-800/50 border-b border-slate-700/50 backdrop-blur-sm px-6 py-4">
            <h1 className="text-2xl font-bold text-white">ABS数据中心</h1>
            <p className="text-sm text-slate-400 mt-1">聚焦REITs相关ABS和城投平台ABS，提供全面的资产支持证券数据分析</p>
          </div>

          {/* 主内容区 */}
          <div className="flex-1 overflow-auto">
            <ABSCenterPanel />
          </div>
        </div>
      </div>
    </>
  );
}
