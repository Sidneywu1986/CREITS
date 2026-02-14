import { useRouter } from 'next/router';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, FileText, Trash2, Download, BookOpen } from 'lucide-react';
import { AGENTS } from '@/types';
import Link from 'next/link';
import { useState } from 'react';
import dynamic from 'next/dynamic';

// 动态导入法规知识库组件（避免SSR问题）
const RegulationsKnowledgeBase = dynamic(
  () => import('@/components/knowledge/RegulationsKnowledgeBase'),
  { ssr: false }
);

export default function KnowledgePage() {
  const router = useRouter();
  const { agentId } = router.query;
  const agent = AGENTS.find(a => a.id === agentId);

  const [documents] = useState([
    { id: 1, name: 'REITs发行指引.pdf', size: '2.5 MB', uploadDate: '2024-01-15' },
    { id: 2, name: '合规检查清单.docx', size: '1.2 MB', uploadDate: '2024-01-14' },
  ]);

  // 判断是否是法务风控Agent
  const isLegalAgent = agentId === 'legal';

  if (!agent) {
    return (
      <div className="container mx-auto px-6 py-8">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">加载中或未找到对应的Agent</p>
            <Link href="/agents">
              <Button className="mx-auto mt-4">返回Agent列表</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // 法务风控Agent显示法规知识库
  if (isLegalAgent) {
    return (
      <div className="container mx-auto px-6 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center">
            <Link href="/agents">
              <Button variant="ghost" size="sm" className="mr-4">
                ← 返回
              </Button>
            </Link>
            <h1 className="text-3xl font-bold flex items-center">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center text-2xl mr-3"
                style={{ backgroundColor: agent.color + '20', border: '2px solid ' + agent.color }}
              >
                {agent.icon}
              </div>
              {agent.name} - 法规知识库
            </h1>
          </div>
          <Link href="/chat?agentId=legal">
            <Button className="bg-gradient-to-r from-[#667eea] to-[#764ba2]">
              <BookOpen className="mr-2 h-4 w-4" />
              法规问答
            </Button>
          </Link>
        </div>

        <RegulationsKnowledgeBase />
      </div>
    );
  }

  // 其他Agent显示普通知识库
  return (
    <div className="container mx-auto px-6 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center">
          <Link href="/agents">
            <Button variant="ghost" size="sm" className="mr-4">
              ← 返回
            </Button>
          </Link>
          <h1 className="text-3xl font-bold flex items-center">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center text-2xl mr-3"
              style={{ backgroundColor: agent.color + '20', border: '2px solid ' + agent.color }}
            >
              {agent.icon}
            </div>
            {agent.name} - 知识库
          </h1>
        </div>
        <Button className="bg-gradient-to-r from-[#667eea] to-[#764ba2]">
          <Upload className="mr-2 h-4 w-4" />
          上传文档
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>知识库文档</CardTitle>
        </CardHeader>
        <CardContent>
          {documents.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>暂无文档</p>
              <p className="text-sm mt-2">上传文档以构建Agent的知识库</p>
            </div>
          ) : (
            <div className="space-y-3">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                      <FileText className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-medium">{doc.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {doc.size} • {doc.uploadDate}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon">
                      <Download className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export const metadata = {
  title: '知识库 - REITs 智能助手',
  description: '管理Agent的知识库文档',
};
