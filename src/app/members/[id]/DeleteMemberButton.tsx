'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Trash2 } from 'lucide-react';
import { deleteMember } from '../actions';

export function DeleteMemberButton({ memberId }: { memberId: string }) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    const confirmed = window.confirm("Are you sure you want to completely delete this member and their payment history? This action cannot be undone.");
    if (!confirmed) return;

    setIsDeleting(true);
    try {
      const result = await deleteMember(memberId);
      // deleteMember redirects on success. If it returns, it might be an error.
      if (result && !result.success) {
        alert("Error: " + result.error);
        setIsDeleting(false);
      }
    } catch (e: any) {
      alert("Error deleting member: " + e.message);
      setIsDeleting(false);
    }
  };

  return (
    <Button variant="danger" onClick={handleDelete} disabled={isDeleting}>
      <Trash2 size={18} /> {isDeleting ? 'Deleting...' : 'Delete'}
    </Button>
  );
}
