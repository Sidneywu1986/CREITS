import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function FeishuPage() {
  return (
    <div className="container mx-auto px-6 py-8">
      <div className="mb-6">
        <div className="flex items-center">
          <Link href="/">
            <Button variant="ghost" size="sm" className="mr-4">
              <ArrowRight className="mr-2 h-4 w-4 rotate-180" />
              返回
            </Button>
          </Link>
          <h1 className="text-3xl font-bold flex items-center">
            <FileText className="mr-3 text-[#667eea]" />
            飞书集成
          </h1>
        </div>
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
