import MainLayout from '@/src/components/layout/MainLayout';
import AgentCard from '@/src/components/home/AgentCard';
import CalculatorEntrance from '@/src/components/home/CalculatorEntrance';
import REITsTablePreview from '@/src/components/home/REITsTablePreview';
import MarketOverview from '@/src/components/home/MarketOverview';
import NewsFeed from '@/src/components/home/NewsFeed';
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
      {/* 两栏布局：中间核心区 + 右侧信息区 */}
      <div className="min-h-[calc(100vh-4rem)]">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-6">
          {/* 中间核心区 - 约58% (7列) */}
          <div className="col-span-1 lg:col-span-7 space-y-6">
            {/* 欢迎 banner */}
            <div className="bg-gradient-to-r from-[#667eea] to-[#764ba2] rounded-xl p-6 text-white shadow-lg">
              <h1 className="text-2xl font-bold mb-2">欢迎来到 REITs 智能助手</h1>
              <p className="opacity-90 leading-relaxed">
                多Agent协作系统 · 专业的REITs发行服务平台 · 全流程智能辅助
              </p>
            </div>

            {/* 核心 Agent 卡片墙 */}
            <div>
              <h2 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
                <span className="w-1 h-6 bg-blue-600 rounded mr-2" />
                核心 Agent
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {agents.map((agent, index) => (
                  <AgentCard key={index} {...agent} />
                ))}
              </div>
            </div>

            {/* 估值计算器入口卡片 */}
            <CalculatorEntrance />

            {/* REITs 八张表数据预览 */}
            <REITsTablePreview />
          </div>

          {/* 右侧信息区 - 约42% (5列) */}
          <div className="col-span-1 lg:col-span-5 space-y-6">
            {/* 市场行情速览 */}
            <MarketOverview />

            {/* 资产证券化新闻 */}
            <NewsFeed />

            {/* 匿名 BBS 话题 */}
            <BBSTopics />
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
