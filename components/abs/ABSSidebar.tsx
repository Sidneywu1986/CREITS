'use client';

export function ABSSidebar() {
  return (
    <div className="w-64 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-r border-slate-700/50 flex-shrink-0">
      <div className="p-4">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-gradient-to-br from-[#667eea] to-[#764ba2] rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/20">
            <span className="text-white font-bold text-lg">A</span>
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">ABS数据中心</h2>
            <p className="text-xs text-slate-400">资产管理平台</p>
          </div>
        </div>

        <div className="space-y-1">
          <div className="w-full px-4 py-3 bg-gradient-to-r from-[#667eea]/20 to-[#764ba2]/20 text-white rounded-xl border border-[#667eea]/30 font-medium text-sm shadow-lg">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
              ABS数据中心
            </div>
          </div>
        </div>
      </div>

      {/* 底部信息 */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-700/50">
        <div className="text-xs text-slate-400">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
            <span>系统运行正常</span>
          </div>
          <div>
            数据更新: {new Date().toLocaleDateString('zh-CN')}
          </div>
        </div>
      </div>
    </div>
  );
}
