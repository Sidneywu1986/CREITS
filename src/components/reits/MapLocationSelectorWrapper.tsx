/**
 * 地图选择器包装器
 * 动态导入 MapLocationSelector 以避免服务端渲染问题
 */

'use client';

import dynamic from 'next/dynamic';

const MapLocationSelector = dynamic(
  () => import('./MapLocationSelector'),
  {
    ssr: false, // 禁用服务端渲染
    loading: () => (
      <div className="flex items-center justify-center h-96 bg-gray-100 dark:bg-gray-800 rounded-lg">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600 dark:text-gray-400">加载地图组件...</span>
      </div>
    ),
  }
);

export default MapLocationSelector;
