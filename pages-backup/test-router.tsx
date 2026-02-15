import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';

export default function TestPage() {
  const router = useRouter();
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toISOString()}: ${message}`]);
  };

  useEffect(() => {
    addLog(`Router isReady: ${router.isReady}`);
    addLog(`Router query: ${JSON.stringify(router.query)}`);
    addLog(`Router pathname: ${router.pathname}`);
  }, [router.isReady, router.query, router.pathname]);

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h1>Test Page - useRouter</h1>
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
