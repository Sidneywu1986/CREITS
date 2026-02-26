'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import type {
  ExplainableDecision,
  ScoreDimension,
  DecisionReason,
  HumanFeedback
} from '@/lib/agent/explainable-approval-agent';

/**
 * 审批决策可视化组件
 */
interface ApprovalDecisionVisualizerProps {
  decision: ExplainableDecision;
  onFeedback?: (feedback: HumanFeedback) => void;
}

export function ApprovalDecisionVisualizer({
  decision,
  onFeedback
}: ApprovalDecisionVisualizerProps) {
  const [showFeedbackDialog, setShowFeedbackDialog] = React.useState(false);
  const [feedbackText, setFeedbackText] = React.useState('');
  const [feedbackType, setFeedbackType] = React.useState<'approve' | 'reject' | 'review'>('review');

  const handleFeedback = () => {
    if (onFeedback) {
      onFeedback({
        decisionId: decision.timestamp,
        humanDecision: feedbackType,
        reason: feedbackText,
        corrected: feedbackType !== decision.action,
        timestamp: new Date().toISOString()
      });
    }
    setShowFeedbackDialog(false);
    setFeedbackText('');
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'approve': return 'bg-green-500';
      case 'reject': return 'bg-red-500';
      case 'review': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getActionLabel = (action: string) => {
    switch (action) {
      case 'approve': return '自动通过';
      case 'reject': return '自动拒绝';
      case 'review': return '需人工审核';
      default: return '未知';
    }
  };

  return (
    <div className="space-y-6">
      {/* 决策概览 */}
      <Card className="border-2">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">审批决策结果</CardTitle>
              <CardDescription>
                Agent智能分析 · {new Date(decision.timestamp).toLocaleString('zh-CN')}
              </CardDescription>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-3xl font-bold">{decision.finalScore.toFixed(1)}</div>
                <div className="text-sm text-muted-foreground">综合得分</div>
              </div>
              <div className={`px-6 py-3 ${getActionColor(decision.action)} text-white rounded-lg`}>
                <div className="text-xl font-bold">{getActionLabel(decision.action)}</div>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* 评分维度可视化 */}
      <Card>
        <CardHeader>
          <CardTitle>评分维度详情</CardTitle>
          <CardDescription>各维度得分及权重分布</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {decision.dimensions.map((dimension, index) => (
              <ScoreDimensionCard key={index} dimension={dimension} />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 决策理由 */}
      <Card>
        <CardHeader>
          <CardTitle>决策理由</CardTitle>
          <CardDescription>Agent的判断依据和证据</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {decision.reasons.map((reason, index) => (
              <ReasonCard key={index} reason={reason} />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 建议 */}
      {decision.suggestions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>处理建议</CardTitle>
            <CardDescription>基于当前评估的操作建议</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {decision.suggestions.map((suggestion, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-blue-600">•</span>
                  <span>{suggestion}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* 置信度 */}
      <Alert>
        <AlertTitle>决策置信度</AlertTitle>
        <AlertDescription>
          <div className="flex items-center gap-4 mt-2">
            <Progress value={decision.confidence * 100} className="flex-1" />
            <span className="font-semibold">{(decision.confidence * 100).toFixed(1)}%</span>
          </div>
        </AlertDescription>
      </Alert>

      {/* 人工反馈按钮 */}
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={() => setShowFeedbackDialog(true)}>
          提供反馈
        </Button>
      </div>

      {/* 反馈对话框 */}
      <Dialog open={showFeedbackDialog} onOpenChange={setShowFeedbackDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>提供人工反馈</DialogTitle>
            <DialogDescription>
              您的反馈将帮助优化Agent的决策能力
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">您的决策</label>
              <div className="flex gap-2">
                <Button
                  variant={feedbackType === 'approve' ? 'default' : 'outline'}
                  onClick={() => setFeedbackType('approve')}
                  className="flex-1"
                >
                  通过
                </Button>
                <Button
                  variant={feedbackType === 'review' ? 'default' : 'outline'}
                  onClick={() => setFeedbackType('review')}
                  className="flex-1"
                >
                  需审核
                </Button>
                <Button
                  variant={feedbackType === 'reject' ? 'default' : 'outline'}
                  onClick={() => setFeedbackType('reject')}
                  className="flex-1"
                >
                  拒绝
                </Button>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">反馈理由</label>
              <Textarea
                placeholder="请说明您的决策理由..."
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                rows={4}
              />
            </div>

            {feedbackType !== decision.action && (
              <Alert>
                <AlertDescription>
                  您的决策与Agent决策不同，这将作为纠正案例用于模型优化
                </AlertDescription>
              </Alert>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowFeedbackDialog(false)}>
              取消
            </Button>
            <Button onClick={handleFeedback} disabled={!feedbackText.trim()}>
              提交反馈
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/**
 * 评分维度卡片
 */
function ScoreDimensionCard({ dimension }: { dimension: ScoreDimension }) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="font-semibold">{dimension.name}</span>
          <Badge variant="secondary">权重 {Math.round(dimension.weight * 100)}%</Badge>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold">{dimension.score.toFixed(1)}</span>
          <span className="text-sm text-muted-foreground">分</span>
        </div>
      </div>

      <Progress value={dimension.score} className="h-2" />

      <div className="grid grid-cols-2 gap-2">
        {dimension.details.map((detail, index) => (
          <div key={index} className="text-sm text-muted-foreground">
            • {detail}
          </div>
        ))}
      </div>

      {dimension.threshold && (
        <div className="text-xs text-muted-foreground">
          达标阈值: {dimension.threshold}分
          {dimension.score < dimension.threshold && ' (未达标)'}
        </div>
      )}
    </div>
  );
}

/**
 * 理由卡片
 */
function ReasonCard({ reason }: { reason: DecisionReason }) {
  return (
    <div className="border rounded-lg p-4 space-y-2">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold">{reason.category}</h4>
        <Badge variant="outline">
          置信度 {(reason.confidence * 100).toFixed(0)}%
        </Badge>
      </div>

      <p className="text-sm text-muted-foreground">{reason.reasoning}</p>

      {reason.evidence.length > 0 && (
        <div className="space-y-1">
          <div className="text-xs font-medium text-muted-foreground">证据：</div>
          <ul className="text-sm space-y-1">
            {reason.evidence.map((evidence, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-blue-600">—</span>
                <span>{evidence}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
