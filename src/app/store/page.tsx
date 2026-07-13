import prisma from '@/lib/prisma';
import StoreClient from './StoreClient';

export const metadata = {
  title: 'Store & Supplements | SFG',
};

export default async function StorePage() {
  const products = await prisma.product.findMany({
    orderBy: { createdAt: 'desc' }
  });

  const sales = await prisma.storeSale.findMany({
    orderBy: { date: 'desc' },
    take: 50
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h1 style={{ fontSize: '28px', fontWeight: 700, color: 'var(--color-text-main)' }}>Store & Supplements</h1>
        <p style={{ color: 'var(--color-text-secondary)', marginTop: '4px' }}>Manage inventory and record sales for energy drinks and gym supplements.</p>
      </div>

      <StoreClient products={products} sales={sales} />
    </div>
  );
}
