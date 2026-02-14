import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Scale } from 'lucide-react';

export default function LawPage() {
  return (
    <div className="container mx-auto px-6 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold flex items-center">
          <Scale className="mr-3 text-[#667eea]" />
          法务风控合规
        </h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>法务风控</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">法务风控合规功能开发中...</p>
        </CardContent>
      </Card>
    </div>
  );
}

export const metadata = {
  title: '法务风控合规 - REITs 智能助手',
  description: '法务风控和合规检查',
};
