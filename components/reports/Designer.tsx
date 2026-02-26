'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { ReportComponent, ReportComponentType } from '@/lib/reports/service';

/**
 * 报表设计器组件
 */
export function ReportDesigner() {
  const [reportName, setReportName] = useState('');
  const [reportDescription, setReportDescription] = useState('');
  const [components, setComponents] = useState<ReportComponent[]>([]);
  const [selectedComponent, setSelectedComponent] = useState<ReportComponent | null>(null);

  /**
   * 添加组件
   */
  const addComponent = (type: ReportComponentType) => {
    const newComponent: ReportComponent = {
      id: `comp_${Date.now()}`,
      type,
      position: { x: 0, y: 0, width: 300, height: 200 },
      config: {
        title: `${type}组件`,
        dataSource: 'reit_products'
      }
    };

    setComponents([...components, newComponent]);
    setSelectedComponent(newComponent);
  };

  /**
   * 更新组件配置
   */
  const updateComponent = (componentId: string, updates: Partial<ReportComponent>) => {
    setComponents(components.map(c =>
      c.id === componentId ? { ...c, ...updates } : c
    ));
    if (selectedComponent?.id === componentId) {
      setSelectedComponent({ ...selectedComponent, ...updates });
    }
  };

  /**
   * 删除组件
   */
  const deleteComponent = (componentId: string) => {
    setComponents(components.filter(c => c.id !== componentId));
    if (selectedComponent?.id === componentId) {
      setSelectedComponent(null);
    }
  };

  /**
   * 保存报表
   */
  const saveReport = async () => {
    // TODO: 实现保存逻辑
    console.log('保存报表:', { name: reportName, description: reportDescription, components });
  };

  const componentTypes: Array<{ type: ReportComponentType; icon: string; label: string }> = [
    { type: 'table', icon: '📊', label: '表格' },
    { type: 'chart', icon: '📈', label: '图表' },
    { type: 'metric', icon: '🎯', label: '指标卡' },
    { type: 'text', icon: '📝', label: '文本' },
    { type: 'image', icon: '🖼️', label: '图片' }
  ];

  return (
    <div className="space-y-6">
      {/* 标题 */}
      <div>
        <h2 className="text-2xl font-bold text-blue-900">报表设计器</h2>
        <p className="text-muted-foreground">拖拽式设计您的自定义报表</p>
      </div>

      {/* 报表基本信息 */}
      <Card>
        <CardHeader>
          <CardTitle>报表信息</CardTitle>
          <CardDescription>设置报表的基本信息</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">报表名称</label>
            <Input
              placeholder="输入报表名称..."
              value={reportName}
              onChange={(e) => setReportName(e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">报表描述</label>
            <Textarea
              placeholder="输入报表描述..."
              value={reportDescription}
              onChange={(e) => setReportDescription(e.target.value)}
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* 组件面板 */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">组件库</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2">
              {componentTypes.map(({ type, icon, label }) => (
                <Button
                  key={type}
                  variant="outline"
                  className="flex flex-col gap-1 h-24"
                  onClick={() => addComponent(type)}
                >
                  <span className="text-2xl">{icon}</span>
                  <span className="text-xs">{label}</span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 画布 */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">报表画布</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="min-h-[500px] bg-slate-50 rounded-lg p-4 relative border-2 border-dashed border-slate-300">
              {components.length === 0 ? (
                <div className="absolute inset-0 flex items-center justify-center text-slate-400">
                  <div className="text-center">
                    <p className="text-4xl mb-2">📊</p>
                    <p>从左侧拖拽组件到此处</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {components.map((component) => (
                    <div
                      key={component.id}
                      className={`p-4 bg-white rounded-lg border-2 cursor-move hover:shadow-lg transition-all ${
                        selectedComponent?.id === component.id ? 'border-blue-500 shadow-lg' : 'border-slate-200'
                      }`}
                      onClick={() => setSelectedComponent(component)}
                      style={{
                        width: component.position.width,
                        height: component.position.height
                      }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold">{component.config.title}</span>
                        <Badge variant="outline">{component.type}</Badge>
                      </div>
                      <div className="text-sm text-slate-500">
                        {component.config.dataSource}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* 属性面板 */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">属性配置</CardTitle>
          </CardHeader>
          <CardContent>
            {selectedComponent ? (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">组件类型</label>
                  <Badge>{selectedComponent.type}</Badge>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">标题</label>
                  <Input
                    value={selectedComponent.config.title || ''}
                    onChange={(e) => updateComponent(selectedComponent.id, {
                      config: { ...selectedComponent.config, title: e.target.value }
                    })}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">数据源</label>
                  <select
                    className="w-full px-3 py-2 border rounded-md"
                    value={selectedComponent.config.dataSource}
                    onChange={(e) => updateComponent(selectedComponent.id, {
                      config: { ...selectedComponent.config, dataSource: e.target.value }
                    })}
                  >
                    <option value="reit_products">REITs产品</option>
                    <option value="reit_properties">底层资产</option>
                    <option value="reit_financial">财务数据</option>
                    <option value="reit_market">市场数据</option>
                  </select>
                </div>

                {selectedComponent.type === 'chart' && (
                  <div>
                    <label className="text-sm font-medium mb-2 block">图表类型</label>
                    <select
                      className="w-full px-3 py-2 border rounded-md"
                      value={selectedComponent.config.chartType || 'line'}
                      onChange={(e) => updateComponent(selectedComponent.id, {
                        config: { ...selectedComponent.config, chartType: e.target.value as any }
                      })}
                    >
                      <option value="line">折线图</option>
                      <option value="bar">柱状图</option>
                      <option value="pie">饼图</option>
                      <option value="area">面积图</option>
                    </select>
                  </div>
                )}

                <Button
                  variant="destructive"
                  size="sm"
                  className="w-full"
                  onClick={() => deleteComponent(selectedComponent.id)}
                >
                  删除组件
                </Button>
              </div>
            ) : (
              <div className="text-center text-slate-400 py-8">
                <p>选择组件以编辑属性</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 操作按钮 */}
      <div className="flex justify-end gap-2">
        <Button variant="outline">预览</Button>
        <Button onClick={saveReport}>保存报表</Button>
      </div>
    </div>
  );
}
