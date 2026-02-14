import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AGENTS } from '@/types';
import { ArrowRight, Bot, Sparkles, BookOpen } from 'lucide-react';

export default function AgentsPage() {
  return (
    <div className="container mx-auto px-6 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center">
          <Link href="/">
            <Button variant="ghost" size="sm" className="mr-4">
              <ArrowRight className="mr-2 h-4 w-4 rotate-180" />
              返回
            </Button>
          </Link>
          <h1 className="text-3xl font-bold flex items-center">
            <Bot className="mr-3 text-[#667eea]" />
            Agent 服务中心
          </h1>
        </div>
      </div>

      <div className="mb-8">
        <div className="rounded-2xl bg-gradient-to-r from-[#667eea] to-[#764ba2] p-6 text-white shadow-lg">
          <h2 className="text-2xl font-bold mb-2 flex items-center">
            <Sparkles className="mr-2" />
            智能Agent + 文档分析
          </h2>
          <p className="opacity-90">
            选择专业Agent进行对话，或上传文档让Agent进行分析。每个Agent都专注于特定领域，为您提供专业、精准的服务。
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {AGENTS.map((agent) => (
          <Card
            key={agent.id}
            className="h-full hover:shadow-2xl transition-all duration-300 border-2 hover:border-[#667eea] group"
          >
            <CardHeader>
              <div className="flex items-center justify-between mb-3">
                <div
                  className="w-14 h-14 rounded-xl flex items-center justify-center text-3xl shadow-md"
                  style={{ backgroundColor: agent.color + '20', border: '2px solid ' + agent.color }}
                >
                  {agent.icon}
                </div>
                <Badge
                  className="font-medium"
                  style={{
                    backgroundColor: agent.color + '20',
                    color: agent.color,
                    border: '1px solid ' + agent.color,
                  }}
                >
                  专业 Agent
                </Badge>
              </div>
              <CardTitle className="text-xl">{agent.name}</CardTitle>
              <CardDescription className="text-base">{agent.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex space-x-2">
                  <Link href={`/chat/${agent.id}`} className="flex-1">
                    <Button variant="default" className="w-full">
                      开始对话
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" className="flex-1">
                    文档分析
                  </Button>
                  <Link href={`/knowledge/${agent.id}`} className="flex-1">
                    <Button variant="outline" className="w-full">
                      <BookOpen className="w-4 h-4 mr-2" />
                      知识库
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-2 border-[#667eea] bg-gradient-to-br from-[#667eea]/5 to-[#764ba2]/5">
        <CardHeader>
          <div className="flex items-center mb-2">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#667eea] to-[#764ba2] flex items-center justify-center text-3xl shadow-lg mr-4">
              AI
            </div>
            <div>
              <CardTitle className="text-2xl">智能协作模式</CardTitle>
              <CardDescription className="text-base mt-1">
                多 Agent 协同工作，复杂任务交给 AI
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            通过智能协作模式，系统会自动协调多个专业Agent共同处理复杂任务，为您提供更全面、更深入的解决方案。
          </p>
          <Link href="/chat/collaboration">
            <Button
              size="lg"
              className="w-full bg-gradient-to-r from-[#667eea] to-[#764ba2] hover:opacity-90 transition-opacity"
            >
              <Sparkles className="mr-2 h-5 w-5" />
              启动协作模式
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}

export const metadata = {
  title: 'Agent 服务中心 - REITs 智能助手',
  description: '选择专业Agent进行对话或文档分析',
};
