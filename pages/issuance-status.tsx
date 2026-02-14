import MainLayout from '../src/components/layout/MainLayout';

export default function IssuanceStatusPage() {
  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            发行状态跟踪
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            实时跟踪REITs和ABS产品从申请到上市的全过程
          </p>
        </div>
        <p>页面正在加载中...</p>
      </div>
    </MainLayout>
  );
}
