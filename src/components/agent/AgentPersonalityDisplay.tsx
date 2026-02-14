/**
 * Agent人格展示组件
 * 用于展示每个Agent的人格特质和风格
 */

'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AGENTS } from '@/types';

interface AgentPersonalityDisplayProps {
  agentId?: string;
}

export default function AgentPersonalityDisplay({ agentId }: AgentPersonalityDisplayProps) {
  const selectedAgent = agentId ? AGENTS.find(agent => agent.id === agentId) : null;

  if (!selectedAgent) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        请选择一个Agent查看其人格信息
      </div>
    );
  }

  const { personality } = selectedAgent;

  // 语言风格映射
  const languageStyleMap: Record<string, string> = {
    'academic': '学术派',
    'practical': '实务派',
    'data-driven': '数据驱动',
    'storytelling': '故事派',
    'conversational': '对话式'
  };

  // 对话风格映射
  const conversationStyleMap: Record<string, string> = {
    'concise': '简洁型',
    'detailed': '详细型',
    'interactive': '互动型',
    'authoritative': '权威型',
    'encouraging': '鼓励型'
  };

  // 专业风格映射
  const professionalStyleMap: Record<string, string> = {
    'theoretical': '理论导向',
    'practical': '实务导向',
    'innovative': '创新导向',
    'comprehensive': '综合型'
  };

  // 情感风格映射
  const emotionalStyleMap: Record<string, string> = {
    'rational': '理性客观',
    'enthusiastic': '热情友好',
    'calm': '冷静沉着',
    'friendly': '友好亲切',
    'professional': '专业严谨'
  };

  return (
    <div className="space-y-6">
      {/* Agent基本信息 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-lg flex items-center justify-center text-3xl"
              style={{ backgroundColor: selectedAgent.color + '20', border: '2px solid ' + selectedAgent.color }}
            >
              {selectedAgent.icon}
            </div>
            <div>
              <div className="text-2xl font-bold">{selectedAgent.name}</div>
              <div className="text-sm text-muted-foreground">{selectedAgent.description}</div>
            </div>
          </CardTitle>
        </CardHeader>
      </Card>

      {/* 人格特质 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="text-2xl">🎭</span>
            人格特质
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {personality.traits.map((trait, index) => (
              <Badge
                key={index}
                variant="outline"
                className="px-3 py-1 text-sm"
                style={{ borderColor: selectedAgent.color, color: selectedAgent.color }}
              >
                {trait}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 语言风格 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="text-2xl">💬</span>
            语言风格
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
              style={{ backgroundColor: selectedAgent.color }}
            >
              {selectedAgent.icon}
            </div>
            <div>
              <div className="font-semibold text-lg">
                {languageStyleMap[personality.languageStyle] || personality.languageStyle}
              </div>
              <div className="text-sm text-muted-foreground">
                {getLanguageStyleDescription(personality.languageStyle)}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 对话风格 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="text-2xl">🗣️</span>
            对话风格
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
              style={{ backgroundColor: selectedAgent.color }}
            >
              {selectedAgent.icon}
            </div>
            <div>
              <div className="font-semibold text-lg">
                {conversationStyleMap[personality.conversationStyle] || personality.conversationStyle}
              </div>
              <div className="text-sm text-muted-foreground">
                {getConversationStyleDescription(personality.conversationStyle)}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 专业风格 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="text-2xl">🎓</span>
            专业风格
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
              style={{ backgroundColor: selectedAgent.color }}
            >
              {selectedAgent.icon}
            </div>
            <div>
              <div className="font-semibold text-lg">
                {professionalStyleMap[personality.professionalStyle] || personality.professionalStyle}
              </div>
              <div className="text-sm text-muted-foreground">
                {getProfessionalStyleDescription(personality.professionalStyle)}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 情感风格 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="text-2xl">❤️</span>
            情感风格
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
              style={{ backgroundColor: selectedAgent.color }}
            >
              {selectedAgent.icon}
            </div>
            <div>
              <div className="font-semibold text-lg">
                {emotionalStyleMap[personality.emotionalStyle] || personality.emotionalStyle}
              </div>
              <div className="text-sm text-muted-foreground">
                {getEmotionalStyleDescription(personality.emotionalStyle)}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 口头禅 */}
      {personality.catchphrase && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-2xl">💡</span>
              标志性表达
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border-l-4" style={{ borderColor: selectedAgent.color }}>
              <p className="text-lg font-medium italic">
                "{personality.catchphrase}"
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 个性标签 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="text-2xl">🏷️</span>
            个性标签
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {personality.tags.map((tag, index) => (
              <Badge
                key={index}
                className="px-3 py-1"
                style={{ backgroundColor: selectedAgent.color + '20', color: selectedAgent.color }}
              >
                {tag}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// 辅助函数：获取语言风格描述
function getLanguageStyleDescription(style: string): string {
  const descriptions: Record<string, string> = {
    'academic': '使用精准的专业术语，表述规范、准确、无歧义',
    'practical': '注重实操，表述简洁、准确，避免冗余',
    'data-driven': '基于数据和分析，用数据和图表说话',
    'storytelling': '使用故事化的表达方式，便于理解和记忆',
    'conversational': '使用亲切、易懂的语言，便于沟通'
  };
  return descriptions[style] || '';
}

// 辅助函数：获取对话风格描述
function getConversationStyleDescription(style: string): string {
  const descriptions: Record<string, string> = {
    'concise': '直奔主题，重点突出，不拖泥带水',
    'detailed': '提供全面的分析，层层递进，详细说明',
    'interactive': '与用户互动，根据实际情况调整建议',
    'authoritative': '基于专业判断，语气坚定，直接给出结论',
    'encouraging': '鼓励用户提问和参与，提供友好的互动体验'
  };
  return descriptions[style] || '';
}

// 辅助函数：获取专业风格描述
function getProfessionalStyleDescription(style: string): string {
  const descriptions: Record<string, string> = {
    'theoretical': '注重理论分析，基于理论框架提供专业建议',
    'practical': '注重实操，提供可落地的解决方案',
    'innovative': '注重创新，提供前瞻性的专业建议',
    'comprehensive': '注重全面性，提供综合性的专业服务'
  };
  return descriptions[style] || '';
}

// 辅助函数：获取情感风格描述
function getEmotionalStyleDescription(style: string): string {
  const descriptions: Record<string, string> = {
    'rational': '始终保持理性客观，避免主观情绪',
    'enthusiastic': '热情友好，积极响应用户需求',
    'calm': '冷静沉着，理性分析问题',
    'friendly': '友好亲切，营造轻松的对话氛围',
    'professional': '专业严谨，注重工作质量'
  };
  return descriptions[style] || '';
}
