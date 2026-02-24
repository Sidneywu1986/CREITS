'use client';

import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Gamepad2,
  Brain,
  ArrowRight,
  Star,
  Clock,
  Users,
  TrendingUp,
} from 'lucide-react';
import Link from 'next/link';

export default function GamesPage() {
  const games = [
    {
      id: 'memory',
      name: '记忆翻牌',
      icon: '🧠',
      description: '经典的记忆翻牌游戏，翻开卡片寻找配对',
      difficulty: '简单',
      players: '1人',
      avgTime: '3-5分钟',
      color: '#667eea',
      hot: true,
    },
    {
      id: '2048',
      name: '2048',
      icon: '🔢',
      description: '滑动合并数字，挑战2048',
      difficulty: '中等',
      players: '1人',
      avgTime: '5-10分钟',
      color: '#764ba2',
      hot: true,
    },
    {
      id: 'snake',
      name: '贪吃蛇',
      icon: '🐍',
      description: '经典贪吃蛇游戏，挑战高分',
      difficulty: '简单',
      players: '1人',
      avgTime: '2-5分钟',
      color: '#48bb78',
      hot: false,
    },
    {
      id: 'whack-a-mole',
      name: '打地鼠',
      icon: '🔨',
      description: '快速反应，敲打地鼠得分',
      difficulty: '中等',
      players: '1人',
      avgTime: '1-3分钟',
      color: '#ed8936',
      hot: false,
    },
    {
      id: 'guess-number',
      name: '猜数字',
      icon: '🎯',
      description: '猜出神秘数字，考验逻辑推理',
      difficulty: '简单',
      players: '1人',
      avgTime: '1-2分钟',
      color: '#f56565',
      hot: false,
    },
    {
      id: 'tic-tac-toe',
      name: '井字棋',
      icon: '⭕',
      description: '经典井字棋，双人对战',
      difficulty: '简单',
      players: '2人',
      avgTime: '1-2分钟',
      color: '#9f7aea',
      hot: false,
    },
  ];

  return (
    <MainLayout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold flex items-center">
          <Gamepad2 className="mr-3 text-[#667eea]" />
          休闲小游戏
        </h1>
        <p className="text-muted-foreground mt-2">放松心情，享受休闲时光</p>
      </div>

      {/* Featured Games */}
      <div className="mb-8">
        <div className="rounded-2xl bg-gradient-to-r from-[#667eea] to-[#764ba2] p-6 text-white shadow-lg">
          <h2 className="text-2xl font-bold mb-2 flex items-center">
            <Star className="mr-2" />
            热门推荐
          </h2>
          <p className="opacity-90">
            现在就来挑战最受喜爱的记忆翻牌和2048游戏！
          </p>
        </div>
      </div>

      {/* Games Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {games.map((game) => (
          <Link key={game.id} href={`/games/${game.id}`}>
            <Card className="h-full hover:shadow-2xl transition-all duration-300 cursor-pointer border-2 hover:border-[#667eea] group">
              <CardHeader>
                <div className="flex items-center justify-between mb-3">
                  <div
                    className="w-14 h-14 rounded-xl flex items-center justify-center text-3xl shadow-md"
                    style={{ backgroundColor: `${game.color}20`, border: `2px solid ${game.color}` }}
                  >
                    {game.icon}
                  </div>
                  <div className="flex items-center space-x-2">
                    {game.hot && (
                      <Badge className="bg-[#ed8936] text-white">
                        <Star className="mr-1 h-3 w-3" />
                        热门
                      </Badge>
                    )}
                    <Badge
                      variant="outline"
                      className="border-[#667eea] text-[#667eea]"
                    >
                      {game.difficulty}
                    </Badge>
                  </div>
                </div>
                <CardTitle className="text-xl">{game.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">{game.description}</p>
                <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-4">
                  <div className="flex items-center">
                    <Users className="mr-1 h-4 w-4" />
                    {game.players}
                  </div>
                  <div className="flex items-center">
                    <Clock className="mr-1 h-4 w-4" />
                    {game.avgTime}
                  </div>
                </div>
                <Button className="w-full group-hover:bg-gradient-to-r group-hover:from-[#667eea] group-hover:to-[#764ba2] group-hover:text-white group-hover:border-transparent">
                  开始游戏
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Tips Section */}
      <Card className="mt-8 border-2 border-[#48bb78]/20 bg-gradient-to-br from-[#48bb78]/5 to-[#48bb78]/5">
        <CardHeader>
          <CardTitle className="flex items-center text-[#48bb78]">
            <Brain className="mr-2 h-5 w-5" />
            游戏提示
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-white dark:bg-gray-800 border">
              <div className="font-semibold mb-2">💡 专注力提升</div>
              <p className="text-sm text-muted-foreground">
                记忆翻牌游戏可以帮助提升专注力和记忆力
              </p>
            </div>
            <div className="p-4 rounded-lg bg-white dark:bg-gray-800 border">
              <div className="font-semibold mb-2">🎯 逻辑思维</div>
              <p className="text-sm text-muted-foreground">
                2048和猜数字游戏锻炼逻辑推理能力
              </p>
            </div>
            <div className="p-4 rounded-lg bg-white dark:bg-gray-800 border">
              <div className="font-semibold mb-2">⚡ 反应速度</div>
              <p className="text-sm text-muted-foreground">
                打地鼠游戏训练快速反应和手眼协调
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </MainLayout>
  );
}
