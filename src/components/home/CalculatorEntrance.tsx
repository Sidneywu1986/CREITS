'use client';

import Link from 'next/link';

export default function CalculatorEntrance() {
  return (
    <Link href="/calculator">
      <div className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-xl p-5 hover:bg-white/20 transition cursor-pointer group">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-white mb-2">
              REITs 估值计算器
            </h3>
            <p className="text-sm text-white/60">
              DCF/相对估值综合分析
            </p>
          </div>
          <button className="ml-4 bg-white text-[#0B1E33] px-5 py-2 rounded-lg font-medium hover:bg-white/90 transition-colors active:scale-95 whitespace-nowrap">
            开始计算
          </button>
        </div>
      </div>
    </Link>
  );
}
