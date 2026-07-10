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

      {/* PAGE 2: Terms and Conditions */}
      <div className={styles.termsPage}>
        <div className={styles.termsHeader}>
          <h2>{gymName} (SFG)</h2>
          <h3>Terms & Conditions</h3>
        </div>
        <div className={styles.termsBody}>
          <p className={styles.termsIntro}>To maintain a safe, clean, and disciplined training environment, every member must follow the rules below.</p>
          
          <ol className={styles.termsList}>
            <li>Re-rack all weights and equipment after completing your workout. Return dumbbells, plates, barbells, and other equipment to their designated places.</li>
            <li>Carry a gym towel during every workout and use it to maintain proper hygiene.</li>
            <li>Do not litter anywhere inside the gym. Dispose of bottles, tissues, wrappers, and other waste only in the dustbins provided.</li>
            <li>Do not enter the gym wearing outside or dirty shoes. Please use clean training shoes to help keep the gym clean.</li>
            <li>Do not lean or rack barbells, weight plates, or other equipment against the walls, as this damages the wall paint and gym property.</li>
            <li>Use respectful language at all times. Vulgar, abusive, or offensive language is strictly prohibited as it disturbs other members and creates an unhealthy environment.</li>
            <li><strong>Posing Room Policy (For Couples Only):</strong> Couples are welcome to use the posing room together; however, the door must remain unlocked at all times while inside. Locking the posing room door is strictly prohibited.</li>
            <li>The use of chalk is strictly prohibited inside the gym unless specifically permitted by gym management.</li>
            <li>Monthly membership holders must inform the gym in advance if they are unable to attend for an extended period. If a member remains absent for 2 consecutive months without prior notice or a valid reason, their membership will be terminated.</li>
            <li>Respect the gym, its staff, and fellow members. Help maintain a positive, disciplined, and motivating environment for everyone.</li>
          </ol>

          <h3 className={styles.penaltiesTitle}>Penalties</h3>
          <ul className={styles.penaltiesList}>
            <li>Violation of any of the above rules may result in a fine of ₹50 to ₹100, depending on the nature and frequency of the violation.</li>
            <li>Repeated violations or serious misconduct may lead to temporary suspension or permanent termination of membership without prior notice.</li>
            <li>The management reserves the right to take appropriate disciplinary action whenever necessary to maintain discipline and protect the gym environment.</li>
          </ul>

          <p className={styles.termsConclusion}>
            <strong>By taking membership at Strength Fusion Gym (SFG), every member agrees to follow all the above terms and conditions.</strong>
          </p>
        </div>
      </div>
    </div>
  );
}
