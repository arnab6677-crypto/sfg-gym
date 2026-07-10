'use client';

import React from 'react';
import { Download } from 'lucide-react';
import { formatDate } from '@/lib/formatDate';
import styles from './Receipt.module.css';

export default function ReceiptClient({ payment, gymName }: { payment: any, gymName: string }) {
  const handleDownload = () => {
    window.print();
  };

  return (
    <div className={styles.container}>
      <div className={styles.invoice}>
        <div className={styles.header}>
          <h1 className={styles.gymName}>{gymName}</h1>
          <p className={styles.receiptTitle}>Official Payment Receipt</p>
        </div>

        <div className={styles.body}>
          <div className={styles.row}>
            <div className={styles.col}>
              <span className={styles.label}>Receipt Number</span>
              <span className={styles.value}>{payment.receiptNumber}</span>
            </div>
            <div className={styles.col} style={{ alignItems: 'flex-end' }}>
              <span className={styles.label}>Date</span>
              <span className={styles.value}>{formatDate(payment.paymentDate)}</span>
            </div>
          </div>

          <div className={styles.row}>
            <div className={styles.col}>
              <span className={styles.label}>Billed To</span>
              <span className={styles.value}>{payment.member.fullName}</span>
              <span style={{ fontSize: '13px', color: '#4b5563', marginTop: '4px' }}>Member ID: {payment.member.regNumber}</span>
              <span style={{ fontSize: '13px', color: '#4b5563' }}>Phone: {payment.member.phone}</span>
            </div>
          </div>

          <table className={styles.table}>
            <thead>
              <tr>
                <th>Description</th>
                <th className={styles.right}>Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{payment.plan.name}</td>
                <td className={styles.right}>₹{payment.amount}</td>
              </tr>
              {payment.admissionFee > 0 && (
                <tr>
                  <td>Admission Fee</td>
                  <td className={styles.right}>₹{payment.admissionFee}</td>
                </tr>
              )}
              {payment.ptFee > 0 && (
                <tr>
                  <td>Personal Training ({payment.ptPlan})</td>
                  <td className={styles.right}>₹{payment.ptFee}</td>
                </tr>
              )}
              {payment.discount > 0 && (
                <tr>
                  <td style={{ color: '#ef4444' }}>Discount Applied</td>
                  <td className={styles.right} style={{ color: '#ef4444' }}>-₹{payment.discount}</td>
                </tr>
              )}
              <tr className={styles.totalRow}>
                <td>Total Amount</td>
                <td className={`${styles.right} ${styles.totalAmount}`}>₹{payment.finalAmount}</td>
              </tr>
              {payment.balanceDue > 0 && (
                <tr>
                  <td style={{ color: '#f59e0b', fontSize: '14px', paddingTop: '16px' }}>Balance Due (Promised: {formatDate(payment.promisedDate)})</td>
                  <td className={styles.right} style={{ color: '#f59e0b', fontSize: '14px', paddingTop: '16px' }}>₹{payment.balanceDue}</td>
                </tr>
              )}
              <tr>
                <td style={{ color: '#10b981', fontSize: '14px', fontWeight: 600 }}>Amount Paid ({payment.paymentMethod})</td>
                <td className={styles.right} style={{ color: '#10b981', fontSize: '14px', fontWeight: 600 }}>₹{payment.amountPaid}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className={styles.footer}>
          <p className={styles.footerText}>Thank you for choosing {gymName}.<br/>Keep pushing your limits!</p>
          <div className={styles.actions}>
            <button className={styles.downloadBtn} onClick={handleDownload}>
              <Download size={18} /> Download PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
