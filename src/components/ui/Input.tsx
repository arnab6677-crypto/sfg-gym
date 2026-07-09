'use client';

import React, { InputHTMLAttributes, forwardRef, useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import styles from './Input.module.css';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  fullWidth?: boolean;
}

function parseDateString(str: any): Date | null {
  if (!str) return null;
  if (typeof str === 'string' && str.includes('-')) {
    const [y, m, d] = str.split('-');
    if (y && m && d) {
      return new Date(parseInt(y, 10), parseInt(m, 10) - 1, parseInt(d, 10));
    }
  }
  const d = new Date(str);
  return isNaN(d.getTime()) ? null : d;
}

function formatDateString(date: Date | null): string {
  if (!date) return '';
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, fullWidth = true, className = '', ...props }, ref) => {
    
    // State for DatePicker
    const [dateValue, setDateValue] = useState<Date | null>(() => {
      return parseDateString(props.value || props.defaultValue);
    });

    useEffect(() => {
      if (props.value !== undefined) {
        setDateValue(parseDateString(props.value));
      }
    }, [props.value]);

    if (props.type === 'date') {
      return (
        <div className={`${styles.inputContainer} ${fullWidth ? styles.fullWidth : ''} ${className}`}>
          {label && <label className={styles.label}>{label}</label>}
          <DatePicker
            selected={dateValue}
            onChange={(date: Date | null) => {
              setDateValue(date);
              if (props.onChange) {
                props.onChange({
                  target: {
                    name: props.name,
                    value: formatDateString(date)
                  }
                } as any);
              }
            }}
            dateFormat="dd/MM/yyyy"
            className={`${styles.input} ${error ? styles.inputError : ''}`}
            placeholderText="dd/mm/yyyy"
            showMonthDropdown
            showYearDropdown
            dropdownMode="select"
          />
          <input type="hidden" name={props.name} value={formatDateString(dateValue)} />
          {error && <span className={styles.errorText}>{error}</span>}
        </div>
      );
    }

    return (
      <div className={`${styles.inputContainer} ${fullWidth ? styles.fullWidth : ''} ${className}`}>
        {label && <label className={styles.label}>{label}</label>}
        <input 
          ref={ref} 
          className={`${styles.input} ${error ? styles.inputError : ''}`} 
          {...props} 
        />
        {error && <span className={styles.errorText}>{error}</span>}
      </div>
    );
  }
);

Input.displayName = 'Input';
