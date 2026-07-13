'use client';

import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { formatDate } from '@/lib/formatDate';
import { collectFee } from './actions';
import { useRouter } from 'next/navigation';
import styles from '../admission/Admission.module.css'; // Reusing admission form styles
import { CustomDatePicker } from '@/components/ui/CustomDatePicker';

interface Plan { id: string; name: string; price: number; }
interface Member { 
  id: string; 
  fullName: string; 
  regNumber: string;
  phone: string;
  membershipType?: string | null;
  monthlyFeeAmount?: number | null;
  nextDueDate?: Date | null;
  ptPlan?: string | null;
  assignedTrainer?: string | null;
  payments: { paymentDate: Date }[];
}

export default function FeeForm({ plans, members, initialMemberId, trainers, ptPlans }: { plans: Plan[], members: Member[], initialMemberId?: string, trainers: string[], ptPlans: string[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [planId, setPlanId] = useState(plans[0]?.id || '');
  const [amount, setAmount] = useState<number | string>('');
  const [discount, setDiscount] = useState<number | string>('');
  const [amountPaid, setAmountPaid] = useState<number | string>('');
  const [promisedDate, setPromisedDate] = useState<Date | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [memberId, setMemberId] = useState(initialMemberId || (members.length > 0 ? members[0].id : ''));
  
  const [ptPlan, setPtPlan] = useState<string>('None');
  const [ptFee, setPtFee] = useState<number | string>('0');
  const [assignedTrainer, setAssignedTrainer] = useState<string>('');

  const selectedMember = members.find(m => m.id === memberId);

  // Sync initial PT options when member changes
  useEffect(() => {
    if (selectedMember) {
      setPtPlan(selectedMember.ptPlan || 'None');
      setAssignedTrainer(selectedMember.assignedTrainer || '');
    }
  }, [selectedMember]);
  
  // Payment calculations
  // ptFee is manually entered since ptPlans are dynamic strings
  const finalAmount = (Number(amount) || 0) + (Number(ptFee) || 0) - (Number(discount) || 0);

  // Sync amountPaid to finalAmount by default
  useEffect(() => {
    setAmountPaid(finalAmount);
  }, [finalAmount]);

  const receiptNumber = 'Auto-generated';

  useEffect(() => {
    if (selectedMember) {
      if (selectedMember.membershipType === 'Admission + Monthly Membership' || selectedMember.membershipType === 'Monthly Membership (Without Admission)') {
        const monthlyPlan = plans.find(p => p.name === selectedMember.membershipType);
        if (monthlyPlan) {
          setPlanId(monthlyPlan.id);
          setAmount(selectedMember.monthlyFeeAmount || monthlyPlan.price);
        }
      } else {
        const defaultPlan = plans[0];
        setPlanId(defaultPlan?.id || '');
        setAmount(defaultPlan?.price || 0);
      }
    }
  }, [selectedMember, plans]);

  const handlePlanChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = e.target.value;
    setPlanId(selectedId);
    const selectedPlan = plans.find(p => p.id === selectedId);
    if (selectedPlan) {
      setAmount(selectedPlan.price);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!memberId) {
      setError('Please select a member.');
      return;
    }
    
    setLoading(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    formData.append('memberId', memberId);
    if (!formData.has('amount')) formData.append('amount', (Number(amount) || 0).toString());
    formData.append('finalAmount', finalAmount.toString());
    
    // Add amount paid
    if (!formData.has('amountPaid')) formData.append('amountPaid', (Number(amountPaid) || 0).toString());
    if (promisedDate && Number(amountPaid) < finalAmount) {
      formData.append('promisedDate', promisedDate.toISOString());
    }
    formData.append('ptPlan', ptPlan);
    formData.append('ptFee', ptFee.toString());
    if (assignedTrainer) formData.append('assignedTrainer', assignedTrainer);

    const result = await collectFee(formData);
    
    if (result.success) {
      const selectedPlan = plans.find(p => p.id === planId);
      
      // WhatsApp Integration
      const phoneRaw = selectedMember?.phone || '';
      const phone = phoneRaw.replace(/\D/g, '');
      const message = `Hi ${selectedMember?.fullName},\n\nYour fee payment at STRENGTH FUSION GYM was successful! 💪\n\nAmount Paid: ₹${finalAmount}\nMembership: ${selectedPlan?.name}\nReceipt: ${result.receiptNumber || 'N/A'}\n\n📄 *View and download your official digital receipt:* \nhttps://sfg-gym-website.vercel.app/receipt/${result.receiptNumber}\n\nThank you for choosing SFG!`;
      
      const waUrl = `https://wa.me/91${phone}?text=${encodeURIComponent(message)}`;
      
      if (window.confirm(`Fee collected successfully!\n\nDo you want to send the receipt to their WhatsApp now?`)) {
        window.open(waUrl, '_blank');
      }
      
      router.push('/history');
    } else {
      setError(result.error || 'Failed to process fee.');
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      {error && <div className={styles.errorBanner}>{error}</div>}
      
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Select Member</h3>
        <div className={styles.grid}>
          <div className={styles.inputGroup} style={{ gridColumn: '1 / -1' }}>
            <Input 
              label="Search Member (Name, Phone, ID)" 
              name="searchDummy"
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
              placeholder="Start typing to filter the list below..." 
            />
          </div>
          <div className={styles.inputGroup} style={{ gridColumn: '1 / -1' }}>
            <label className={styles.label}>Member *</label>
            <select value={memberId} onChange={(e) => setMemberId(e.target.value)} className={styles.select} required>
              <option value="" disabled>-- Select a member --</option>
              {members.filter(m => 
                m.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                m.phone.includes(searchTerm) ||
                m.regNumber.toLowerCase().includes(searchTerm.toLowerCase())
              ).map(m => (
                <option key={m.id} value={m.id}>{m.regNumber} - {m.fullName} ({m.phone})</option>
              ))}
            </select>
          </div>
        </div>
      </div>


      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Personal Training (Optional)</h3>
        <div className={styles.grid}>
          <div className={styles.inputGroup}>
            <label className={styles.label}>PT Plan</label>
            <select name="ptPlanDummy" value={ptPlan} onChange={(e) => setPtPlan(e.target.value)} className={styles.select}>
              {ptPlans.map(opt => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
          {ptPlan !== 'None' && (
            <>
              <div className={styles.inputGroup}>
                <label className={styles.label}>Assigned Trainer Name *</label>
                <select name="assignedTrainerDummy" value={assignedTrainer} onChange={(e) => setAssignedTrainer(e.target.value)} className={styles.select} required>
                  <option value="">Select Trainer</option>
                  {trainers.map(trainer => (
                    <option key={trainer} value={trainer}>{trainer}</option>
                  ))}
                </select>
              </div>
              <Input label="PT Fee (₹)" type="number" name="ptFeeDummy" value={ptFee} onChange={(e) => setPtFee(e.target.value)} required />
            </>
          )}
        </div>
        
        <h3 className={styles.sectionTitle}>Payment Details</h3>
        <div className={styles.grid}>
          <div className={styles.inputGroup}>
            <label className={styles.label}>Membership Plan *</label>
            <select name="planId" value={planId} onChange={handlePlanChange} className={styles.select} required>
              {plans.map(plan => (
                <option key={plan.id} value={plan.id}>{plan.name} (₹{plan.price})</option>
              ))}
            </select>
          </div>
          <Input label="Package Amount (₹)" type="number" name="amount" value={amount} onChange={(e) => setAmount(e.target.value)} />
          <Input label="Discount (₹)" type="number" name="discount" value={discount} onChange={(e) => setDiscount(e.target.value)} />
          <Input label="Final Amount (₹)" type="number" value={finalAmount} readOnly className={styles.highlightInput} />
          
          <Input label="Amount Paid Now (₹)" type="number" name="amountPaid" value={amountPaid} onChange={(e) => setAmountPaid(e.target.value)} className={styles.highlightInput} style={{ borderColor: Number(amountPaid) < finalAmount ? '#F59E0B' : undefined }} />
          
          {Number(amountPaid) < finalAmount && (
            <div className={styles.inputGroup}>
              <label className={styles.label} style={{ color: '#F59E0B' }}>Promised Payment Date</label>
              <CustomDatePicker selected={promisedDate} onChange={(date) => setPromisedDate(date)} name="promisedDateDummy" />
              <p style={{ fontSize: '12px', color: '#B45309', marginTop: '4px' }}>
                When will they pay the remaining balance?
              </p>
            </div>
          )}

          <div className={styles.inputGroup}>
            <label className={styles.label}>Payment Method *</label>
            <select name="paymentMethod" className={styles.select} required>
              <option value="CASH">Cash</option>
              <option value="UPI">UPI</option>
              <option value="CARD">Card</option>
            </select>
          </div>
          <Input label="Receipt Number" value={receiptNumber} readOnly className={styles.readOnly} />
        </div>
      </div>

      <div className={styles.actions}>
        <Button type="button" variant="secondary" onClick={() => router.push('/')}>Cancel</Button>
        <Button type="submit" disabled={loading || !memberId}>
          {loading ? 'Processing...' : 'Collect Fee'}
        </Button>
      </div>
    </form>
  );
}
