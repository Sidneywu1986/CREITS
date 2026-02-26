export interface AlertConfig {
  type: 'email' | 'feishu' | 'webhook'
  recipients?: string[]
  webhookUrl?: string
}

export interface SecurityAlert {
  id: string
  type: string
  severity: string
  userId: string
  ipAddress: string
  timestamp: Date
  details: any
  status: string
}

export class SecurityAlerter {
  private config: AlertConfig

  constructor(config: AlertConfig) {
    this.config = config
  }

  // 发送飞书告警
  async sendFeishu(alert: SecurityAlert) {
    const colors: Record<string, string> = {
      critical: 'red',
      high: 'orange',
      medium: 'yellow',
      low: 'blue'
    }

    const typeMap: Record<string, string> = {
      bruteforce: '暴力破解攻击',
      unusual_time: '非常规时间登录',
      multiple_ips: '多IP异常登录',
      permission_escalation: '权限异常'
    }

    const severityMap: Record<string, string> = {
      critical: '严重',
      high: '高',
      medium: '中',
      low: '低'
    }

    const message = {
      msg_type: 'interactive',
      card: {
        config: { wide_screen_mode: true },
        header: {
          title: { tag: 'plain_text', content: `🔔 安全告警: ${typeMap[alert.type] || alert.type}` },
          template: colors[alert.severity] || 'blue'
        },
        elements: [
          {
            tag: 'div',
            text: { tag: 'lark_md', content: `**严重级别**: ${severityMap[alert.severity] || alert.severity}` }
          },
          {
            tag: 'div',
            text: { tag: 'lark_md', content: `**时间**: ${new Date(alert.timestamp).toLocaleString('zh-CN')}` }
          },
          {
            tag: 'div',
            text: { tag: 'lark_md', content: `**IP地址**: ${alert.ipAddress}` }
          },
          {
            tag: 'div',
            text: { tag: 'lark_md', content: `**用户ID**: ${alert.userId || '未知'}` }
          },
          {
            tag: 'div',
            text: { tag: 'lark_md', content: `**详情**:\n\`\`\`json\n${JSON.stringify(alert.details, null, 2)}\n\`\`\`` }
          },
          {
            tag: 'action',
            actions: [
              {
                tag: 'button',
                text: { tag: 'plain_text', content: '查看详情' },
                url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:5000'}/admin/security`,
                type: 'primary'
              }
            ]
          }
        ]
      }
    }

    try {
      const response = await fetch(this.config.webhookUrl!, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(message)
      })

      if (!response.ok) {
        console.error('飞书告警发送失败:', await response.text())
        return false
      }

      return true
    } catch (error) {
      console.error('飞书告警发送异常:', error)
      return false
    }
  }

  // 发送邮件告警
  async sendEmail(alert: SecurityAlert) {
    const typeMap: Record<string, string> = {
      bruteforce: '暴力破解攻击',
      unusual_time: '非常规时间登录',
      multiple_ips: '多IP异常登录',
      permission_escalation: '权限异常'
    }

    try {
      const response = await fetch('/api/notifications/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: this.config.recipients,
          subject: `[安全告警] ${typeMap[alert.type] || alert.type} - ${alert.severity}`,
          html: `
            <h2>安全告警详情</h2>
            <div style="margin: 20px 0;">
              <p><strong>类型:</strong> ${typeMap[alert.type] || alert.type}</p>
              <p><strong>严重级别:</strong> ${alert.severity}</p>
              <p><strong>时间:</strong> ${new Date(alert.timestamp).toLocaleString('zh-CN')}</p>
              <p><strong>IP地址:</strong> ${alert.ipAddress}</p>
              <p><strong>用户ID:</strong> ${alert.userId || '未知'}</p>
            </div>
            <div style="margin: 20px 0;">
              <h3>详情:</h3>
              <pre style="background: #f5f5f5; padding: 15px; border-radius: 5px; overflow: auto;">${JSON.stringify(alert.details, null, 2)}</pre>
            </div>
            <div style="margin-top: 30px;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:5000'}/admin/security" 
                 style="background: #1890ff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
                查看详情
              </a>
            </div>
          `
        })
      })

      if (!response.ok) {
        console.error('邮件告警发送失败:', await response.text())
        return false
      }

      return true
    } catch (error) {
      console.error('邮件告警发送异常:', error)
      return false
    }
  }

  // 发送告警
  async send(alert: SecurityAlert) {
    if (this.config.type === 'feishu' && this.config.webhookUrl) {
      return await this.sendFeishu(alert)
    } else if (this.config.type === 'email' && this.config.recipients) {
      return await this.sendEmail(alert)
    }

    console.warn('未配置告警渠道:', this.config)
    return false
  }
}
