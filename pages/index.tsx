export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          REITs 智能助手
        </h1>
        <p className="text-lg text-gray-600">
          服务正在运行中...
        </p>
        <div className="mt-8 space-y-4">
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-700">✓ 服务已启动</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-700">✓ 页面加载正常</p>
          </div>
        </div>
      </div>
    </div>
  );
}
