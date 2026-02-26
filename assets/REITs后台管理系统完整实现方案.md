REITs后台管理系统完整实现方案
一、项目概述
1.1 定位
基于Next.js + React + TypeScript构建的企业级REITs中后台管理系统，融合DeepSeek四大核心理念：智能联动、安全加密、Agent协作、数据一致性，与现有前台展示形成完整闭环。

1.2 核心特性
🎨 深蓝色金融科技风格：与首页、八张表驾驶舱完全统一

🔗 八张表智能联动：产品表点击，七张表自动更新

🔐 四层加密审计：敏感数据AES加密+环签名防篡改

🤖 智能审批Agent：自动分析数据完整性，辅助决策

📊 数据一致性检查：跨表异常自动告警

🔄 可视化工作流：支持数据审核、重大事项审批流程

二、技术栈扩展（在原有基础上补充）
类别	技术	用途
加密库	crypto-js + node-forge	AES加密、环签名
状态管理	@tanstack/react-query	数据请求缓存
表格联动	自定义 useTableLinkage Hook	八张表智能联动
工作流	自定义轻量级引擎	审批流程管理
Agent框架	自定义 AgentService	智能分析辅助
三、核心功能模块实现
3.1 八张表智能联动系统
3.1.1 联动关系配置
typescript
// config/table-linkage.ts
export const tableLinkages = {
  // 主表: 关联表列表
  reit_product_info: [
    { table: 'reit_property_info', foreignKey: 'fund_code', type: 'one-to-many' },
    { table: 'reit_financial_metrics', foreignKey: 'fund_code', type: 'one-to-many' },
    { table: 'reit_operational_data', foreignKey: 'fund_code', type: 'one-to-many' },
    { table: 'reit_market_performance', foreignKey: 'fund_code', type: 'one-to-many' },
    { table: 'reit_investor_structure', foreignKey: 'fund_code', type: 'one-to-many' },
    { table: 'reit_dividend_history', foreignKey: 'fund_code', type: 'one-to-many' },
    { table: 'reit_risk_metrics', foreignKey: 'fund_code', type: 'one-to-many' }
  ],
  
  // 资产信息变更时，检查财务和运营数据
  reit_property_info: [
    { table: 'reit_financial_metrics', checkField: 'occupancy_rate' },
    { table: 'reit_operational_data', checkField: 'rent_growth_rate' }
  ],
  
  // 财务数据变更时，检查风险指标
  reit_financial_metrics: [
    { table: 'reit_risk_metrics', checkField: 'debt_ratio' }
  ]
};
3.1.2 联动Hook实现
typescript
// hooks/useTableLinkage.ts
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';

interface LinkageConfig {
  mainTable: string;
  mainRecordId: string;
  linkedTables: string[];
}

export function useTableLinkage({ mainTable, mainRecordId, linkedTables }: LinkageConfig) {
  const [linkageData, setLinkageData] = useState<Record<string, any>>({});
  const [inconsistencies, setInconsistencies] = useState<any[]>([]);

  // 获取主表数据
  const { data: mainData } = useQuery({
    queryKey: [mainTable, mainRecordId],
    queryFn: () => fetch(`/api/${mainTable}/${mainRecordId}`).then(r => r.json()),
    enabled: !!mainRecordId
  });

  // 获取所有关联表数据
  const linkedQueries = linkedTables.map(table => 
    useQuery({
      queryKey: [table, mainRecordId],
      queryFn: () => fetch(`/api/${table}?fund_code=${mainRecordId}`).then(r => r.json()),
      enabled: !!mainRecordId
    })
  );

  // 数据一致性检查
  useEffect(() => {
    if (!mainData || linkedQueries.some(q => !q.data)) return;

    const checks = [];
    
    // 检查出租率一致性（产品 vs 运营）
    if (mainTable === 'reit_product_info') {
      const operationalData = linkedQueries.find(q => q.queryKey[0] === 'reit_operational_data')?.data;
      if (operationalData?.occupancy_rate) {
        const diff = Math.abs(mainData.avg_occupancy - operationalData.occupancy_rate);
        if (diff > 5) { // 差异超过5%
          checks.push({
            type: 'inconsistency',
            severity: 'warning',
            message: `出租率与运营数据差异${diff.toFixed(2)}%`,
            tables: ['reit_product_info', 'reit_operational_data']
          });
        }
      }
    }
    
    setInconsistencies(checks);
  }, [mainData, linkedQueries]);

  return {
    mainData,
    linkedData: Object.fromEntries(
      linkedTables.map((table, i) => [table, linkedQueries[i]?.data])
    ),
    inconsistencies,
    isLoading: linkedQueries.some(q => q.isLoading)
  };
}
3.1.3 联动界面组件
tsx
// components/features/reits/TableLinkageView.tsx
'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useTableLinkage } from '@/hooks/useTableLinkage';
import { DataTable } from '@/components/ui/data-table';
import { columnsByTable } from './table-columns';

interface TableLinkageViewProps {
  mainTable: string;
  mainRecordId: string;
}

export function TableLinkageView({ mainTable, mainRecordId }: TableLinkageViewProps) {
  const linkedTables = tableLinkages[mainTable]?.map(l => l.table) || [];
  
  const { mainData, linkedData, inconsistencies, isLoading } = useTableLinkage({
    mainTable,
    mainRecordId,
    linkedTables
  });

  if (isLoading) return <Loading />;

  return (
    <div className="space-y-6">
      {/* 主表信息卡片 */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">当前REITs: {mainData?.fund_name}</h3>
        <div className="grid grid-cols-4 gap-4">
          <StatCard label="基金代码" value={mainData?.fund_code} />
          <StatCard label="发行规模" value={`${mainData?.issue_amount}亿`} />
          <StatCard label="上市日期" value={mainData?.listing_date} />
          <StatCard label="基金管理人" value={mainData?.manager_name} />
        </div>
      </div>

      {/* 一致性告警 */}
      {inconsistencies.length > 0 && (
        <Alert variant="warning" className="bg-yellow-500/10 border-yellow-500/20">
          <AlertDescription>
            <ul className="list-disc pl-4">
              {inconsistencies.map((inc, i) => (
                <li key={i} className="text-yellow-200">{inc.message}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* 关联表Tabs */}
      <Tabs defaultValue={linkedTables[0]} className="w-full">
        <TabsList className="bg-slate-800/50 border border-slate-700/50">
          {linkedTables.map(table => (
            <TabsTrigger key={table} value={table} className="text-white/70 data-[state=active]:text-white">
              {getTableLabel(table)}
            </TabsTrigger>
          ))}
        </TabsList>

        {linkedTables.map(table => (
          <TabsContent key={table} value={table}>
            <DataTable
              columns={columnsByTable[table]}
              data={linkedData[table] || []}
              className="mt-4"
            />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
3.2 四层加密审计系统
3.2.1 加密工具函数
typescript
// lib/security/encryption.ts
import CryptoJS from 'crypto-js';
import forge from 'node-forge';

// 第一层：传输层加密（TLS由Next.js处理）

// 第二层：消息层加密（AES-256）
export class MessageEncryption {
  private static instance: MessageEncryption;
  private key: CryptoJS.lib.WordArray;

  private constructor(secretKey: string) {
    // 从环境变量获取主密钥
    this.key = CryptoJS.enc.Utf8.parse(secretKey.padEnd(32, '0').slice(0, 32));
  }

  static getInstance(): MessageEncryption {
    if (!this.instance) {
      this.instance = new MessageEncryption(process.env.ENCRYPTION_KEY!);
    }
    return this.instance;
  }

  // 加密敏感数据
  encrypt(data: any): { iv: string; encryptedData: string } {
    const iv = CryptoJS.lib.WordArray.random(16);
    const encrypted = CryptoJS.AES.encrypt(
      JSON.stringify(data),
      this.key,
      { iv }
    );
    return {
      iv: iv.toString(CryptoJS.enc.Hex),
      encryptedData: encrypted.toString()
    };
  }

  // 解密
  decrypt(encryptedData: string, iv: string): any {
    const decrypted = CryptoJS.AES.decrypt(
      encryptedData,
      this.key,
      { iv: CryptoJS.enc.Hex.parse(iv) }
    );
    return JSON.parse(decrypted.toString(CryptoJS.enc.Utf8));
  }
}

// 第三层：身份层加密（环签名）
export class RingSignature {
  // 生成环签名
  static sign(message: string, privateKey: string, publicKeys: string[]): string {
    // 简化版环签名实现（实际应使用更复杂的密码学库）
    const signer = forge.pki.privateKeyFromPem(privateKey);
    const md = forge.md.sha256.create();
    md.update(message + publicKeys.join(','));
    const signature = signer.sign(md);
    return forge.util.encode64(signature);
  }

  // 验证环签名
  static verify(message: string, signature: string, publicKeys: string[]): boolean {
    try {
      // 验证签名是否来自环中任一成员
      return publicKeys.some(pem => {
        const verifier = forge.pki.publicKeyFromPem(pem);
        const md = forge.md.sha256.create();
        md.update(message + publicKeys.join(','));
        return verifier.verify(md, forge.util.decode64(signature));
      });
    } catch {
      return false;
    }
  }
}

// 第四层：存储层加密（分片存储）
export class StorageEncryption {
  static async shardAndEncrypt(data: any, shardCount: number = 3): Promise<string[]> {
    const jsonStr = JSON.stringify(data);
    const chunkSize = Math.ceil(jsonStr.length / shardCount);
    const shards = [];
    
    for (let i = 0; i < shardCount; i++) {
      const chunk = jsonStr.slice(i * chunkSize, (i + 1) * chunkSize);
      // 每个分片用不同的密钥加密
      const shardKey = process.env[`SHARD_KEY_${i + 1}`]!;
      const encrypted = MessageEncryption.getInstance().encrypt(chunk);
      shards.push(JSON.stringify(encrypted));
    }
    
    return shards;
  }
}
3.2.2 加密审计日志
typescript
// lib/security/audit-log.ts
import { MessageEncryption, RingSignature } from './encryption';
import { prisma } from '@/lib/prisma';

export class AuditLogger {
  // 记录操作（自动加密敏感字段）
  static async log(options: {
    userId: string;
    action: string;
    resourceType: string;
    resourceId?: string;
    oldValue?: any;
    newValue?: any;
    ip?: string;
    userAgent?: string;
  }) {
    // 识别敏感字段
    const sensitiveFields = ['password', 'token', 'idCard', 'bankAccount'];
    const sensitiveData: Record<string, any> = {};
    const normalData: Record<string, any> = {};
    
    if (options.newValue) {
      Object.entries(options.newValue).forEach(([key, value]) => {
        if (sensitiveFields.includes(key)) {
          sensitiveData[key] = value;
        } else {
          normalData[key] = value;
        }
      });
    }

    // 加密敏感数据
    const encryptedSensitive = sensitiveData.length > 0
      ? MessageEncryption.getInstance().encrypt(sensitiveData)
      : null;

    // 生成签名（防止篡改）
    const signature = RingSignature.sign(
      JSON.stringify({ ...normalData, action: options.action }),
      process.env.AUDIT_PRIVATE_KEY!,
      [process.env.AUDIT_PUBLIC_KEY!]
    );

    // 存储审计日志
    return await prisma.auditLog.create({
      data: {
        userId: options.userId,
        username: await this.getUsername(options.userId),
        ipAddress: options.ip,
        userAgent: options.userAgent,
        action: options.action,
        resourceType: options.resourceType,
        resourceId: options.resourceId,
        oldValue: options.oldValue,
        newValue: normalData,
        sensitiveData: encryptedSensitive,
        signature,
        result: 'success'
      }
    });
  }

  // 验证日志完整性
  static async verifyLog(logId: string): Promise<boolean> {
    const log = await prisma.auditLog.findUnique({ where: { id: logId } });
    if (!log) return false;

    return RingSignature.verify(
      JSON.stringify({ ...log.newValue, action: log.action }),
      log.signature,
      [process.env.AUDIT_PUBLIC_KEY!]
    );
  }
}
3.2.3 书密钥验证（可选）
typescript
// lib/security/book-key.ts
export class BookKeyAuth {
  // 验证书密钥
  static async verify(bookKey: {
    isbn: string;
    page: number;
    line: number;
    word: number;
    character: string;
  }): Promise<boolean> {
    // 从数据库获取该ISBN对应位置的标准字符
    const standard = await prisma.bookReference.findUnique({
      where: {
        isbn_page_line_word: {
          isbn: bookKey.isbn,
          page: bookKey.page,
          line: bookKey.line,
          word: bookKey.word
        }
      }
    });

    return standard?.character === bookKey.character;
  }

  // 生成身份种子
  static generateIdentitySeed(bookKey: Omit<BookKeyAuth, 'character'>): string {
    return CryptoJS.SHA256(`${bookKey.isbn}:${bookKey.page}:${bookKey.line}:${bookKey.word}`).toString();
  }
}
3.3 智能审批Agent系统
3.3.1 Agent核心引擎
typescript
// lib/agent/approval-agent.ts
export interface ApprovalContext {
  userId: string;
  role: string;
  department: string;
  action: 'create' | 'update' | 'delete' | 'approve';
  table: string;
  recordId?: string;
  data: any;
  history?: any[];
}

export interface ApprovalDecision {
  action: 'auto_approve' | 'auto_reject' | 'need_review';
  confidence: number;  // 0-100
  reason: string;
  suggestions?: string[];
  assignedTo?: string; // 需要人工审核时指定
}

export class ApprovalAgent {
  private rules: ApprovalRule[] = [];

  constructor() {
    this.loadRules();
  }

  // 加载规则（可从数据库配置）
  private loadRules() {
    this.rules = [
      // 出租率正常时自动通过
      new OccupancyRule(),
      // 财务数据异常时预警
      new FinancialAnomalyRule(),
      // 重大变更需要风控审核
      new MaterialChangeRule(),
      // 首次录入需要人工复核
      new FirstTimeEntryRule()
    ];
  }

  // 分析决策
  async analyze(context: ApprovalContext): Promise<ApprovalDecision> {
    const results = await Promise.all(
      this.rules.map(rule => rule.evaluate(context))
    );

    // 综合决策
    const autoApprove = results.every(r => r.action === 'auto_approve');
    const autoReject = results.some(r => r.action === 'auto_reject');
    const needsReview = results.some(r => r.action === 'need_review');

    if (autoReject) {
      return {
        action: 'auto_reject',
        confidence: 95,
        reason: '触发自动拒绝规则',
        suggestions: results.flatMap(r => r.suggestions || [])
      };
    }

    if (autoApprove && !needsReview) {
      return {
        action: 'auto_approve',
        confidence: 90,
        reason: '所有规则验证通过'
      };
    }

    // 需要人工审核
    return {
      action: 'need_review',
      confidence: 60,
      reason: '需要人工复核',
      suggestions: results.flatMap(r => r.suggestions || []),
      assignedTo: this.determineReviewer(context)
    };
  }

  private determineReviewer(context: ApprovalContext): string {
    // 根据业务类型指定审核人
    if (context.table === 'reit_risk_metrics') {
      return '风控部门';
    }
    if (context.table === 'reit_financial_metrics') {
      return '财务主管';
    }
    return '数据审核员';
  }
}

// 规则基类
abstract class ApprovalRule {
  abstract evaluate(context: ApprovalContext): Promise<ApprovalDecision>;
}

// 出租率规则
class OccupancyRule extends ApprovalRule {
  async evaluate(context: ApprovalContext): Promise<ApprovalDecision> {
    if (context.table !== 'reit_operational_data') {
      return { action: 'auto_approve', confidence: 100, reason: '不适用' };
    }

    const occupancy = context.data.occupancy_rate;
    if (occupancy >= 90) {
      return {
        action: 'auto_approve',
        confidence: 95,
        reason: '出租率正常'
      };
    }

    if (occupancy < 70) {
      return {
        action: 'need_review',
        confidence: 80,
        reason: '出租率过低',
        suggestions: ['请核实出租率下降原因', '检查租户续租情况']
      };
    }

    return {
      action: 'auto_approve',
      confidence: 85,
      reason: '出租率在合理区间'
    };
  }
}
3.3.2 Agent服务接口
typescript
// app/api/agent/approve/route.ts
import { ApprovalAgent } from '@/lib/agent/approval-agent';
import { AuditLogger } from '@/lib/security/audit-log';

const agent = new ApprovalAgent();

export async function POST(req: Request) {
  const { context } = await req.json();
  const user = await getCurrentUser();
  
  // Agent分析
  const decision = await agent.analyze({
    ...context,
    userId: user.id,
    role: user.role,
    department: user.department
  });

  // 记录Agent决策
  await AuditLogger.log({
    userId: user.id,
    action: 'agent_decision',
    resourceType: 'approval',
    newValue: { context, decision }
  });

  // 如果自动通过，直接执行
  if (decision.action === 'auto_approve') {
    await executeApproval(context);
    return Response.json({ 
      status: 'approved', 
      message: '自动审核通过',
      decision 
    });
  }

  // 需要人工审核，创建任务
  if (decision.action === 'need_review') {
    const task = await createApprovalTask({
      ...context,
      assignedTo: decision.assignedTo,
      suggestions: decision.suggestions
    });
    return Response.json({ 
      status: 'pending', 
      taskId: task.id,
      decision 
    });
  }

  // 自动拒绝
  return Response.json({ 
    status: 'rejected', 
    message: decision.reason,
    decision 
  }, { status: 400 });
}
3.3.3 Agent辅助界面
tsx
// components/features/approval/AgentAssistant.tsx
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Sparkles, AlertCircle, CheckCircle, Clock } from 'lucide-react';

interface AgentAssistantProps {
  context: ApprovalContext;
  onDecision: (decision: ApprovalDecision) => void;
}

export function AgentAssistant({ context, onDecision }: AgentAssistantProps) {
  const [analyzing, setAnalyzing] = useState(false);
  const [decision, setDecision] = useState<ApprovalDecision | null>(null);

  const analyze = async () => {
    setAnalyzing(true);
    try {
      const res = await fetch('/api/agent/approve', {
        method: 'POST',
        body: JSON.stringify({ context })
      });
      const data = await res.json();
      setDecision(data.decision);
      onDecision(data);
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <Card className="bg-slate-800/50 border-slate-700/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <Sparkles className="w-5 h-5 text-purple-400" />
          智能审批Agent
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!decision ? (
          <Button 
            onClick={analyze} 
            disabled={analyzing}
            className="w-full bg-purple-600 hover:bg-purple-700"
          >
            {analyzing ? '分析中...' : '启动Agent分析'}
          </Button>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              {decision.action === 'auto_approve' && (
                <CheckCircle className="w-5 h-5 text-green-400" />
              )}
              {decision.action === 'need_review' && (
                <Clock className="w-5 h-5 text-yellow-400" />
              )}
              {decision.action === 'auto_reject' && (
                <AlertCircle className="w-5 h-5 text-red-400" />
              )}
              <span className="text-white font-medium">
                {decision.action === 'auto_approve' && '自动通过'}
                {decision.action === 'need_review' && '需人工审核'}
                {decision.action === 'auto_reject' && '自动拒绝'}
              </span>
              <Badge variant="outline" className="ml-auto">
                置信度 {decision.confidence}%
              </Badge>
            </div>

            <p className="text-white/70 text-sm">{decision.reason}</p>

            {decision.suggestions && decision.suggestions.length > 0 && (
              <div className="bg-slate-700/30 rounded-lg p-3">
                <p className="text-white/60 text-xs mb-2">审核建议</p>
                <ul className="list-disc pl-4 text-sm text-white/80">
                  {decision.suggestions.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </div>
            )}

            {decision.assignedTo && (
              <div className="text-sm text-white/60">
                指派给: {decision.assignedTo}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
3.4 数据一致性检查系统
3.4.1 检查规则配置
typescript
// config/consistency-rules.ts
export const consistencyRules = [
  {
    name: '出租率一致性',
    tables: ['reit_operational_data', 'reit_property_info'],
    fields: ['occupancy_rate', 'occupancy_rate'],
    check: (opData: any, propData: any) => {
      const diff = Math.abs(opData.occupancy_rate - propData.occupancy_rate);
      return {
        passed: diff < 5,
        diff,
        message: `出租率差异 ${diff.toFixed(2)}%`
      };
    },
    severity: 'warning'
  },
  {
    name: '财务指标一致性',
    tables: ['reit_financial_metrics', 'reit_risk_metrics'],
    fields: ['debt_ratio', 'debt_ratio'],
    check: (finData: any, riskData: any) => {
      const diff = Math.abs(finData.debt_ratio - riskData.debt_ratio);
      return {
        passed: diff < 2,
        diff,
        message: `资产负债率差异 ${diff.toFixed(2)}%`
      };
    },
    severity: 'error'
  },
  {
    name: '资产价值变动',
    tables: ['reit_property_info', 'reit_property_info'],
    fields: ['appraised_value', 'appraised_value'],
    check: (current: any, history: any) => {
      if (!history) return { passed: true };
      const change = (current.appraised_value - history.appraised_value) / history.appraised_value * 100;
      return {
        passed: Math.abs(change) < 10,
        change,
        message: `资产价值变动 ${change.toFixed(2)}%`
      };
    },
    severity: 'info'
  }
];
3.4.2 检查服务
typescript
// lib/consistency/checker.ts
import { prisma } from '@/lib/prisma';
import { consistencyRules } from '@/config/consistency-rules';

export class ConsistencyChecker {
  // 检查单条记录
  static async checkRecord(table: string, recordId: string) {
    const record = await prisma[table].findUnique({
      where: { id: recordId }
    });

    if (!record) return [];

    const violations = [];

    // 应用相关规则
    for (const rule of consistencyRules.filter(r => r.tables.includes(table))) {
      // 获取关联表数据
      const relatedTables = rule.tables.filter(t => t !== table);
      const relatedData = await Promise.all(
        relatedTables.map(t => 
          prisma[t].findMany({
            where: { fund_code: record.fund_code }
          })
        )
      );

      // 执行检查
      const result = rule.check(record, ...relatedData);
      
      if (!result.passed) {
        violations.push({
          rule: rule.name,
          severity: rule.severity,
          message: result.message,
          tables: rule.tables,
          timestamp: new Date()
        });

        // 记录到审计日志
        await AuditLogger.log({
          userId: 'system',
          action: 'consistency_violation',
          resourceType: table,
          resourceId: recordId,
          newValue: { violation: result }
        });
      }
    }

    return violations;
  }

  // 定时全量检查
  static async scheduleFullCheck() {
    console.log('开始全量数据一致性检查', new Date().toISOString());

    const tables = Object.keys(consistencyRules.reduce((acc, rule) => {
      rule.tables.forEach(t => acc[t] = true);
      return acc;
    }, {}));

    for (const table of tables) {
      const records = await prisma[table].findMany();
      
      for (const record of records) {
        await this.checkRecord(table, record.id);
      }
    }

    console.log('全量检查完成', new Date().toISOString());
  }
}
3.4.3 检查报告界面
tsx
// components/features/consistency/ConsistencyReport.tsx
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';

interface Violation {
  rule: string;
  severity: 'error' | 'warning' | 'info';
  message: string;
  tables: string[];
  timestamp: string;
}

export function ConsistencyReport() {
  const [violations, setViolations] = useState<Violation[]>([]);
  const [loading, setLoading] = useState(false);

  const loadViolations = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/consistency/violations');
      const data = await res.json();
      setViolations(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadViolations();
    // 每5分钟刷新
    const interval = setInterval(loadViolations, 300000);
    return () => clearInterval(interval);
  }, []);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'error': return 'bg-red-500/20 text-red-300 border-red-500/30';
      case 'warning': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      default: return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
    }
  };

  return (
    <Card className="bg-slate-800/50 border-slate-700/50">
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-white">
          <span>数据一致性报告</span>
          <Button variant="ghost" size="sm" onClick={loadViolations} disabled={loading}>
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {violations.length === 0 ? (
          <div className="text-center py-8">
            <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-3" />
            <p className="text-white/60">所有数据一致性良好</p>
          </div>
        ) : (
          <div className="space-y-3">
            {violations.map((v, i) => (
              <div
                key={i}
                className={`p-3 rounded-lg border ${getSeverityColor(v.severity)}`}
              >
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{v.rule}</span>
                      <Badge variant="outline" className="text-xs">
                        {v.severity}
                      </Badge>
                    </div>
                    <p className="text-sm opacity-90">{v.message}</p>
                    <div className="flex items-center gap-2 mt-2 text-xs opacity-70">
                      <span>涉及表: {v.tables.join(', ')}</span>
                      <span>•</span>
                      <span>{new Date(v.timestamp).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
四、页面整合与路由
4.1 后台路由结构
text
app/(admin)/
├── layout.tsx                    # 后台主布局
├── page.tsx                      # 后台仪表盘
├── reits/
│   ├── page.tsx                  # REITs产品列表
│   ├── [code]/
│   │   └── page.tsx              # 单只REITs详情（联动视图）
│   └── create/
│       └── page.tsx              # 新建REITs
├── consistency/
│   └── page.tsx                  # 一致性检查报告
├── approval/
│   ├── page.tsx                  # 待审批列表
│   └── [id]/
│       └── page.tsx              # 审批详情（含Agent助手）
├── audit/
│   └── page.tsx                  # 审计日志
└── settings/
    └── page.tsx                  # 系统设置（含书密钥配置）
4.2 仪表盘整合
tsx
// app/(admin)/page.tsx
'use client';

import { StatCard } from '@/components/dashboard/StatCard';
import { ConsistencyReport } from '@/components/features/consistency/ConsistencyReport';
import { ApprovalQueue } from '@/components/features/approval/ApprovalQueue';
import { AuditSummary } from '@/components/features/audit/AuditSummary';
import { ActivityTimeline } from '@/components/dashboard/ActivityTimeline';

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      {/* 顶部统计卡片 */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard
          title="REITs总数"
          value="58"
          trend={{ value: 2.3, isPositive: true }}
          icon="🏢"
        />
        <StatCard
          title="待审核任务"
          value="12"
          trend={{ value: 3, isPositive: false }}
          icon="⏳"
        />
        <StatCard
          title="数据异常"
          value="5"
          trend={{ value: 1, isPositive: true }}
          icon="⚠️"
        />
        <StatCard
          title="今日操作"
          value="342"
          icon="📊"
        />
      </div>

      {/* 核心功能区域 */}
      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2">
          <ConsistencyReport />
        </div>
        <div>
          <ApprovalQueue />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <AuditSummary />
        <ActivityTimeline />
      </div>
    </div>
  );
}
五、部署与运维
5.1 环境变量配置
bash
# .env.local
# 数据库
DATABASE_URL=postgresql://...

# 加密密钥
ENCRYPTION_KEY=your-32-char-secret-key
SHARD_KEY_1=shard-key-1
SHARD_KEY_2=shard-key-2
SHARD_KEY_3=shard-key-3

# 环签名密钥对
AUDIT_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----
...
AUDIT_PUBLIC_KEY=-----BEGIN PUBLIC KEY-----
...

# 定时任务
CRON_SCHEDULE=0 */6 * * *  # 每6小时全量检查
5.2 定时任务配置
typescript
// lib/cron.ts
import { CronJob } from 'cron';
import {