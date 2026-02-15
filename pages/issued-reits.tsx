export default function IssuedReitsPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-4">已发行 REITs</h1>
      <p className="text-gray-600 mb-6">查看市场上已发行的 REITs 产品实时行情</p>
      
      <div className="bg-white p-6 rounded-lg border shadow-sm">
        <p className="text-gray-500">REITs 数据加载中...</p>
      </div>
    </div>
  );
}
