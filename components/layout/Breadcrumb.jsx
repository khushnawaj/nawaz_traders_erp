'use client';

import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';

export default function Breadcrumb({ items = [] }) {
  if (!items || items.length === 0) return null;

  return (
    <nav className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium overflow-x-auto pb-1">
      <Link href="/" className="hover:text-emerald-600 dark:hover:text-emerald-400 flex items-center gap-1 transition">
        <Home className="w-3.5 h-3.5" /> Dashboard
      </Link>

      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <div key={index} className="flex items-center gap-1.5 whitespace-nowrap">
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 dark:text-slate-600 shrink-0" />
            {isLast || !item.href ? (
              <span className="font-semibold text-slate-900 dark:text-white truncate max-w-[200px]">
                {item.label}
              </span>
            ) : (
              <Link href={item.href} className="hover:text-emerald-600 dark:hover:text-emerald-400 transition">
                {item.label}
              </Link>
            )}
          </div>
        );
      })}
    </nav>
  );
}
