export default function NewsPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-4">新闻资讯</h1>
      <p className="text-gray-600 mb-6">获取最新的 REITs 行业新闻和动态</p>
      
      <div className="bg-white p-6 rounded-lg border shadow-sm">
        <p className="text-gray-500">新闻加载中...</p>
      </div>
    </div>
  );
}
