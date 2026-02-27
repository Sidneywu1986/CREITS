import type { NextConfig } from 'next';
import path from 'path';

const nextConfig: NextConfig = {
  // outputFileTracingRoot: path.resolve(__dirname),
  allowedDevOrigins: ['*.dev.coze.site'],
  // 排除需要原生编译的包，避免在构建时编译
  serverExternalPackages: ['pdfjs-dist', 'sharp', 'canvas'],
  // 禁用一些不必要的优化以加快构建
  swcMinify: true,
  // 减少并发数以避免内存问题
  experimental: {
    // 使用更激进的优化
    optimizePackageImports: [
      'lucide-react',
      '@radix-ui/react-icons',
      'echarts',
      'recharts',
    ],
  },
  turbopack: {},
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lf-coze-web-cdn.coze.cn',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
