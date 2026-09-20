'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X, Wheat, Users, UserCheck, Truck, Warehouse, ShoppingBag, ArrowRight } from 'lucide-react';

export default function GlobalSearchModal({ isOpen, onClose }) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const [partiesRes, empRes] = await Promise.all([
          fetch(`/api/parties?search=${encodeURIComponent(query)}`),
          fetch(`/api/employees?search=${encodeURIComponent(query)}`),
        ]);

        const partiesJson = await partiesRes.json();
        const empJson = await empRes.json();

        const combined = [];
        if (partiesJson.success) {
          partiesJson.data.forEach((p) => {
            const isFarmer = p.roles?.includes('FARMER');
            combined.push({
              id: p.id,
              name: p.name,
              code: p.partyCode,
              type: isFarmer ? 'Farmer' : 'Party / Mill',
              url: isFarmer ? `/farmers/${p.id}` : `/parties/${p.id}`,
              icon: isFarmer ? Wheat : Users,
            });
          });
        }

        if (empJson.success) {
          empJson.data.forEach((e) => {
            combined.push({
              id: e.id,
              name: e.fullName,
              code: e.employeeCode,
              type: `Staff (${e.role})`,
              url: `/employees/${e.id}`,
              icon: UserCheck,
            });
          });
        }

        setResults(combined);
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  const handleSelect = (url) => {
    router.push(url);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-start justify-center p-4 pt-16 sm:pt-24">
      <div className="glass-modal rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden border border-slate-200/80 dark:border-slate-800 text-slate-900 dark:text-white animate-in fade-in zoom-in duration-150">
        {/* Search Input Bar */}
        <div className="p-4 border-b border-slate-200/80 dark:border-slate-800 flex items-center gap-3">
          <Search className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <input
            type="text"
            autoFocus
            placeholder="Search Farmers, Parties, Mills, Staff, Code..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent border-none outline-none text-sm sm:text-base font-medium text-slate-900 dark:text-white placeholder-slate-400"
          />
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto p-3 space-y-1">
          {loading ? (
            <div className="p-6 text-center text-xs text-slate-500 dark:text-slate-400">Searching records...</div>
          ) : results.length > 0 ? (
            results.map((r) => {
              const Icon = r.icon;
              return (
                <button
                  key={r.id}
                  onClick={() => handleSelect(r.url)}
                  className="w-full p-3 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800/60 flex items-center justify-between text-left transition group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition">
                        {r.name}
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono">{r.code} • {r.type}</div>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
                </button>
              );
            })
          ) : query.trim() ? (
            <div className="p-6 text-center text-xs text-slate-500 dark:text-slate-400">No records found matching &quot;{query}&quot;</div>
          ) : (
            <div className="p-4 text-xs text-slate-400 dark:text-slate-500 text-center">
              Type farmer name, code (e.g. PRT-0001), or mobile number to search
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
