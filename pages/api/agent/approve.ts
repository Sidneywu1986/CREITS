import { NextApiRequest, NextApiResponse } from 'next'
import { ExplainableApprovalAgent } from '@/lib/agent/explainable-approval-agent'
import { createClient } from '@/lib/supabase/server'

/**
 * 智能审批Agent API（可解释性）
 * 需要内部认证（INTERNAL_API_KEY）
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // 验证内部API密钥
  const internalApiKey = req.headers['x-internal-api-key']

  if (internalApiKey !== process.env.INTERNAL_API_KEY) {
    return res.status(403).json({
      error: '未授权访问'
    })
  }

  if (req.method === 'POST') {
    // 执行审批分析
    try {
      const { context } = req.body

      if (!context) {
        return res.status(400).json({ error: '缺少context参数' })
      }

      // 验证必需字段
      if (!context.table || !context.data || !context.userId) {
        return res.status(400).json({
          error: 'context缺少必需字段'
        })
      }

      // 获取用户信息
      const supabase = createClient()
      if (!supabase) {
        return res.status(500).json({ error: '数据库连接失败' })
      }

      const { data: userData } = await supabase
        .from('users')
        .select('username, role, department')
        .eq('id', context.userId)
        .single()

      if (!userData) {
        return res.status(404).json({ error: '用户不存在' })
      }

      // 构建完整上下文
      const fullContext = {
        ...context,
        role: userData.role,
        department: userData.department,
        timestamp: new Date().toISOString()
      }

      // 运行Agent分析（可解释性）
      const agent = new ExplainableApprovalAgent()
      const decision = await agent.analyze(fullContext)

      res.status(200).json({
        success: true,
        decision
      })
    } catch (error: any) {
      console.error('Agent分析失败:', error)
      res.status(500).json({
        success: false,
        error: error.message || 'Agent分析失败'
      })
    }
  } else if (req.method === 'PATCH') {
    // 接收人工反馈
    try {
      const feedback = req.body

      if (!feedback.decisionId || !feedback.humanDecision) {
        return res.status(400).json({ error: '缺少必需字段' })
      }

      const agent = new ExplainableApprovalAgent()
      await agent.receiveFeedback(feedback)

      res.status(200).json({ success: true })
    } catch (error: any) {
      res.status(500).json({ error: error.message })
    }
  } else {
    res.status(405).json({ error: '方法不允许' })
  }
}
