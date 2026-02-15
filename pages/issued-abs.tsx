export default function IssuedAbsPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-4">已发行 ABS</h1>
      <p className="text-gray-600 mb-6">查看已发行的 ABS 项目信息和票面利率</p>
      
      <div className="bg-white p-6 rounded-lg border shadow-sm">
        <p className="text-gray-500">ABS 数据加载中...</p>
      </div>
    </div>
  );
}
