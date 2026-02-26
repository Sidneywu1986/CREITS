/**
 * KnowledgeGraph - 知识图谱构建服务
 *
 * 功能：
 * 1. 从八张表抽取REITs节点
 * 2. 从政策库抽取政策节点
 * 3. 从新闻库抽取事件节点
 * 4. 计算节点关联强度
 */

import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

// Supabase客户端
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * 节点类型枚举
 */
export enum NodeType {
  REIT = 'reit',
  POLICY = 'policy',
  EVENT = 'event',
  ASSET = 'asset',
  FUND = 'fund'
}

/**
 * 关系类型枚举
 */
export enum EdgeType {
  AFFECTS = 'affects',              // 影响（政策→REITs）
  RELATED_TO = 'related_to',        // 相关（事件→REITs）
  CONTAINS = 'contains',            // 包含（REITs→资产）
  MANAGED_BY = 'managed_by',        // 由...管理（REITs→基金）
  ISSUED_BY = 'issued_by',          // 由...发行（REITs→交易所）
  MENTIONED_IN = 'mentioned_in'     // 提及（REITs→政策/新闻）
}

/**
 * KnowledgeGraph类
 */
export class KnowledgeGraph {
  private static instance: KnowledgeGraph;

  private constructor() {}

  static getInstance(): KnowledgeGraph {
    if (!KnowledgeGraph.instance) {
      KnowledgeGraph.instance = new KnowledgeGraph();
    }
    return KnowledgeGraph.instance;
  }

  /**
   * 构建知识图谱（完整流程）
   */
  async buildGraph(): Promise<{
    reits: number;
    policies: number;
    events: number;
    assets: number;
    funds: number;
    edges: number;
  }> {
    console.log('开始构建知识图谱...');

    // 1. 提取REITs节点
    const reitsCount = await this.extractREITsNodes();
    console.log(`提取REITs节点: ${reitsCount}`);

    // 2. 提取政策节点
    const policiesCount = await this.extractPolicyNodes();
    console.log(`提取政策节点: ${policiesCount}`);

    // 3. 提取事件节点
    const eventsCount = await this.extractEventNodes();
    console.log(`提取事件节点: ${eventsCount}`);

    // 4. 提取资产节点
    const assetsCount = await this.extractAssetNodes();
    console.log(`提取资产节点: ${assetsCount}`);

    // 5. 提取基金公司节点
    const fundsCount = await this.extractFundNodes();
    console.log(`提取基金公司节点: ${fundsCount}`);

    // 6. 构建节点关系
    const edgesCount = await this.buildEdges();
    console.log(`构建节点关系: ${edgesCount}`);

    // 7. 计算节点重要性评分
    await this.calculateNodeImportance();
    console.log('计算节点重要性评分完成');

    return {
      reits: reitsCount,
      policies: policiesCount,
      events: eventsCount,
      assets: assetsCount,
      funds: fundsCount,
      edges: edgesCount
    };
  }

  /**
   * 提取REITs节点
   */
  async extractREITsNodes(): Promise<number> {
    try {
      // 从collected_reits表获取数据
      const { data: reitsData, error } = await supabase
        .from('collected_reits')
        .select('*')
        .eq('is_valid', true);

      if (error) {
        console.error('获取REITs数据失败:', error);
        return 0;
      }

      let count = 0;

      for (const reit of reitsData || []) {
        // 创建或更新节点
        const nodeId = await this.createOrUpdateNode({
          node_type: NodeType.REIT,
          node_name: reit.reit_name,
          node_code: reit.reit_code,
          properties: {
            exchange: reit.exchange,
            listing_date: reit.listing_date,
            fund_manager: reit.fund_manager,
            asset_type: reit.asset_type
          },
          source_table: 'collected_reits',
          source_id: reit.id
        });

        // 创建或更新REITs节点属性
        await this.createOrUpdateREITsNode(nodeId, reit);

        count++;
      }

      return count;
    } catch (error) {
      console.error('提取REITs节点失败:', error);
      return 0;
    }
  }

  /**
   * 提取政策节点
   */
  async extractPolicyNodes(): Promise<number> {
    try {
      const { data: policiesData, error } = await supabase
        .from('collected_policies')
        .select('*')
        .eq('is_valid', true);

      if (error) {
        console.error('获取政策数据失败:', error);
        return 0;
      }

      let count = 0;

      for (const policy of policiesData || []) {
        // 创建或更新节点
        const nodeId = await this.createOrUpdateNode({
          node_type: NodeType.POLICY,
          node_name: policy.policy_title,
          node_code: policy.policy_number,
          properties: {
            publishing_body: policy.publishing_body,
            policy_type: policy.policy_type,
            publish_date: policy.publish_date,
            impact_level: policy.impact_level
          },
          source_table: 'collected_policies',
          source_id: policy.id
        });

        // 创建或更新政策节点属性
        await this.createOrUpdatePolicyNode(nodeId, policy);

        count++;
      }

      return count;
    } catch (error) {
      console.error('提取政策节点失败:', error);
      return 0;
    }
  }

  /**
   * 提取事件节点
   */
  async extractEventNodes(): Promise<number> {
    try {
      // 从新闻和公告中提取事件
      const events = [];

      // 提取新闻事件
      const { data: newsData } = await supabase
        .from('collected_news')
        .select('*')
        .eq('is_valid', true);

      for (const news of newsData || []) {
        events.push({
          node_type: NodeType.EVENT,
          node_name: news.title,
          node_code: null,
          properties: {
            event_type: 'news',
            event_source: news.source,
            sentiment_score: news.sentiment_score
          },
          source_table: 'collected_news',
          source_id: news.id,
          event_data: {
            event_type: 'news',
            event_title: news.title,
            event_time: news.publish_time,
            event_source: news.source,
            content: news.content,
            summary: news.summary,
            sentiment_score: news.sentiment_score,
            sentiment_label: news.sentiment_label,
            affected_reits: news.related_reits
          }
        });
      }

      // 提取公告事件
      const { data: announcementsData } = await supabase
        .from('collected_announcements')
        .select('*')
        .eq('is_valid', true);

      for (const announcement of announcementsData || []) {
        events.push({
          node_type: NodeType.EVENT,
          node_name: announcement.announcement_title,
          node_code: announcement.announcement_code,
          properties: {
            event_type: 'announcement',
            event_source: announcement.exchange,
            announcement_type: announcement.announcement_type
          },
          source_table: 'collected_announcements',
          source_id: announcement.id,
          event_data: {
            event_type: 'announcement',
            event_title: announcement.announcement_title,
            event_time: announcement.publish_time,
            event_source: announcement.exchange,
            content: announcement.content,
            summary: announcement.summary,
            affected_reits: [announcement.reit_code]
          }
        });
      }

      let count = 0;

      for (const event of events) {
        // 创建或更新节点
        const nodeId = await this.createOrUpdateNode({
          node_type: event.node_type,
          node_name: event.node_name,
          node_code: event.node_code,
          properties: event.properties,
          source_table: event.source_table,
          source_id: event.source_id
        });

        // 创建或更新事件节点属性
        await this.createOrUpdateEventNode(nodeId, event.event_data);

        count++;
      }

      return count;
    } catch (error) {
      console.error('提取事件节点失败:', error);
      return 0;
    }
  }

  /**
   * 提取资产节点
   */
  async extractAssetNodes(): Promise<number> {
    try {
      // 从REITs的underlying_asset字段提取资产信息
      const { data: reitsData } = await supabase
        .from('collected_reits')
        .select('*')
        .eq('is_valid', true);

      if (!reitsData) {
        return 0;
      }

      const assetsMap = new Map<string, any>();

      for (const reit of reitsData) {
        if (reit.underlying_asset) {
          // 简单的资产提取逻辑
          const assetName = reit.underlying_asset;

          if (!assetsMap.has(assetName)) {
            assetsMap.set(assetName, {
              node_name: assetName,
              node_code: null,
              properties: {
                asset_type: reit.asset_type,
                owned_by: [reit.reit_code]
              },
              asset_data: {
                asset_name: assetName,
                asset_type: reit.asset_type,
                owned_by_reits: [reit.reit_code]
              }
            });
          } else {
            // 添加到已存在的资产
            const asset = assetsMap.get(assetName)!;
            asset.properties.owned_by.push(reit.reit_code);
            asset.asset_data.owned_by_reits.push(reit.reit_code);
          }
        }
      }

      let count = 0;

      for (const asset of assetsMap.values()) {
        // 创建或更新节点
        const nodeId = await this.createOrUpdateNode({
          node_type: NodeType.ASSET,
          node_name: asset.node_name,
          node_code: asset.node_code,
          properties: asset.properties,
          source_table: 'collected_reits',
          source_id: null
        });

        // 创建或更新资产节点属性
        await this.createOrUpdateAssetNode(nodeId, asset.asset_data);

        count++;
      }

      return count;
    } catch (error) {
      console.error('提取资产节点失败:', error);
      return 0;
    }
  }

  /**
   * 提取基金公司节点
   */
  async extractFundNodes(): Promise<number> {
    try {
      const { data: reitsData } = await supabase
        .from('collected_reits')
        .select('*')
        .eq('is_valid', true);

      if (!reitsData) {
        return 0;
      }

      const fundsMap = new Map<string, any>();

      for (const reit of reitsData) {
        if (reit.fund_manager) {
          const fundName = reit.fund_manager;

          if (!fundsMap.has(fundName)) {
            fundsMap.set(fundName, {
              node_name: fundName,
              node_code: null,
              properties: {
                fund_type: '公募基金',
                managed_reits: [reit.reit_code]
              },
              fund_data: {
                fund_name: fundName,
                fund_type: '公募基金',
                managed_reits: [reit.reit_code]
              }
            });
          } else {
            // 添加到已存在的基金
            const fund = fundsMap.get(fundName)!;
            fund.properties.managed_reits.push(reit.reit_code);
            fund.fund_data.managed_reits.push(reit.reit_code);
          }
        }
      }

      let count = 0;

      for (const fund of fundsMap.values()) {
        // 创建或更新节点
        const nodeId = await this.createOrUpdateNode({
          node_type: NodeType.FUND,
          node_name: fund.node_name,
          node_code: fund.node_code,
          properties: fund.properties,
          source_table: 'collected_reits',
          source_id: null
        });

        // 创建或更新基金节点属性
        await this.createOrUpdateFundNode(nodeId, fund.fund_data);

        count++;
      }

      return count;
    } catch (error) {
      console.error('提取基金公司节点失败:', error);
      return 0;
    }
  }

  /**
   * 创建或更新节点
   */
  private async createOrUpdateNode(nodeData: any): Promise<string> {
    try {
      const { data, error } = await supabase
        .from('graph_nodes')
        .upsert({
          ...nodeData,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'node_code',
          ignoreDuplicates: false
        })
        .select('id')
        .single();

      if (error) {
        console.error('创建或更新节点失败:', error);
        return '';
      }

      return data.id;
    } catch (error) {
      console.error('创建或更新节点失败:', error);
      return '';
    }
  }

  /**
   * 创建或更新REITs节点属性
   */
  private async createOrUpdateREITsNode(nodeId: string, reitData: any): Promise<void> {
    try {
      await supabase
        .from('node_reits')
        .upsert({
          node_id: nodeId,
          reit_code: reitData.reit_code,
          reit_name: reitData.reit_name,
          exchange: reitData.exchange,
          listing_date: reitData.listing_date,
          fund_manager: reitData.fund_manager,
          fund_custodian: reitData.fund_custodian,
          total_shares: reitData.total_shares,
          asset_type: reitData.asset_type,
          underlying_asset: reitData.underlying_asset,
          property_count: reitData.property_count,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'node_id',
          ignoreDuplicates: false
        });
    } catch (error) {
      console.error('创建或更新REITs节点属性失败:', error);
    }
  }

  /**
   * 创建或更新政策节点属性
   */
  private async createOrUpdatePolicyNode(nodeId: string, policyData: any): Promise<void> {
    try {
      await supabase
        .from('node_policies')
        .upsert({
          node_id: nodeId,
          policy_number: policyData.policy_number,
          policy_title: policyData.policy_title,
          publishing_body: policyData.publishing_body,
          policy_type: policyData.policy_type,
          publish_date: policyData.publish_date,
          effective_date: policyData.effective_date,
          expiry_date: policyData.expiry_date,
          content: policyData.content,
          summary: policyData.summary,
          keywords: policyData.keywords,
          impact_level: policyData.impact_level,
          impact_description: policyData.impact_description,
          related_reits: policyData.related_reits,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'node_id',
          ignoreDuplicates: false
        });
    } catch (error) {
      console.error('创建或更新政策节点属性失败:', error);
    }
  }

  /**
   * 创建或更新事件节点属性
   */
  private async createOrUpdateEventNode(nodeId: string, eventData: any): Promise<void> {
    try {
      await supabase
        .from('node_events')
        .upsert({
          node_id: nodeId,
          event_type: eventData.event_type,
          event_title: eventData.event_title,
          event_time: eventData.event_time,
          event_source: eventData.event_source,
          content: eventData.content,
          summary: eventData.summary,
          sentiment_score: eventData.sentiment_score,
          sentiment_label: eventData.sentiment_label,
          affected_reits: eventData.affected_reits,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'node_id',
          ignoreDuplicates: false
        });
    } catch (error) {
      console.error('创建或更新事件节点属性失败:', error);
    }
  }

  /**
   * 创建或更新资产节点属性
   */
  private async createOrUpdateAssetNode(nodeId: string, assetData: any): Promise<void> {
    try {
      await supabase
        .from('node_assets')
        .upsert({
          node_id: nodeId,
          asset_name: assetData.asset_name,
          asset_type: assetData.asset_type,
          owned_by_reits: assetData.owned_by_reits,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'node_id',
          ignoreDuplicates: false
        });
    } catch (error) {
      console.error('创建或更新资产节点属性失败:', error);
    }
  }

  /**
   * 创建或更新基金节点属性
   */
  private async createOrUpdateFundNode(nodeId: string, fundData: any): Promise<void> {
    try {
      await supabase
        .from('node_funds')
        .upsert({
          node_id: nodeId,
          fund_name: fundData.fund_name,
          fund_type: fundData.fund_type,
          managed_reits: fundData.managed_reits,
          total_reits_count: fundData.managed_reits.length,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'node_id',
          ignoreDuplicates: false
        });
    } catch (error) {
      console.error('创建或更新基金节点属性失败:', error);
    }
  }

  /**
   * 构建节点关系
   */
  async buildEdges(): Promise<number> {
    try {
      let edgeCount = 0;

      // 1. 政策→REITs关系（affects）
      edgeCount += await this.buildPolicyToREITsEdges();

      // 2. 事件→REITs关系（related_to）
      edgeCount += await this.buildEventToREITsEdges();

      // 3. REITs→资产关系（contains）
      edgeCount += await this.buildREITsToAssetEdges();

      // 4. REITs→基金关系（managed_by）
      edgeCount += await this.buildREITsToFundEdges();

      return edgeCount;
    } catch (error) {
      console.error('构建节点关系失败:', error);
      return 0;
    }
  }

  /**
   * 构建政策→REITs关系
   */
  private async buildPolicyToREITsEdges(): Promise<number> {
    try {
      // 获取所有政策节点
      const { data: policyNodes } = await supabase
        .from('node_policies')
        .select('*');

      if (!policyNodes) {
        return 0;
      }

      let edgeCount = 0;

      for (const policy of policyNodes) {
        if (policy.related_reits && policy.related_reits.length > 0) {
          for (const reitCode of policy.related_reits) {
            // 获取REITs节点ID
            const { data: reitNode } = await supabase
              .from('node_reits')
              .select('node_id')
              .eq('reit_code', reitCode)
              .single();

            if (reitNode) {
              // 计算关系强度（基于影响级别）
              const strength = this.calculateEdgeStrength(policy.impact_level);
              const confidence = 0.9; // 高置信度

              // 创建关系
              await this.createOrUpdateEdge({
                source_node_id: policy.node_id,
                target_node_id: reitNode.node_id,
                edge_type: EdgeType.AFFECTS,
                properties: {
                  impact_level: policy.impact_level,
                  impact_description: policy.impact_description
                },
                strength,
                confidence,
                source_type: 'policy',
                source_id: policy.node_id
              });

              edgeCount++;
            }
          }
        }
      }

      return edgeCount;
    } catch (error) {
      console.error('构建政策→REITs关系失败:', error);
      return 0;
    }
  }

  /**
   * 构建事件→REITs关系
   */
  private async buildEventToREITsEdges(): Promise<number> {
    try {
      const { data: eventNodes } = await supabase
        .from('node_events')
        .select('*');

      if (!eventNodes) {
        return 0;
      }

      let edgeCount = 0;

      for (const event of eventNodes) {
        if (event.affected_reits && event.affected_reits.length > 0) {
          for (const reitCode of event.affected_reits) {
            const { data: reitNode } = await supabase
              .from('node_reits')
              .select('node_id')
              .eq('reit_code', reitCode)
              .single();

            if (reitNode) {
              // 计算关系强度（基于情感分数）
              const strength = this.calculateSentimentStrength(event.sentiment_score);
              const confidence = 0.8;

              await this.createOrUpdateEdge({
                source_node_id: event.node_id,
                target_node_id: reitNode.node_id,
                edge_type: EdgeType.RELATED_TO,
                properties: {
                  event_type: event.event_type,
                  sentiment_score: event.sentiment_score,
                  sentiment_label: event.sentiment_label
                },
                strength,
                confidence,
                source_type: 'event',
                source_id: event.node_id
              });

              edgeCount++;
            }
          }
        }
      }

      return edgeCount;
    } catch (error) {
      console.error('构建事件→REITs关系失败:', error);
      return 0;
    }
  }

  /**
   * 构建REITs→资产关系
   */
  private async buildREITsToAssetEdges(): Promise<number> {
    try {
      const { data: assetNodes } = await supabase
        .from('node_assets')
        .select('*');

      if (!assetNodes) {
        return 0;
      }

      let edgeCount = 0;

      for (const asset of assetNodes) {
        if (asset.owned_by_reits && asset.owned_by_reits.length > 0) {
          for (const reitCode of asset.owned_by_reits) {
            const { data: reitNode } = await supabase
              .from('node_reits')
              .select('node_id')
              .eq('reit_code', reitCode)
              .single();

            if (reitNode) {
              const strength = 1.0;
              const confidence = 1.0;

              await this.createOrUpdateEdge({
                source_node_id: reitNode.node_id,
                target_node_id: asset.node_id,
                edge_type: EdgeType.CONTAINS,
                properties: {
                  asset_type: asset.asset_type
                },
                strength,
                confidence,
                source_type: 'manual',
                source_id: null
              });

              edgeCount++;
            }
          }
        }
      }

      return edgeCount;
    } catch (error) {
      console.error('构建REITs→资产关系失败:', error);
      return 0;
    }
  }

  /**
   * 构建REITs→基金关系
   */
  private async buildREITsToFundEdges(): Promise<number> {
    try {
      const { data: fundNodes } = await supabase
        .from('node_funds')
        .select('*');

      if (!fundNodes) {
        return 0;
      }

      let edgeCount = 0;

      for (const fund of fundNodes) {
        if (fund.managed_reits && fund.managed_reits.length > 0) {
          for (const reitCode of fund.managed_reits) {
            const { data: reitNode } = await supabase
              .from('node_reits')
              .select('node_id')
              .eq('reit_code', reitCode)
              .single();

            if (reitNode) {
              const strength = 1.0;
              const confidence = 1.0;

              await this.createOrUpdateEdge({
                source_node_id: reitNode.node_id,
                target_node_id: fund.node_id,
                edge_type: EdgeType.MANAGED_BY,
                properties: {
                  fund_type: fund.fund_type
                },
                strength,
                confidence,
                source_type: 'manual',
                source_id: null
              });

              edgeCount++;
            }
          }
        }
      }

      return edgeCount;
    } catch (error) {
      console.error('构建REITs→基金关系失败:', error);
      return 0;
    }
  }

  /**
   * 创建或更新关系
   */
  private async createOrUpdateEdge(edgeData: any): Promise<void> {
    try {
      await supabase
        .from('graph_edges')
        .upsert({
          ...edgeData,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'source_node_id,target_node_id,edge_type',
          ignoreDuplicates: false
        });
    } catch (error) {
      console.error('创建或更新关系失败:', error);
    }
  }

  /**
   * 计算关系强度（基于影响级别）
   */
  private calculateEdgeStrength(impactLevel?: string): number {
    switch (impactLevel) {
      case 'high':
        return 1.0;
      case 'medium':
        return 0.7;
      case 'low':
        return 0.4;
      default:
        return 0.5;
    }
  }

  /**
   * 计算情感强度
   */
  private calculateSentimentStrength(sentimentScore?: number): number {
    if (!sentimentScore) {
      return 0.5;
    }

    return Math.abs(sentimentScore);
  }

  /**
   * 计算节点重要性评分
   */
  async calculateNodeImportance(): Promise<void> {
    try {
      // 获取所有节点
      const { data: nodes } = await supabase
        .from('graph_nodes')
        .select('*');

      if (!nodes) {
        return;
      }

      for (const node of nodes) {
        // 计算连接数
        const { count: incomingCount } = await supabase
          .from('graph_edges')
          .select('*', { count: 'exact', head: true })
          .eq('target_node_id', node.id);

        const { count: outgoingCount } = await supabase
          .from('graph_edges')
          .select('*', { count: 'exact', head: true })
          .eq('source_node_id', node.id);

        const totalConnections = (incomingCount || 0) + (outgoingCount || 0);

        // 计算平均关系强度
        const { data: edges } = await supabase
          .from('graph_edges')
          .select('strength')
          .or(`source_node_id.eq.${node.id},target_node_id.eq.${node.id}`);

        let avgStrength = 0;
        if (edges && edges.length > 0) {
          const totalStrength = edges.reduce((sum, edge) => sum + (edge.strength || 0), 0);
          avgStrength = totalStrength / edges.length;
        }

        // 计算重要性评分（0-100）
        // 公式：(连接数权重 * 连接数 + 关系强度权重 * 平均强度 * 100) / 2
        const importanceScore = (totalConnections * 5 + avgStrength * 100) / 2;
        const normalizedScore = Math.min(100, Math.max(0, importanceScore));

        // 更新节点
        await supabase
          .from('graph_nodes')
          .update({
            connection_count: totalConnections,
            importance_score: parseFloat(normalizedScore.toFixed(2)),
            updated_at: new Date().toISOString()
          })
          .eq('id', node.id);
      }

    } catch (error) {
      console.error('计算节点重要性评分失败:', error);
    }
  }

  /**
   * 获取节点关系网络
   */
  async getNodeNetwork(nodeId: string, depth: number = 1): Promise<any> {
    try {
      const nodes = new Map<string, any>();
      const edges = new Set<string>();

      // 递归获取节点
      await this.collectNodesRecursively(nodeId, depth, nodes, edges);

      return {
        nodes: Array.from(nodes.values()),
        edges: Array.from(edges).map(e => JSON.parse(e))
      };
    } catch (error) {
      console.error('获取节点关系网络失败:', error);
      return { nodes: [], edges: [] };
    }
  }

  /**
   * 递归收集节点
   */
  private async collectNodesRecursively(
    nodeId: string,
    depth: number,
    nodes: Map<string, any>,
    edges: Set<string>
  ): Promise<void> {
    if (depth < 0) {
      return;
    }

    // 获取节点信息
    const { data: node } = await supabase
      .from('graph_nodes')
      .select('*')
      .eq('id', nodeId)
      .single();

    if (node) {
      nodes.set(nodeId, node);
    }

    // 获取出边
    const { data: outgoingEdges } = await supabase
      .from('graph_edges')
      .select('*')
      .eq('source_node_id', nodeId);

    for (const edge of outgoingEdges || []) {
      edges.add(JSON.stringify(edge));

      if (!nodes.has(edge.target_node_id)) {
        await this.collectNodesRecursively(edge.target_node_id, depth - 1, nodes, edges);
      }
    }

    // 获取入边
    const { data: incomingEdges } = await supabase
      .from('graph_edges')
      .select('*')
      .eq('target_node_id', nodeId);

    for (const edge of incomingEdges || []) {
      edges.add(JSON.stringify(edge));

      if (!nodes.has(edge.source_node_id)) {
        await this.collectNodesRecursively(edge.source_node_id, depth - 1, nodes, edges);
      }
    }
  }
}

// 导出单例
export const knowledgeGraph = KnowledgeGraph.getInstance();
