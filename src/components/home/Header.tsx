'use client';

import Link from 'next/link';

export default function Header() {
  return (
    <div className="py-8 border-b border-white/10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-4xl font-bold text-white">REITs 智能助手</h1>
          <p className="text-white/60 mt-1">
            多Agent协作系统 · 专业的REITs发行服务平台
          </p>
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <Link href="/calculator">
            <button className="w-full sm:w-auto bg-white text-[#0B1E33] px-5 py-2 rounded-lg font-medium hover:bg-white/90 transition active:scale-95">
              开始估值
            </button>
          </Link>
          <Link href="/agents">
            <button className="w-full sm:w-auto border border-white/30 text-white px-5 py-2 rounded-lg font-medium hover:bg-white/10 transition active:scale-95">
              了解Agent
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
