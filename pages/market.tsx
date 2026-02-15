export default function MarketPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-4">市场行情</h1>
      <p className="text-gray-600 mb-6">实时查看 REITs 和 ABS 市场行情数据</p>
      
      <div className="bg-white p-6 rounded-lg border shadow-sm">
        <p className="text-gray-500">市场数据加载中...</p>
      </div>
    </div>
  );
}
