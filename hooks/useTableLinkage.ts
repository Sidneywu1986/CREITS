'use client';

import { useState, useEffect } from 'react';
import { tableLinkages, getTableLabel } from '@/config/table-linkage';

export interface LinkageState {
  sourceTable: string;
  sourceId: string;
  targetTable: string;
  data: any[];
  loading: boolean;
  error: string | null;
}

export function useTableLinkage() {
  const [linkageState, setLinkageState] = useState<LinkageState | null>(null);
  const [activeLinkages, setActiveLinkages] = useState<string[]>([]);

  // 启用联动
  const enableLinkage = async (
    sourceTable: string,
    sourceId: string,
    targetTable: string
  ) => {
    const linkageKey = `${sourceTable}-${sourceId}-${targetTable}`;
    
    if (!activeLinkages.includes(linkageKey)) {
      setActiveLinkages([...activeLinkages, linkageKey]);
    }

    setLinkageState({
      sourceTable,
      sourceId,
      targetTable,
      data: [],
      loading: true,
      error: null,
    });

    try {
      // 调用API获取关联数据
      const response = await fetch('/api/reits/table-linkage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sourceTable, sourceId, targetTable }),
      });

      if (!response.ok) {
        throw new Error('获取关联数据失败');
      }

      const data = await response.json();

      setLinkageState((prev) =>
        prev
          ? { ...prev, data: data.data || [], loading: false }
          : null
      );
    } catch (error) {
      setLinkageState((prev) =>
        prev
          ? {
              ...prev,
              loading: false,
              error: error instanceof Error ? error.message : '未知错误',
            }
          : null
      );
    }
  };

  // 禁用联动
  const disableLinkage = () => {
    if (linkageState) {
      const linkageKey = `${linkageState.sourceTable}-${linkageState.sourceId}-${linkageState.targetTable}`;
      setActiveLinkages(activeLinkages.filter((key) => key !== linkageKey));
      setLinkageState(null);
    }
  };

  // 清除所有联动
  const clearAllLinkages = () => {
    setActiveLinkages([]);
    setLinkageState(null);
  };

  // 获取当前可用的联动配置
  const getAvailableLinkages = (currentTable: string): Array<{table: string; label: string; type: string}> => {
    const linkages = tableLinkages[currentTable] || [];
    return linkages.map((config) => ({
      table: config.table,
      label: getTableLabel(config.table),
      type: config.type,
    }));
  };

  // 检查是否有活跃的联动
  const hasActiveLinkage = () => linkageState !== null;

  return {
    linkageState,
    activeLinkages,
    enableLinkage,
    disableLinkage,
    clearAllLinkages,
    getAvailableLinkages,
    hasActiveLinkage,
  };
}
