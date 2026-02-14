import MainLayout from '../src/components/layout/MainLayout';

export default function Home() {
  return (
    <MainLayout>
      <div className="p-8">
        <h1 className="text-3xl font-bold mb-4">REITs 智能助手</h1>
        <p className="text-lg text-gray-700 mb-8">
          欢迎使用 REITs 智能助手系统
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-blue-50 p-6 rounded-lg border-2 border-blue-200">
            <h2 className="text-xl font-semibold mb-2">发行状态跟踪</h2>
            <p className="text-sm text-gray-600">实时跟踪REITs和ABS产品从申请到上市的全过程</p>
          </div>
          <div className="bg-purple-50 p-6 rounded-lg border-2 border-purple-200">
            <h2 className="text-xl font-semibold mb-2">已发行REITs</h2>
            <p className="text-sm text-gray-600">查看市场上已发行的REITs产品实时行情</p>
          </div>
          <div className="bg-green-50 p-6 rounded-lg border-2 border-green-200">
            <h2 className="text-xl font-semibold mb-2">已发行ABS</h2>
            <p className="text-sm text-gray-600">查看已发行的ABS项目信息和票面利率</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <h2 className="text-2xl font-bold mb-4">核心功能</h2>
          <ul className="space-y-3">
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">1.</span>
              <span>法务风控合规 Agent - 提供法规检索、风险识别、合规审查等服务</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-600 font-bold">2.</span>
              <span>政策解读 Agent - 解读 REITs 相关政策法规</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 font-bold">3.</span>
              <span>尽职调查 Agent - 全面分析 REITs 项目风险</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-orange-600 font-bold">4.</span>
              <span>申报材料生成 Agent - 协助生成REITs发行申报材料</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-600 font-bold">5.</span>
              <span>定价发行建议 Agent - 提供REITs定价分析和发行建议</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-teal-600 font-bold">6.</span>
              <span>存续期管理 Agent - 提供REITs存续期管理建议</span>
            </li>
          </ul>
        </div>
      </div>
    </MainLayout>
  );
}
