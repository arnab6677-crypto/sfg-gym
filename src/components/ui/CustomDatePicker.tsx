'use client';

import React from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

interface CustomDatePickerProps {
  selected: Date | null;
  onChange: (date: Date | null) => void;
  name?: string;
  required?: boolean;
}

export function CustomDatePicker({ selected, onChange, name, required }: CustomDatePickerProps) {
  return (
    <div style={{ width: '100%' }}>
      <DatePicker
        selected={selected}
        onChange={onChange}
        dateFormat="dd/MM/yyyy"
        placeholderText="DD/MM/yyyy"
        name={name}
        required={required}
        className="react-datepicker-custom"
      />
    </div>
  );
}
