'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, RotateCcw, Trophy, ArrowUp, ArrowDown, ArrowLeft as ArrowLeftIcon, ArrowRight as ArrowRightIcon } from 'lucide-react';

export default function Game2048Page() {
  const router = useRouter();
  const [grid, setGrid] = useState<number[][]>([]);
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [gameWon, setGameWon] = useState(false);

  const initializeGame = () => {
    const newGrid = Array(4).fill(null).map(() => Array(4).fill(0));
    addNewTile(newGrid);
    addNewTile(newGrid);
    setGrid(newGrid);
    setScore(0);
    setGameOver(false);
    setGameWon(false);
  };

  const addNewTile = (currentGrid: number[][]) => {
    const emptyCells: [number, number][] = [];
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        if (currentGrid[i][j] === 0) {
          emptyCells.push([i, j]);
        }
      }
    }
    if (emptyCells.length > 0) {
      const [row, col] = emptyCells[Math.floor(Math.random() * emptyCells.length)];
      currentGrid[row][col] = Math.random() < 0.9 ? 2 : 4;
    }
  };

  useEffect(() => {
    initializeGame();
  }, []);

  useEffect(() => {
    if (score > bestScore) {
      setBestScore(score);
    }
  }, [score, bestScore]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameOver || gameWon) return;

      let newGrid = grid.map(row => [...row]);
      let moved = false;

      switch (e.key) {
        case 'ArrowUp':
          moved = moveUp(newGrid);
          break;
        case 'ArrowDown':
          moved = moveDown(newGrid);
          break;
        case 'ArrowLeft':
          moved = moveLeft(newGrid);
          break;
        case 'ArrowRight':
          moved = moveRight(newGrid);
          break;
        default:
          return;
      }

      if (moved) {
        addNewTile(newGrid);
        setGrid(newGrid);
        checkGameStatus(newGrid);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [grid, gameOver, gameWon]);

  const moveLeft = (currentGrid: number[][]) => {
    let moved = false;
    for (let i = 0; i < 4; i++) {
      const row = currentGrid[i].filter(val => val !== 0);
      for (let j = 0; j < row.length - 1; j++) {
        if (row[j] === row[j + 1]) {
          row[j] *= 2;
          setScore(prev => prev + row[j]);
          row.splice(j + 1, 1);
          moved = true;
          if (row[j] === 2048) setGameWon(true);
        }
      }
      while (row.length < 4) row.push(0);
      if (JSON.stringify(currentGrid[i]) !== JSON.stringify(row)) {
        moved = true;
      }
      currentGrid[i] = row;
    }
    return moved;
  };

  const moveRight = (currentGrid: number[][]) => {
    let moved = false;
    for (let i = 0; i < 4; i++) {
      const row = currentGrid[i].filter(val => val !== 0);
      for (let j = row.length - 1; j > 0; j--) {
        if (row[j] === row[j - 1]) {
          row[j] *= 2;
          setScore(prev => prev + row[j]);
          row.splice(j - 1, 1);
          moved = true;
          if (row[j] === 2048) setGameWon(true);
        }
      }
      while (row.length < 4) row.unshift(0);
      if (JSON.stringify(currentGrid[i]) !== JSON.stringify(row)) {
        moved = true;
      }
      currentGrid[i] = row;
    }
    return moved;
  };

  const moveUp = (currentGrid: number[][]) => {
    let moved = false;
    for (let j = 0; j < 4; j++) {
      const col: number[] = [];
      for (let i = 0; i < 4; i++) {
        if (currentGrid[i][j] !== 0) col.push(currentGrid[i][j]);
      }
      for (let i = 0; i < col.length - 1; i++) {
        if (col[i] === col[i + 1]) {
          col[i] *= 2;
          setScore(prev => prev + col[i]);
          col.splice(i + 1, 1);
          moved = true;
          if (col[i] === 2048) setGameWon(true);
        }
      }
      while (col.length < 4) col.push(0);
      for (let i = 0; i < 4; i++) {
        if (currentGrid[i][j] !== col[i]) moved = true;
        currentGrid[i][j] = col[i];
      }
    }
    return moved;
  };

  const moveDown = (currentGrid: number[][]) => {
    let moved = false;
    for (let j = 0; j < 4; j++) {
      const col: number[] = [];
      for (let i = 0; i < 4; i++) {
        if (currentGrid[i][j] !== 0) col.push(currentGrid[i][j]);
      }
      for (let i = col.length - 1; i > 0; i--) {
        if (col[i] === col[i - 1]) {
          col[i] *= 2;
          setScore(prev => prev + col[i]);
          col.splice(i - 1, 1);
          moved = true;
          if (col[i] === 2048) setGameWon(true);
        }
      }
      while (col.length < 4) col.unshift(0);
      for (let i = 0; i < 4; i++) {
        if (currentGrid[i][j] !== col[i]) moved = true;
        currentGrid[i][j] = col[i];
      }
    }
    return moved;
  };

  const checkGameStatus = (currentGrid: number[][]) => {
    // Check for 2048
    if (currentGrid.some(row => row.includes(2048))) {
      setGameWon(true);
      return;
    }

    // Check for game over (no empty cells and no possible merges)
    const hasEmptyCell = currentGrid.some(row => row.includes(0));
    if (!hasEmptyCell) {
      let canMerge = false;
      for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
          if (
            (j < 3 && currentGrid[i][j] === currentGrid[i][j + 1]) ||
            (i < 3 && currentGrid[i][j] === currentGrid[i + 1][j])
          ) {
            canMerge = true;
            break;
          }
        }
        if (canMerge) break;
      }
      if (!canMerge) {
        setGameOver(true);
      }
    }
  };

  const getTileColor = (value: number) => {
    const colors: { [key: number]: string } = {
      2: 'bg-[#eee4da] text-[#776e65]',
      4: 'bg-[#ede0c8] text-[#776e65]',
      8: 'bg-[#f2b179] text-white',
      16: 'bg-[#f59563] text-white',
      32: 'bg-[#f67c5f] text-white',
      64: 'bg-[#f65e3b] text-white',
      128: 'bg-[#edcf72] text-white',
      256: 'bg-[#edcc61] text-white',
      512: 'bg-[#edc850] text-white',
      1024: 'bg-[#edc53f] text-white',
      2048: 'bg-[#edc22e] text-white',
    };
    return colors[value] || 'bg-[#3c3a32] text-white';
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
            <div className="text-xl font-bold">🔢 2048</div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="px-3 py-1 rounded bg-[#bbada0] text-white text-sm">
              得分: {score}
            </div>
            <div className="px-3 py-1 rounded bg-[#bbada0] text-white text-sm">
              最高: {bestScore}
            </div>
            <Button variant="outline" size="sm" onClick={initializeGame}>
              <RotateCcw className="mr-2 h-4 w-4" />
              重新开始
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-lg mx-auto">
          {/* Mobile Controls */}
          <div className="md:hidden mb-4">
            <div className="grid grid-cols-3 gap-2 max-w-[200px] mx-auto">
              <div></div>
              <Button
                variant="outline"
                size="icon"
                onClick={() => {
                  const newGrid = grid.map(row => [...row]);
                  if (moveUp(newGrid)) {
                    addNewTile(newGrid);
                    setGrid(newGrid);
                    checkGameStatus(newGrid);
                  }
                }}
              >
                <ArrowUp className="h-4 w-4" />
              </Button>
              <div></div>
              <Button
                variant="outline"
                size="icon"
                onClick={() => {
                  const newGrid = grid.map(row => [...row]);
                  if (moveLeft(newGrid)) {
                    addNewTile(newGrid);
                    setGrid(newGrid);
                    checkGameStatus(newGrid);
                  }
                }}
              >
                <ArrowLeftIcon className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => {
                  const newGrid = grid.map(row => [...row]);
                  if (moveDown(newGrid)) {
                    addNewTile(newGrid);
                    setGrid(newGrid);
                    checkGameStatus(newGrid);
                  }
                }}
              >
                <ArrowDown className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => {
                  const newGrid = grid.map(row => [...row]);
                  if (moveRight(newGrid)) {
                    addNewTile(newGrid);
                    setGrid(newGrid);
                    checkGameStatus(newGrid);
                  }
                }}
              >
                <ArrowRightIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Game Board */}
          <div className="bg-[#bbada0] p-2 rounded-lg">
            <div className="grid grid-cols-4 gap-2">
              {grid.map((row, i) =>
                row.map((value, j) => (
                  <div
                    key={`${i}-${j}`}
                    className={`
                      aspect-square rounded flex items-center justify-center
                      text-2xl font-bold transition-all duration-300
                      ${getTileColor(value)}
                    `}
                  >
                    {value || ''}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Instructions */}
          <p className="text-center text-muted-foreground mt-4 text-sm">
            使用方向键或按钮滑动合并数字，挑战2048！
          </p>

          {/* Game Over / Win Modal */}
          {(gameOver || gameWon) && (
            <Card className="max-w-md mx-auto mt-6 p-6 text-center border-2">
              <div className="text-6xl mb-4">{gameWon ? '🎉' : '😢'}</div>
              <h2 className="text-2xl font-bold mb-2">
                {gameWon ? '恭喜获胜！' : '游戏结束'}
              </h2>
              <p className="text-muted-foreground mb-4">
                得分: {score}
              </p>
              <Button
                className="w-full bg-gradient-to-r from-[#667eea] to-[#764ba2]"
                onClick={initializeGame}
              >
                再玩一次
              </Button>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
