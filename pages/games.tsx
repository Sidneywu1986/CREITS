'use client';

import Link from 'next/link';
import { ArrowRight, Trophy, Flame, Star, Clock, Zap } from 'lucide-react';

// 游戏数据
const GAMES = [
  {
    id: '2048',
    icon: '🎮',
    title: '2048',
    description: '经典数字消除，合并相同数字挑战2048',
    color: 'from-purple-600 to-purple-800',
    href: '/games/2048',
  },
  {
    id: 'guess-number',
    icon: '🔢',
    title: '猜数字',
    description: '趣味猜数字，用最少次数猜中目标',
    color: 'from-blue-600 to-blue-800',
    href: '/games/guess-number',
  },
  {
    id: 'memory',
    icon: '🃏',
    title: '记忆翻牌',
    description: '锻炼记忆力，找到所有配对的卡片',
    color: 'from-green-600 to-green-800',
    href: '/games/memory',
  },
  {
    id: 'snake',
    icon: '🐍',
    title: '贪吃蛇',
    description: '经典贪吃蛇，吃食物变长避免撞墙',
    color: 'from-orange-600 to-orange-800',
    href: '/games/snake',
  },
];

// 高分榜Mock数据
const HIGH_SCORES = [
  { game: '2048', player: '玩家A', score: '2048分', time: '刚刚' },
  { game: '猜数字', player: '玩家B', score: '8次猜中', time: '5分钟前' },
  { game: '记忆翻牌', player: '玩家C', score: '32步', time: '12分钟前' },
  { game: '贪吃蛇', player: '玩家D', score: '58分', time: '25分钟前' },
];

// 热门推荐
const HOT_RECOMMENDATIONS = [
  { name: '五子棋', status: 'hot', description: '黑白对战' },
  { name: '俄罗斯方块', status: 'coming', description: '经典消除' },
];

export default function GamesPage() {
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
              <h1 className="text-2xl font-bold text-white">休闲小游戏</h1>
              <p className="text-white/60 text-sm mt-1">工作累了？来玩个小游戏放松一下吧</p>
            </div>
          </div>
          {/* 用户头像 */}
          <div className="flex items-center gap-3">
            <button className="px-3 py-1.5 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white/70 hover:text-white hover:bg-white/20 transition text-sm">
              个人中心
            </button>
          </div>
        </div>

        {/* 游戏卡片网格 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {GAMES.map((game) => (
            <Link
              key={game.id}
              href={game.href}
              className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6 hover:bg-white/20 transition group"
            >
              <div className="text-4xl mb-3">{game.icon}</div>
              <h3 className="text-xl font-semibold text-white">{game.title}</h3>
              <p className="text-sm text-white/60 mt-1">{game.description}</p>
              <button className={`w-full mt-4 bg-gradient-to-r ${game.color} hover:opacity-90 text-white px-4 py-2 rounded-lg text-sm font-medium transition group-hover:shadow-lg`}>
                开始游戏
              </button>
            </Link>
          ))}
        </div>

        {/* 今日高分榜 */}
        <div className="mb-12">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-400" />
            今日高分榜
          </h3>
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
            {HIGH_SCORES.map((score, index) => (
              <div
                key={index}
                className="flex items-center justify-between py-3 border-b border-white/10 last:border-0 last:pb-0 first:pt-0"
              >
                <div className="flex items-center gap-4">
                  <span className="text-white/40 w-6 text-center font-medium">
                    {index + 1}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-white/80 font-medium">{score.game}</span>
                  </div>
                  <span className="text-white/60 text-sm">{score.player}</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-400" />
                    <span className="text-white font-semibold">{score.score}</span>
                  </div>
                  <div className="flex items-center gap-1 text-white/40 text-xs">
                    <Clock className="w-3 h-3" />
                    <span>{score.time}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 热门推荐 */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Flame className="w-5 h-5 text-orange-400" />
            热门推荐
          </h3>
          <div className="flex flex-wrap gap-4">
            {HOT_RECOMMENDATIONS.map((rec, index) => (
              <div
                key={index}
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg px-4 py-3 flex items-center gap-3"
              >
                {rec.status === 'hot' ? (
                  <Flame className="w-5 h-5 text-orange-400" />
                ) : (
                  <Zap className="w-5 h-5 text-blue-400" />
                )}
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-white font-medium">{rec.name}</span>
                    {rec.status === 'hot' && (
                      <span className="px-2 py-0.5 bg-orange-500/20 text-orange-400 text-xs rounded">
                        最近很火
                      </span>
                    )}
                    {rec.status === 'coming' && (
                      <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 text-xs rounded">
                        即将上线
                      </span>
                    )}
                  </div>
                  <p className="text-white/60 text-sm">{rec.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
