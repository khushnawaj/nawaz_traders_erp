import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merges Tailwind CSS classes with clsx
 * @param  {...any} inputs 
 * @returns {string}
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * Format currency in Indian Rupees (INR)
 * @param {number|string|Decimal} amount 
 * @returns {string}
 */
export function formatCurrency(amount) {
  if (amount === null || amount === undefined || isNaN(amount)) return '₹0.00';
  const num = typeof amount === 'number' ? amount : parseFloat(amount.toString());
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(num);
}

/**
 * Format weight quantity with precision
 * @param {number|string|Decimal} qty 
 * @param {string} unitCode 
 * @returns {string}
 */
export function formatWeight(qty, unitCode = 'QTL') {
  if (qty === null || qty === undefined || isNaN(qty)) return `0.00 ${unitCode}`;
  const num = typeof qty === 'number' ? qty : parseFloat(qty.toString());
  return `${num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 3 })} ${unitCode}`;
}
