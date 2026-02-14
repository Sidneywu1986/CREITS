import { useRouter } from 'next/router';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Bot, Send, User, Loader2, Users, Sparkles, Plus, X } from 'lucide-react';
import { AGENTS, Agent } from '@/types';
import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import {
  CollaborationManager,
  QuestionAnalyzer,
  CollaborationMessage,
  getAgentDomain
} from '@/lib/services/multi-agent-collaboration';

/**
 * 消息类型定义
 */
interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  agentId?: string;
  content: string;
  type?: 'response' | 'invitation' | 'transition' | 'suggestion';
  timestamp: number;
  mentionedAgents?: string[];
}

export default function ChatPage() {
  const router = useRouter();
  const { id: agentId } = router.query;
  const agent = AGENTS.find(a => a.id === agentId);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [participatingAgents, setParticipatingAgents] = useState<string[]>([]);
  const [collaborationMode, setCollaborationMode] = useState(false);
  const [showCollaborationSuggestion, setShowCollaborationSuggestion] = useState(false);
  const [collaborationSuggestion, setCollaborationSuggestion] = useState<{
    suggestedAgents: string[];
    reason: string;
  } | null>(null);
  const initializedRef = useRef(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 初始化问候语
  useEffect(() => {
    if (agent && !initializedRef.current) {
      setMessages([
        {
          id: 'init',
          role: 'assistant',
          agentId: agent.id,
          content: agent.greeting,
          type: 'response',
          timestamp: Date.now()
        },
      ]);
      initializedRef.current = true;
    }
  }, [agent]);

  // 自动滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 获取Agent对象
  const getAgentById = (id: string): Agent | undefined => {
    return AGENTS.find(a => a.id === id);
  };

  // 处理发送消息
  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setLoading(true);

    // 添加用户消息
    const newUserMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: userMessage,
      timestamp: Date.now()
    };
    setMessages(prev => [...prev, newUserMessage]);

    // 分析问题是否需要协作
    if (agent) {
      const analysis = QuestionAnalyzer.analyze(agent.id, userMessage);

      // 如果需要协作，显示协作建议
      if (analysis.suggestedAgents.length > 0 && !collaborationMode) {
        setCollaborationSuggestion({
          suggestedAgents: analysis.suggestedAgents,
          reason: analysis.reason
        });
        setShowCollaborationSuggestion(true);
      }

      // 模拟Agent响应
      setTimeout(() => {
        const responseMessage: ChatMessage = {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          agentId: agent.id,
          content: generateAgentResponse(agent, userMessage, analysis),
          type: 'response',
          timestamp: Date.now()
        };
        setMessages(prev => [...prev, responseMessage]);
        setLoading(false);
      }, 1000);
    } else {
      setLoading(false);
    }
  };

  // 启动协作模式
  const startCollaboration = () => {
    if (!collaborationSuggestion || !agent) return;

    setCollaborationMode(true);
    const newAgents = collaborationSuggestion.suggestedAgents;
    setParticipatingAgents(prev => [...prev, ...newAgents.filter(id => !prev.includes(id))]);
    setShowCollaborationSuggestion(false);

    // 添加系统消息：邀请其他Agent
    const invitationMessages = CollaborationManager.generateInvitationMessages(
      agent.id,
      newAgents,
      messages[messages.length - 1]?.content || ''
    );

    invitationMessages.forEach(msg => {
      setTimeout(() => {
        setMessages(prev => [...prev, {
          id: `msg-${Date.now()}-${Math.random()}`,
          role: 'assistant',
          agentId: msg.agentId,
          content: msg.content,
          type: msg.type,
          timestamp: Date.now(),
          mentionedAgents: msg.mentionedAgents
        } as ChatMessage]);
      }, 500);
    });

    // 逐个添加Agent加入消息
    newAgents.forEach((agentId, index) => {
      setTimeout(() => {
        const joinMessage: ChatMessage = {
          id: `join-${Date.now()}-${agentId}`,
          role: 'system',
          agentId: agentId,
          content: `${getAgentById(agentId)?.icon} ${getAgentById(agentId)?.name} 已加入对话`,
          type: 'transition',
          timestamp: Date.now()
        };
        setMessages(prev => [...prev, joinMessage]);
      }, 1000 + (index + 1) * 500);
    });

    // 协作Agent回应
    setTimeout(() => {
      newAgents.forEach(invitedId => {
        const invitedAgent = getAgentById(invitedId);
        if (invitedAgent) {
          const responseMessage: ChatMessage = {
            id: `response-${Date.now()}-${invitedId}`,
            role: 'assistant',
            agentId: invitedId,
            content: generateCollaborationResponse(invitedAgent, messages[messages.length - 1]?.content || ''),
            type: 'response',
            timestamp: Date.now()
          };
          setMessages(prev => [...prev, responseMessage]);
        }
      });
    }, 3000);
  };

  // 移除参与Agent
  const removeAgent = (agentIdToRemove: string) => {
    setParticipatingAgents(prev => prev.filter(id => id !== agentIdToRemove));

    // 添加系统消息
    const leaveMessage: ChatMessage = {
      id: `leave-${Date.now()}-${agentIdToRemove}`,
      role: 'system',
      content: `${getAgentById(agentIdToRemove)?.icon} ${getAgentById(agentIdToRemove)?.name} 已退出对话`,
      type: 'transition',
      timestamp: Date.now()
    };
    setMessages(prev => [...prev, leaveMessage]);

    // 如果没有其他Agent，退出协作模式
    if (participatingAgents.filter(id => id !== agentIdToRemove).length === 0) {
      setCollaborationMode(false);
    }
  };

  // 生成Agent响应（模拟）
  const generateAgentResponse = (
    currentAgent: Agent,
    question: string,
    analysis: any
  ): string => {
    // 问候语检测
    const greetingResponses = [
      '您好！很高兴为您服务。请问有什么我可以帮助您的？',
      '您好！我是REITs智能助手，请问您有什么问题需要咨询？',
      '您好！请问有什么我可以为您做的？',
      '您好！请问您想了解哪方面的内容？'
    ];

    // 检查是否是问候语
    const greetingPatterns = [
      /^(你好|您好|hello|hi|哈喽|嗨|早上好|下午好|晚上好|晚安)([？！。，。！？]*)?$/i,
      /^(谢谢|感谢|拜拜|再见)([！。，。！？]*)?$/i,
      /^(在吗|在不在|有人吗)([？！。，。！？]*)?$/i
    ];

    const isGreeting = greetingPatterns.some(pattern => pattern.test(question.trim()));

    if (isGreeting) {
      // 随机返回一个问候回复
      const randomResponse = greetingResponses[Math.floor(Math.random() * greetingResponses.length)];
      return randomResponse;
    }

    // 上下文相关输入检测（更智能的检测）
    const contextPatterns = {
      // 顺序选择
      sequential: [
        /^(从第[一二三四五六七八九十百千0-9]+方面)/,
        /^(第一个|第二个|第三个|第四个|第五个|第六个|第7个|第8个|第9个|第10个)/,
        /^(首先|其次|再次|最后)(点|方面)?/
      ],
      // 继续询问
      continue: [
        /^(继续|还有|再|next)(讲|说|展开|详细)?/i,
        /^(多说点|多说一些|详细点|详细说)/,
        /^(接着|接下来|然后|下一步)/
      ],
      // 询问细节
      detail: [
        /^(详细|展开|说说|讲讲)(一下)?/,
        /^(具体|详细说|详细点|具体说)/,
        /^(深一点|深入|深入一点)/
      ],
      // 疑问词
      question: [
        /^(怎么|如何|为什么|为啥)(会|能|可能)?/,
        /^(是什么|怎么样|如何做)/
      ],
      // 确认/否定
      confirmation: [
        /^(好吗|可以吗|行吗|对吗|是吧)/,
        /^(是的|对的|没错|正确|OK|ok)/,
        /^(不是|不对|不|no|NO|错|错误)/
      ]
    };

    // 检测是否是上下文相关输入
    let contextType: string | null = null;
    for (const [type, patterns] of Object.entries(contextPatterns)) {
      if (patterns.some(pattern => pattern.test(question.trim()))) {
        contextType = type;
        break;
      }
    }

    if (contextType) {
      // 获取对话历史
      const lastUserMessage = messages.filter(m => m.role === 'user').pop();
      const lastAssistantMessage = messages.filter(m => m.role === 'assistant').pop();

      if (lastUserMessage && lastAssistantMessage && messages.length >= 3) {
        // 有足够的上下文
        const userQuestionPreview = lastUserMessage.content.length > 30
          ? lastUserMessage.content.substring(0, 30) + '...'
          : lastUserMessage.content;

        switch (contextType) {
          case 'sequential':
            return `好的，让我从您指定的方面继续展开：\n\n针对"${userQuestionPreview}"，这个方面需要重点关注以下几点：\n\n• 核心要素：这是该领域的关键组成部分\n• 影响因素：需要考虑多个相关因素\n• 实际应用：建议结合项目具体情况进行分析\n\n如果您需要了解其他方面，请随时告诉我。`;

          case 'continue':
            return `好的，让我继续为您展开说明：\n\n关于"${userQuestionPreview}"，还有以下几个重要方面需要补充：\n\n• 补充要点1：在实际操作中的具体应用\n• 补充要点2：可能遇到的风险和挑战\n• 补充要点3：建议的应对措施和策略\n\n请问您对哪个部分还有疑问？`;

          case 'detail':
            return `好的，让我为您详细说明：\n\n针对"${userQuestionPreview}"，具体来说：\n\n• 第一点：从专业角度分析，这是该领域的核心要素\n• 第二点：实际操作中需要注意的关键节点\n• 第三点：不同情况下的处理建议\n\n如果您需要更深入的解析，请告诉我具体想了解哪个环节。`;

          case 'question':
            return `关于您的问题，我来详细解答：\n\n"${userQuestionPreview}"涉及的内容比较专业，主要包括：\n\n• 基本概念和定义\n• 相关法规要求\n• 实际操作要点\n\n建议您可以结合项目的具体情况进行评估，如果需要更精准的分析，可以提供更多项目信息。`;

          case 'confirmation':
            if (/^(是的|对的|没错|正确|OK|ok)/.test(question.trim())) {
              return `很高兴能帮到您！如果您还有其他关于REITs的问题，随时可以问我。比如：\n\n• 政策解读\n• 尽调分析\n• 定价建议\n• 运营管理\n\n请问您还想了解什么？`;
            } else if (/^(不是|不对|不|no|NO|错|错误)/.test(question.trim())) {
              return `感谢您的反馈。能否请您说明一下具体的疑问点？或者您想了解哪个方面的内容？这样我可以为您提供更准确的信息。`;
            }
            break;
        }
      }

      // 没有足够的上下文
      return '我注意到您想要了解更多细节，但为了给出更准确的回答，能否请您提供更多背景信息？例如：\n\n• 您想了解的具体REITs项目\n• 您关心的问题类型（政策、尽调、定价、运营等）\n• 您的具体需求和场景\n\n这样我可以为您提供更精准、有针对性的建议。';
    }

    // 检查是否是简短的无意义输入
    if (question.trim().length < 3) {
      return '您好，请问您有什么具体的问题需要咨询吗？我可以为您解答关于REITs发行、法律合规、政策解读、尽调分析、定价发行、运营管理等各方面的问题。';
    }

    const domain = getAgentDomain(currentAgent.id);
    const keyword = domain?.keywords[0] || '专业领域';

    if (analysis.confidence < 0.3 && analysis.suggestedAgents.length > 0) {
      const suggestedNames = analysis.suggestedAgents
        .map((id: string) => getAgentById(id)?.name || id)
        .join('、');
      return `感谢您的提问。这个问题虽然涉及${keyword}，但似乎更偏向于${analysis.suggestedAgents.map((id: string) => getAgentById(id)?.name || id).join('和')}的专业领域。\n\n建议启动协作模式，让我与${suggestedNames}共同为您解答，这样可以提供更全面、准确的专业建议。`;
    }

    return `关于您提到的"${question.substring(0, 50)}${question.length > 50 ? '...' : ''}"，从${keyword}的角度分析：\n\n1. 首先，我们需要确认相关的合规要求和风险点。\n2. 其次，需要评估对项目整体的影响。\n3. 最后，建议采取相应的应对措施。\n\n请问您需要我详细展开哪个方面？`;
  };

  // 生成协作Agent响应（模拟）
  const generateCollaborationResponse = (
    collaboratingAgent: Agent,
    originalQuestion: string
  ): string => {
    // 问候语检测
    const greetingPatterns = [
      /^(你好|您好|hello|hi|哈喽|嗨|早上好|下午好|晚上好|晚安)([？！。，。！？]*)?$/i,
      /^(谢谢|感谢|拜拜|再见)([！。，。！？]*)?$/i,
      /^(在吗|在不在|有人吗)([？！。，。！？]*)?$/i
    ];

    // 上下文相关输入检测（更智能的检测）
    const contextPatterns = {
      sequential: [
        /^(从第[一二三四五六七八九十百千0-9]+方面)/,
        /^(第一个|第二个|第三个|第四个|第五个|第六个|第7个|第8个|第9个|第10个)/,
        /^(首先|其次|再次|最后)(点|方面)?/
      ],
      continue: [
        /^(继续|还有|再|next)(讲|说|展开|详细)?/i,
        /^(多说点|多说一些|详细点|详细说)/,
        /^(接着|接下来|然后|下一步)/
      ],
      detail: [
        /^(详细|展开|说说|讲讲)(一下)?/,
        /^(具体|详细说|详细点|具体说)/,
        /^(深一点|深入|深入一点)/
      ],
      question: [
        /^(怎么|如何|为什么|为啥)(会|能|可能)?/,
        /^(是什么|怎么样|如何做)/
      ]
    };

    const isGreeting = greetingPatterns.some(pattern => pattern.test(originalQuestion.trim()));

    // 检测是否是上下文相关输入
    let contextType: string | null = null;
    for (const [type, patterns] of Object.entries(contextPatterns)) {
      if (patterns.some(pattern => pattern.test(originalQuestion.trim()))) {
        contextType = type;
        break;
      }
    }

    if (isGreeting) {
      return `您好！很高兴参与协作。从${collaboratingAgent.name}的角度，如果您有任何关于${collaboratingAgent.description.substring(0, 20)}...的问题，随时可以问我。`;
    }

    if (contextType) {
      const domain = getAgentDomain(collaboratingAgent.id);
      const domainKeywords = domain?.keywords.slice(0, 3).join('、') || '专业领域';

      switch (contextType) {
        case 'sequential':
          return `好的，从${collaboratingAgent.name}的专业角度补充：\n\n关于您提到的顺序问题，从${domainKeywords}方面来看，我们需要关注：\n\n• 核心要素：确保符合相关法规要求\n• 关键节点：在实际操作中的具体流程\n• 风险控制：需要注意的潜在风险点\n\n建议您结合项目的实际情况进行分析。`;

        case 'continue':
          return `好的，让我继续补充：\n\n从${collaboratingAgent.name}的专业视角，还有以下几点需要强调：\n\n• 补充要点：这是在实践中经常遇到的情况\n• 风险提示：需要特别关注的合规要求\n• 实操建议：建议采取的具体措施\n\n如果您需要更多细节，请随时告诉我。`;

        case 'detail':
          return `好的，让我详细说明：\n\n从${collaboratingAgent.name}的专业领域来说：\n\n• 要点1：这是该领域的核心要求\n• 要点2：在实际操作中需要注意的细节\n• 要点3：建议采取的最佳实践\n\n如果您对某个具体方面有疑问，请随时提出。`;

        case 'question':
          return `关于您的问题，从${collaboratingAgent.name}的角度解答：\n\n这个问题涉及${domainKeywords}的内容，主要包括：\n\n• 基本要求：相关的法规和标准\n• 实际应用：在项目中的具体体现\n• 注意事项：需要重点关注的风险点\n\n建议您可以提供更多项目信息，这样我可以给出更精准的建议。`;

        default:
          return '好的，从我的专业角度补充说明：\n\n这个问题需要综合考虑多个因素，建议您可以提供更多具体的项目信息，这样我可以给出更精准的分析建议。';
      }
    }

    const domain = getAgentDomain(collaboratingAgent.id);
    const keyword = domain?.keywords[0] || '专业领域';

    return `感谢邀请！从${keyword}的角度，我补充以下专业见解：\n\n针对您的问题，我们需要考虑以下几个关键点：\n\n• ${domain?.keywords[1] || '相关要点'}：这是该领域的重要考量因素\n• ${domain?.keywords[2] || '相关要点'}：需要特别关注的风险点\n• ${domain?.keywords[3] || '相关要点'}：建议采取的应对策略\n\n如果您需要更详细的分析，请随时告诉我。`;
  };

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

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center">
          <Link href="/agents">
            <Button variant="ghost" size="sm" className="mr-4">
              <ArrowRight className="mr-2 h-4 w-4 rotate-180" />
              返回
            </Button>
          </Link>
          <h1 className="text-3xl font-bold flex items-center">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center text-2xl mr-3"
              style={{ backgroundColor: agent.color + '20', border: '2px solid ' + agent.color }}
            >
              {agent.icon}
            </div>
            {agent.name}
          </h1>
          {collaborationMode && (
            <Badge className="ml-4 bg-gradient-to-r from-[#667eea] to-[#764ba2]">
              <Sparkles className="w-3 h-3 mr-1" />
              协作模式
            </Badge>
          )}
        </div>
        {participatingAgents.length > 0 && (
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">参与Agent：</span>
            <div className="flex gap-2">
              {[agent.id, ...participatingAgents].map((id: string) => {
                const a = getAgentById(id);
                return (
                  <Badge
                    key={id}
                    variant="outline"
                    className="flex items-center gap-1"
                    style={{ borderColor: a?.color, color: a?.color }}
                  >
                    {a?.icon}
                    {a?.name}
                    {id !== agent.id && (
                      <X
                        className="w-3 h-3 cursor-pointer hover:text-red-500"
                        onClick={() => removeAgent(id)}
                      />
                    )}
                  </Badge>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <div className="max-w-4xl mx-auto">
        <Card className="h-[70vh] flex flex-col">
          <CardHeader className="border-b">
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center">
                <Bot className="w-5 h-5 mr-2 text-[#667eea]" />
                对话
              </span>
              {collaborationMode && (
                <Badge variant="outline" className="flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  多Agent协作中
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-hidden p-0">
            <div className="h-full flex flex-col">
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => (
                  <MessageItem
                    key={message.id}
                    message={message}
                    currentAgent={agent}
                    getAgentById={getAgentById}
                  />
                ))}
                {loading && (
                  <div className="flex gap-3 justify-start">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#667eea] to-[#764ba2] flex items-center justify-center">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                    <div className="bg-gray-100 dark:bg-gray-800 rounded-lg px-4 py-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* 协作建议卡片 */}
              {showCollaborationSuggestion && collaborationSuggestion && (
                <div className="border-t p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#667eea] to-[#764ba2] flex items-center justify-center flex-shrink-0">
                      <Sparkles className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold mb-1">建议启动协作模式</div>
                      <p className="text-sm text-muted-foreground mb-3">
                        {collaborationSuggestion.reason}
                      </p>
                      <div className="flex gap-2 mb-3">
                        {collaborationSuggestion.suggestedAgents.map(id => {
                          const a = getAgentById(id);
                          return (
                            <Badge
                              key={id}
                              variant="outline"
                              className="flex items-center gap-1"
                              style={{ borderColor: a?.color, color: a?.color }}
                            >
                              {a?.icon} {a?.name}
                            </Badge>
                          );
                        })}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={startCollaboration}
                          className="bg-gradient-to-r from-[#667eea] to-[#764ba2]"
                        >
                          <Users className="w-4 h-4 mr-1" />
                          启动协作
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setShowCollaborationSuggestion(false)}
                        >
                          继续单人对话
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 输入区域 */}
              <div className="border-t p-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="输入您的问题..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                    disabled={loading}
                  />
                  <Button onClick={handleSend} disabled={loading || !input.trim()}>
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

/**
 * 消息项组件
 */
function MessageItem({
  message,
  currentAgent,
  getAgentById
}: {
  message: ChatMessage;
  currentAgent: Agent;
  getAgentById: (id: string) => Agent | undefined;
}) {
  const isUser = message.role === 'user';
  const isSystem = message.role === 'system';
  const messageAgent = message.agentId ? getAgentById(message.agentId) : currentAgent;

  if (isSystem) {
    return (
      <div className="flex justify-center">
        <div className="bg-gray-100 dark:bg-gray-800 rounded-full px-4 py-2 text-sm text-muted-foreground">
          {message.content}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'} ${message.type === 'invitation' ? 'bg-yellow-50 dark:bg-yellow-950/20 p-2 rounded-lg' : ''}`}
    >
      {!isUser && messageAgent && (
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-sm"
          style={{
            background: message.type === 'invitation'
              ? 'linear-gradient(135deg, #fbbf24, #f59e0b)'
              : `linear-gradient(135deg, ${messageAgent.color}20, ${messageAgent.color}40)`,
            border: `2px solid ${messageAgent.color}`,
            color: messageAgent.color
          }}
        >
          {messageAgent.icon}
        </div>
      )}
      <div
        className={`max-w-[70%] rounded-lg px-4 py-2 ${
          isUser
            ? 'bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white'
            : message.type === 'invitation'
            ? 'bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-300 dark:border-yellow-700'
            : 'bg-gray-100 dark:bg-gray-800'
        }`}
      >
        {!isUser && message.type !== 'invitation' && messageAgent && (
          <div className="text-xs font-semibold mb-1" style={{ color: messageAgent.color }}>
            {messageAgent.name}
          </div>
        )}
        <div className="whitespace-pre-wrap">{message.content}</div>
        {message.mentionedAgents && message.mentionedAgents.length > 0 && (
          <div className="mt-2 pt-2 border-t border-current/20 flex gap-1 flex-wrap">
            {message.mentionedAgents.map(id => {
              const a = getAgentById(id);
              return (
                <Badge key={id} variant="outline" className="text-xs">
                  {a?.icon} {a?.name}
                </Badge>
              );
            })}
          </div>
        )}
      </div>
      {isUser && (
        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#667eea] to-[#764ba2] flex items-center justify-center flex-shrink-0">
          <User className="w-4 h-4 text-white" />
        </div>
      )}
    </div>
  );
}

export const metadata = {
  title: 'AI对话 - REITs 智能助手',
  description: '与AI Agent进行对话',
};
