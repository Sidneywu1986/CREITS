'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Calculator, BarChart3 } from 'lucide-react';
import Link from 'next/link';

export default function CalculatorEntrance() {
  return (
    <Link href="/calculator">
      <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer group">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-200">
                <Calculator className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-1">
                  REITs 估值计算器
                </h3>
                <p className="text-sm text-gray-600 flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-indigo-600" />
                  DCF/相对估值综合分析
                </p>
              </div>
            </div>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg group-hover:scale-105 transition-transform duration-200">
              开始计算
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
