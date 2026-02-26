#!/usr/bin/env ts-node

/**
 * 保密合规自查工具
 * 自动检查代码中的潜在安全问题
 */

import { execSync } from 'child_process'
import { readFileSync, readdirSync, statSync } from 'fs'
import { join, extname } from 'path'

interface Issue {
  file: string
  line: number
  type: 'error' | 'warning' | 'info'
  message: string
  severity: 'high' | 'medium' | 'low'
}

class ComplianceChecker {
  private issues: Issue[] = []
  private projectRoot: string

  constructor(root: string = process.cwd()) {
    this.projectRoot = root
  }

  /**
   * 运行所有检查
   */
  async run(): Promise<void> {
    console.log('🔍 开始保密合规自查...\n')

    await this.checkHardcodedSecrets()
    await this.checkEnvironmentVariables()
    await this.checkEncryptionUsage()
    await this.checkSensitiveDataExposure()
    await this.checkAuthentication()
    await this.checkAuditLogging()
    await this.checkAPIKeys()

    // 输出报告
    this.printReport()
  }

  /**
   * 检查硬编码的密钥
   */
  private async checkHardcodedSecrets(): Promise<void> {
    console.log('检查 1: 硬编码密钥检测...')

    const patterns = [
      { regex: /password\s*=\s*['"][^'"]+['"]/gi, type: 'password' },
      { regex: /api[_-]?key\s*=\s*['"][^'"]+['"]/gi, type: 'api_key' },
      { regex: /secret[_-]?key\s*=\s*['"][^'"]+['"]/gi, type: 'secret_key' },
      { regex: /token\s*=\s*['"][^'"]+['"]/gi, type: 'token' },
      { regex: /['"]sk-[a-zA-Z0-9]{32,}['"]/g, type: 'openai_key' }
    ]

    this.scanFiles((file, content) => {
      for (const { regex, type } of patterns) {
        const matches = content.match(regex)
        if (matches) {
          const lines = content.split('\n')
          lines.forEach((line, index) => {
            if (line.match(regex)) {
              this.issues.push({
                file,
                line: index + 1,
                type: 'error',
                message: `发现${type}硬编码`,
                severity: 'high'
              })
            }
          })
        }
      }
    })

    console.log('✓ 硬编码密钥检测完成\n')
  }

  /**
   * 检查环境变量配置
   */
  private async checkEnvironmentVariables(): Promise<void> {
    console.log('检查 2: 环境变量配置...')

    const envFile = join(this.projectRoot, '.env.local')
    try {
      const content = readFileSync(envFile, 'utf-8')

      const requiredVars = [
        'DATABASE_URL',
        'NEXTAUTH_SECRET',
        'INTERNAL_API_KEY'
      ]

      for (const varName of requiredVars) {
        if (!content.includes(varName)) {
          this.issues.push({
            file: '.env.local',
            line: 0,
            type: 'warning',
            message: `缺少必需环境变量: ${varName}`,
            severity: 'medium'
          })
        }
      }

      // 检查是否有默认值
      if (content.includes('NEXTAUTH_SECRET="default"')) {
        this.issues.push({
          file: '.env.local',
          line: 0,
          type: 'error',
          message: 'NEXTAUTH_SECRET使用默认值',
          severity: 'high'
        })
      }
    } catch {
      console.log('  ! 未找到.env.local文件')
    }

    console.log('✓ 环境变量配置检查完成\n')
  }

  /**
   * 检查加密使用
   */
  private async checkEncryptionUsage(): Promise<void> {
    console.log('检查 3: 加密使用检查...')

    this.scanFiles((file, content) => {
      // 检查是否使用了crypto-js
      if (content.includes('import AES from crypto-js/aes')) {
        // 检查是否使用了硬编码的密钥
        if (content.match(/CryptoJS\.AES\.encrypt\([^,]+,\s*['"][^'"]+['"]\)/)) {
          this.issues.push({
            file,
            line: 0,
            type: 'error',
            message: 'AES加密使用硬编码密钥',
            severity: 'high'
          })
        }
      }
    })

    console.log('✓ 加密使用检查完成\n')
  }

  /**
   * 检查敏感数据暴露
   */
  private async checkSensitiveDataExposure(): Promise<void> {
    console.log('检查 4: 敏感数据暴露检查...')

    this.scanFiles((file, content) => {
      // 检查console.log中的敏感信息
      const sensitivePatterns = [
        /console\.log\([^)]*password[^)]*\)/gi,
        /console\.log\([^)]*token[^)]*\)/gi,
        /console\.log\([^)]*secret[^)]*\)/gi
      ]

      sensitivePatterns.forEach(pattern => {
        if (content.match(pattern)) {
          this.issues.push({
            file,
            line: 0,
            type: 'warning',
            message: 'console.log可能包含敏感信息',
            severity: 'medium'
          })
        }
      })

      // 检查是否直接返回敏感数据
      if (content.match(/res\.json\(\s*\{\s*[^}]*password[^}]*\}\s*\)/)) {
        this.issues.push({
          file,
          line: 0,
          type: 'error',
          message: '直接在响应中返回password',
          severity: 'high'
        })
      }
    })

    console.log('✓ 敏感数据暴露检查完成\n')
  }

  /**
   * 检查认证
   */
  private async checkAuthentication(): Promise<void> {
    console.log('检查 5: 认证机制检查...')

    const apiRoutes = join(this.projectRoot, 'pages', 'api')
    try {
      const files = this.getFiles(apiRoutes)
      let authenticatedCount = 0

      files.forEach(file => {
        if (file.endsWith('.ts')) {
          const content = readFileSync(file, 'utf-8')
          if (content.includes('getUser') || content.includes('auth')) {
            authenticatedCount++
          } else {
            this.issues.push({
              file,
              line: 0,
              type: 'warning',
              message: 'API路由缺少认证',
              severity: 'medium'
            })
          }
        }
      })

      console.log(`  - 认证保护的API: ${authenticatedCount}/${files.length}`)
    } catch {
      console.log('  ! 未找到API路由')
    }

    console.log('✓ 认证机制检查完成\n')
  }

  /**
   * 检查审计日志
   */
  private async checkAuditLogging(): Promise<void> {
    console.log('检查 6: 审计日志检查...')

    this.scanFiles((file, content) => {
      // 检查关键操作是否有审计日志
      const criticalOperations = [
        'update', 'delete', 'create'
      ]

      if (file.includes('api')) {
        criticalOperations.forEach(op => {
          if (content.includes(`if (req.method === '${op.toUpperCase()}')`)) {
            if (!content.includes('AuditLogService')) {
              this.issues.push({
                file,
                line: 0,
                type: 'warning',
                message: `${op.toUpperCase()}操作缺少审计日志`,
                severity: 'medium'
              })
            }
          }
        })
      }
    })

    console.log('✓ 审计日志检查完成\n')
  }

  /**
   * 检查API密钥管理
   */
  private async checkAPIKeys(): Promise<void> {
    console.log('检查 7: API密钥管理检查...')

    const envFile = join(this.projectRoot, '.env.local')
    try {
      const content = readFileSync(envFile, 'utf-8')

      // 检查内部API密钥强度
      const apiKeyMatch = content.match(/INTERNAL_API_KEY=(.+)/)
      if (apiKeyMatch) {
        const key = apiKeyMatch[1].trim()
        if (key.length < 32) {
          this.issues.push({
            file: '.env.local',
            line: 0,
            type: 'error',
            message: 'INTERNAL_API_KEY强度不足(建议>32字符)',
            severity: 'high'
          })
        }
      }
    } catch {
      console.log('  ! 未找到.env.local文件')
    }

    console.log('✓ API密钥管理检查完成\n')
  }

  /**
   * 扫描文件
   */
  private scanFiles(callback: (file: string, content: string) => void): void {
    const dirs = ['pages', 'lib', 'components']

    dirs.forEach(dir => {
      const dirPath = join(this.projectRoot, dir)
      try {
        const files = this.getFiles(dirPath)
        files.forEach(file => {
          if (file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.js')) {
            const content = readFileSync(file, 'utf-8')
            callback(file, content)
          }
        })
      } catch {}
    })
  }

  /**
   * 递归获取文件
   */
  private getFiles(dir: string): string[] {
    const files: string[] = []

    try {
      const entries = readdirSync(dir, { withFileTypes: true })
      entries.forEach(entry => {
        const fullPath = join(dir, entry.name)
        if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
          files.push(...this.getFiles(fullPath))
        } else if (entry.isFile() && (extname(entry.name) === '.ts' || extname(entry.name) === '.tsx' || extname(entry.name) === '.js')) {
          files.push(fullPath)
        }
      })
    } catch {}

    return files
  }

  /**
   * 打印报告
   */
  private printReport(): void {
    console.log('\n' + '='.repeat(60))
    console.log('📊 自查报告')
    console.log('='.repeat(60) + '\n')

    const errors = this.issues.filter(i => i.type === 'error')
    const warnings = this.issues.filter(i => i.type === 'warning')
    const infos = this.issues.filter(i => i.type === 'info')

    console.log(`错误: ${errors.length} ⚠️`)
    console.log(`警告: ${warnings.length} ⚡`)
    console.log(`信息: ${infos.length} ℹ️`)
    console.log()

    if (this.issues.length > 0) {
      console.log('问题列表:\n')

      this.issues.forEach((issue, index) => {
        const icon = issue.type === 'error' ? '❌' : issue.type === 'warning' ? '⚠️' : 'ℹ️'
        console.log(`${icon} [${index + 1}] ${issue.message}`)
        console.log(`   文件: ${issue.file}`)
        if (issue.line > 0) console.log(`   行号: ${issue.line}`)
        console.log(`   严重程度: ${issue.severity}`)
        console.log()
      })
    }

    console.log('='.repeat(60))
    console.log('✅ 自查完成')
    console.log('='.repeat(60))

    if (errors.length > 0) {
      process.exit(1)
    }
  }
}

// 运行检查
const checker = new ComplianceChecker()
checker.run().catch(console.error)
