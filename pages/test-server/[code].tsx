'use client';

import { useRouter } from 'next/router';
import { useState } from 'react';

export default function TestServerSidePage() {
  const router = useRouter();
  const code = router.query.code as string;
  const [logs, setLogs] = useState<string[]>([
    `Code from router: ${code}`,
  ]);

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toISOString()}: ${message}`]);
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h1>Test Page - getServerSideProps</h1>
      <div style={{ marginBottom: '20px' }}>
        <strong>Props from Server:</strong>
        <ul>
          <li>code: {code}</li>
        </ul>
      </div>
      <div style={{ marginBottom: '20px' }}>
        <strong>Router Info:</strong>
        <ul>
          <li>isReady: {router.isReady ? 'true' : 'false'}</li>
          <li>pathname: {router.pathname}</li>
          <li>query: {JSON.stringify(router.query)}</li>
        </ul>
      </div>
      <div>
        <strong>Logs:</strong>
        <pre style={{ background: '#f0f0f0', padding: '10px' }}>
          {logs.map((log, i) => (
            <div key={i}>{log}</div>
          ))}
        </pre>
      </div>
    </div>
  );
}
