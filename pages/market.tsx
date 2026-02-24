'use client';

import { useState, useEffect } from 'react';
import { ArrowRight, RefreshCw, Globe, Activity, Landmark, BarChart3, ArrowUp, ArrowDown } from 'lucide-react';
import Link from 'next/link';

// 全球REITs指数数据
const GLOBAL_REITS_INDEX = [
  { region: '美国', index: 2850.5, change: 65.3, changePercent: 2.34, name: 'FTSE NAREIT All REITs' },
  { region: '欧洲', index: 1425.2, change: 21.8, changePercent: 1.55, name: 'EPRA Europe' },
  { region: '日本', index: 1850.7, change: 55.6, changePercent: 3.10, name: 'Tokyo REIT Index' },
  { region: '澳洲', index: 1680.3, change: -12.5, changePercent: -0.74, name: 'S&P/ASX 200 A-REIT' },
  { region: '香港', index: 980.3, change: 8.2, changePercent: 0.84, name: 'Hang Seng REIT Index' },
  { region: '新加坡', index: 845.6, change: 12.4, changePercent: 1.49, name: 'iEdge S-REIT Index' },
];

// 全球主要市场股指
const GLOBAL_STOCK_INDEX = [
  // 美洲
  { region: '美国道指', index: 38654.42, change: 234.52, changePercent: 0.61, name: 'Dow Jones' },
  { region: '美国纳指', index: 16428.82, change: 285.16, changePercent: 1.77, name: 'NASDAQ' },
  { region: '美国标普', index: 5234.18, change: 45.87, changePercent: 0.88, name: 'S&P 500' },
  { region: '巴西圣保罗', index: 125876.3, change: 1234.56, changePercent: 0.99, name: 'BOVESPA' },
  // 欧洲
  { region: '欧洲STOXX50', index: 4956.8, change: 56.7, changePercent: 1.15, name: 'STOXX 50' },
  { region: '欧洲STOX', index: 5234.5, change: 45.3, changePercent: 0.87, name: 'STOX' },
  { region: '欧洲STOXX', index: 4876.2, change: 38.9, changePercent: 0.80, name: 'STOXX' },
  { region: '欧洲FTSE300', index: 1425.6, change: 12.8, changePercent: 0.91, name: 'FTSE Eurofirst 300' },
  // 亚洲
  { region: '日经225', index: 39238.81, change: 324.56, changePercent: 0.83, name: 'NIKKEI 225' },
  { region: '恒生指数', index: 17651.15, change: -89.23, changePercent: -0.50, name: 'Hang Seng' },
  { region: '上证指数', index: 3088.64, change: 15.42, changePercent: 0.50, name: 'SSE Composite' },
  { region: '深证成指', index: 9668.52, change: -23.67, changePercent: -0.24, name: 'SZSE Component' },
];

// 按地区分组的市场股指
const MARKET_BY_REGION = {
  美洲: GLOBAL_STOCK_INDEX.filter(item => ['美国道指', '美国纳指', '美国标普', '巴西圣保罗'].includes(item.region)),
  欧洲: GLOBAL_STOCK_INDEX.filter(item => ['欧洲STOXX50', '欧洲STOX', '欧洲STOXX', '欧洲FTSE300'].includes(item.region)),
  亚洲: GLOBAL_STOCK_INDEX.filter(item => ['日经225', '恒生指数', '上证指数', '深证成指'].includes(item.region)),
};

// 十年期国债行情
const TREASURY_BOND_DATA = [
  { country: 'US', yield: 4.23, change: 0.05, name: '美国' },
  { country: '中国', yield: 2.34, change: -0.02, name: '中国' },
  { country: '日本', yield: 0.73, change: 0.01, name: '日本' },
  { country: '德国', yield: 2.45, change: 0.03, name: '德国' },
  { country: '英国', yield: 4.12, change: 0.07, name: '英国' },
  { country: '法国', yield: 2.98, change: 0.04, name: '法国' },
];

// 中国REITs/ABS指数
const CHINA_REITS_ABS_INDEX = [
  {
    name: '中证REITs（收盘）指数',
    type: 'REITs',
    publisher: '中证指数',
    code: '',
    features: '反映沪深交易所上市REITs的价格表现。',
    indexValue: 1025.6,
    changePercent: 0.8,
    highestValue: 1156.8,
    highestDate: '2024-03-15',
    lowestValue: 932.5,
    lowestDate: '2023-10-25',
  },
  {
    name: '中证REITs全收益指数',
    type: 'REITs',
    publisher: '中证指数',
    code: '',
    features: '在价格指数基础上，考虑了现金分红再投资，更全面反映投资者实际收益。',
    indexValue: 1087.2,
    changePercent: 1.2,
    highestValue: 1224.6,
    highestDate: '2024-03-15',
    lowestValue: 978.3,
    lowestDate: '2023-10-25',
  },
  {
    name: '细分领域REITs指数',
    type: 'REITs',
    publisher: '中证指数（及其他机构）',
    code: '',
    features: '反映不同底层资产类别的表现，如园区基础设施、交通基础设施、仓储物流、消费基础设施、保障性租赁住房、能源基础设施、生态环保、新型基础设施等。',
    indexValue: 998.5,
    changePercent: -0.3,
    highestValue: 1087.2,
    highestDate: '2024-02-28',
    lowestValue: 892.6,
    lowestDate: '2023-11-15',
  },
  {
    name: '中金C-REITs指数',
    type: 'REITs',
    publisher: '中金公司',
    code: '',
    features: '研究机构发布的指数，包含价格指数和总回报指数，用于行业研究和市场监测。',
    indexValue: 1032.8,
    changePercent: 0.5,
    highestValue: 1125.4,
    highestDate: '2024-03-10',
    lowestValue: 915.7,
    lowestDate: '2023-11-02',
  },
  {
    name: '中证资产支持证券指数系列',
    type: 'ABS',
    publisher: '中证指数',
    code: '932220',
    features: '综合性指数，选取在交易所及银行间市场挂牌的ABS作为样本，反映ABS市场整体表现。',
    indexValue: 156.3,
    changePercent: 0.4,
    highestValue: 178.5,
    highestDate: '2024-02-20',
    lowestValue: 132.8,
    lowestDate: '2023-09-18',
  },
  {
    name: '中证华泰证券资管资产支持证券指数',
    type: 'ABS',
    publisher: '中证指数、华泰证券资管',
    code: '932356',
    features: '市场首只以单一券商资管管理人发行的产品为编制基础的ABS指数，反映该管理人发行的ABS产品的整体表现。',
    indexValue: 142.7,
    changePercent: 0.6,
    highestValue: 165.3,
    highestDate: '2024-02-25',
    lowestDate: '2023-10-05',
    lowestValue: 118.9,
  },
  {
    name: '惠誉博华银行间市场个贷ABS指数系列',
    type: 'ABS',
    publisher: '惠誉博华',
    code: '',
    features: '专业评级机构发布的指数，专注于银行间市场的个人贷款ABS，包括车贷ABS、消费贷ABS、RMBS等细分领域的指数，反映其逾期率、提前偿付率等表现。',
    indexValue: 98.2,
    changePercent: 0.1,
    highestValue: 112.6,
    highestDate: '2024-01-18',
    lowestValue: 85.4,
    lowestDate: '2023-08-20',
  },
];

// 迷你折线图组件
const MiniSparkline = ({ trend }: { trend: 'up' | 'down' | 'neutral' }) => {
  const points = trend === 'up' 
    ? '0,15 10,12 20,10 30,8 40,5 50,3 60,4 70,2 80,1'
    : trend === 'down'
    ? '0,2 10,5 20,8 30,10 40,12 50,15 60,13 70,16 80,18'
    : '0,10 10,8 20,12 30,9 40,11 50,8 60,10 70,9 80,10';
  
  const color = trend === 'up' ? '#34D399' : trend === 'down' ? '#F87171' : 'rgba(255, 255, 255, 0.4)';
  
  return (
    <svg width="100%" height="20" viewBox="0 0 80 20" className="mt-2" preserveAspectRatio="none">
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

// 涨跌幅单元格组件
const ChangeCell = ({ value }: { value: number }) => {
  const isPositive = value >= 0;
  return (
    <span className={isPositive ? 'text-green-400' : 'text-red-400'}>
      {isPositive ? '↑' : '↓'} {value >= 0 ? '+' : ''}{value.toFixed(2)}%
    </span>
  );
};

export default function MarketPage() {
  const [countdown, setCountdown] = useState(60);
  const [lastUpdate, setLastUpdate] = useState<string>(new Date().toLocaleTimeString('zh-CN'));

  // 自动刷新
  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          setLastUpdate(new Date().toLocaleTimeString('zh-CN'));
          return 60;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0B1E33] to-[#1A3B5E]">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* 头部区域 */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link href="/">
              <button className="flex items-center gap-2 text-white/70 hover:text-white transition-colors">
                <ArrowRight className="w-4 h-4 rotate-180" />
                <span>返回</span>
              </button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-white">市场行情</h1>
              <p className="text-white/60 text-sm mt-1">
                全球REITs指数 · 主要市场股指 · 十年期国债 · 中国REITs/ABS
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg">
              <Activity className="w-3 h-3 text-blue-400" />
              <span className="text-sm text-white/80">{countdown}s 后刷新</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg">
              <Globe className="w-3 h-3 text-blue-400" />
              <span className="text-sm text-white/80">更新: {lastUpdate}</span>
            </div>
            <button
              onClick={() => {
                setCountdown(60);
                setLastUpdate(new Date().toLocaleTimeString('zh-CN'));
              }}
              className="px-3 py-1.5 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg hover:bg-white/20 transition-colors"
            >
              <RefreshCw className="w-4 h-4 text-white/80" />
            </button>
          </div>
        </div>

        {/* 1. 全球REITs指数 */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Landmark className="w-5 h-5 text-blue-400" />
            全球REITs指数
          </h2>
          <div className="grid grid-cols-3 gap-4">
            {GLOBAL_REITS_INDEX.map((item) => (
              <div
                key={item.region}
                className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4 hover:bg-white/20 transition"
              >
                <div className="text-sm font-medium text-white/70">{item.name}</div>
                <div className="text-xl font-bold text-white mt-1">{item.index.toFixed(1)}</div>
                <div className="flex items-center gap-1 mt-1">
                  <span className={item.changePercent >= 0 ? 'text-green-400' : 'text-red-400'}>
                    {item.changePercent >= 0 ? '↑' : '↓'}
                  </span>
                  <ChangeCell value={item.changePercent} />
                </div>
                <MiniSparkline trend={item.changePercent >= 0 ? 'up' : 'down'} />
              </div>
            ))}
          </div>
        </div>

        {/* 2. 全球主要市场股指 */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-purple-400" />
            全球主要市场股指
          </h2>
          {Object.entries(MARKET_BY_REGION).map(([region, indices]) => (
            <div key={region} className="mt-6">
              <h3 className="text-sm font-semibold text-white/50 uppercase tracking-wider mb-3">
                {region}
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {indices.map((item) => (
                  <div
                    key={item.region}
                    className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-3 hover:bg-white/20 transition"
                  >
                    <div className="text-sm font-medium text-white/70">{item.name}</div>
                    <div className="text-lg font-bold text-white mt-1">{item.index.toFixed(0)}</div>
                    <ChangeCell value={item.changePercent} />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* 3. 十年期国债行情 */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Landmark className="w-5 h-5 text-green-400" />
            十年期国债行情
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {TREASURY_BOND_DATA.map((item) => (
              <div
                key={item.country}
                className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-3 hover:bg-white/20 transition"
              >
                <div className="text-xs font-medium text-white/60">{item.name}</div>
                <div className="text-base font-bold text-white mt-1">{item.yield.toFixed(2)}%</div>
                <div className={`text-xs font-medium ${item.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {item.change >= 0 ? '↑' : '↓'} {item.change >= 0 ? '+' : ''}{item.change.toFixed(2)}%
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 4. 中国REITs/ABS指数 */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-400" />
            中国REITs/ABS指数
          </h2>
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4">
            <div className="max-h-96 overflow-y-auto">
              <table className="w-full">
                <thead className="sticky top-0 z-10 bg-[#0B1E33]/95 backdrop-blur-sm">
                  <tr>
                    <th className="text-left py-3 px-4 text-xs font-medium text-white/50 uppercase tracking-wider min-w-[180px]">指数名称</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-white/50 uppercase tracking-wider w-16">类型</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-white/50 uppercase tracking-wider w-24">发布方/代码</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-white/50 uppercase tracking-wider min-w-[200px]">主要特点</th>
                    <th className="text-right py-3 px-4 text-xs font-medium text-white/50 uppercase tracking-wider w-20">指数</th>
                    <th className="text-right py-3 px-4 text-xs font-medium text-white/50 uppercase tracking-wider w-20">最高值</th>
                    <th className="text-right py-3 px-4 text-xs font-medium text-white/50 uppercase tracking-wider w-20">最低值</th>
                    <th className="text-right py-3 px-4 text-xs font-medium text-white/50 uppercase tracking-wider w-20">涨跌幅</th>
                  </tr>
                </thead>
                <tbody>
                  {CHINA_REITS_ABS_INDEX.map((item, index) => (
                    <tr key={index} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="py-3 px-4 text-sm text-white/80">{item.name}</td>
                      <td className="py-3 px-4">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                          item.type === 'REITs' 
                            ? 'bg-blue-500/20 text-blue-400' 
                            : 'bg-purple-500/20 text-purple-400'
                        }`}>
                          {item.type}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-white/80">
                        <div className="flex flex-col">
                          <span className="text-xs">{item.publisher}</span>
                          {item.code && <span className="text-xs text-white/60">{item.code}</span>}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm text-white/60 truncate max-w-[200px]" title={item.features}>
                        {item.features}
                      </td>
                      <td className="py-3 px-4 text-sm text-right text-white/80">{item.indexValue.toFixed(1)}</td>
                      <td className="py-3 px-4 text-sm text-right text-white/60">{item.highestValue.toFixed(1)}</td>
                      <td className="py-3 px-4 text-sm text-right text-white/60">{item.lowestValue.toFixed(1)}</td>
                      <td className="py-3 px-4 text-sm text-right font-medium">
                        <ChangeCell value={item.changePercent} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
