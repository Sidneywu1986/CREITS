import { NextApiRequest, NextApiResponse } from 'next'
import { ApprovalAgent } from '@/lib/agent/approval-agent'
import { createClient } from '@/lib/supabase/server'

/**
 * 智能审批Agent API
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

  if (req.method !== 'POST') {
    return res.status(405).json({ error: '方法不允许' })
  }

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

    // 运行Agent分析
    const agent = new ApprovalAgent()
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
}
