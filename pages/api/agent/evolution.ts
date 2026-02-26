import { NextApiRequest, NextApiResponse } from 'next'
import { AgentEvolutionService } from '@/lib/agent/evolution'
import { createClient } from '@/lib/supabase/server'

/**
 * Agent进化管理API
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // 认证
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return res.status(401).json({ error: '未授权' })
  }

  // 获取用户信息
  const { data: userData } = await supabase
    .from('users')
    .select('username, role')
    .eq('id', user.id)
    .single()

  if (!userData || userData.role !== 'admin') {
    return res.status(403).json({ error: '需要管理员权限' })
  }

  const service = new AgentEvolutionService()

  if (req.method === 'GET') {
    // 获取进化统计
    try {
      const stats = await service.getEvolutionStats()

      res.status(200).json({ stats })
    } catch (error: any) {
      res.status(500).json({ error: error.message })
    }
  } else if (req.method === 'POST') {
    // 优化权重
    try {
      const { action, limit } = req.body

      if (action === 'optimize_weights') {
        // 收集训练案例
        const cases = await service.collectTrainingCases(limit || 100)

        // 优化权重
        const result = await service.optimizeWeights(cases, user.id, userData.username)

        res.status(200).json({
          success: true,
          result
        })
      } else if (action === 'fine_tune') {
        // 收集训练案例
        const cases = await service.collectTrainingCases(limit || 100)

        // 模型微调
        await service.fineTuneModel(cases, user.id, userData.username)

        res.status(200).json({
          success: true,
          message: '模型微调完成'
        })
      } else {
        res.status(400).json({ error: '无效的action参数' })
      }
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message
      })
    }
  } else {
    res.status(405).json({ error: '方法不允许' })
  }
}
