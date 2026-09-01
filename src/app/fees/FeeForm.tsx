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
  admissionFeePaid?: boolean;
  payments: { paymentDate: Date }[];
}

export default function FeeForm({ plans, members, initialMemberId, trainers, ptPlans, defaultAdmissionFee }: { plans: Plan[], members: Member[], initialMemberId?: string, trainers: string[], ptPlans: string[], defaultAdmissionFee: number }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [planId, setPlanId] = useState(plans[0]?.id || '');
  const [quantity, setQuantity] = useState<number | string>(1);
  const [amount, setAmount] = useState<number | string>('');
  const [admissionFee, setAdmissionFee] = useState<number | string>('0');
  const [discount, setDiscount] = useState<number | string>('');
  const [amountPaid, setAmountPaid] = useState<number | string>('');
  const [promisedDate, setPromisedDate] = useState<Date | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [memberId, setMemberId] = useState(initialMemberId || (members.length > 0 ? members[0].id : ''));
  
  const [ptPlan, setPtPlan] = useState<string>('None');
  const [ptFee, setPtFee] = useState<number | string>('0');
  const [assignedTrainer, setAssignedTrainer] = useState<string>('');
  
  const [nextDueDateOverride, setNextDueDateOverride] = useState<Date>(new Date());

  const selectedMember = members.find(m => m.id === memberId);

  // Sync initial PT options and default due date
  useEffect(() => {
    if (selectedMember) {
      setPtPlan(selectedMember.ptPlan || 'None');
      setAssignedTrainer(selectedMember.assignedTrainer || '');
      
      const latestPayment = selectedMember.payments && selectedMember.payments.length > 0 ? selectedMember.payments[0] : null;
      const baseDate = latestPayment ? new Date(latestPayment.paymentDate) /* fallback */ : new Date(selectedMember.nextDueDate || new Date());
      // The member list only fetches paymentDate currently. We actually rely on the backend for true accuracy if they don't override.
      // But we can approximate it for the UI picker. 
      // Actually, if we have selectedMember.nextDueDate, we should use that as the base date.
      const accurateBaseDate = new Date(selectedMember.nextDueDate || new Date());
      
      const defaultNextDue = new Date(accurateBaseDate);
      const q = Number(quantity) || 1;
      const selectedPlan = plans.find(p => p.id === planId);
      const days = selectedPlan ? selectedPlan.durationDays : 30;
      defaultNextDue.setDate(defaultNextDue.getDate() + (days * q));
      
      setNextDueDateOverride(defaultNextDue);
    }
  }, [selectedMember, planId, quantity, plans]);
  
  // Payment calculations
  // ptFee is manually entered since ptPlans are dynamic strings
  const finalAmount = (Number(amount) || 0) + (Number(admissionFee) || 0) + (Number(ptFee) || 0) - (Number(discount) || 0);

  // Sync amountPaid to finalAmount by default
  useEffect(() => {
    setAmountPaid(finalAmount);
  }, [finalAmount]);

  const receiptNumber = 'Auto-generated';

  useEffect(() => {
    if (selectedMember) {
      const q = Number(quantity) || 1;
      if (selectedMember.membershipType === 'Admission + Monthly Membership' || selectedMember.membershipType === 'Monthly Membership (Without Admission)') {
        const monthlyPlan = plans.find(p => p.name === selectedMember.membershipType);
        if (monthlyPlan) {
          setPlanId(monthlyPlan.id);
          setAmount((selectedMember.monthlyFeeAmount || monthlyPlan.price) * q);
          if (selectedMember.membershipType === 'Admission + Monthly Membership' && !selectedMember.admissionFeePaid) {
            setAdmissionFee(defaultAdmissionFee.toString());
          } else {
            setAdmissionFee('0');
          }
        }
      } else {
        const defaultPlan = plans[0];
        setPlanId(defaultPlan?.id || '');
        setAmount((defaultPlan?.price || 0) * q);
        setAdmissionFee('0');
      }
    }
  }, [selectedMember, plans]);

  const handlePlanChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = e.target.value;
    setPlanId(selectedId);
    const selectedPlan = plans.find(p => p.id === selectedId);
    const q = Number(quantity) || 1;
    if (selectedPlan) {
      if (selectedPlan.name === 'Admission + Monthly Membership') {
        setAmount(selectedPlan.price * q);
        setAdmissionFee(defaultAdmissionFee);
      } else {
        setAmount(selectedPlan.price * q);
        setAdmissionFee(0);
      }
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
    formData.append('quantity', (Number(quantity) || 1).toString());
    if (!formData.has('amount')) formData.append('amount', (Number(amount) || 0).toString());
    if (!formData.has('admissionFee')) formData.append('admissionFee', (Number(admissionFee) || 0).toString());
    formData.append('finalAmount', finalAmount.toString());
    
    // Add amount paid
    if (!formData.has('amountPaid')) formData.append('amountPaid', (Number(amountPaid) || 0).toString());
    if (promisedDate && Number(amountPaid) < finalAmount) {
      formData.append('promisedDate', promisedDate.toISOString());
    }
    formData.append('ptPlan', ptPlan);
    formData.append('ptFee', ptFee.toString());
    if (assignedTrainer) formData.append('assignedTrainer', assignedTrainer);
    formData.append('nextDueDateOverride', nextDueDateOverride.toISOString());

    const result = await collectFee(formData);
    
    if (result.success) {
      const selectedPlan = plans.find(p => p.id === planId);
      
      // WhatsApp Integration
      const phoneRaw = selectedMember?.phone || '';
      const phone = phoneRaw.replace(/\D/g, '');
      const getDisplayPlanName = (name: string | undefined) => {
        if (!name) return 'Membership';
        if (name.includes('Monthly')) return 'Monthly Membership';
        return name;
      };
      const planName = getDisplayPlanName(selectedPlan?.name);

      const amountPaidNum = Number(amountPaid) || 0;
      let paymentDetailsText = `Amount Paid: ₹${finalAmount}`;
      
      if (amountPaidNum < finalAmount) {
        paymentDetailsText = `Remaining Balance: ₹${finalAmount - amountPaidNum}`;
      }

      const message = `Hi ${selectedMember?.fullName},\n\nYour fee payment at STRENGTH FUSION GYM was successful! 💪\n\n${paymentDetailsText}\nMembership: ${planName}\nReceipt: ${result.receiptNumber || 'N/A'}\n\n📄 *View and download your official digital receipt:* \nhttps://sfg-gym-website.vercel.app/receipt/${result.receiptNumber}\n\nThank you for choosing SFG!`;
      
      const waUrl = `https://wa.me/91${phone}?text=${encodeURIComponent(message)}`;
      
      if (window.confirm(`Fee collected successfully!\n\nDo you want to send the receipt to their WhatsApp now?`)) {
        const newWindow = window.open(waUrl, '_blank');
        
        // Browsers block popups if they happen after an async 'await' delay.
        // If it was blocked, newWindow will be null. Fallback to redirecting the current tab.
        if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
          window.location.href = waUrl;
        } else {
          router.push('/history');
        }
      } else {
        router.push('/history');
      }
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
          <div className={styles.inputGroup} style={{ gridColumn: '1 / -1', backgroundColor: '#F0FDF4', padding: '16px', borderRadius: '8px', border: '1px solid #BBF7D0', marginBottom: '12px' }}>
            <label className={styles.label} style={{ color: '#166534', marginBottom: '8px' }}>New Due Date (After Payment) *</label>
            <CustomDatePicker selected={nextDueDateOverride} onChange={(date) => setNextDueDateOverride(date || new Date())} name="nextDueDateOverrideDummy" />
            <p style={{ fontSize: '13px', color: '#166534', marginTop: '8px' }}>
              This is mathematically calculated to keep the same day every month. If they took a gap month and this date is in the past, simply click to change it to the correct future date!
            </p>
          </div>
        </div>

        <h3 className={styles.sectionTitle} style={{ marginTop: '24px' }}>Amount Collection</h3>
        <div className={styles.grid}>
          <div className={styles.inputGroup}>
            <label className={styles.label}>Membership Plan *</label>
            <select name="planId" value={planId} onChange={handlePlanChange} className={styles.select} required>
              {plans.map(plan => {
                const displayPrice = plan.name === 'Admission + Monthly Membership' ? (plan.price + defaultAdmissionFee) : plan.price;
                return <option key={plan.id} value={plan.id}>{plan.name} (₹{displayPrice})</option>
              })}
            </select>
          </div>
          <div className={styles.inputGroup}>
            <label className={styles.label}>Duration (Months/Cycles)</label>
            <input 
              type="number" 
              name="quantityDummy" 
              min="1"
              value={quantity} 
              onChange={(e) => {
                const qStr = e.target.value;
                setQuantity(qStr);
                const q = parseInt(qStr) || 1;
                const selectedPlan = plans.find(p => p.id === planId);
                if (selectedPlan) {
                  const basePrice = selectedPlan.price;
                  setAmount(basePrice * q);
                }
              }} 
              style={{ width: '100%', padding: '10px 16px', borderRadius: 'var(--border-radius-md)', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg-secondary)', color: 'var(--color-text-main)' }}
            />
          </div>
          <Input label="Package Amount (₹)" type="number" name="amount" value={amount} onChange={(e) => setAmount(e.target.value)} />
          {Number(admissionFee) > 0 && (
            <Input label="Admission Fee (₹)" type="number" name="admissionFee" value={admissionFee} onChange={(e) => setAdmissionFee(e.target.value)} />
          )}
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
