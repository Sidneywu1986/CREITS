'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, RotateCcw, Trophy, Lightbulb } from 'lucide-react';

export default function GuessNumberPage() {
  const router = useRouter();
  const [targetNumber, setTargetNumber] = useState<number>(() => Math.floor(Math.random() * 100) + 1);
  const [guess, setGuess] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [history, setHistory] = useState<{ guess: number; result: string }[]>([]);
  const [gameOver, setGameOver] = useState(false);
  const [hint, setHint] = useState('');

  const initializeGame = () => {
    setTargetNumber(Math.floor(Math.random() * 100) + 1);
    setGuess('');
    setAttempts(0);
    setHistory([]);
    setGameOver(false);
    setHint('');
  };

  const handleGuess = () => {
    const guessNum = parseInt(guess);
    if (isNaN(guessNum) || guessNum < 1 || guessNum > 100) {
      setHint('请输入1-100之间的数字');
      return;
    }

    setAttempts((prev) => prev + 1);
    setGuess('');

    let result = '';
    if (guessNum === targetNumber) {
      result = '恭喜你，猜对了！🎉';
      setGameOver(true);
      setHint('');
    } else if (guessNum < targetNumber) {
      result = '太小了！再试一次 📈';
      setHint('提示：目标数字更大');
    } else {
      result = '太大了！再试一次 📉';
      setHint('提示：目标数字更小');
    }

    setHistory((prev) => [...prev, { guess: guessNum, result }]);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleGuess();
    }
  };

  const getHint = () => {
    if (attempts === 0) return '目标数字在1-100之间';
    if (targetNumber % 10 === 0) return '提示：目标数字是10的倍数';
    if (targetNumber < 50) return '提示：目标数字小于50';
    if (targetNumber > 50) return '提示：目标数字大于50';
    if (targetNumber % 2 === 0) return '提示：目标数字是偶数';
    return '提示：目标数字是奇数';
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <header className="h-16 border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50 dark:bg-gray-900/80">
        <div className="container mx-auto px-4 h-full flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="sm" onClick={() => router.push('/games')}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="text-xl font-bold">🎯 猜数字</div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-sm">尝试次数: {attempts}</div>
            <Button variant="outline" size="sm" onClick={initializeGame}>
              <RotateCcw className="mr-2 h-4 w-4" />
              重新开始
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Game Card */}
          <Card className="p-6 mb-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold mb-2">猜猜神秘数字</h2>
              <p className="text-muted-foreground">
                目标数字在1到100之间，用最少的次数猜中它！
              </p>
            </div>

            {gameOver ? (
              <div className="text-center py-8">
                <div className="text-6xl mb-4">🎉</div>
                <h3 className="text-3xl font-bold mb-4">恭喜你！</h3>
                <p className="text-xl mb-2">
                  神秘数字是 <span className="font-bold text-[#667eea]">{targetNumber}</span>
                </p>
                <p className="text-muted-foreground mb-6">
                  你用了 <span className="font-semibold">{attempts}</span> 次猜中
                </p>
                <Button
                  className="w-full bg-gradient-to-r from-[#667eea] to-[#764ba2]"
                  onClick={initializeGame}
                >
                  再玩一次
                </Button>
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  <div className="flex space-x-2">
                    <Input
                      type="number"
                      min="1"
                      max="100"
                      placeholder="输入1-100之间的数字"
                      value={guess}
                      onChange={(e) => setGuess(e.target.value)}
                      onKeyPress={handleKeyPress}
                      disabled={gameOver}
                      className="text-2xl text-center py-6"
                    />
                    <Button onClick={handleGuess} disabled={gameOver} className="px-8">
                      猜！
                    </Button>
                  </div>

                  {hint && (
                    <div className="p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                      <div className="flex items-start space-x-2">
                        <Lightbulb className="h-5 w-5 text-blue-600 mt-0.5" />
                        <div>
                          <div className="font-semibold text-blue-600 mb-1">提示</div>
                          <p className="text-sm text-muted-foreground">{hint}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="p-4 bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Lightbulb className="h-5 w-5 text-purple-600" />
                      <span className="text-sm text-muted-foreground">{getHint()}</span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </Card>

          {/* History */}
          {history.length > 0 && (
            <Card>
              <div className="p-4">
                <h3 className="font-semibold mb-3 flex items-center">
                  <Trophy className="mr-2 h-4 w-4" />
                  猜测记录
                </h3>
                <div className="space-y-2">
                  {history.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#667eea] to-[#764ba2] text-white flex items-center justify-center font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <div className="font-semibold">第{index + 1}次</div>
                          <div className="text-sm text-muted-foreground">猜测: {item.guess}</div>
                        </div>
                      </div>
                      <div className={`text-sm ${item.result.includes('太大') ? 'text-orange-600' : item.result.includes('太小') ? 'text-blue-600' : 'text-green-600'}`}>
                        {item.result}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          )}

          {/* Statistics */}
          {!gameOver && attempts > 0 && (
            <Card className="mt-6">
              <div className="p-4">
                <h3 className="font-semibold mb-3">游戏统计</h3>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-[#667eea]">{attempts}</div>
                    <div className="text-sm text-muted-foreground">尝试次数</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-[#764ba2]">
                      {history.filter((h) => h.guess < targetNumber).length}
                    </div>
                    <div className="text-sm text-muted-foreground">猜小次数</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-[#48bb78]">
                      {history.filter((h) => h.guess > targetNumber).length}
                    </div>
                    <div className="text-sm text-muted-foreground">猜大次数</div>
                  </div>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
