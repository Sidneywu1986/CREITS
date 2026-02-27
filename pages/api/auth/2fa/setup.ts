import { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@/lib/supabase/server'
import { TwoFactorService } from '@/lib/security/two-factor'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: '方法不允许' })
  }

  try {
    // 获取用户信息
    const supabase = createClient()
    if (!supabase) {
      return res.status(500).json({ error: '数据库连接失败' })
    }

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return res.status(401).json({ error: '未授权' })
    }

    // 获取用户名
    const { data: userData } = await supabase
      .from('users')
      .select('username')
      .eq('id', user.id)
      .single()

    if (!userData) {
      return res.status(404).json({ error: '用户不存在' })
    }

    // 生成2FA配置
    const twoFactorService = new TwoFactorService()
    const setup = await twoFactorService.setupTwoFactor(userData.username)

    res.status(200).json({
      success: true,
      secret: setup.secret,
      qrCode: setup.qrCode,
      backupCodes: setup.backupCodes
    })
  } catch (error) {
    console.error('生成2FA配置失败:', error)
    res.status(500).json({
      success: false,
      error: '生成2FA配置失败'
    })
  }
}
