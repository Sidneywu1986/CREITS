import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Gamepad2, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function GamesPage() {
  return (
    <div className="container mx-auto px-6 py-8">
      <div className="mb-6">
        <div className="flex items-center">
          <Link href="/">
            <Button variant="ghost" size="sm" className="mr-4">
              <ArrowRight className="mr-2 h-4 w-4 rotate-180" />
              返回
            </Button>
          </Link>
          <h1 className="text-3xl font-bold flex items-center">
            <Gamepad2 className="mr-3 text-[#667eea]" />
            休闲小游戏
          </h1>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="hover:shadow-xl transition-all duration-300 cursor-pointer">
          <CardHeader>
            <CardTitle>2048</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">经典数字消除游戏</p>
            <Button className="w-full">开始游戏</Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-xl transition-all duration-300 cursor-pointer">
          <CardHeader>
            <CardTitle>猜数字</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">趣味猜数字游戏</p>
            <Button className="w-full">开始游戏</Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-xl transition-all duration-300 cursor-pointer">
          <CardHeader>
            <CardTitle>记忆翻牌</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">锻炼记忆力的翻牌游戏</p>
            <Button className="w-full">开始游戏</Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-xl transition-all duration-300 cursor-pointer">
          <CardHeader>
            <CardTitle>贪吃蛇</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">经典贪吃蛇游戏</p>
            <Button className="w-full">开始游戏</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export const metadata = {
  title: '休闲小游戏 - REITs 智能助手',
  description: '放松心情，享受游戏',
};
