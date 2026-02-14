import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText } from 'lucide-react';

export default function FeishuPage() {
  return (
    <div className="container mx-auto px-6 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold flex items-center">
          <FileText className="mr-3 text-[#667eea]" />
          飞书集成
        </h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>飞书文档管理</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">飞书集成功能开发中...</p>
        </CardContent>
      </Card>
    </div>
  );
}

export const metadata = {
  title: '飞书集成 - REITs 智能助手',
  description: '飞书文档和协作功能集成',
};
