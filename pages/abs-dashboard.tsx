'use client';

import { useState } from 'react';
import Head from 'next/head';
import { ABSProductPanel } from '@/components/abs/ABSProductPanel';
import { ABSCenterPanel } from '@/components/abs/ABSCenterPanel';
import { ABSSidebar } from '@/components/abs/ABSSidebar';

export default function ABSDashboardPage() {
  const [activeTab, setActiveTab] = useState('ABS数据中心');

  const tabs = [
    'ABS速览',
    'ABS项目大全',
    'ABS分层证券大全',
    'ABS市场统计',
    'ABS数据中心',
    'ABS项目备案',
    'ABS项目进度',
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'ABS项目大全':
        return <ABSProductPanel />;
      case 'ABS数据中心':
        return <ABSCenterPanel />;
      default:
        return (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <div className="text-6xl mb-4">🚧</div>
            <p className="text-xl">{activeTab} 功能开发中...</p>
          </div>
        );
    }
  };

  return (
    <>
      <Head>
        <title>ABS管理系统 - REITs智能助手</title>
        <meta name="description" content="资产支持证券（ABS）管理系统，提供ABS产品数据库、市场统计、数据中心等功能" />
      </Head>

      <div className="flex h-screen bg-gray-50">
        {/* 左侧侧边栏 */}
        <ABSSidebar tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

        {/* 右侧内容区 */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* 顶部标题栏 */}
          <div className="bg-white border-b border-gray-200 px-6 py-4">
            <h1 className="text-2xl font-bold text-gray-900">{activeTab}</h1>
          </div>

          {/* 主内容区 */}
          <div className="flex-1 overflow-auto">
            {renderContent()}
          </div>
        </div>
      </div>
    </>
  );
}
