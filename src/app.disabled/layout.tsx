import type { Metadata } from 'next';
import { Inspector } from 'react-dev-inspector';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'REITs智能助手 | 多Agent协作系统',
    template: '%s | REITs智能助手',
  },
  description: '为用户提供一个直观、易用的Web界面，通过多个专业Agent协同工作，提供REITs发行全流程服务。',
  keywords: [
    'REITs',
    '智能助手',
    '多Agent协作',
    '政策解读',
    '尽职调查',
    '申报材料',
    '定价发行',
    '存续期管理',
  ],
  authors: [{ name: 'REITs Team' }],
  generator: 'Coze Code',
  openGraph: {
    title: 'REITs智能助手 - 多Agent协作系统',
    description: '全流程 REITs 发行服务，一站式解决方案',
    siteName: 'REITs智能助手',
    locale: 'zh_CN',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const isDev = process.env.NODE_ENV === 'development';

  return (
    <html lang="zh-CN">
      <body className={`antialiased`}>
        {isDev && <Inspector />}
        {children}
      </body>
    </html>
  );
}
