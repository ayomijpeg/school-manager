// src/lib/utils.ts
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// --- FIX: Import the new constant structure ---
import { CONFIG_DEFAULTS, DEFAULT_GRADE_SCALE } from './constant';

// --- FIX: Map old names to new structure for backward compatibility ---
const CURRENCY = CONFIG_DEFAULTS.CURRENCY;
const GRADE_SCALE = DEFAULT_GRADE_SCALE;

// ==================== CLASSNAME UTILITY ====================
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ==================== DATE UTILITIES ====================
export function formatDate(date: string | Date, format: string = 'MMM DD, YYYY'): string {
  if (!date) return '-';
  const d = new Date(date);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  const day = d.getDate().toString().padStart(2, '0');
  const month = months[d.getMonth()];
  const year = d.getFullYear();
  const hours = d.getHours().toString().padStart(2, '0');
  const minutes = d.getMinutes().toString().padStart(2, '0');
  
  if (format === 'YYYY-MM-DD') {
    return `${year}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${day}`;
  }
  
  if (format === 'MMM DD, YYYY HH:mm') {
    return `${month} ${day}, ${year} ${hours}:${minutes}`;
  }
  
  return `${month} ${day}, ${year}`;
}

export function formatTime(time: string): string {
  if (!time) return '';
  const [hours, minutes] = time.split(':');
  const h = parseInt(hours);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const displayHour = h % 12 || 12;
  return `${displayHour}:${minutes} ${ampm}`;
}

export function getToday(): string {
  return formatDate(new Date(), 'YYYY-MM-DD');
}

export function isDatePast(date: string): boolean {
  return new Date(date) < new Date();
}

export function getDaysDifference(date1: string, date2: string): number {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  const diffTime = Math.abs(d2.getTime() - d1.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

// ==================== CURRENCY UTILITIES ====================
export function formatCurrency(amount: number | string | undefined | null) {
  // 1. Safety Check: Convert to number, default to 0 if invalid
  const value = Number(amount) || 0;

  // 2. Use Native International Formatting (Reliable)
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 2,
  }).format(value);
}

export function parseCurrency(value: string): number {
  return parseFloat(value.replace(/[^0-9.-]+/g, '')) || 0;
}

// ==================== PERCENTAGE UTILITIES ====================
export function calculatePercentage(value: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((value / total) * 100);
}

export function formatPercentage(value: number): string {
  return `${value.toFixed(1)}%`;
}

// ==================== GRADE UTILITIES ====================
export function calculateGrade(marks: number, maxMarks: number = 100): { grade: string; remark: string } {
  const percentage = (marks / maxMarks) * 100;
  
  // Use the mapped constant
  for (const scale of GRADE_SCALE) {
    if (percentage >= scale.min && percentage <= scale.max) {
      return { grade: scale.grade, remark: scale.remark };
    }
  }
  
  return { grade: 'F', remark: 'Fail' };
}

// ==================== STRING UTILITIES ====================
export function truncate(str: string, length: number = 50): string {
  if (!str) return '';
  if (str.length <= length) return str;
  return `${str.substring(0, length)}...`;
}

export function capitalize(str: string): string {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

export function titleCase(str: string): string {
  if (!str) return '';
  return str
    .split(' ')
    .map(word => capitalize(word))
    .join(' ');
}

export function getInitials(name: string): string {
  if (!name) return '??';
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
}

// ==================== VALIDATION UTILITIES ====================
export function isValidEmail(email: string): boolean {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

export function isValidPhone(phone: string): boolean {
  const regex = /^[\d\s\+\-\(\)]+$/;
  return regex.test(phone);
}

export function validatePassword(password: string): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters');
  }
  // Simplified for MVP, add regex back if stricter policy needed
  return {
    isValid: errors.length === 0,
    errors,
  };
}

// ==================== ARRAY UTILITIES ====================
export function groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
  return array.reduce((result, item) => {
    const groupKey = String(item[key]);
    if (!result[groupKey]) {
      result[groupKey] = [];
    }
    result[groupKey].push(item);
    return result;
  }, {} as Record<string, T[]>);
}

// ==================== STATUS COLOR UTILITIES ====================
export function getStatusColor(status: string): string {
  const statusColors: Record<string, string> = {
    PRESENT: 'green',
    ABSENT: 'red',
    LATE: 'amber',
    EXCUSED: 'blue',
    PAID: 'green',
    PENDING: 'amber',
    PARTIALLY_PAID: 'blue',
    OVERDUE: 'red',
    CANCELLED: 'gray',
    ACTIVE: 'green',
    INACTIVE: 'gray',
  };
  return statusColors[status] || 'gray';
}

export function getStatusBadgeClass(status: string): string {
  const color = getStatusColor(status);
  const colorClasses: Record<string, string> = {
    green: 'bg-emerald-100 text-emerald-800', // Updated to Emerald
    red: 'bg-red-100 text-red-800',
    amber: 'bg-amber-100 text-amber-800',
    blue: 'bg-blue-100 text-blue-800',
    gray: 'bg-slate-100 text-slate-800',
  };
  return colorClasses[color] || colorClasses.gray;
}

// ==================== ERROR HANDLING ====================
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  return 'An unexpected error occurred';
}


export function buildQueryString(params: Record<string, any>): string {
  if (!params) return '';
  
  const query = Object.entries(params)
    .filter(([, value]) => value !== undefined && value !== null && value !== '')
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
    .join('&');

  return query ? `?${query}` : '';
}

// Fixes the search bar debounce requirement
export function debounce<T extends (...args: any[]) => void>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}
