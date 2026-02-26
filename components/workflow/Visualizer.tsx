import React, { useState, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

/**
 * 工作流节点
 */
interface WorkflowNode {
  id: string
  name: string
  type: 'start' | 'approval' | 'task' | 'end'
  status: 'pending' | 'in_progress' | 'completed' | 'rejected'
  assignee?: string
  startTime?: string
  endTime?: string
}

/**
 * 工作流连接
 */
interface WorkflowEdge {
  from: string
  to: string
  label?: string
  condition?: string
}

/**
 * 工作流
 */
interface Workflow {
  id: string
  name: string
  nodes: WorkflowNode[]
  edges: WorkflowEdge[]
}

export function WorkflowVisualizer() {
  const [selectedWorkflow, setSelectedWorkflow] = useState<string>('reit-approval')

  // 模拟工作流数据
  const workflows: Record<string, Workflow> = useMemo(() => ({
    'reit-approval': {
      id: 'reit-approval',
      name: 'REITs产品审批流程',
      nodes: [
        { id: 'start', name: '提交申请', type: 'start', status: 'completed', startTime: '2024-01-15T09:00:00' },
        { id: 'dept-review', name: '部门审核', type: 'approval', status: 'completed', assignee: '张三', startTime: '2024-01-15T10:00:00', endTime: '2024-01-15T11:30:00' },
        { id: 'risk-review', name: '风险评估', type: 'task', status: 'completed', assignee: '李四', startTime: '2024-01-15T11:30:00', endTime: '2024-01-15T14:00:00' },
        { id: 'finance-review', name: '财务审核', type: 'approval', status: 'in_progress', assignee: '王五', startTime: '2024-01-15T14:00:00' },
        { id: 'smart-approve', name: '智能审批Agent', type: 'task', status: 'pending' },
        { id: 'final-approve', name: '最终审批', type: 'approval', status: 'pending', assignee: '总经理' },
        { id: 'end', name: '完成', type: 'end', status: 'pending' }
      ],
      edges: [
        { from: 'start', to: 'dept-review', label: '自动流转' },
        { from: 'dept-review', to: 'risk-review', label: '通过', condition: '评估通过' },
        { from: 'risk-review', to: 'finance-review', label: '风险可控' },
        { from: 'finance-review', to: 'smart-approve', label: '通过' },
        { from: 'smart-approve', to: 'final-approve', label: '自动通过', condition: '评分>80' },
        { from: 'smart-approve', to: 'end', label: '自动拒绝', condition: '评分<60' },
        { from: 'final-approve', to: 'end', label: '审批完成' }
      ]
    },
    'data-consistency': {
      id: 'data-consistency',
      name: '数据一致性检查流程',
      nodes: [
        { id: 'start', name: '数据提交', type: 'start', status: 'completed' },
        { id: 'collect', name: '收集八张表', type: 'task', status: 'completed' },
        { id: 'check-occupancy', name: '检查出租率', type: 'task', status: 'completed' },
        { id: 'check-debt', name: '检查债务比率', type: 'task', status: 'completed' },
        { id: 'check-nav', name: '检查NAV', type: 'task', status: 'in_progress' },
        { id: 'report', name: '生成报告', type: 'task', status: 'pending' },
        { id: 'end', name: '完成', type: 'end', status: 'pending' }
      ],
      edges: [
        { from: 'start', to: 'collect' },
        { from: 'collect', to: 'check-occupancy' },
        { from: 'check-occupancy', to: 'check-debt' },
        { from: 'check-debt', to: 'check-nav' },
        { from: 'check-nav', to: 'report' },
        { from: 'report', to: 'end' }
      ]
    }
  }), [])

  const workflow = workflows[selectedWorkflow]

  if (!workflow) return null

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">工作流可视化</h2>
        <p className="text-muted-foreground">实时查看REITs全流程工作流状态</p>
      </div>

      <Tabs value={selectedWorkflow} onValueChange={setSelectedWorkflow}>
        <TabsList>
          {Object.values(workflows).map(w => (
            <TabsTrigger key={w.id} value={w.id}>
              {w.name}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={selectedWorkflow}>
          <Card>
            <CardHeader>
              <CardTitle>{workflow.name}</CardTitle>
              <CardDescription>
                节点总数: {workflow.nodes.length} | 连接数: {workflow.edges.length}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <WorkflowCanvas workflow={workflow} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

/**
 * 工作流画布
 */
function WorkflowCanvas({ workflow }: { workflow: Workflow }) {
  return (
    <div className="relative p-8 bg-slate-50 rounded-lg min-h-[500px]">
      <div className="flex flex-col gap-8 items-center">
        {workflow.nodes.map((node, index) => (
          <React.Fragment key={node.id}>
            {/* 节点 */}
            <WorkflowNodeItem node={node} />

            {/* 连接线 */}
            {index < workflow.nodes.length - 1 && (
              <div className="flex flex-col items-center gap-2">
                <div className="h-8 w-0.5 bg-slate-300" />
                {workflow.edges
                  .filter(e => e.from === node.id)
                  .map((edge, i) => (
                    <div key={i} className="flex flex-col items-center gap-1">
                      {edge.label && (
                        <Badge variant="outline" className="text-xs">
                          {edge.label}
                        </Badge>
                      )}
                      {edge.condition && (
                        <span className="text-xs text-slate-500">{edge.condition}</span>
                      )}
                    </div>
                  ))}
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  )
}

/**
 * 工作流节点项
 */
function WorkflowNodeItem({ node }: { node: WorkflowNode }) {
  const getStatusColor = (status: WorkflowNode['status']) => {
    switch (status) {
      case 'completed': return 'bg-green-500'
      case 'in_progress': return 'bg-blue-500'
      case 'rejected': return 'bg-red-500'
      default: return 'bg-slate-400'
    }
  }

  const getNodeTypeIcon = (type: WorkflowNode['type']) => {
    switch (type) {
      case 'start': return '🚀'
      case 'approval': return '👤'
      case 'task': return '⚙️'
      case 'end': return '🎯'
      default: return '📌'
    }
  }

  return (
    <Card className={`w-80 ${node.status === 'in_progress' ? 'ring-2 ring-blue-500' : ''}`}>
      <CardContent className="pt-6">
        <div className="flex items-start gap-4">
          {/* 状态指示器 */}
          <div className={`w-3 h-3 rounded-full ${getStatusColor(node.status)} mt-1.5`} />

          <div className="flex-1 space-y-2">
            {/* 标题 */}
            <div className="flex items-center gap-2">
              <span className="text-xl">{getNodeTypeIcon(node.type)}</span>
              <h4 className="font-semibold">{node.name}</h4>
              <Badge variant="secondary">{node.type}</Badge>
            </div>

            {/* 处理人 */}
            {node.assignee && (
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <span>👤</span>
                <span>{node.assignee}</span>
              </div>
            )}

            {/* 时间信息 */}
            {(node.startTime || node.endTime) && (
              <div className="text-xs text-slate-500 space-y-1">
                {node.startTime && (
                  <div>开始时间: {new Date(node.startTime).toLocaleString('zh-CN')}</div>
                )}
                {node.endTime && (
                  <div>结束时间: {new Date(node.endTime).toLocaleString('zh-CN')}</div>
                )}
              </div>
            )}

            {/* 状态 */}
            <div className="flex items-center gap-2">
              <Badge
                variant={
                  node.status === 'completed' ? 'default' :
                  node.status === 'in_progress' ? 'secondary' :
                  node.status === 'rejected' ? 'destructive' : 'outline'
                }
              >
                {node.status === 'completed' ? '已完成' :
                 node.status === 'in_progress' ? '进行中' :
                 node.status === 'rejected' ? '已拒绝' : '待处理'}
              </Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
