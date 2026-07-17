'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { addProduct, deleteProduct, recordSale } from './actions';
import { ShoppingCart, Plus, Trash2, Package } from 'lucide-react';
import styles from '../members/Members.module.css'; // Reusing table styles
import { useRouter } from 'next/navigation';

export default function StoreClient({ products, sales }: { products: any[], sales: any[] }) {
  const [isPending, setIsPending] = useState(false);
  const router = useRouter();

  async function handleAddProduct(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsPending(true);
    await addProduct(new FormData(e.currentTarget));
    e.currentTarget.reset();
    router.refresh();
    setIsPending(false);
  }

  async function handleRecordSale(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsPending(true);
    await recordSale(new FormData(e.currentTarget));
    e.currentTarget.reset();
    router.refresh();
    setIsPending(false);
  }

  async function handleDeleteProduct(id: string) {
    if (confirm('Delete this product?')) {
      setIsPending(true);
      await deleteProduct(id);
      router.refresh();
      setIsPending(false);
    }
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>
      
      {/* Record Sale Section */}
      <Card padding="lg" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShoppingCart size={24} color="var(--color-primary)" />
            Record a Sale
          </h2>
          <p style={{ color: 'var(--color-text-secondary)', marginTop: '4px' }}>Select a product and quantity sold.</p>
        </div>
        
        {products.length === 0 ? (
          <div style={{ padding: '24px', backgroundColor: 'var(--color-bg-secondary)', borderRadius: '8px', textAlign: 'center' }}>
            <p style={{ color: 'var(--color-text-secondary)' }}>Add products to the catalog first!</p>
          </div>
        ) : (
          <form onSubmit={handleRecordSale} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '14px', fontWeight: 500 }}>Select Product</label>
              <select name="productId" required style={{ padding: '10px 16px', borderRadius: '8px', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg-main)', color: 'var(--color-text-main)' }}>
                <option value="">-- Choose a Product --</option>
                {products.map(p => (
                  <option key={p.id} value={p.id}>{p.name} (₹{p.price})</option>
                ))}
              </select>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '14px', fontWeight: 500 }}>Quantity</label>
              <Input type="number" name="quantity" required min="1" defaultValue="1" />
            </div>
            
            <Button type="submit" variant="primary" disabled={isPending} style={{ width: '100%', marginTop: '8px' }}>
              <ShoppingCart size={18} /> Record Sale
            </Button>
          </form>
        )}
      </Card>

      {/* Product Catalog Section */}
      <Card padding="lg" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Package size={24} color="#10B981" />
            Product Catalog
          </h2>
          <p style={{ color: 'var(--color-text-secondary)', marginTop: '4px' }}>Manage energy drinks and supplements.</p>
        </div>
        
        <form onSubmit={handleAddProduct} style={{ display: 'flex', gap: '12px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '150px' }}>
            <Input placeholder="Product Name" name="name" required />
          </div>
          <div style={{ minWidth: '120px' }}>
            <select name="category" required style={{ width: '100%', padding: '10px 16px', borderRadius: '8px', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg-main)', color: 'var(--color-text-main)' }}>
              <option value="ENERGY_DRINK">Energy Drink</option>
              <option value="SUPPLEMENT">Supplement</option>
            </select>
          </div>
          <div style={{ width: '100px' }}>
            <Input type="number" placeholder="Price" name="price" required min="0" />
          </div>
          <Button type="submit" variant="primary" disabled={isPending}>
            <Plus size={18} /> Add
          </Button>
        </form>

        <div style={{ maxHeight: '300px', overflowY: 'auto', border: '1px solid var(--color-border)', borderRadius: '8px' }}>
          <table className={styles.table} style={{ margin: 0 }}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Category</th>
                <th>Price</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <tr><td colSpan={4} style={{ textAlign: 'center', color: 'var(--color-text-secondary)' }}>No products found</td></tr>
              ) : products.map(p => (
                <tr key={p.id}>
                  <td style={{ fontWeight: 500 }}>{p.name}</td>
                  <td>{p.category === 'ENERGY_DRINK' ? 'Energy Drink' : 'Supplement'}</td>
                  <td>₹{p.price}</td>
                  <td style={{ textAlign: 'right' }}>
                    <button onClick={() => handleDeleteProduct(p.id)} disabled={isPending} style={{ color: '#EF4444', background: 'none', border: 'none', cursor: 'pointer' }}>
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Sales History Table (Full Width) */}
      <Card padding="lg" style={{ gridColumn: '1 / -1' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '16px' }}>Recent Sales History</h2>
        <div style={{ overflowX: 'auto', border: '1px solid var(--color-border)', borderRadius: '8px' }}>
          <table className={styles.table} style={{ margin: 0 }}>
            <thead>
              <tr>
                <th>Date</th>
                <th>Product</th>
                <th>Category</th>
                <th>Quantity</th>
                <th>Total Amount</th>
              </tr>
            </thead>
            <tbody>
              {sales.length === 0 ? (
                <tr><td colSpan={5} style={{ textAlign: 'center', color: 'var(--color-text-secondary)' }}>No sales recorded yet</td></tr>
              ) : sales.map(s => (
                <tr key={s.id}>
                  <td>{new Date(s.date).toLocaleDateString()} {new Date(s.date).toLocaleTimeString()}</td>
                  <td style={{ fontWeight: 500 }}>{s.productName}</td>
                  <td>{s.category === 'ENERGY_DRINK' ? 'Energy Drink' : 'Supplement'}</td>
                  <td>{s.quantity}</td>
                  <td style={{ fontWeight: 600, color: '#10B981' }}>₹{s.totalAmount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      
    </div>
  );
}
