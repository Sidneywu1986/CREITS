import { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@/lib/supabase/server'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: '方法不允许' })
  }

  try {
    const { token } = req.body

    if (!token) {
      return res.status(400).json({ error: '需要提供验证码' })
    }

    // 获取用户信息
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return res.status(401).json({ error: '未授权' })
    }

    // 获取用户的2FA密钥
    const { data: userData } = await supabase
      .from('users')
      .select('two_factor_secret, two_factor_enabled')
      .eq('id', user.id)
      .single()

    if (!userData || !userData.two_factor_enabled || !userData.two_factor_secret) {
      return res.status(400).json({ error: '2FA未启用' })
    }

    // 验证OTP
    const { TwoFactorService } = await import('@/lib/security/two-factor')
    const twoFactorService = new TwoFactorService()

    if (!twoFactorService.verifyToken(userData.two_factor_secret, token)) {
      return res.status(400).json({
        success: false,
        error: '验证码无效'
      })
    }

    res.status(200).json({
      success: true,
      message: '验证成功'
    })
  } catch (error) {
    console.error('验证2FA失败:', error)
    res.status(500).json({
      success: false,
      error: '验证2FA失败'
    })
  }
}
