'use client';

import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { CustomDatePicker } from '@/components/ui/CustomDatePicker';
import { createAdmission } from './actions';
import { useRouter } from 'next/navigation';
import styles from './Admission.module.css';

interface Plan {
  id: string;
  name: string;
  price: number;
}

export default function AdmissionForm({ plans, defaultAdmissionFee, trainers, ptPlans }: { plans: Plan[], defaultAdmissionFee: number, trainers: string[], ptPlans: string[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Payment calculation state
  const [planId, setPlanId] = useState(plans[0]?.id || '');
  const [amount, setAmount] = useState<number | string>('');
  const [discount, setDiscount] = useState<number | string>('');
  const [admissionFee, setAdmissionFee] = useState<number | string>('2000');
  const [amountPaid, setAmountPaid] = useState<number | string>('');
  const [promisedDate, setPromisedDate] = useState<Date | null>(null);
  const [joiningDate, setJoiningDate] = useState<Date | null>(new Date());
  const [customNextDueDate, setCustomNextDueDate] = useState<Date | null>(null);
  
  // PT State
  const [ptPlan, setPtPlan] = useState<string>('None');
  const [ptFee, setPtFee] = useState<number | string>('0');
  const [assignedTrainer, setAssignedTrainer] = useState<string>('');
  
  const [amountReadOnly, setAmountReadOnly] = useState(false);
  const [admissionReadOnly, setAdmissionReadOnly] = useState(false);
  
  useEffect(() => {
    const selectedPlan = plans.find(p => p.id === planId);
    if (!selectedPlan) return;

    const name = selectedPlan.name;
    
    if (name === 'Admission + Monthly Membership') {
      setAmount(800);
      setAdmissionFee(2000);
      setAmountReadOnly(true);
      setAdmissionReadOnly(true);
    } else if (name === 'Monthly Membership (Without Admission)') {
      setAmount(1400);
      setAdmissionFee(0);
      setAmountReadOnly(false);
      setAdmissionReadOnly(true);
    } else if (name === 'Daily Pass') {
      setAmount(selectedPlan.price);
      setAdmissionFee(0);
      setAmountReadOnly(false);
      setAdmissionReadOnly(true);
    } else {
      // Quarterly, Half-Yearly, Yearly
      setAmount(selectedPlan.price);
      setAdmissionFee(0); // Defaults to 0, but user can override
      setAmountReadOnly(false);
      setAdmissionReadOnly(false);
    }
  }, [planId, plans]);
  
  // Payment calculations
  // ptFee is now manually controlled since ptPlans are dynamic strings
  const finalAmount = (Number(amount) || 0) + (Number(admissionFee) || 0) + (Number(ptFee) || 0) - (Number(discount) || 0);

  // Sync amountPaid to finalAmount by default
  useEffect(() => {
    setAmountPaid(finalAmount);
  }, [finalAmount]);

  const receiptNumber = 'Auto-generated';

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
    setLoading(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    formData.append('finalAmount', finalAmount.toString());
    
    // In case inputs are hidden/disabled, append state values explicitly just in case
    if (!formData.has('admissionFee')) formData.append('admissionFee', (Number(admissionFee) || 0).toString());
    if (!formData.has('amount')) formData.append('amount', (Number(amount) || 0).toString());
    
    // Add amount paid and PT
    formData.append('amountPaid', amountPaid.toString());
    if (promisedDate && Number(amountPaid) < finalAmount) {
      formData.append('promisedDate', promisedDate.toISOString());
    }
    formData.append('ptPlan', ptPlan);
    formData.append('ptFee', ptFee.toString());

    
    // Add date formatting explicitly
    if (joiningDate) {
      formData.set('joiningDate', joiningDate.toISOString());
    }
    if (customNextDueDate) {
      formData.set('customNextDueDate', customNextDueDate.toISOString());
    }

    const result = await createAdmission(formData);
    
    if (result.success) {
      const selectedPlan = plans.find(p => p.id === planId);
      const phoneRaw = formData.get('phone') as string;
      const phone = phoneRaw.replace(/\D/g, '');
      const message = `🏋️‍♂️ Welcome to STRENGTH FUSION GYM (SFG)! 💙

Hello ${formData.get('fullName')},

Welcome to the Strength Fusion Gym (SFG) Family! 💪

Your admission is successful!
*Member ID:* ${result.regNumber}
*Membership:* ${selectedPlan?.name}
*Amount Paid:* ₹${finalAmount}
*Receipt No:* ${result.receiptNumber || 'N/A'}

📄 *View and download your official digital receipt:* 
https://sfg-gym-website.vercel.app/receipt/${result.receiptNumber}

We're excited to have you join us on your fitness journey. Whether your goal is to build muscle, lose weight, improve endurance, or simply stay fit, our team is here to support and motivate you every step of the way.

📍 Gym Address:
National Highway, Ramkrishna Sarani, Silchar, Assam – 788005

📞 Contact: +91 88226 34752

📋 Gym Rules & Guidelines

To ensure a clean, safe, and motivating environment for everyone, please follow these rules:

✅ Re-rack all weights and equipment after use.

✅ Carry a gym towel during every workout.

✅ Keep the gym clean. Please use the dustbins provided.

✅ Wear clean training shoes only. Outside/dirty shoes are not allowed.

✅ Do not lean barbells, weight plates, or equipment against the walls.

✅ Maintain respectful behavior. Abusive or offensive language is strictly prohibited.

✅ Posing Room Policy (Couples Only):
The posing room may be used by couples together, but the door must remain unlocked at all times.

✅ Chalk is not permitted unless approved by gym management.

✅ Monthly members must inform the gym in advance if they will be absent for an extended period. Membership may be terminated after 2 consecutive months of absence without prior notice.

✅ Respect the gym, the trainers, the staff, and fellow members to help maintain a positive training environment.

⚠️ Penalties

• Rule violations may result in a ₹50–₹100 fine, depending on the severity.

• Repeated violations or serious misconduct may lead to temporary suspension or permanent termination of membership without prior notice.

• Gym management reserves the right to take appropriate disciplinary action whenever necessary.

💙 Let's Grow Stronger Together!

Thank you for choosing Strength Fusion Gym (SFG).

We wish you success in achieving your fitness goals and look forward to seeing your progress every day.

"Discipline. Dedication. Strength."

— Team STRENGTH FUSION GYM (SFG) 💪🔥`;
      
      const waUrl = `https://wa.me/91${phone}?text=${encodeURIComponent(message)}`;
      
      if (window.confirm(`Admission successful! Member ID: ${result.regNumber}\n\nDo you want to send the invoice to their WhatsApp now?`)) {
        window.open(waUrl, '_blank');
      }
      
      router.push('/members');
    } else {
      setError(result.error || 'Failed to create admission');
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      {error && <div className={styles.errorBanner}>{error}</div>}
      
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Personal Details</h3>
        <div className={styles.grid}>
          <Input label="Full Name *" name="fullName" required />
          <Input label="Phone (WhatsApp) *" type="tel" name="phone" required />
          <Input label="Age" type="number" name="age" />
          <div className={styles.inputGroup}>
            <label className={styles.label}>Gender *</label>
            <select name="gender" className={styles.select} required>
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
              <option value="OTHER">Other</option>
            </select>
          </div>
          <div className={styles.inputGroup}>
            <label className={styles.label}>Joining Date *</label>
            <CustomDatePicker selected={joiningDate} onChange={(date) => setJoiningDate(date)} name="joiningDateDummy" />
          </div>
          <div className={styles.inputGroup}>
            <label className={styles.label}>Custom Next Due Date (Optional)</label>
            <CustomDatePicker selected={customNextDueDate} onChange={(date) => setCustomNextDueDate(date)} name="customNextDueDateDummy" />
            <p style={{ fontSize: '11px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>Use this for old members to manually set when their next payment is due.</p>
          </div>
          <Input label="Address" name="address" className={styles.fullSpan} />
          <Input label="Emergency Contact" name="emergencyContact" className={styles.fullSpan} />
        </div>
      </div>

      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Membership Details</h3>
        <div className={styles.grid}>
          <div className={styles.inputGroup}>
            <label className={styles.label}>Membership Type (Package) *</label>
            <select name="planId" value={planId} onChange={handlePlanChange} className={styles.select} required>
              {plans.map(plan => {
                const displayPrice = plan.name === 'Admission + Monthly Membership' ? 2800 : plan.price;
                return <option key={plan.id} value={plan.id}>{plan.name} (₹{displayPrice})</option>
              })}
            </select>
          </div>
        </div>

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
                <select name="assignedTrainer" value={assignedTrainer} onChange={(e) => setAssignedTrainer(e.target.value)} className={styles.select} required>
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
      </div>

      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Payment Details</h3>
        <div className={styles.grid}>
          <Input label="Package Amount (₹)" type="number" name="amount" value={amount} onChange={(e) => setAmount(e.target.value)} readOnly={amountReadOnly} className={amountReadOnly ? styles.readOnly : ''} />
          {admissionReadOnly ? (
            <div style={{ display: 'none' }}>
              <input type="hidden" name="admissionFee" value={admissionFee} />
            </div>
          ) : (
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
              <option value="ONLINE">Online</option>
            </select>
          </div>
          <Input label="Receipt Number" value={receiptNumber} readOnly className={styles.readOnly} />
        </div>
      </div>



      <div className={styles.actions}>
        <Button type="button" variant="secondary" onClick={() => router.push('/')}>Cancel</Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Processing...' : 'Complete Admission'}
        </Button>
      </div>
    </form>
  );
}
