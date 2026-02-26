/**
 * KnowledgeGraph - 模拟版本（用于测试）
 */

const mockGraphDatabase = {
  nodes: [] as any[],
  edges: [] as any[]
};

export enum NodeType {
  REIT = 'reit',
  POLICY = 'policy',
  EVENT = 'event',
  ASSET = 'asset',
  FUND = 'fund'
}

export enum EdgeType {
  AFFECTS = 'affects',
  RELATED_TO = 'related_to',
  CONTAINS = 'contains',
  MANAGED_BY = 'managed_by'
}

export class KnowledgeGraphMock {
  async buildGraph(): Promise<{
    reits: number;
    policies: number;
    events: number;
    assets: number;
    funds: number;
    edges: number;
  }> {
    console.log('[MOCK] 开始构建知识图谱...');

    // 模拟延迟
    await new Promise(resolve => setTimeout(resolve, 300));

    // 清空现有图谱
    mockGraphDatabase.nodes = [];
    mockGraphDatabase.edges = [];

    // 创建节点
    const reitsNode = this.createNode(NodeType.REIT, '首钢绿能', '180101');
    const policyNode = this.createNode(NodeType.POLICY, 'REITs试点通知', '发改投资〔2021〕958号');
    const eventNode = this.createNode(NodeType.EVENT, '首钢绿能表现优异', null);
    const assetNode = this.createNode(NodeType.ASSET, '垃圾焚烧发电项目', null);
    const fundNode = this.createNode(NodeType.FUND, '中航基金', null);

    // 创建关系
    this.createEdge(policyNode.id, reitsNode.id, EdgeType.AFFECTS, 1.0);
    this.createEdge(eventNode.id, reitsNode.id, EdgeType.RELATED_TO, 0.8);
    this.createEdge(reitsNode.id, assetNode.id, EdgeType.CONTAINS, 1.0);
    this.createEdge(reitsNode.id, fundNode.id, EdgeType.MANAGED_BY, 1.0);

    const result = {
      reits: 1,
      policies: 1,
      events: 1,
      assets: 1,
      funds: 1,
      edges: 4
    };

    console.log('[MOCK] 图谱构建完成:', result);

    return result;
  }

  private createNode(type: NodeType, name: string, code: string | null) {
    const node = {
      id: `node-${type}-${Date.now()}-${Math.random()}`,
      node_type: type,
      node_name: name,
      node_code: code,
      properties: {},
      connection_count: 0,
      importance_score: Math.random() * 100
    };
    mockGraphDatabase.nodes.push(node);
    return node;
  }

  private createEdge(sourceId: string, targetId: string, type: EdgeType, strength: number) {
    const edge = {
      id: `edge-${Date.now()}-${Math.random()}`,
      source_node_id: sourceId,
      target_node_id: targetId,
      edge_type: type,
      strength,
      confidence: 1.0
    };
    mockGraphDatabase.edges.push(edge);
    return edge;
  }

  async getNodeNetwork(nodeId: string, depth: number = 1): Promise<any> {
    return {
      nodes: mockGraphDatabase.nodes.slice(0, depth + 2),
      edges: mockGraphDatabase.edges.slice(0, depth + 2)
    };
  }

  getMockGraphDatabase() {
    return mockGraphDatabase;
  }

  clearMockGraphDatabase() {
    mockGraphDatabase.nodes = [];
    mockGraphDatabase.edges = [];
  }
}

export const knowledgeGraphMock = new KnowledgeGraphMock();
