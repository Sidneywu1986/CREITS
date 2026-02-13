'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, RotateCcw, Trophy, Clock } from 'lucide-react';

interface CardType {
  id: number;
  emoji: string;
  isFlipped: boolean;
  isMatched: boolean;
}

const emojis = ['🎈', '🎁', '🎨', '🎭', '🎪', '🎯', '🎲', '🎸'];

export default function MemoryGamePage() {
  const router = useRouter();
  const [cards, setCards] = useState<CardType[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [matchedPairs, setMatchedPairs] = useState(0);
  const [moves, setMoves] = useState(0);
  const [timer, setTimer] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGameComplete, setIsGameComplete] = useState(false);

  // Initialize game
  const initializeGame = () => {
    const shuffledEmojis = [...emojis, ...emojis]
      .sort(() => Math.random() - 0.5)
      .map((emoji, index) => ({
        id: index,
        emoji,
        isFlipped: false,
        isMatched: false,
      }));
    setCards(shuffledEmojis);
    setFlippedCards([]);
    setMatchedPairs(0);
    setMoves(0);
    setTimer(0);
    setIsPlaying(false);
    setIsGameComplete(false);
  };

  useEffect(() => {
    initializeGame();
  }, []);

  // Timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying && !isGameComplete) {
      interval = setInterval(() => {
        setTimer((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, isGameComplete]);

  // Check for match
  useEffect(() => {
    if (flippedCards.length === 2) {
      setIsPlaying(true);
      setMoves((prev) => prev + 1);

      const [firstId, secondId] = flippedCards;
      const firstCard = cards[firstId];
      const secondCard = cards[secondId];

      if (firstCard.emoji === secondCard.emoji) {
        // Match found
        setCards((prev) =>
          prev.map((card) =>
            card.id === firstId || card.id === secondId
              ? { ...card, isMatched: true }
              : card
          )
        );
        setMatchedPairs((prev) => prev + 1);
        setFlippedCards([]);
      } else {
        // No match
        setTimeout(() => {
          setCards((prev) =>
            prev.map((card) =>
              card.id === firstId || card.id === secondId
                ? { ...card, isFlipped: false }
                : card
            )
          );
          setFlippedCards([]);
        }, 1000);
      }
    }
  }, [flippedCards, cards]);

  // Check game complete
  useEffect(() => {
    if (matchedPairs === emojis.length && !isGameComplete) {
      setIsGameComplete(true);
    }
  }, [matchedPairs, isGameComplete]);

  const handleCardClick = (id: number) => {
    if (
      flippedCards.length === 2 ||
      flippedCards.includes(id) ||
      cards[id].isMatched ||
      cards[id].isFlipped
    ) {
      return;
    }

    setCards((prev) =>
      prev.map((card) =>
        card.id === id ? { ...card, isFlipped: true } : card
      )
    );
    setFlippedCards((prev) => [...prev, id]);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
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
            <div className="text-xl font-bold">🧠 记忆翻牌</div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center text-sm">
              <Clock className="mr-1 h-4 w-4" />
              {formatTime(timer)}
            </div>
            <div className="text-sm">步数: {moves}</div>
            <Button variant="outline" size="sm" onClick={initializeGame}>
              <RotateCcw className="mr-2 h-4 w-4" />
              重新开始
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {isGameComplete ? (
          <Card className="max-w-md mx-auto p-8 text-center border-2 border-[#48bb78]">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-3xl font-bold mb-4">恭喜完成！</h2>
            <div className="space-y-2 mb-6">
              <div className="flex items-center justify-center space-x-2">
                <Clock className="h-5 w-5 text-muted-foreground" />
                <span>用时: {formatTime(timer)}</span>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <Trophy className="h-5 w-5 text-muted-foreground" />
                <span>步数: {moves}</span>
              </div>
            </div>
            <Button
              className="w-full bg-gradient-to-r from-[#667eea] to-[#764ba2]"
              onClick={initializeGame}
            >
              再玩一次
            </Button>
          </Card>
        ) : (
          <div className="max-w-2xl mx-auto">
            <div className="grid grid-cols-4 gap-4">
              {cards.map((card) => (
                <button
                  key={card.id}
                  onClick={() => handleCardClick(card.id)}
                  disabled={card.isMatched || card.isFlipped}
                  className={`
                    aspect-square rounded-2xl flex items-center justify-center text-5xl
                    transition-all duration-300 cursor-pointer
                    ${
                      card.isFlipped || card.isMatched
                        ? 'bg-white dark:bg-gray-800 shadow-lg transform rotate-0'
                        : 'bg-gradient-to-br from-[#667eea] to-[#764ba2] hover:from-[#764ba2] hover:to-[#667eea] transform hover:scale-105'
                    }
                  `}
                >
                  {card.isFlipped || card.isMatched ? card.emoji : '❓'}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
