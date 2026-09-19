'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { 
  User, 
  Phone, 
  MapPin, 
  ArrowLeft, 
  Receipt, 
  CreditCard, 
  Wheat, 
  Landmark, 
  Building2,
  Camera
} from 'lucide-react';
import ProfileAvatarModal from '@/components/common/ProfileAvatarModal';
import { formatCurrency, formatWeight } from '@/lib/utils';

export default function PartyProfilePage() {
  const params = useParams();
  const id = params?.id;
  const [party, setParty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);

  const fetchProfile = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/parties/${id}`);
      const json = await res.json();
      if (json.success) {
        setParty(json.data);
      }
    } catch (err) {
      console.error('Error fetching party profile:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-slate-500 dark:text-slate-400 font-semibold text-sm">Loading party profile...</div>
      </div>
    );
  }

  if (!party) {
    return (
      <div className="max-w-7xl mx-auto p-6 text-center">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Party Not Found</h2>
        <Link href="/parties" className="text-emerald-600 dark:text-emerald-400 font-bold text-sm mt-2 inline-block">
          ← Back to Parties Directory
        </Link>
      </div>
    );
  }

  return (
    <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Breadcrumb Header */}
      <div className="flex items-center justify-between">
        <Link
          href="/parties"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 glass-card px-3.5 py-2 rounded-xl shadow-sm transition"
        >
          <ArrowLeft className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> Back to Parties Directory
        </Link>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold text-amber-800 dark:text-amber-300 bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 rounded-md uppercase">
            {party.partyCode}
          </span>
          <div className="flex gap-1">
            {party.roles.map((r) => (
              <span key={r} className="text-[10px] font-extrabold text-white bg-emerald-700 dark:bg-emerald-600 px-2 py-0.5 rounded-md uppercase">
                {r.replace('_', ' ')}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Party Summary Header Card */}
      <div className="glass-card p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-4">
          {/* Avatar Picture with Camera Click Trigger */}
          <div className="relative group cursor-pointer" onClick={() => setIsAvatarModalOpen(true)}>
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl overflow-hidden border-2 border-emerald-500/40 shadow-xl bg-slate-100 dark:bg-slate-900 flex items-center justify-center group-hover:opacity-90 transition">
              {party.avatarUrl ? (
                <img src={party.avatarUrl} alt={party.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-tr from-emerald-600 to-emerald-500 flex items-center justify-center text-white font-black text-2xl">
                  {party.name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            <div className="absolute inset-0 bg-slate-950/40 rounded-3xl opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
              <Camera className="w-6 h-6 text-white" />
            </div>
            <span className="absolute -bottom-1 -right-1 p-1.5 bg-emerald-600 text-white rounded-xl shadow-md">
              <Camera className="w-3.5 h-3.5" />
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                {party.name}
              </h1>
              <button
                onClick={() => setIsAvatarModalOpen(true)}
                className="text-xs text-amber-600 dark:text-amber-400 hover:underline font-bold"
              >
                (Edit Photo)
              </button>
            </div>
            {party.address && (
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-1">
                <MapPin className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" /> {party.address} {party.city ? `, ${party.city}` : ''}
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="bg-slate-100 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 px-4 py-2 rounded-2xl text-left">
            <div className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400">Contact Number</div>
            <div className="text-xs font-extrabold text-slate-900 dark:text-white flex items-center gap-1 mt-0.5">
              <Phone className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> {party.phone || 'N/A'}
            </div>
          </div>

          <div className="bg-slate-100 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 px-4 py-2 rounded-2xl text-left">
            <div className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400">Opening Balance</div>
            <div className={`text-xs font-extrabold mt-0.5 ${
              party.balanceType === 'RECEIVABLE' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
            }`}>
              {formatCurrency(party.openingBalance)} ({party.balanceType === 'RECEIVABLE' ? 'DR' : 'CR'})
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-slate-200 dark:border-slate-800 flex gap-2 overflow-x-auto pb-0.5">
        {[
          { id: 'overview', label: 'Overview & Details', icon: User },
          { id: 'ledger', label: 'Accounts & Ledger (खाता)', icon: Receipt },
          { id: 'history', label: 'Purchase & Sales History', icon: Wheat },
          { id: 'payments', label: 'Payments & Receipts', icon: CreditCard },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 font-bold text-xs rounded-t-2xl transition border-b-2 whitespace-nowrap ${
                isActive
                  ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400 bg-white dark:bg-slate-900 shadow-sm'
                  : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/50'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="glass-card p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm border-b border-slate-200 dark:border-slate-800 pb-2 flex items-center gap-2">
              <User className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> Basic Information
            </h3>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-500 dark:text-slate-400 block">Party Code</span>
                <span className="font-bold text-slate-900 dark:text-white">{party.partyCode}</span>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400 block">Full Name</span>
                <span className="font-bold text-slate-900 dark:text-white">{party.name}</span>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400 block">Primary Phone</span>
                <span className="font-bold text-slate-900 dark:text-white">{party.phone || 'N/A'}</span>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400 block">Alternate Phone</span>
                <span className="font-bold text-slate-900 dark:text-white">{party.alternatePhone || 'N/A'}</span>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400 block">Address</span>
                <span className="font-bold text-slate-900 dark:text-white">{party.address || 'N/A'}</span>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400 block">City / State</span>
                <span className="font-bold text-slate-900 dark:text-white">{party.city || 'N/A'}, {party.state || 'MP'}</span>
              </div>
            </div>
          </div>

          <div className="glass-card p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm border-b border-slate-200 dark:border-slate-800 pb-2 flex items-center gap-2">
              <Receipt className="w-4 h-4 text-amber-600 dark:text-amber-400" /> Financial Settings
            </h3>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-500 dark:text-slate-400 block">Opening Balance</span>
                <span className="font-bold text-slate-900 dark:text-white">{formatCurrency(party.openingBalance)}</span>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400 block">Balance Type</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">{party.balanceType}</span>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400 block">Registered Date</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {new Date(party.createdAt).toLocaleDateString('en-IN')}
                </span>
              </div>
            </div>
            {party.notes && (
              <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400 text-xs block">Notes & Remarks</span>
                <p className="text-xs text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-950/80 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 font-mono mt-1">
                  {party.notes}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: ACCOUNTS & LEDGER */}
      {activeTab === 'ledger' && (
        <div className="glass-card rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900/60 flex items-center justify-between">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">Account Ledger (खाता विवरण)</h3>
          </div>
          {party.ledgerEntries.length === 0 ? (
            <div className="p-8 text-center text-slate-500 dark:text-slate-400 text-xs">
              No ledger transactions recorded yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 dark:bg-slate-900/80 text-slate-700 dark:text-slate-300 font-bold uppercase border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="p-3">Date</th>
                    <th className="p-3">Voucher No</th>
                    <th className="p-3">Voucher Type</th>
                    <th className="p-3">Narration</th>
                    <th className="p-3 text-right text-emerald-600 dark:text-emerald-400">Debit (DR)</th>
                    <th className="p-3 text-right text-rose-600 dark:text-rose-400">Credit (CR)</th>
                    <th className="p-3 text-right">Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800/80">
                  {party.ledgerEntries.map((entry) => (
                    <tr key={entry.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                      <td className="p-3 text-slate-600 dark:text-slate-400 font-medium">
                        {new Date(entry.date).toLocaleDateString('en-IN')}
                      </td>
                      <td className="p-3 font-bold text-slate-900 dark:text-white">{entry.voucherNo}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 uppercase">
                          {entry.voucherType}
                        </span>
                      </td>
                      <td className="p-3 text-slate-600 dark:text-slate-400">{entry.narration || '-'}</td>
                      <td className="p-3 text-right font-bold text-emerald-600 dark:text-emerald-400">
                        {parseFloat(entry.debit) > 0 ? formatCurrency(entry.debit) : '-'}
                      </td>
                      <td className="p-3 text-right font-bold text-rose-600 dark:text-rose-400">
                        {parseFloat(entry.credit) > 0 ? formatCurrency(entry.credit) : '-'}
                      </td>
                      <td className="p-3 text-right font-bold text-slate-900 dark:text-white">
                        {formatCurrency(entry.runningBalance)} ({entry.balanceType === 'RECEIVABLE' ? 'DR' : 'CR'})
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: PURCHASES & SALES HISTORY */}
      {activeTab === 'history' && (
        <div className="space-y-6">
          {/* Purchases */}
          <div className="glass-card rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-emerald-500/10 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                <Wheat className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> Procurement / Purchase History
              </h3>
              <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300">{party.purchases.length} Purchases</span>
            </div>
            {party.purchases.length === 0 ? (
              <div className="p-8 text-center text-slate-500 dark:text-slate-400 text-xs">No purchase history recorded.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 dark:bg-slate-900/80 text-slate-700 dark:text-slate-300 font-bold uppercase">
                    <tr>
                      <th className="p-3">Purchase No</th>
                      <th className="p-3">Date</th>
                      <th className="p-3">Commodity</th>
                      <th className="p-3">Net Quantity</th>
                      <th className="p-3 text-right">Net Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800/80">
                    {party.purchases.map((pur) => (
                      <tr key={pur.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                        <td className="p-3 font-bold text-slate-900 dark:text-white">{pur.purchaseNo}</td>
                        <td className="p-3 text-slate-600 dark:text-slate-400">{new Date(pur.date).toLocaleDateString('en-IN')}</td>
                        <td className="p-3 font-semibold text-slate-800 dark:text-slate-200">
                          {pur.items.map((i) => i.commodity.name).join(', ')}
                        </td>
                        <td className="p-3 font-medium text-slate-800 dark:text-slate-200">
                          {pur.items.map((i) => formatWeight(i.displayQuantity, i.unit.code)).join(', ')}
                        </td>
                        <td className="p-3 text-right font-bold text-slate-900 dark:text-white">{formatCurrency(pur.netAmount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Sales */}
          <div className="glass-card rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-blue-500/10 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                <Building2 className="w-4 h-4 text-blue-600 dark:text-blue-400" /> Sales History
              </h3>
              <span className="text-xs font-bold text-blue-700 dark:text-blue-300">{party.sales.length} Sales</span>
            </div>
            {party.sales.length === 0 ? (
              <div className="p-8 text-center text-slate-500 dark:text-slate-400 text-xs">No sales history recorded.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 dark:bg-slate-900/80 text-slate-700 dark:text-slate-300 font-bold uppercase">
                    <tr>
                      <th className="p-3">Sale No</th>
                      <th className="p-3">Date</th>
                      <th className="p-3">Commodity</th>
                      <th className="p-3">Net Quantity</th>
                      <th className="p-3 text-right">Net Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800/80">
                    {party.sales.map((sal) => (
                      <tr key={sal.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                        <td className="p-3 font-bold text-slate-900 dark:text-white">{sal.saleNo}</td>
                        <td className="p-3 text-slate-600 dark:text-slate-400">{new Date(sal.date).toLocaleDateString('en-IN')}</td>
                        <td className="p-3 font-semibold text-slate-800 dark:text-slate-200">
                          {sal.items.map((i) => i.commodity.name).join(', ')}
                        </td>
                        <td className="p-3 font-medium text-slate-800 dark:text-slate-200">
                          {sal.items.map((i) => formatWeight(i.displayQuantity, i.unit.code)).join(', ')}
                        </td>
                        <td className="p-3 text-right font-bold text-slate-900 dark:text-white">{formatCurrency(sal.netAmount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: PAYMENTS & RECEIPTS */}
      {activeTab === 'payments' && (
        <div className="glass-card rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900/60 flex items-center justify-between">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">Payment Vouchers & Receipts</h3>
          </div>
          {party.payments.length === 0 ? (
            <div className="p-8 text-center text-slate-500 dark:text-slate-400 text-xs">No payments logged yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 dark:bg-slate-900/80 text-slate-700 dark:text-slate-300 font-bold uppercase">
                  <tr>
                    <th className="p-3">Payment No</th>
                    <th className="p-3">Date</th>
                    <th className="p-3">Type</th>
                    <th className="p-3">Mode</th>
                    <th className="p-3">Account</th>
                    <th className="p-3 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800/80">
                  {party.payments.map((pmt) => (
                    <tr key={pmt.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                      <td className="p-3 font-bold text-slate-900 dark:text-white">{pmt.paymentNo}</td>
                      <td className="p-3 text-slate-600 dark:text-slate-400">{new Date(pmt.date).toLocaleDateString('en-IN')}</td>
                      <td className="p-3 font-semibold text-slate-700 dark:text-slate-300">{pmt.paymentType}</td>
                      <td className="p-3 font-semibold text-slate-700 dark:text-slate-300">{pmt.paymentMode}</td>
                      <td className="p-3 text-slate-600 dark:text-slate-400">{pmt.accountName}</td>
                      <td className="p-3 text-right font-bold text-slate-900 dark:text-white">{formatCurrency(pmt.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Profile Photo Upload/Edit/Delete Modal */}
      <ProfileAvatarModal
        isOpen={isAvatarModalOpen}
        onClose={() => setIsAvatarModalOpen(false)}
        currentAvatar={party.avatarUrl}
        entityName={party.name}
        apiEndpoint={`/api/parties/${party.id}/avatar`}
        onSuccess={() => fetchProfile()}
      />
    </main>
  );
}

