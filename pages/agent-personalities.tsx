/**
 * Agent人格展示页面
 * 展示所有7个Agent的人格特质和风格
 */

'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AGENTS } from '@/types';
import AgentPersonalityDisplay from '@/components/agent/AgentPersonalityDisplay';

export default function AgentPersonalitiesPage() {
  const [selectedAgentId, setSelectedAgentId] = useState<string | undefined>(undefined);
  const selectedAgent = selectedAgentId ? AGENTS.find(agent => agent.id === selectedAgentId) : null;

  return (
    <div className="container mx-auto px-6 py-8">
      {/* 页面标题 */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Agent人格展示</h1>
        <p className="text-muted-foreground text-lg">
          了解每个REITs智能助手的独特人格和风格
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 左侧：Agent列表 */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-2xl">🤖</span>
                Agent列表
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {AGENTS.map((agent) => (
                  <Button
                    key={agent.id}
                    variant={selectedAgentId === agent.id ? "default" : "outline"}
                    className={`w-full justify-start text-left h-auto py-3 px-4 ${
                      selectedAgentId === agent.id ? '' : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                    style={
                      selectedAgentId === agent.id
                        ? { backgroundColor: agent.color, color: 'white' }
                        : {}
                    }
                    onClick={() => setSelectedAgentId(agent.id)}
                  >
                    <div className="flex items-center gap-3 w-full">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center text-xl flex-shrink-0"
                        style={{
                          backgroundColor: selectedAgentId === agent.id
                            ? 'rgba(255,255,255,0.2)'
                            : agent.color + '20',
                          border: `2px solid ${agent.color}`
                        }}
                      >
                        {agent.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-sm truncate">{agent.name}</div>
                        <div className="text-xs opacity-80 truncate">{agent.description}</div>
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 右侧：Agent人格详情 */}
        <div className="lg:col-span-2">
          {selectedAgentId ? (
            <AgentPersonalityDisplay agentId={selectedAgentId} />
          ) : (
            <Card>
              <CardContent className="pt-12">
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">👈</div>
                  <h3 className="text-xl font-semibold mb-2">选择一个Agent</h3>
                  <p className="text-muted-foreground">
                    从左侧列表中选择一个Agent，查看其详细的人格特质和风格
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* 底部：所有Agent概览 */}
      <div className="mt-12">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-2xl">📊</span>
              所有Agent概览
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {AGENTS.map((agent) => (
                <div
                  key={agent.id}
                  className="p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => setSelectedAgentId(agent.id)}
                  style={{ borderColor: agent.color + '40' }}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center text-xl"
                      style={{ backgroundColor: agent.color + '20', border: `2px solid ${agent.color}` }}
                    >
                      {agent.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm truncate">{agent.name}</div>
                    </div>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">人格:</span>
                      <span className="font-medium">{agent.personality.traits.slice(0, 3).join(', ')}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">风格:</span>
                      <span className="font-medium">
                        {getLanguageStyleLabel(agent.personality.languageStyle)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// 辅助函数：获取语言风格标签
function getLanguageStyleLabel(style: string): string {
  const labels: Record<string, string> = {
    'academic': '学术派',
    'practical': '实务派',
    'data-driven': '数据驱动',
    'storytelling': '故事派',
    'conversational': '对话式'
  };
  return labels[style] || style;
}
