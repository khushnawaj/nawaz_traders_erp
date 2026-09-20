'use client';

import Loader from '@/components/common/Loader';

/**
 * Root Streaming Loading Fallback for Next.js app directory.
 * Triggers automatically during route transitions.
 */
export default function GlobalLoading() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center p-6">
      <Loader 
        text="Loading Nawaz Traders ERP..." 
        subtext="Synchronizing Mandi Rates, Stock & Financial Ledgers" 
        size="lg" 
      />
    </div>
  );
}
