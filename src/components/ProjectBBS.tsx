'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  MessageSquare, 
  ThumbsUp, 
  Reply, 
  Send, 
  User,
  Clock,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  timestamp: Date;
  likes: number;
  isLiked: boolean;
  replies: Comment[];
  projectId: string;
  projectType: 'REITs' | 'ABS';
}

interface ProjectBBSProps {
  projectId: string;
  projectType: 'REITs' | 'ABS';
  projectName: string;
  comments?: Comment[];
  onAddComment?: (projectId: string, content: string) => void;
  onReplyComment?: (commentId: string, content: string) => void;
  onLikeComment?: (commentId: string) => void;
}

export default function ProjectBBS({
  projectId,
  projectType,
  projectName,
  comments: initialComments = [],
  onAddComment,
  onReplyComment,
  onLikeComment,
}: ProjectBBSProps) {
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set());

  // 模拟当前用户
  const currentUser = {
    id: 'user-001',
    name: '当前用户',
    avatar: '',
  };

  // 添加评论
  const handleAddComment = () => {
    if (!newComment.trim()) return;

    const comment: Comment = {
      id: `comment-${Date.now()}`,
      userId: currentUser.id,
      userName: currentUser.name,
      userAvatar: currentUser.avatar,
      content: newComment,
      timestamp: new Date(),
      likes: 0,
      isLiked: false,
      replies: [],
      projectId,
      projectType,
    };

    const updatedComments = [comment, ...comments];
    setComments(updatedComments);
    setNewComment('');
    
    if (onAddComment) {
      onAddComment(projectId, newComment);
    }
  };

  // 回复评论
  const handleReply = (commentId: string) => {
    if (!replyContent.trim()) return;

    const reply: Comment = {
      id: `reply-${Date.now()}`,
      userId: currentUser.id,
      userName: currentUser.name,
      userAvatar: currentUser.avatar,
      content: replyContent,
      timestamp: new Date(),
      likes: 0,
      isLiked: false,
      replies: [],
      projectId,
      projectType,
    };

    const updatedComments = comments.map(comment => {
      if (comment.id === commentId) {
        return {
          ...comment,
          replies: [...comment.replies, reply],
        };
      }
      return comment;
    });

    setComments(updatedComments);
    setReplyContent('');
    setReplyingTo(null);
    
    if (onReplyComment) {
      onReplyComment(commentId, replyContent);
    }
  };

  // 点赞评论
  const handleLike = (commentId: string) => {
    const updatedComments = comments.map(comment => {
      if (comment.id === commentId) {
        return {
          ...comment,
          likes: comment.isLiked ? comment.likes - 1 : comment.likes + 1,
          isLiked: !comment.isLiked,
        };
      }
      // 检查回复
      const updatedReplies = comment.replies.map(reply => {
        if (reply.id === commentId) {
          return {
            ...reply,
            likes: reply.isLiked ? reply.likes - 1 : reply.likes + 1,
            isLiked: !reply.isLiked,
          };
        }
        return reply;
      });
      
      if (updatedReplies !== comment.replies) {
        return { ...comment, replies: updatedReplies };
      }
      
      return comment;
    });

    setComments(updatedComments);
    
    if (onLikeComment) {
      onLikeComment(commentId);
    }
  };

  // 切换展开/收起回复
  const toggleExpand = (commentId: string) => {
    const newExpanded = new Set(expandedComments);
    if (newExpanded.has(commentId)) {
      newExpanded.delete(commentId);
    } else {
      newExpanded.add(commentId);
    }
    setExpandedComments(newExpanded);
  };

  // 格式化时间
  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return '刚刚';
    if (minutes < 60) return `${minutes}分钟前`;
    if (hours < 24) return `${hours}小时前`;
    if (days < 30) return `${days}天前`;
    return new Date(date).toLocaleDateString('zh-CN');
  };

  // 渲染评论项
  const renderComment = (comment: Comment, isReply = false, depth = 0) => {
    const totalReplies = comment.replies.length;
    const isExpanded = expandedComments.has(comment.id);

    return (
      <div 
        key={comment.id} 
        className={`${isReply ? 'ml-8 mt-3' : 'mb-4'}`}
        style={{ marginLeft: isReply ? `${depth * 32}px` : '0' }}
      >
        <div className="flex gap-3">
          <Avatar className="w-8 h-8 flex-shrink-0">
            <AvatarImage src={comment.userAvatar} />
            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xs">
              {comment.userName.charAt(0)}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            {/* 评论头部 */}
            <div className="flex items-center gap-2 mb-1">
              <span className="font-medium text-sm text-gray-900 dark:text-white">
                {comment.userName}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {formatTime(comment.timestamp)}
              </span>
              <Badge variant="outline" className="text-xs h-5">
                {projectType}
              </Badge>
            </div>
            
            {/* 评论内容 */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 mb-2">
              <p className="text-sm text-gray-900 dark:text-white break-words">
                {comment.content}
              </p>
            </div>
            
            {/* 操作按钮 */}
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                className={`h-7 px-2 text-xs ${
                  comment.isLiked ? 'text-red-600' : 'text-gray-600 dark:text-gray-400'
                }`}
                onClick={() => handleLike(comment.id)}
              >
                <ThumbsUp className={`w-3 h-3 mr-1 ${comment.isLiked ? 'fill-current' : ''}`} />
                {comment.likes || '赞'}
              </Button>
              
              {!isReply && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-xs text-gray-600 dark:text-gray-400"
                  onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                >
                  <Reply className="w-3 h-3 mr-1" />
                  回复
                </Button>
              )}
              
              {totalReplies > 0 && !isReply && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-xs text-gray-600 dark:text-gray-400"
                  onClick={() => toggleExpand(comment.id)}
                >
                  {totalReplies} 条回复
                  {isExpanded ? (
                    <ChevronUp className="w-3 h-3 ml-1" />
                  ) : (
                    <ChevronDown className="w-3 h-3 ml-1" />
                  )}
                </Button>
              )}
            </div>
            
            {/* 回复输入框 */}
            {replyingTo === comment.id && (
              <div className="mt-3 space-y-2">
                <Textarea
                  placeholder={`回复 ${comment.userName}...`}
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  rows={2}
                  className="resize-none text-sm"
                />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => handleReply(comment.id)}
                    disabled={!replyContent.trim()}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Send className="w-3 h-3 mr-1" />
                    发送回复
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setReplyingTo(null);
                      setReplyContent('');
                    }}
                  >
                    取消
                  </Button>
                </div>
              </div>
            )}
            
            {/* 回复列表 */}
            {!isReply && isExpanded && (
              <div className="mt-3 space-y-3">
                {comment.replies.map(reply => renderComment(reply, true, depth + 1))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <Card className="mt-4">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <MessageSquare className="w-5 h-5 text-blue-600" />
          <h3 className="font-semibold text-gray-900 dark:text-white">
            项目讨论 ({comments.length})
          </h3>
          <Badge variant="outline" className="ml-auto">
            {projectType}
          </Badge>
        </div>

        {/* 发布评论 */}
        <div className="mb-6 space-y-3">
          <Textarea
            placeholder="分享您对该项目的看法、疑问或建议..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            rows={3}
            className="resize-none text-sm"
          />
          <div className="flex justify-end">
            <Button
              onClick={handleAddComment}
              disabled={!newComment.trim()}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Send className="w-4 h-4 mr-2" />
              发布评论
            </Button>
          </div>
        </div>

        {/* 评论列表 */}
        {comments.length === 0 ? (
          <div className="text-center py-10 text-gray-500 dark:text-gray-400">
            <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">暂无评论，成为第一个发言的人吧！</p>
          </div>
        ) : (
          <ScrollArea className="h-[400px]">
            <div className="space-y-2">
              {comments.map(comment => renderComment(comment))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
