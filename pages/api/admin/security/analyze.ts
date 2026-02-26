import { NextApiRequest, NextApiResponse } from 'next'
import { SecurityAgent } from '@/lib/security/security-agent'
import { SecurityAlerter } from '@/lib/notification/alerter'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: '方法不允许' })
  }

  try {
    // 运行安全分析
    const agent = new SecurityAgent()
    const result = await agent.runFullAnalysis()

    // 发送高危告警通知
    if (result.alerts.length > 0) {
      const highSeverityAlerts = result.alerts.filter(
        a => a.severity === 'high' || a.severity === 'critical'
      )

      if (highSeverityAlerts.length > 0) {
        const feishuWebhook = process.env.NEXT_PUBLIC_FEISHU_WEBHOOK

        if (feishuWebhook) {
          const alerter = new SecurityAlerter({
            type: 'feishu',
            webhookUrl: feishuWebhook
          })

          // 发送每个高危告警
          for (const alert of highSeverityAlerts) {
            await alerter.send({
              ...alert,
              timestamp: alert.timestamp
            })
          }
        }
      }
    }

    res.status(200).json({
      success: true,
      alerts: result.alerts,
      summary: result.summary
    })
  } catch (error) {
    console.error('安全分析失败:', error)
    res.status(500).json({
      success: false,
      error: '分析失败，请稍后重试'
    })
  }
}
