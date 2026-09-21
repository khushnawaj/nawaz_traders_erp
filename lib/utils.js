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

/**
 * Convert numbers to Indian Rupees in words
 * @param {number|string} amount 
 * @returns {string}
 */
export function numberToWordsINR(amount) {
  if (amount === null || amount === undefined || isNaN(amount) || parseFloat(amount) === 0) return 'Zero Rupees Only';
  
  const num = Math.abs(parseFloat(amount));
  const rupees = Math.floor(num);
  const paise = Math.round((num - rupees) * 100);

  const singleDigits = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
  const doubleDigits = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tensDigits = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  function convertLessThanThousand(n) {
    let str = '';
    if (n >= 100) {
      str += singleDigits[Math.floor(n / 100)] + ' Hundred ';
      n %= 100;
    }
    if (n >= 10 && n <= 19) {
      str += doubleDigits[n - 10] + ' ';
    } else if (n >= 20 || n > 0) {
      str += tensDigits[Math.floor(n / 10)] + ' ' + singleDigits[n % 10] + ' ';
    }
    return str.trim();
  }

  function convertRupees(n) {
    if (n === 0) return 'Zero';
    let res = '';
    
    if (n >= 10000000) {
      res += convertLessThanThousand(Math.floor(n / 10000000)) + ' Crore ';
      n %= 10000000;
    }
    if (n >= 100000) {
      res += convertLessThanThousand(Math.floor(n / 100000)) + ' Lakh ';
      n %= 100000;
    }
    if (n >= 1000) {
      res += convertLessThanThousand(Math.floor(n / 1000)) + ' Thousand ';
      n %= 1000;
    }
    if (n > 0) {
      res += convertLessThanThousand(n);
    }
    return res.trim();
  }

  let words = convertRupees(rupees) + ' Rupees';
  if (paise > 0) {
    words += ' and ' + convertLessThanThousand(paise) + ' Paise';
  }
  return words + ' Only';
}
