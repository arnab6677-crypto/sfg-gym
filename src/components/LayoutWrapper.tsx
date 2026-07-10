'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import styles from '@/app/layout.module.css';

export default function LayoutWrapper({ 
  sidebar, 
  topbar, 
  children 
}: { 
  sidebar: React.ReactNode, 
  topbar: React.ReactNode, 
  children: React.ReactNode 
}) {
  const pathname = usePathname();
  const isReceiptPage = pathname?.startsWith('/receipt');

  if (isReceiptPage) {
    return (
      <main style={{ width: '100%', minHeight: '100vh', backgroundColor: 'var(--color-bg-main)', margin: 0, padding: 0 }}>
        {children}
      </main>
    );
  }

  return (
    <>
      {sidebar}
      {topbar}
      <main className={styles.mainContent}>
        <div className={styles.pageContainer}>
          {children}
        </div>
      </main>
    </>
  );
}
