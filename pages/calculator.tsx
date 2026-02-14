import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calculator } from 'lucide-react';

export default function CalculatorPage() {
  return (
    <div className="container mx-auto px-6 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold flex items-center">
          <Calculator className="mr-3 text-[#667eea]" />
          REITs 估值计算器
        </h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>估值计算</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">REITs估值计算器功能开发中...</p>
        </CardContent>
      </Card>
    </div>
  );
}

export const metadata = {
  title: '估值计算器 - REITs 智能助手',
  description: 'REITs产品估值计算工具',
};
