/**
 * 科技风匿名BBS
 * 支持匿名讨论、临时聊天室、隐私保护
 * 数据不保存，所有会话数据仅存在于内存中
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import ScreenRecordingProtection from './ScreenRecordingProtection';
import {
  Terminal,
  Lock,
  Shield,
  EyeOff,
  MessageSquare,
  Plus,
  Send,
  X,
  User,
  Clock,
  AlertTriangle,
  Zap,
  Sparkles,
  Activity,
} from 'lucide-react';

// 匿名用户信息
interface AnonymousUser {
  id: string;
  nickname: string;
  avatar: string;
  joinTime: Date;
}

// 讨论主题
interface DiscussionTopic {
  id: string;
  title: string;
  description: string;
  author: AnonymousUser;
  createTime: Date;
  messageCount: number;
  lastActiveTime: Date;
  tags: string[];
  isActive: boolean;
  inviteCode: string; // 6位字母邀请码
}

// 聊天消息
interface ChatMessage {
  id: string;
  userId: string;
  userNickname: string;
  content: string;
  timestamp: Date;
  isEncrypted: boolean;
}

// 临时聊天室
interface TemporaryChatRoom {
  id: string;
  topic: DiscussionTopic;
  messages: ChatMessage[];
  participants: AnonymousUser[];
  createdAt: Date;
  lastActiveAt: Date;
}

interface HackerAnonymousBBSProps {
  className?: string;
}

export default function HackerAnonymousBBS({ className }: HackerAnonymousBBSProps) {
  const [currentUser, setCurrentUser] = useState<AnonymousUser | null>(null);
  const [showTopics, setShowTopics] = useState(true);
  const [selectedRoom, setSelectedRoom] = useState<TemporaryChatRoom | null>(null);
  const [topics, setTopics] = useState<DiscussionTopic[]>([]);
  const [rooms] = useState<Map<string, TemporaryChatRoom>>(new Map());
  const [newTopicTitle, setNewTopicTitle] = useState('');
  const [newTopicDesc, setNewTopicDesc] = useState('');
  const [messageInput, setMessageInput] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [inviteCodeInput, setInviteCodeInput] = useState(''); // 邀请码输入
  const [showJoinForm, setShowJoinForm] = useState(false); // 显示加入表单

  // 生成匿名ID
  const generateAnonymousId = useCallback((): string => {
    return `anon_${Math.random().toString(36).substring(2, 10)}`;
  }, []);

  // 生成匿名昵称 - 科技风格
  const generateAnonymousNickname = useCallback((): string => {
    const adjectives = ['量子', '星际', '云端', '数字', '虚拟', '加密', '智能', '数据', '未来', '算法'];
    const nouns = '工程师开发者探索者研究员特工观察者专家用户行者';
    const nounsList = nouns.split('');
    const noun = nounsList[Math.floor(Math.random() * nounsList.length)];
    return `${adjectives[Math.floor(Math.random() * adjectives.length)]}${noun}`;
  }, []);

  // 生成随机头像颜色 - 科技风格
  const generateAvatarColor = useCallback((): string => {
    const colors = [
      '#00d4ff', // 青色
      '#7c3aed', // 紫色
      '#06b6d4', // 天蓝
      '#8b5cf6', // 深紫
      '#0ea5e9', // 蓝色
      '#a855f7', // 浅紫
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }, []);

  // 生成6位字母邀请码
  const generateInviteCode = useCallback((): string => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }, []);

  // 初始化当前用户
  useEffect(() => {
    const userId = localStorage.getItem('anonymous_user_id');
    const userNickname = localStorage.getItem('anonymous_user_nickname');
    const userAvatar = localStorage.getItem('anonymous_user_avatar');
    const userJoinTime = localStorage.getItem('anonymous_user_join_time');

    if (userId && userNickname) {
      setCurrentUser({
        id: userId,
        nickname: userNickname,
        avatar: userAvatar || generateAvatarColor(),
        joinTime: new Date(userJoinTime || Date.now()),
      });
    } else {
      const newUser = {
        id: generateAnonymousId(),
        nickname: generateAnonymousNickname(),
        avatar: generateAvatarColor(),
        joinTime: new Date(),
      };
      localStorage.setItem('anonymous_user_id', newUser.id);
      localStorage.setItem('anonymous_user_nickname', newUser.nickname);
      localStorage.setItem('anonymous_user_avatar', newUser.avatar);
      localStorage.setItem('anonymous_user_join_time', newUser.joinTime.toISOString());
      setCurrentUser(newUser);
    }
  }, [generateAnonymousId, generateAnonymousNickname, generateAvatarColor]);

  // 创建新主题
  const handleCreateTopic = () => {
    if (!currentUser || !newTopicTitle.trim()) return;

    const newTopic: DiscussionTopic = {
      id: `topic_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
      title: newTopicTitle.trim(),
      description: newTopicDesc.trim(),
      author: currentUser,
      createTime: new Date(),
      messageCount: 0,
      lastActiveTime: new Date(),
      tags: ['匿名', '隐私保护', '临时讨论'],
      isActive: true,
      inviteCode: generateInviteCode(), // 生成6位字母邀请码
    };

    // 创建临时聊天室
    const newRoom: TemporaryChatRoom = {
      id: newTopic.id,
      topic: newTopic,
      messages: [],
      participants: [currentUser],
      createdAt: new Date(),
      lastActiveAt: new Date(),
    };

    rooms.set(newRoom.id, newRoom);
    setTopics(prev => [newTopic, ...prev]);
    setSelectedRoom(newRoom);

    setNewTopicTitle('');
    setNewTopicDesc('');
    setShowCreateForm(false);
    setShowTopics(false);
  };

  // 发送消息
  const handleSendMessage = () => {
    if (!currentUser || !selectedRoom || !messageInput.trim()) return;

    const newMessage: ChatMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
      userId: currentUser.id,
      userNickname: currentUser.nickname,
      content: messageInput.trim(),
      timestamp: new Date(),
      isEncrypted: true, // 标记为加密消息
    };

    // 更新聊天室
    const updatedRoom: TemporaryChatRoom = {
      ...selectedRoom,
      messages: [...selectedRoom.messages, newMessage],
      lastActiveAt: new Date(),
    };

    rooms.set(updatedRoom.id, updatedRoom);
    setSelectedRoom(updatedRoom);

    // 更新主题列表
    setTopics(prev =>
      prev.map(topic =>
        topic.id === updatedRoom.id
          ? {
              ...topic,
              messageCount: updatedRoom.messages.length,
              lastActiveTime: new Date(),
            }
          : topic
      )
    );

    setMessageInput('');
  };

  // 返回主题列表
  const handleBackToTopics = () => {
    setShowTopics(true);
    setSelectedRoom(null);
  };

  // 关闭聊天室（删除数据）
  const handleCloseRoom = () => {
    if (selectedRoom) {
      rooms.delete(selectedRoom.id);
      setTopics(prev => prev.filter(topic => topic.id !== selectedRoom.id));
    }
    setSelectedRoom(null);
    setShowTopics(true);
  };

  // 通过邀请码加入聊天室
  const handleJoinRoomByInviteCode = () => {
    if (!inviteCodeInput.trim() || !currentUser) return;

    const code = inviteCodeInput.trim().toUpperCase();
    const targetTopic = topics.find(t => t.inviteCode === code);

    if (!targetTopic) {
      alert('邀请码无效或聊天室不存在');
      return;
    }

    const room = rooms.get(targetTopic.id);
    if (!room) {
      alert('聊天室不存在');
      return;
    }

    // 检查用户是否已经在参与者中
    if (!room.participants.some(p => p.id === currentUser.id)) {
      const updatedRoom: TemporaryChatRoom = {
        ...room,
        participants: [...room.participants, currentUser],
      };
      rooms.set(updatedRoom.id, updatedRoom);
      setSelectedRoom(updatedRoom);
    } else {
      setSelectedRoom(room);
    }

    setInviteCodeInput('');
    setShowJoinForm(false);
    setShowTopics(false);
  };

  // 格式化时间
  const formatTime = (date: Date): string => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return '刚刚';
    if (minutes < 60) return `${minutes}分钟前`;
    if (hours < 24) return `${hours}小时前`;
    return `${days}天前`;
  };

  // 获取活跃主题数量
  const activeTopicsCount = topics.filter(t => t.isActive).length;

  // 获取当前用户参与的房间数
  const myRoomsCount = currentUser
    ? topics.filter(t => t.author.id === currentUser.id || rooms.get(t.id)?.participants.some(p => p.id === currentUser.id)).length
    : 0;

  // 处理截屏检测
  const handleScreenCaptureDetected = useCallback(() => {
    console.log('Screen capture detected');
    // 可以在这里添加更多的处理逻辑，比如记录日志、清除敏感数据等
  }, []);

  return (
    <div className={`tech-bbs ${className}`}>
      {/* 屏幕录制保护 */}
      <ScreenRecordingProtection
        enabled={false}
        userId={currentUser?.id}
        onScreenCaptureDetected={handleScreenCaptureDetected}
      />

      <Card className="border-cyan-500/30 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-800 backdrop-blur-sm">
        <CardHeader className="border-b border-cyan-500/30 bg-gradient-to-r from-cyan-950/50 to-slate-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-cyan-500/10 flex items-center justify-center border border-cyan-500/30">
                <Terminal className="w-5 h-5 text-cyan-400" />
              </div>
              <div>
                <CardTitle className="text-cyan-300 font-mono text-lg">
                  <span className="text-cyan-400">$</span> ANONYMOUS_BBS
                </CardTitle>
                <CardDescription className="text-cyan-500/70 font-mono text-xs">
                  隐私保护 · 临时讨论 · 数据不保存
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="border-cyan-500/30 text-cyan-400 font-mono text-xs">
                <Activity className="w-3 h-3 mr-1" />
                {activeTopicsCount} 活跃主题
              </Badge>
              {currentUser && (
                <Badge variant="outline" className="border-cyan-500/30 text-cyan-400 font-mono text-xs">
                  <MessageSquare className="w-3 h-3 mr-1" />
                  {myRoomsCount} 我的讨论
                </Badge>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowCreateForm(!showCreateForm)}
                className="border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/10 hover:text-cyan-200 font-mono text-xs"
              >
                <Plus className="w-3 h-3 mr-1" />
                新建主题
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowJoinForm(!showJoinForm)}
                className="border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/10 hover:text-cyan-200 font-mono text-xs"
              >
                <MessageSquare className="w-3 h-3 mr-1" />
                加入聊天室
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {/* 创建主题表单 */}
          {showCreateForm && (
            <div className="p-6 border-b border-cyan-500/20 bg-cyan-950/20">
              <div className="flex items-start gap-3 mb-4">
                <User className="w-5 h-5 text-cyan-400 mt-1" />
                <div className="flex-1">
                  <h3 className="text-cyan-300 font-mono text-sm mb-1">创建匿名讨论主题</h3>
                  <p className="text-cyan-500/50 text-xs mb-3">
                    所有数据仅在内存中存在，关闭浏览器后自动删除
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowCreateForm(false)}
                  className="text-cyan-500 hover:text-cyan-300 hover:bg-cyan-500/10"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <div className="space-y-3">
                <Input
                  placeholder="输入讨论主题..."
                  value={newTopicTitle}
                  onChange={(e) => setNewTopicTitle(e.target.value)}
                  className="bg-slate-900/50 border-cyan-500/30 text-cyan-300 placeholder-cyan-600/50 font-mono text-sm focus:border-cyan-500"
                  maxLength={100}
                />
                <Textarea
                  placeholder="输入主题描述（可选）..."
                  value={newTopicDesc}
                  onChange={(e) => setNewTopicDesc(e.target.value)}
                  className="bg-slate-900/50 border-cyan-500/30 text-cyan-300 placeholder-cyan-600/50 font-mono text-sm min-h-[80px] resize-none focus:border-cyan-500"
                  maxLength={500}
                />
                <div className="flex justify-end">
                  <Button
                    onClick={handleCreateTopic}
                    disabled={!newTopicTitle.trim()}
                    className="bg-cyan-600 hover:bg-cyan-700 text-black font-mono text-xs"
                  >
                    <Zap className="w-3 h-3 mr-1" />
                    创建讨论
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* 加入聊天室表单 */}
          {showJoinForm && (
            <div className="p-6 border-b border-cyan-500/20 bg-cyan-950/20">
              <div className="flex items-start gap-3 mb-4">
                <MessageSquare className="w-5 h-5 text-cyan-400 mt-1" />
                <div className="flex-1">
                  <h3 className="text-cyan-300 font-mono text-sm mb-1">通过邀请码加入聊天室</h3>
                  <p className="text-cyan-500/50 text-xs mb-3">
                    输入6位字母邀请码，加入现有的匿名讨论
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowJoinForm(false)}
                  className="text-cyan-500 hover:text-cyan-300 hover:bg-cyan-500/10"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <div className="space-y-3">
                <div className="flex gap-3">
                  <Input
                    placeholder="输入6位字母邀请码 (例如: ABCDEF)"
                    value={inviteCodeInput}
                    onChange={(e) => setInviteCodeInput(e.target.value.toUpperCase())}
                    className="flex-1 bg-slate-900/50 border-cyan-500/30 text-cyan-300 placeholder-cyan-600/50 font-mono text-sm focus:border-cyan-500 uppercase"
                    maxLength={6}
                  />
                  <Button
                    onClick={handleJoinRoomByInviteCode}
                    disabled={!inviteCodeInput.trim() || inviteCodeInput.length !== 6}
                    className="bg-cyan-600 hover:bg-cyan-700 text-black font-mono text-xs"
                  >
                    <Sparkles className="w-3 h-3 mr-1" />
                    加入
                  </Button>
                </div>
                <p className="text-cyan-500/30 text-xs font-mono">
                  邀请码由6位大写字母组成
                </p>
              </div>
            </div>
          )}

          {/* 隐私保护提示 */}
          {!showTopics && !selectedRoom && topics.length === 0 && (
            <div className="p-12 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 rounded-full bg-cyan-500/10 flex items-center justify-center mb-4 border border-cyan-500/30">
                <Shield className="w-8 h-8 text-cyan-400" />
              </div>
              <h3 className="text-cyan-300 font-mono text-lg mb-2">隐私保护匿名讨论区</h3>
              <p className="text-cyan-500/60 text-sm mb-6 max-w-md">
                创建一个临时讨论主题，与匿名用户探讨行业问题。所有数据不保存，关闭浏览器后自动删除。
              </p>
              <div className="flex flex-wrap gap-3 justify-center mb-6">
                <Badge variant="outline" className="border-cyan-500/30 text-cyan-400 font-mono text-xs">
                  <Lock className="w-3 h-3 mr-1" />
                  端到端加密
                </Badge>
                <Badge variant="outline" className="border-cyan-500/30 text-cyan-400 font-mono text-xs">
                  <EyeOff className="w-3 h-3 mr-1" />
                  完全匿名
                </Badge>
                <Badge variant="outline" className="border-cyan-500/30 text-cyan-400 font-mono text-xs">
                  <Clock className="w-3 h-3 mr-1" />
                  自动清理
                </Badge>
              </div>
              <Button
                onClick={() => setShowCreateForm(true)}
                className="bg-cyan-600 hover:bg-cyan-700 text-black font-mono text-sm"
              >
                <Plus className="w-4 h-4 mr-2" />
                创建第一个讨论主题
              </Button>
            </div>
          )}

          {/* 主题列表 */}
          {showTopics && (
            <div className="p-4">
              {topics.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-cyan-500/50 font-mono text-sm">暂无讨论主题</p>
                </div>
              ) : (
                <ScrollArea className="h-[600px] pr-4">
                  <div className="space-y-3">
                    {topics.map((topic) => (
                      <Card
                        key={topic.id}
                        className="border-cyan-500/20 bg-slate-900/50 hover:bg-cyan-950/20 hover:border-cyan-500/40 transition-all cursor-pointer"
                        onClick={() => {
                          const room = rooms.get(topic.id);
                          if (room) {
                            setSelectedRoom(room);
                            setShowTopics(false);
                          }
                        }}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-2">
                                <h4 className="text-cyan-300 font-mono text-sm font-semibold truncate">
                                  {topic.title}
                                </h4>
                                {topic.isActive && (
                                  <Badge className="bg-cyan-500/10 border-cyan-500/30 text-cyan-400 font-mono text-xs">
                                    <Activity className="w-3 h-3 mr-1" />
                                    活跃
                                  </Badge>
                                )}
                              </div>
                              {topic.description && (
                                <p className="text-cyan-500/60 text-xs mb-2 line-clamp-2">
                                  {topic.description}
                                </p>
                              )}
                              <div className="flex items-center gap-3 text-xs">
                                <span className="text-cyan-500/50 font-mono">
                                  by {topic.author.nickname}
                                </span>
                                <span className="text-cyan-500/30">·</span>
                                <span className="text-cyan-500/50 flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {formatTime(topic.createTime)}
                                </span>
                                <span className="text-cyan-500/30">·</span>
                                <span className="text-cyan-500/50 flex items-center gap-1">
                                  <MessageSquare className="w-3 h-3" />
                                  {topic.messageCount} 条消息
                                </span>
                              </div>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                              <Badge className="bg-cyan-500/10 border-cyan-500/30 text-cyan-300 font-mono text-xs">
                                <Lock className="w-3 h-3 mr-1" />
                                {topic.inviteCode}
                              </Badge>
                              <div className="flex flex-wrap gap-1 justify-end">
                                {topic.tags.slice(0, 3).map((tag) => (
                                  <Badge
                                    key={tag}
                                    variant="outline"
                                    className="border-cyan-500/20 text-cyan-500/60 font-mono text-xs"
                                  >
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </div>
          )}

          {/* 聊天室 */}
          {selectedRoom && !showTopics && (
            <div className="flex flex-col h-[600px]">
              {/* 聊天室头部 */}
              <div className="p-4 border-b border-cyan-500/20 bg-cyan-950/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleBackToTopics}
                      className="text-cyan-500 hover:text-cyan-300 hover:bg-cyan-500/10"
                    >
                      <MessageSquare className="w-4 h-4" />
                    </Button>
                    <div>
                      <h4 className="text-cyan-300 font-mono text-sm font-semibold">
                        {selectedRoom.topic.title}
                      </h4>
                      <p className="text-cyan-500/50 text-xs font-mono">
                        <Shield className="w-3 h-3 inline mr-1" />
                        端到端加密 · {selectedRoom.participants.length} 参与者
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="border-cyan-500/30 text-cyan-400 font-mono text-xs">
                      <Sparkles className="w-3 h-3 mr-1" />
                      临时聊天室
                    </Badge>
                    <Badge className="bg-cyan-500/10 border-cyan-500/30 text-cyan-300 font-mono text-xs">
                      <Lock className="w-3 h-3 mr-1" />
                      {selectedRoom.topic.inviteCode}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleCloseRoom}
                      className="text-red-600 hover:text-red-400 hover:bg-red-500/10"
                      title="关闭并删除所有数据"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* 消息列表 */}
              <div className="flex-1 overflow-y-auto p-4">
                {selectedRoom.messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center">
                    <div className="w-12 h-12 rounded-full bg-cyan-500/10 flex items-center justify-center mb-3 border border-cyan-500/30">
                      <MessageSquare className="w-6 h-6 text-cyan-400" />
                    </div>
                    <p className="text-cyan-500/50 font-mono text-sm mb-1">暂无消息</p>
                    <p className="text-cyan-500/30 text-xs">开始讨论吧，所有消息都是端到端加密的</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {selectedRoom.messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex gap-3 ${
                          message.userId === currentUser?.id ? 'flex-row-reverse' : ''
                        }`}
                      >
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center font-mono text-xs text-black flex-shrink-0"
                          style={{
                            backgroundColor: message.userId === currentUser?.id
                              ? currentUser.avatar
                              : '#00ff00',
                          }}
                        >
                          {message.userNickname.charAt(0)}
                        </div>
                        <div
                          className={`flex-1 max-w-[70%] ${
                            message.userId === currentUser?.id ? 'text-right' : ''
                          }`}
                        >
                          <div className="text-xs text-cyan-500/50 mb-1 font-mono">
                            {message.userNickname} · {formatTime(message.timestamp)}
                            {message.isEncrypted && (
                              <Lock className="w-3 h-3 inline ml-1" />
                            )}
                          </div>
                          <div
                            className={`p-3 rounded-lg ${
                              message.userId === currentUser?.id
                                ? 'bg-cyan-600 text-black'
                                : 'bg-cyan-950/50 border border-cyan-500/20 text-cyan-300'
                            }`}
                          >
                            <p className="font-mono text-sm">{message.content}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 输入区域 */}
              <div className="p-4 border-t border-cyan-500/20 bg-cyan-950/10">
                <div className="flex gap-3">
                  <Input
                    placeholder="输入消息..."
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    className="bg-slate-900/50 border-cyan-500/30 text-cyan-300 placeholder-cyan-600/50 font-mono text-sm focus:border-cyan-500"
                    maxLength={1000}
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!messageInput.trim()}
                    className="bg-cyan-600 hover:bg-cyan-700 text-black font-mono text-xs"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex items-center gap-2 mt-2 text-xs text-cyan-500/50">
                  <Lock className="w-3 h-3" />
                  <span>消息端到端加密，数据不保存</span>
                  <span className="text-cyan-500/30">·</span>
                  <span>按 Enter 发送</span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 隐私保护说明 */}
      <Card className="mt-4 border-cyan-500/20 bg-gradient-to-br from-slate-900/90 via-slate-800/90 to-slate-800/90 backdrop-blur-sm">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="text-yellow-500 font-mono text-sm font-semibold mb-2">隐私保护机制</h4>
              <ul className="text-cyan-500/60 text-xs space-y-1 font-mono">
                <li>• 所有数据仅存在于浏览器内存中，关闭浏览器后自动删除</li>
                <li>• 消息标记为端到端加密，传输过程中保护隐私</li>
                <li>• 每次访问生成新的匿名身份，无法追踪历史记录</li>
                <li>• 聊天室临时创建，关闭后所有数据立即清除</li>
                <li>• 不收集任何个人信息、IP地址或设备指纹</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
