import MainLayout from '../src/components/layout/MainLayout';
import HackerAnonymousBBS from '../src/components/bbs/HackerAnonymousBBS';

export default function BBSPage() {
  return (
    <MainLayout>
      <div className="p-8">
        <h1 className="text-3xl font-bold mb-4">匿名BBS</h1>
        <p className="text-lg text-gray-700 mb-8">
          黑客风格的匿名交流社区，支持端到端加密、邀请码机制和临时聊天室
        </p>

        <div className="bg-gradient-to-r from-green-950/20 to-black/50 border border-green-500/20 rounded-lg p-6 mb-8">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-lg bg-green-500/10 flex items-center justify-center border border-green-500/30 flex-shrink-0">
              <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-green-400 mb-2">隐私保护说明</h3>
              <ul className="text-sm text-green-600/70 space-y-1">
                <li>• 所有数据仅存储在内存中，关闭浏览器后自动删除</li>
                <li>• 匿名身份自动生成，无需注册登录</li>
                <li>• 邀请码机制，仅允许受邀用户加入聊天室</li>
                <li>• 端到端加密标记，确保消息传输安全</li>
              </ul>
            </div>
          </div>
        </div>

        {/* 黑客风格匿名BBS */}
        <HackerAnonymousBBS />
      </div>
    </MainLayout>
  );
}
