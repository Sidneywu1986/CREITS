import MainLayout from '@/src/components/layout/MainLayout';
import Header from '@/src/components/home/Header';
import DataMetrics from '@/src/components/home/DataMetrics';
import AgentCard from '@/src/components/home/AgentCard';
import CalculatorEntrance from '@/src/components/home/CalculatorEntrance';
import REITsTablePreview from '@/src/components/home/REITsTablePreview';
import MarketOverview from '@/src/components/home/MarketOverview';
import NewsHorizontal from '@/src/components/home/NewsHorizontal';
import BBSTopics from '@/src/components/home/BBSTopics';

const agents = [
  {
    icon: '⚖️',
    title: '法务风险合规',
    description: '法规检索·风险识别·合规审查',
    href: '/agents',
    isHot: true,
  },
  {
    icon: '📜',
    title: '政策解读',
    description: 'REITs相关政策法规解读',
    href: '/agents',
  },
  {
    icon: '🔍',
    title: '尽职调查',
    description: '全面分析REITs项目风险',
    href: '/agents',
    isNew: true,
  },
  {
    icon: '📄',
    title: '申报材料生成',
    description: '协助生成REITs发行申报材料',
    href: '/agents',
  },
  {
    icon: '💡',
    title: '定价发行建议',
    description: '提供REITs定价分析和发行建议',
    href: '/agents',
    isHot: true,
  },
  {
    icon: '📈',
    title: '存续期管理',
    description: '提供REITs存续期管理建议',
    href: '/agents',
  },
];

export default function Home() {
  return (
    <MainLayout>
      <div className="min-h-[calc(100vh-4rem)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          {/* 头部 */}
          <Header />

          {/* 数据指标卡片 */}
          <DataMetrics />

          {/* 核心内容区 */}
          <div className="mt-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* 中间核心区 - 全宽 (12列) */}
              <div className="col-span-1 lg:col-span-12 space-y-6">
                {/* 核心 Agent 卡片墙 */}
                <div className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-xl p-5 hover:bg-white/20 transition">
                  <h2 className="text-lg font-semibold text-white mb-4">
                    核心 Agent
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {agents.map((agent, index) => (
                      <AgentCard key={index} {...agent} />
                    ))}
                  </div>
                </div>

                {/* 估值计算器入口卡片 */}
                <CalculatorEntrance />

                {/* 资产证券化新闻 */}
                <NewsHorizontal />

                {/* REITs 八张表数据预览 */}
                <REITsTablePreview />

                {/* 待发行项目 + 匿名BBS */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <MarketOverview />
                  <BBSTopics />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
