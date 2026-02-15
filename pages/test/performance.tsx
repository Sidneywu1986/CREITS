import { useState } from 'react';
import Head from 'next/head';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface TestResult {
  name: string;
  status: 'running' | 'success' | 'error';
  duration?: number;
  data?: any;
  error?: string;
}

export default function PerformanceTestPage() {
  const [results, setResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  /**
   * 运行所有性能测试
   */
  const runAllTests = async () => {
    setIsRunning(true);
    setResults([]);

    const tests = [
      { name: 'WASM 加载时间测试', fn: testWASMLoadTime },
      { name: '加密/解密性能测试', fn: testEncryptionPerformance },
      { name: 'API 响应时间测试', fn: testAPIResponseTime },
      { name: 'IndexedDB 查询时间测试', fn: testIndexedDBPerformance },
    ];

    for (const test of tests) {
      setResults(prev => [
        ...prev,
        { name: test.name, status: 'running' },
      ]);

      try {
        const start = performance.now();
        const data = await test.fn();
        const duration = performance.now() - start;

        setResults(prev =>
          prev.map(r =>
            r.name === test.name
              ? { ...r, status: 'success', duration, data }
              : r
          )
        );
      } catch (error) {
        setResults(prev =>
          prev.map(r =>
            r.name === test.name
              ? { ...r, status: 'error', error: (error as Error).message }
              : r
          )
        );
      }

      // 等待一秒再进行下一个测试
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    setIsRunning(false);
  };

  /**
   * WASM 加载时间测试
   */
  async function testWASMLoadTime() {
    console.log('[Performance Test] 开始 WASM 加载时间测试...');

    // 测试导入模块的耗时
    const start = performance.now();
    const bbsModule = await import('@/lib/encryption/bbs-signature');
    const importTime = performance.now() - start;

    // 测试初始化耗时
    const initStart = performance.now();
    const signature = await bbsModule.createBBSKeyPair();
    const initTime = performance.now() - initStart;

    return {
      importTime,
      initTime,
      totalTime: importTime + initTime,
    };
  }

  /**
   * 加密/解密性能测试
   */
  async function testEncryptionPerformance() {
    console.log('[Performance Test] 开始加密/解密性能测试...');

    const { BookCipher } = await import('@/lib/encryption/book-cipher');

    // 测试数据
    const testData = '这是一条需要加密测试的消息，长度为50个字符。'.repeat(10);
    const iterations = 10; // 减少测试次数以加快速度

    // 创建书密码实例
    const bookContent = '测试书本内容，用于书密码加密。'.repeat(1000);
    const cipher = new BookCipher(bookContent);

    // 加密测试
    const encryptTimes: number[] = [];
    for (let i = 0; i < iterations; i++) {
      const start = performance.now();
      const startPos = cipher.generateStartPos();
      await cipher.encrypt(testData, startPos);
      const time = performance.now() - start;
      encryptTimes.push(time);
    }

    // 解密测试
    const startPos = cipher.generateStartPos();
    const ciphertext = await cipher.encrypt(testData, startPos);
    const decryptTimes: number[] = [];

    for (let i = 0; i < iterations; i++) {
      const start = performance.now();
      await cipher.decrypt(ciphertext, startPos, testData.length);
      const time = performance.now() - start;
      decryptTimes.push(time);
    }

    const avgEncryptTime = encryptTimes.reduce((a, b) => a + b, 0) / iterations;
    const avgDecryptTime = decryptTimes.reduce((a, b) => a + b, 0) / iterations;

    return {
      encrypt: {
        iterations,
        totalTime: encryptTimes.reduce((a, b) => a + b, 0),
        avgTime: avgEncryptTime,
        minTime: Math.min(...encryptTimes),
        maxTime: Math.max(...encryptTimes),
      },
      decrypt: {
        iterations,
        totalTime: decryptTimes.reduce((a, b) => a + b, 0),
        avgTime: avgDecryptTime,
        minTime: Math.min(...decryptTimes),
        maxTime: Math.max(...decryptTimes),
      },
    };
  }

  /**
   * API 响应时间测试
   */
  async function testAPIResponseTime() {
    console.log('[Performance Test] 开始 API 响应时间测试...');

    const { apiClient } = await import('@/lib/api/client');

    // 测试不同 API 端点
    const tests = [
      {
        name: 'GET /posts',
        fn: () => apiClient.get('/posts'),
      },
      {
        name: 'GET /experts',
        fn: () => apiClient.get('/experts'),
      },
    ];

    const results: Record<string, any> = {};

    for (const test of tests) {
      const times: number[] = [];
      const iterations = 5; // 减少测试次数

      for (let i = 0; i < iterations; i++) {
        try {
          const start = performance.now();
          await test.fn();
          const time = performance.now() - start;
          times.push(time);
        } catch (error) {
          // 忽略错误，只测试性能
          console.log(`API 测试 ${test.name} 失败:`, error);
        }
      }

      if (times.length > 0) {
        const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
        results[test.name] = {
          iterations,
          successCount: times.length,
          avgTime,
          minTime: Math.min(...times),
          maxTime: Math.max(...times),
        };
      } else {
        results[test.name] = {
          iterations,
          successCount: 0,
          avgTime: 0,
          error: '所有请求均失败',
        };
      }
    }

    return results;
  }

  /**
   * IndexedDB 查询时间测试
   */
  async function testIndexedDBPerformance() {
    console.log('[Performance Test] 开始 IndexedDB 查询时间测试...');

    const { getDB } = await import('@/lib/storage/indexeddb');

    const db = await getDB();

    // 写入测试数据
    const writeCount = 100;
    const writeStart = performance.now();
    for (let i = 0; i < writeCount; i++) {
      await db.put('credentials', { id: `test_${i}`, data: `test_data_${i}` }, `test_${i}`);
    }
    const writeTime = performance.now() - writeStart;

    // 读取测试数据
    const readCount = 100;
    const readStart = performance.now();
    for (let i = 0; i < readCount; i++) {
      await db.get('credentials', `test_${i % writeCount}`);
    }
    const readTime = performance.now() - readStart;

    // 查询测试
    const queryStart = performance.now();
    const allData = await db.getAll('credentials');
    const queryTime = performance.now() - queryStart;

    // 清理测试数据
    for (let i = 0; i < writeCount; i++) {
      await db.delete('credentials', `test_${i}`);
    }

    return {
      write: {
        count: writeCount,
        totalTime: writeTime,
        avgTime: writeTime / writeCount,
      },
      read: {
        count: readCount,
        totalTime: readTime,
        avgTime: readTime / readCount,
      },
      query: {
        resultCount: allData.length,
        totalTime: queryTime,
      },
    };
  }

  /**
   * 格式化结果显示
   */
  const formatResult = (result: TestResult) => {
    if (result.status === 'running') {
      return <div className="text-muted-foreground">测试中...</div>;
    }

    if (result.status === 'error') {
      return (
        <Alert variant="destructive">
          <AlertTitle>测试失败</AlertTitle>
          <AlertDescription>{result.error}</AlertDescription>
        </Alert>
      );
    }

    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">耗时:</span>
          <span className="font-mono text-sm">{result.duration?.toFixed(2)}ms</span>
        </div>
        <div className="mt-2 p-3 bg-muted rounded-md">
          <pre className="text-xs overflow-auto max-h-60">
            {JSON.stringify(result.data, null, 2)}
          </pre>
        </div>
      </div>
    );
  };

  return (
    <>
      <Head>
        <title>性能测试 - REITs 智能助手</title>
        <meta name="description" content="性能基准测试页面" />
      </Head>

      <div className="container mx-auto py-6 max-w-5xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight">性能基准测试</h1>
          <p className="text-muted-foreground mt-2">
            测试系统各模块的性能指标，验证优化效果
          </p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>测试控制</CardTitle>
            <CardDescription>
              运行性能测试并查看结果
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Button
                onClick={runAllTests}
                disabled={isRunning}
                size="lg"
              >
                {isRunning ? '测试运行中...' : '运行所有测试'}
              </Button>
              {results.length > 0 && (
                <Button
                  onClick={() => setResults([])}
                  variant="outline"
                  size="lg"
                >
                  清空结果
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {results.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">测试结果</h2>
            {results.map((result, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="text-base">
                    {result.name}
                  </CardTitle>
                  <CardDescription>
                    状态:{' '}
                    {result.status === 'running' && '运行中'}
                    {result.status === 'success' && '成功'}
                    {result.status === 'error' && '失败'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {formatResult(result)}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {results.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">
                点击"运行所有测试"按钮开始性能测试
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}
