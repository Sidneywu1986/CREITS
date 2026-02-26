'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * 彩蛋变体配置
 */
const eggVariants = {
  first: {
    phase1: {
      icon: '👀',
      text: '你发现了我',
      signature: '—— 探索者'
    },
    phase2: {
      icon: '🌟',
      text: '继续探索',
      signature: '—— 冒险家'
    }
  },
  second: {
    phase1: {
      icon: '🤝',
      text: '又见面了',
      signature: '—— 老朋友'
    },
    phase2: {
      icon: '🎯',
      text: '保持热爱',
      signature: '—— 同行者'
    }
  },
  third: {
    phase1: {
      icon: '❤️',
      text: '真爱粉',
      signature: '—— 忠实用户'
    },
    phase2: {
      icon: '💖',
      text: '感谢支持',
      signature: '—— 开发团队'
    }
  },
  tenth: {
    phase1: {
      icon: '😅',
      text: '...你到底点了多少次',
      signature: '—— 吃惊的彩蛋'
    },
    phase2: {
      icon: '🎉',
      text: '你是传奇',
      signature: '—— 敬佩的彩蛋'
    }
  }
};

/**
 * 原始彩蛋内容
 */
const originalEgg = {
  phase1: {
    icon: '🔮',
    text: '静悄悄干大事',
    signature: '—— DeepSeek'
  },
  phase2: {
    icon: '💎',
    text: '低调 低调',
    signature: '—— 扣子编程'
  }
};

/**
 * 根据触发次数获取彩蛋内容
 */
const getEggContent = (triggerCount: number) => {
  // 首次触发显示原始内容
  if (triggerCount === 1) {
    return originalEgg;
  }

  // 第二次触发
  if (triggerCount === 2) {
    return eggVariants.second;
  }

  // 第三次触发
  if (triggerCount === 3) {
    return eggVariants.third;
  }

  // 第十次或更多次触发
  if (triggerCount >= 10) {
    return eggVariants.tenth;
  }

  // 其他次数显示 first 变体
  return eggVariants.first;
};

/**
 * 获取触发次数
 */
const getTriggerCount = (): number => {
  if (typeof window === 'undefined') return 0;
  try {
    const count = localStorage.getItem('easter_egg_triggers');
    return count ? parseInt(count, 10) : 0;
  } catch {
    return 0;
  }
};

/**
 * 增加触发次数
 */
const incrementTriggerCount = (): number => {
  if (typeof window === 'undefined') return 0;
  try {
    const current = getTriggerCount();
    const next = current + 1;
    localStorage.setItem('easter_egg_triggers', next.toString());
    return next;
  } catch {
    return 0;
  }
};

/**
 * 彩蛋组件
 * 连续点击6次触发彩蛋
 */
export function ReitEgg() {
  const [clickCount, setClickCount] = useState(0);
  const [showEasterEgg, setShowEasterEgg] = useState(false);
  const [currentPhase, setCurrentPhase] = useState(1);
  const [triggerCount, setTriggerCountState] = useState(0);

  // 初始化触发次数
  useEffect(() => {
    setTriggerCountState(getTriggerCount());
  }, []);

  // 重置点击计数（3秒无点击则重置）
  useEffect(() => {
    const timer = setTimeout(() => {
      if (clickCount > 0 && clickCount < 6) {
        setClickCount(0);
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [clickCount]);

  // 处理点击
  const handleClick = () => {
    const newCount = clickCount + 1;
    setClickCount(newCount);

    if (newCount >= 6) {
      // 增加触发次数并更新状态
      const newTriggerCount = incrementTriggerCount();
      setTriggerCountState(newTriggerCount);

      setShowEasterEgg(true);
      setCurrentPhase(1);

      // 3秒后切换到第二句
      setTimeout(() => {
        setCurrentPhase(2);
      }, 3000);

      // 6秒后隐藏
      setTimeout(() => {
        setShowEasterEgg(false);
        setClickCount(0);
      }, 8000);
    }
  };

  const content = getEggContent(triggerCount);

  // 进度指示器（仅调试时显示，生产环境可隐藏）
  const showProgress = process.env.NODE_ENV === 'development';

  return (
    <>
      {/* 触发器 - 右下角 */}
      <motion.button
        onClick={handleClick}
        className="fixed bottom-4 right-4 w-8 h-8 rounded-full bg-blue-900/20 hover:bg-blue-900/40 transition-colors flex items-center justify-center cursor-pointer z-40"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        title="点击发现惊喜"
      >
        <div className="w-2 h-2 rounded-full bg-blue-900/60" />
      </motion.button>

      {/* 进度提示（开发环境） */}
      {showProgress && clickCount > 0 && (
        <div className="fixed bottom-14 right-4 bg-blue-900/80 text-white text-xs px-3 py-1 rounded-full z-40">
          {clickCount}/6
        </div>
      )}

      {/* 彩蛋弹窗 */}
      <AnimatePresence>
        {showEasterEgg && (
          <>
            {/* 背景遮罩 */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.7 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-blue-950/30 backdrop-blur-sm z-50"
              onClick={() => {
                setShowEasterEgg(false);
                setClickCount(0);
              }}
            />

            {/* 彩蛋内容 */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 20 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none"
            >
              <div
                className="relative pointer-events-auto"
                style={{
                  background: 'rgba(30, 58, 95, 0.85)',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 60px rgba(30, 58, 95, 0.3)'
                }}
              >
                <div className="bg-gradient-to-br from-blue-900/30 to-blue-950/30 rounded-2xl p-8 md:p-12 min-w-[300px] md:min-w-[400px]">
                  {/* 装饰性光晕 */}
                  <div className="absolute -top-20 -left-20 w-40 h-40 bg-blue-500/20 rounded-full blur-3xl" />
                  <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-purple-500/20 rounded-full blur-3xl" />

                  {/* 内容 */}
                  <AnimatePresence mode="wait">
                    {currentPhase === 1 ? (
                      <motion.div
                        key="phase1"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.5 }}
                        className="relative z-10"
                      >
                        <div className="text-center space-y-6">
                          {/* 图标 */}
                          <motion.div
                            initial={{ rotate: -180, scale: 0 }}
                            animate={{ rotate: 0, scale: 1 }}
                            transition={{
                              type: 'spring',
                              stiffness: 200,
                              damping: 15
                            }}
                            className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-2xl shadow-blue-500/30"
                          >
                            <span className="text-4xl">{content.phase1.icon}</span>
                          </motion.div>

                          {/* 第一句文本 */}
                          <h2 className="text-2xl md:text-3xl font-bold text-white leading-relaxed">
                            {content.phase1.text}
                          </h2>

                          {/* 签名 */}
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            className="pt-4"
                          >
                            <p className="text-blue-300/80 text-sm md:text-base font-medium">
                              {content.phase1.signature}
                            </p>
                          </motion.div>
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="phase2"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.5 }}
                        className="relative z-10"
                      >
                        <div className="text-center space-y-6">
                          {/* 图标 */}
                          <motion.div
                            initial={{ rotate: -180, scale: 0 }}
                            animate={{ rotate: 0, scale: 1 }}
                            transition={{
                              type: 'spring',
                              stiffness: 200,
                              damping: 15
                            }}
                            className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center shadow-2xl shadow-purple-500/30"
                          >
                            <span className="text-4xl">{content.phase2.icon}</span>
                          </motion.div>

                          {/* 第二句文本 */}
                          <h2 className="text-2xl md:text-3xl font-bold text-white leading-relaxed">
                            {content.phase2.text}
                          </h2>

                          {/* 签名 */}
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            className="pt-4"
                          >
                            <p className="text-purple-300/80 text-sm md:text-base font-medium">
                              {content.phase2.signature}
                            </p>
                          </motion.div>

                          {/* 闪烁提示 */}
                          <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5 }}
                            className="text-xs text-white/40 mt-4"
                          >
                            再次点击任意处关闭
                          </motion.p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* 底部装饰线 */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-blue-400 to-transparent" />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

/**
 * Logo触发器组件 - 可在Logo中使用
 */
export function LogoEggTrigger({ children }: { children: React.ReactNode }) {
  const [clickCount, setClickCount] = useState(0);
  const [showEasterEgg, setShowEasterEgg] = useState(false);
  const [currentPhase, setCurrentPhase] = useState(1);
  const [triggerCount, setTriggerCountState] = useState(0);

  // 初始化触发次数
  useEffect(() => {
    setTriggerCountState(getTriggerCount());
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (clickCount > 0 && clickCount < 6) {
        setClickCount(0);
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [clickCount]);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newCount = clickCount + 1;
    setClickCount(newCount);

    if (newCount >= 6) {
      // 增加触发次数并更新状态
      const newTriggerCount = incrementTriggerCount();
      setTriggerCountState(newTriggerCount);

      setShowEasterEgg(true);
      setCurrentPhase(1);

      setTimeout(() => {
        setCurrentPhase(2);
      }, 3000);

      setTimeout(() => {
        setShowEasterEgg(false);
        setClickCount(0);
      }, 8000);
    }
  };

  // 获取彩蛋内容
  const content = getEggContent(triggerCount);

  return (
    <>
      <div onClick={handleClick} className="cursor-pointer">
        {children}
      </div>

      <AnimatePresence>
        {showEasterEgg && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.7 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-blue-950/30 backdrop-blur-sm z-50"
              onClick={() => {
                setShowEasterEgg(false);
                setClickCount(0);
              }}
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 20 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none"
            >
              <div
                className="relative pointer-events-auto"
                style={{
                  background: 'rgba(30, 58, 95, 0.85)',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 60px rgba(30, 58, 95, 0.3)'
                }}
              >
                <div className="bg-gradient-to-br from-blue-900/30 to-blue-950/30 rounded-2xl p-8 md:p-12 min-w-[300px] md:min-w-[400px]">
                  <div className="absolute -top-20 -left-20 w-40 h-40 bg-blue-500/20 rounded-full blur-3xl" />
                  <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-purple-500/20 rounded-full blur-3xl" />

                  <AnimatePresence mode="wait">
                    {currentPhase === 1 ? (
                      <motion.div
                        key="phase1"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.5 }}
                        className="relative z-10"
                      >
                        <div className="text-center space-y-6">
                          <motion.div
                            initial={{ rotate: -180, scale: 0 }}
                            animate={{ rotate: 0, scale: 1 }}
                            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                            className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-2xl shadow-blue-500/30"
                          >
                            <span className="text-4xl">{content.phase1.icon}</span>
                          </motion.div>
                          <h2 className="text-2xl md:text-3xl font-bold text-white leading-relaxed">
                            {content.phase1.text}
                          </h2>
                          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="pt-4">
                            <p className="text-blue-300/80 text-sm md:text-base font-medium">{content.phase1.signature}</p>
                          </motion.div>
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="phase2"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.5 }}
                        className="relative z-10"
                      >
                        <div className="text-center space-y-6">
                          <motion.div
                            initial={{ rotate: -180, scale: 0 }}
                            animate={{ rotate: 0, scale: 1 }}
                            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                            className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center shadow-2xl shadow-purple-500/30"
                          >
                            <span className="text-4xl">{content.phase2.icon}</span>
                          </motion.div>
                          <h2 className="text-2xl md:text-3xl font-bold text-white leading-relaxed">
                            {content.phase2.text}
                          </h2>
                          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="pt-4">
                            <p className="text-purple-300/80 text-sm md:text-base font-medium">{content.phase2.signature}</p>
                          </motion.div>
                          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="text-xs text-white/40 mt-4">
                            再次点击任意处关闭
                          </motion.p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-blue-400 to-transparent" />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
