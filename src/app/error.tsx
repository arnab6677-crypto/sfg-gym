'use client';
import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("GLOBAL ERROR BOUNDARY CAUGHT ERROR:", error);
  }, [error]);

  return (
    <div style={{ padding: '40px', backgroundColor: '#1e1e2d', color: '#fff', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      <h2 style={{ color: '#ff5555', fontSize: '24px', marginBottom: '20px' }}>Application Error</h2>
      <p style={{ fontSize: '16px', marginBottom: '20px' }}>The application encountered an unexpected error.</p>
      
      <div style={{ backgroundColor: '#2a2a35', padding: '20px', borderRadius: '8px', overflowX: 'auto', marginBottom: '20px' }}>
        <p style={{ color: '#ffaaaa', fontWeight: 'bold', marginBottom: '10px' }}>Error Name: {error.name}</p>
        <p style={{ color: '#ffcccc', marginBottom: '10px' }}>Message: {error.message}</p>
        <pre style={{ color: '#aaa', fontSize: '12px', whiteSpace: 'pre-wrap' }}>
          {error.stack}
        </pre>
      </div>
      
      <button
        onClick={() => reset()}
        style={{ padding: '10px 20px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
      >
        Try again
      </button>
    </div>
  );
}
