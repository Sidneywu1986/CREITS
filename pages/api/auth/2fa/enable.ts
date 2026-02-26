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
    const { secret, token, backupCodes } = req.body

    if (!secret || (!token && !backupCodes)) {
      return res.status(400).json({ error: '参数不完整' })
    }

    // 获取用户信息
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return res.status(401).json({ error: '未授权' })
    }

    const twoFactorService = new TwoFactorService()

    // 验证OTP或备份码
    let isValid = false
    if (token) {
      isValid = twoFactorService.verifyToken(secret, token)
    }

    // 启用2FA
    if (isValid) {
      await supabase
        .from('users')
        .update({
          two_factor_enabled: true,
          two_factor_secret: secret,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)

      res.status(200).json({
        success: true,
        message: '双因素认证已启用'
      })
    } else {
      res.status(400).json({
        success: false,
        error: '验证码无效'
      })
    }
  } catch (error) {
    console.error('启用2FA失败:', error)
    res.status(500).json({
      success: false,
      error: '启用2FA失败'
    })
  }
}
