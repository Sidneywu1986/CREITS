import { createClient } from '@/lib/supabase/server'
import { AuditLogService } from '@/lib/supabase/audit-log-v2'
import crypto from 'crypto'

/**
 * 工作流节点类型
 */
export type NodeType = 'start' | 'end' | 'approval' | 'task' | 'condition' | 'parallel' | 'merge'

/**
 * 工作流节点
 */
export interface WorkflowNode {
  id: string
  name: string
  type: NodeType
  position: { x: number; y: number }
  config: {
    assignee?: string
    role?: string
    timeout?: number
    autoApprove?: boolean
    conditions?: Array<{ field: string; operator: string; value: any }>
    tasks?: string[]
  }
  nextNodes: string[]
}

/**
 * 工作流连接
 */
export interface WorkflowEdge {
  id: string
  from: string
  to: string
  label?: string
  condition?: string
}

/**
 * 工作流定义
 */
export interface WorkflowDefinition {
  id: string
  name: string
  version: string
  description: string
  nodes: WorkflowNode[]
  edges: WorkflowEdge[]
  status: 'draft' | 'active' | 'archived'
  createdAt: string
  createdBy: string
  updatedAt: string
  updatedBy: string
}

/**
 * 工作流实例
 */
export interface WorkflowInstance {
  id: string
  workflowId: string
  workflowVersion: string
  status: 'running' | 'completed' | 'failed' | 'cancelled'
  currentNodeId: string
  variables: Record<string, any>
  history: WorkflowStepHistory[]
  startedAt: string
  completedAt?: string
  startedBy: string
}

/**
 * 工作流步骤历史
 */
export interface WorkflowStepHistory {
  nodeId: string
  nodeName: string
  status: 'pending' | 'in_progress' | 'completed' | 'failed'
  startedAt: string
  completedAt?: string
  assignedTo?: string
  result?: any
  error?: string
}

/**
 * 工作流引擎
 */
export class WorkflowEngine {
  private supabase
  private auditService

  constructor() {
    this.supabase = createClient()
    this.auditService = new AuditLogService()
  }

  /**
   * 创建工作流定义
   */
  async createWorkflowDefinition(
    definition: Omit<WorkflowDefinition, 'id' | 'version' | 'createdAt' | 'updatedAt'>,
    userId: string,
    username: string
  ): Promise<WorkflowDefinition> {
    const id = crypto.randomUUID()
    const version = '1.0.0'
    const timestamp = new Date().toISOString()

    const newDefinition: WorkflowDefinition = {
      ...definition,
      id,
      version,
      createdAt: timestamp,
      updatedAt: timestamp
    }

    await this.supabase.from('workflow_definitions').insert({
      id: newDefinition.id,
      name: newDefinition.name,
      version: newDefinition.version,
      description: newDefinition.description,
      nodes: newDefinition.nodes,
      edges: newDefinition.edges,
      status: newDefinition.status,
      created_by: newDefinition.createdBy,
      updated_by: newDefinition.updatedBy,
      created_at: newDefinition.createdAt,
      updated_at: newDefinition.updatedAt
    })

    await this.auditService.log({
      userId,
      username,
      action: 'workflow_created',
      resourceType: 'workflow_definition',
      resourceId: id,
      oldValue: null,
      newValue: { name: definition.name },
      result: 'success'
    })

    return newDefinition
  }

  /**
   * 更新工作流定义
   */
  async updateWorkflowDefinition(
    workflowId: string,
    updates: Partial<WorkflowDefinition>,
    userId: string,
    username: string
  ): Promise<WorkflowDefinition> {
    // 获取当前定义
    const { data: current } = await this.supabase
      .from('workflow_definitions')
      .select('*')
      .eq('id', workflowId)
      .single()

    if (!current) {
      throw new Error('工作流不存在')
    }

    // 生成新版本号
    const versionParts = current.version.split('.').map(Number)
    versionParts[2]++ // 修订版本号
    const newVersion = versionParts.join('.')

    // 创建新版本
    const newDefinition: WorkflowDefinition = {
      ...current,
      ...updates,
      version: newVersion,
      updatedAt: new Date().toISOString(),
      updatedBy: username
    }

    await this.supabase.from('workflow_definitions').insert({
      id: newDefinition.id,
      name: newDefinition.name,
      version: newDefinition.version,
      description: newDefinition.description,
      nodes: newDefinition.nodes,
      edges: newDefinition.edges,
      status: newDefinition.status,
      created_by: newDefinition.createdBy,
      updated_by: newDefinition.updatedBy,
      created_at: newDefinition.createdAt,
      updated_at: newDefinition.updatedAt
    })

    // 归档旧版本
    await this.supabase
      .from('workflow_definitions')
      .update({ status: 'archived' })
      .eq('id', workflowId)
      .eq('version', current.version)

    await this.auditService.log({
      userId,
      username,
      action: 'workflow_updated',
      resourceType: 'workflow_definition',
      resourceId: workflowId,
      oldValue: { version: current.version },
      newValue: { version: newVersion },
      result: 'success'
    })

    return newDefinition
  }

  /**
   * 启动工作流实例
   */
  async startWorkflowInstance(
    workflowId: string,
    variables: Record<string, any>,
    userId: string,
    username: string
  ): Promise<WorkflowInstance> {
    // 获取活动版本
    const { data: definition } = await this.supabase
      .from('workflow_definitions')
      .select('*')
      .eq('id', workflowId)
      .eq('status', 'active')
      .order('version', { ascending: false })
      .limit(1)
      .single()

    if (!definition) {
      throw new Error('未找到活动的工作流定义')
    }

    // 查找开始节点
    const startNode = definition.nodes.find(n => n.type === 'start')
    if (!startNode) {
      throw new Error('工作流缺少开始节点')
    }

    // 创建实例
    const instance: WorkflowInstance = {
      id: crypto.randomUUID(),
      workflowId,
      workflowVersion: definition.version,
      status: 'running',
      currentNodeId: startNode.id,
      variables,
      history: [],
      startedAt: new Date().toISOString(),
      startedBy: username
    }

    await this.supabase.from('workflow_instances').insert({
      id: instance.id,
      workflow_id: instance.workflowId,
      workflow_version: instance.workflowVersion,
      status: instance.status,
      current_node_id: instance.currentNodeId,
      variables: instance.variables,
      history: instance.history,
      started_at: instance.startedAt,
      started_by: instance.startedBy
    })

    await this.auditService.log({
      userId,
      username,
      action: 'workflow_started',
      resourceType: 'workflow_instance',
      resourceId: instance.id,
      oldValue: null,
      newValue: { workflowId, version: definition.version },
      result: 'success'
    })

    // 执行第一步
    await this.executeNextStep(instance.id, definition)

    return instance
  }

  /**
   * 执行下一步
   */
  private async executeNextStep(
    instanceId: string,
    definition: WorkflowDefinition
  ): Promise<void> {
    // 获取实例
    const { data: instance } = await this.supabase
      .from('workflow_instances')
      .select('*')
      .eq('id', instanceId)
      .single()

    if (!instance) {
      throw new Error('工作流实例不存在')
    }

    // 获取当前节点
    const currentNode = definition.nodes.find(n => n.id === instance.currentNodeId)
    if (!currentNode) {
      throw new Error(`节点不存在: ${instance.currentNodeId}`)
    }

    // 添加到历史
    const historyEntry: WorkflowStepHistory = {
      nodeId: currentNode.id,
      nodeName: currentNode.name,
      status: 'in_progress',
      startedAt: new Date().toISOString()
    }
    instance.history.push(historyEntry)

    // 更新实例
    await this.supabase
      .from('workflow_instances')
      .update({
        history: instance.history
      })
      .eq('id', instanceId)

    // 根据节点类型执行
    switch (currentNode.type) {
      case 'start':
        await this.executeStartNode(instanceId, currentNode, definition)
        break
      case 'end':
        await this.executeEndNode(instanceId, currentNode, definition)
        break
      case 'approval':
        await this.executeApprovalNode(instanceId, currentNode, definition)
        break
      case 'task':
        await this.executeTaskNode(instanceId, currentNode, definition)
        break
      case 'condition':
        await this.executeConditionNode(instanceId, currentNode, definition, instance.variables)
        break
      default:
        throw new Error(`不支持的节点类型: ${currentNode.type}`)
    }
  }

  /**
   * 执行开始节点
   */
  private async executeStartNode(
    instanceId: string,
    node: WorkflowNode,
    definition: WorkflowDefinition
  ): Promise<void> {
    // 完成开始节点
    await this.completeNode(instanceId, node.id, definition)
  }

  /**
   * 执行结束节点
   */
  private async executeEndNode(
    instanceId: string,
    node: WorkflowNode,
    definition: WorkflowDefinition
  ): Promise<void> {
    // 完成工作流
    await this.supabase
      .from('workflow_instances')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString()
      })
      .eq('id', instanceId)
  }

  /**
   * 执行审批节点
   */
  private async executeApprovalNode(
    instanceId: string,
    node: WorkflowNode,
    definition: WorkflowDefinition
  ): Promise<void> {
    // 更新实例状态为等待审批
    const { data: instance } = await this.supabase
      .from('workflow_instances')
      .select('*')
      .eq('id', instanceId)
      .single()

    if (!instance) return

    // 通知审批人
    // TODO: 实现通知逻辑（邮件、消息等）

    console.log(`工作流 ${instanceId} 等待审批: ${node.name}, 审批人: ${node.config.assignee}`)
  }

  /**
   * 执行任务节点
   */
  private async executeTaskNode(
    instanceId: string,
    node: WorkflowNode,
    definition: WorkflowDefinition
  ): Promise<void> {
    // 执行任务
    // TODO: 实现具体任务逻辑

    console.log(`执行任务节点: ${node.name}, 任务: ${node.config.tasks?.join(', ')}`)

    // 完成节点
    await this.completeNode(instanceId, node.id, definition)
  }

  /**
   * 执行条件节点
   */
  private async executeConditionNode(
    instanceId: string,
    node: WorkflowNode,
    definition: WorkflowDefinition,
    variables: Record<string, any>
  ): Promise<void> {
    // 评估条件
    // TODO: 实现条件评估逻辑

    // 假设第一个条件满足
    const nextNodeId = node.nextNodes[0]

    await this.moveToNode(instanceId, nextNodeId, definition)
  }

  /**
   * 完成节点
   */
  private async completeNode(
    instanceId: string,
    nodeId: string,
    definition: WorkflowDefinition
  ): Promise<void> {
    // 获取实例
    const { data: instance } = await this.supabase
      .from('workflow_instances')
      .select('*')
      .eq('id', instanceId)
      .single()

    if (!instance) return

    // 更新历史
    const lastHistory = instance.history[instance.history.length - 1]
    if (lastHistory) {
      lastHistory.status = 'completed'
      lastHistory.completedAt = new Date().toISOString()
    }

    // 移动到下一个节点
    const node = definition.nodes.find(n => n.id === nodeId)
    if (node && node.nextNodes.length > 0) {
      await this.moveToNode(instanceId, node.nextNodes[0], definition)
    }
  }

  /**
   * 移动到下一个节点
   */
  private async moveToNode(
    instanceId: string,
    nodeId: string,
    definition: WorkflowDefinition
  ): Promise<void> {
    await this.supabase
      .from('workflow_instances')
      .update({
        current_node_id: nodeId,
        history: (await this.supabase
          .from('workflow_instances')
          .select('history')
          .eq('id', instanceId)
          .single()
        ).data?.history
      })
      .eq('id', instanceId)

    // 执行下一个节点
    await this.executeNextStep(instanceId, definition)
  }

  /**
   * 获取工作流定义列表
   */
  async getWorkflowDefinitions(): Promise<WorkflowDefinition[]> {
    const { data, error } = await this.supabase
      .from('workflow_definitions')
      .select('*')
      .order('updated_at', { ascending: false })

    if (error) {
      throw new Error(`获取工作流列表失败: ${error.message}`)
    }

    return (data || []).map(record => ({
      id: record.id,
      name: record.name,
      version: record.version,
      description: record.description,
      nodes: record.nodes,
      edges: record.edges,
      status: record.status,
      createdAt: record.created_at,
      createdBy: record.created_by,
      updatedAt: record.updated_at,
      updatedBy: record.updated_by
    }))
  }

  /**
   * 获取工作流实例列表
   */
  async getWorkflowInstances(workflowId?: string): Promise<WorkflowInstance[]> {
    let query = this.supabase.from('workflow_instances').select('*')

    if (workflowId) {
      query = query.eq('workflow_id', workflowId)
    }

    query = query.order('started_at', { ascending: false })

    const { data, error } = await query

    if (error) {
      throw new Error(`获取工作流实例失败: ${error.message}`)
    }

    return (data || []).map(record => ({
      id: record.id,
      workflowId: record.workflow_id,
      workflowVersion: record.workflow_version,
      status: record.status,
      currentNodeId: record.current_node_id,
      variables: record.variables,
      history: record.history,
      startedAt: record.started_at,
      completedAt: record.completed_at,
      startedBy: record.started_by
    }))
  }
}
