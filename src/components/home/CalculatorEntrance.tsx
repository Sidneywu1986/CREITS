'use client';

import Link from 'next/link';

export default function CalculatorEntrance() {
  return (
    <Link href="/calculator">
      <div className="border border-gray-200 rounded-lg p-5 bg-gray-50 hover:border-gray-400 transition-colors duration-200 cursor-pointer group">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-800 mb-1">
              REITs 估值计算器
            </h3>
            <p className="text-sm text-gray-500">
              DCF/相对估值综合分析
            </p>
          </div>
          <button className="ml-4 border border-blue-600 text-blue-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-50 transition-colors duration-200 active:bg-blue-100 whitespace-nowrap">
            开始计算
          </button>
        </div>
      </div>
    </Link>
  );
}
