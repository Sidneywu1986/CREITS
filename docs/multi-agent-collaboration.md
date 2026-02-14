# 多Agent协助交流机制文档

## 概述

多Agent协助交流机制是一个智能的协作系统，能够自动识别用户问题所属的领域，并在需要时调用相关领域的Agent共同参与对话，提升用户体验和专业性。

## 核心功能

### 1. 智能问题分析

系统会自动分析用户提出的问题，判断是否属于当前Agent的专业领域：

- **领域关键词匹配**：通过预定义的领域关键词，快速识别问题类型
- **置信度计算**：基于关键词匹配度计算问题与当前领域的关联度
- **跨领域识别**：识别问题是否涉及其他Agent的专业领域

### 2. 协作建议触发

当系统检测到问题超出当前Agent领域时，会触发协作建议：

- **智能推荐**：根据问题内容，推荐最相关的1-2个Agent参与协作
- **原因说明**：向用户解释为什么建议启动协作模式
- **用户选择**：用户可以选择启动协作或继续单人对话

### 3. 多Agent协作对话

启动协作模式后，系统会模拟真实的Agent协作场景：

- **Agent邀请**：主Agent会邀请相关领域的Agent加入对话
- **Agent加入**：被邀请的Agent会逐个加入，并显示加入提示
- **协作响应**：每个参与的Agent都会从自己的专业角度提供见解
- **交互体验**：营造真实的团队协作氛围

### 4. Agent管理

用户可以在协作过程中管理参与的Agent：

- **查看参与Agent**：在对话顶部显示所有参与的Agent
- **移除Agent**：用户可以随时移除某个Agent
- **退出协作**：当所有Agent都被移除时，自动退出协作模式

## 技术实现

### 核心模块

#### 1. Agent领域配置 (`AGENT_DOMAINS`)

每个Agent都有自己的领域配置，包括：

```typescript
{
  agentId: 'legal-risk',
  domain: ['法务风控', '法律合规', '风险识别'],
  keywords: ['法律', '合规', '法规', '风险', ...],
  relatedAgents: ['policy', 'due-diligence']
}
```

#### 2. Agent知识矩阵 (`AGENT_KNOWLEDGE_MATRIX`)

记录不同Agent之间的知识重叠和互补关系，用于识别协作需求：

```typescript
{
  'legal-risk': {
    overlaps: {
      'policy': ['合规要求', '监管条款'],
      'due-diligence': ['法律风险', '合规风险']
    },
    complementaries: {
      'policy': ['法律条文解读', '政策法律风险评估']
    }
  }
}
```

#### 3. 问题分析器 (`QuestionAnalyzer`)

提供静态方法分析问题：

- `analyze(agentId, question)`: 分析问题是否属于Agent领域
- `extractKeywords(question)`: 提取问题中的关键词
- `findRelevantAgents(question)`: 找到最相关的Agent
- `assessCollaborationNeed(agentId, question, matchedKeywords)`: 评估是否需要协作

#### 4. 协作管理器 (`CollaborationManager`)

管理协作会话和消息：

- `createSession(mainAgentId, participatingAgents)`: 创建协作会话
- `generateInvitationMessages(mainAgentId, invitedAgents, originalQuestion)`: 生成邀请消息
- `generateJoinMessage(agentId)`: 生成加入消息
- `analyzeAndSuggest(currentAgentId, question)`: 分析问题并建议协作

### 对话界面增强

#### 1. 消息类型扩展

支持多种消息类型：

- `response`: 普通响应消息
- `invitation`: Agent邀请消息（黄色背景）
- `transition`: 系统通知消息（Agent加入/退出）
- `suggestion`: 协作建议

#### 2. 视觉效果

- **协作模式标识**：在标题和对话区域显示"协作模式"标识
- **参与Agent列表**：在页面顶部显示所有参与的Agent
- **彩色头像**：每个Agent都有自己独特的颜色和图标
- **邀请消息样式**：邀请消息使用黄色背景和特殊样式

#### 3. 动画效果

- **Agent加入动画**：Agent逐个加入，每个间隔500ms
- **消息渐入**：新消息平滑滚动到视图中
- **协作建议弹出**：协作建议卡片平滑显示

## 使用示例

### 示例1：法律问题触发协作

**场景**：用户向法务风控Agent提问关于政策解读的问题

```
用户：最新发布的REITs政策对市场有什么影响？
```

**系统分析**：
- 问题包含"政策"、"市场"等关键词
- 不属于法务风控Agent的核心领域
- 建议邀请政策解读Agent

**协作流程**：
1. 系统显示协作建议
2. 用户点击"启动协作"
3. 法务风控Agent邀请政策解读Agent
4. 政策解读Agent加入对话
5. 两个Agent分别从法律和政策角度回答

### 示例2：复杂问题需要多Agent协作

**场景**：用户询问REITs定价问题

```
用户：这个REITs项目应该如何定价？需要考虑哪些因素？
```

**系统分析**：
- 问题属于定价发行Agent的核心领域
- 但也涉及尽职调查和运营管理
- 建议邀请尽调和运营Agent协作

**协作流程**：
1. 定价Agent首先回答核心定价问题
2. 邀请尽调Agent从财务和资产角度补充
3. 邀请运营Agent从运营管理角度补充
4. 三个Agent共同提供全面的定价建议

## Agent领域关键词

### 法务风控 Agent
- 核心领域：法务风控、法律合规、风险识别
- 关键词：法律、合规、法规、风险、诉讼、合同、权属、知识产权、刑事责任

### 政策解读 Agent
- 核心领域：政策解读、监管分析、合规指引
- 关键词：政策、监管、指导意见、通知、指引、发改委、证监会、试点、审批

### 尽职调查 Agent
- 核心领域：尽职调查、风险识别、资产评估、财务分析
- 关键词：尽调、资产评估、财务分析、现金流、风险评估、运营数据、审计

### 申报材料生成 Agent
- 核心领域：申报材料、文书生成、合规审查
- 关键词：申报材料、申报、材料、文书、文件、法律意见书、评估报告、审计报告

### 定价发行建议 Agent
- 核心领域：定价分析、市场估值、投资建议
- 关键词：定价、估值、价格、估值方法、收益法、市场法、折现率、发行价

### 存续期管理 Agent
- 核心领域：运营管理、价值提升、风险监控
- 关键词：运营、管理、存续期、运营效率、资产运营、价值提升、租户管理、出租率

### 智能协作 Agent
- 核心领域：智能协作、任务协调
- 关键词：协作、多Agent、协同、协调、综合、整合、复杂任务、跨领域

## 扩展和自定义

### 添加新的领域关键词

修改 `AGENT_DOMAINS` 数组，为Agent添加更多关键词：

```typescript
{
  agentId: 'legal-risk',
  keywords: [
    '法律', '合规', '法规',
    // 添加新的关键词
    '监管', '处罚', '诉讼'
  ]
}
```

### 调整协作阈值

修改 `QuestionAnalyzer.analyze` 方法中的置信度阈值：

```typescript
// 当前阈值：0.3
const isMyDomain = confidence >= 0.3 || matchedKeywords.length >= 2;
```

### 自定义协作建议

修改 `CollaborationManager.analyzeAndSuggest` 方法，自定义协作建议的逻辑：

```typescript
// 可以添加更复杂的协作建议逻辑
if (analysis.suggestedAgents.length >= 3) {
  // 限制最多推荐2个Agent
  analysis.suggestedAgents = analysis.suggestedAgents.slice(0, 2);
}
```

## 性能优化

### 1. 关键词匹配优化

- 使用前缀树（Trie）结构存储关键词，提高匹配效率
- 缓存关键词匹配结果，避免重复计算

### 2. 协作会话管理

- 限制协作会话的最大时长
- 自动清理过期的协作会话

### 3. 消息渲染优化

- 使用虚拟滚动处理大量消息
- 懒加载Agent头像和资源

## 未来改进方向

### 1. 真实的LLM集成

目前系统使用模拟响应，未来可以：

- 集成真实的LLM API（如coze-coding-dev-sdk）
- 实现真正的流式对话
- 支持多Agent的实时协作

### 2. 更智能的协作决策

- 使用机器学习模型优化协作决策
- 基于历史对话数据学习最佳协作策略
- 支持动态调整Agent参与度

### 3. 用户体验优化

- 添加协作历史的可视化
- 支持用户自定义协作模式
- 提供协作效率分析和建议

### 4. 多模态支持

- 支持图片、文档等多媒体输入
- 集成知识库检索
- 支持代码生成和执行

## 总结

多Agent协助交流机制通过智能问题分析和Agent协作，大大提升了REITs智能助手的对话体验和专业性。用户可以获得更全面、更准确的答案，同时感受到真实的团队协作氛围，增强了用户粘性和使用新鲜度。

系统具有良好的扩展性和可定制性，可以根据实际需求进行调整和优化，为未来功能扩展奠定了坚实基础。
