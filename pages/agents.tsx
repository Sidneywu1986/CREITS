import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { AGENTS } from '@/src/types';

export default function AgentsPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-b from-[#0B1E33] to-[#1A3B5E]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 头部区域 */}
        <div className="mb-6 border-b border-white/10 pb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Link href="/">
                <button className="flex items-center gap-2 text-white/70 hover:text-white transition-colors">
                  <ArrowRight className="h-4 w-4 rotate-180" />
                  返回
                </button>
              </Link>
              <div className="ml-6">
                <h1 className="text-2xl font-bold text-white">Agent服务中心</h1>
              </div>
            </div>
          </div>
          <p className="text-white/60 text-sm mt-4 ml-16">
            选择专业Agent进行对话，或上传文档让Agent进行分析。每个Agent都专注于特定领域，为您提供专业、精准的服务。
          </p>
        </div>

        {/* Agent卡片区域 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
          {AGENTS.filter(agent => agent.id !== 'collaboration').map((agent) => (
            <div
              key={agent.id}
              className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-5 hover:bg-white/20 hover:border-white/40 transition-all duration-200"
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">{agent.icon}</span>
                <h3 className="text-lg font-semibold text-white">{agent.name}</h3>
              </div>
              <p className="text-sm text-white/60 h-10 line-clamp-2">
                {agent.description}
              </p>
              <div className="mt-4">
                <Link href={`/chat/${agent.id}`} className="block">
                  <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium w-full transition-colors">
                    开始对话 →
                  </button>
                </Link>
                <div className="flex justify-center items-center gap-3 mt-3 text-sm">
                  <span className="text-white/60 hover:text-white cursor-pointer transition-colors">
                    文档分析
                  </span>
                  <span className="text-white/20">·</span>
                  <Link href={`/knowledge/${agent.id}`}>
                    <span className="text-white/60 hover:text-white cursor-pointer transition-colors">
                      知识库
                    </span>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 智能协作模式区域 */}
        <div className="bg-white/5 rounded-xl p-6 border border-white/10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4 flex-1">
              <span className="text-3xl">🧠</span>
              <div>
                <h3 className="text-xl font-semibold text-white">智能协作模式</h3>
                <p className="text-white/60 text-sm mt-1">多Agent协同工作，复杂任务交给AI</p>
              </div>
            </div>
            <Link href="/chat/collaboration" className="flex-shrink-0">
              <button className="border border-white/30 text-white px-6 py-3 rounded-lg hover:bg-white/10 transition-all duration-200 flex items-center gap-2">
                启动协作模式
                <ArrowRight className="h-4 w-4" />
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export const metadata = {
  title: 'Agent 服务中心 - REITs 智能助手',
  description: '选择专业Agent进行对话或文档分析',
};
