'use client';

import { useState, useEffect } from 'react';
import { X, TrendingUp, Calendar, Wheat, Warehouse, Truck, User, CreditCard, DollarSign, Scale, Plus } from 'lucide-react';
import toast from 'react-hot-toast';

export default function SaleFormModal({ isOpen, onClose, defaultCustomer = null, onSuccess }) {
  const [customers, setCustomers] = useState([]);
  const [commodities, setCommodities] = useState([]);
  const [units, setUnits] = useState([]);
  const [godowns, setGodowns] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loadingData, setLoadingData] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    partyId: '',
    commodityId: '',
    unitId: '',
    godownId: '',
    vehicleId: '',
    driverId: '',
    quantity: '',
    rate: '',
    totalDeductions: '0',
    receivedAmount: '0',
    paymentMode: 'CASH',
    notes: '',
  });

  const loadInitialData = async () => {
    setLoadingData(true);
    try {
      const [partiesRes, cmdRes, gdnRes, vehRes, empRes] = await Promise.all([
        fetch('/api/parties').then((r) => r.json()),
        fetch('/api/commodities').then((r) => r.json()),
        fetch('/api/godowns').then((r) => r.json()),
        fetch('/api/vehicles').then((r) => r.json()),
        fetch('/api/employees').then((r) => r.json()),
      ]);

      if (partiesRes.success) {
        // Filter Parties with CUSTOMER, RICE_MILL, or SUPPLIER role
        const customerList = (partiesRes.data || []).filter((p) =>
          p.roles?.some((r) => ['CUSTOMER', 'RICE_MILL', 'SUPPLIER', 'OTHER'].includes(r))
        );
        setCustomers(customerList.length > 0 ? customerList : partiesRes.data || []);
      }
      if (cmdRes.success) {
        setCommodities(cmdRes.data.commodities || []);
        setUnits(cmdRes.data.units || []);
      }
      if (gdnRes.success) setGodowns(gdnRes.data || []);
      if (vehRes.success) setVehicles(vehRes.data || []);
      if (empRes.success) setDrivers((empRes.data || []).filter((e) => e.role === 'DRIVER'));

      setFormData((prev) => ({
        ...prev,
        partyId: defaultCustomer?.id || (customers[0]?.id || ''),
        commodityId: cmdRes.data?.commodities?.[0]?.id || '',
        unitId: cmdRes.data?.units?.find((u) => u.code === 'QTL')?.id || cmdRes.data?.units?.[0]?.id || '',
        godownId: gdnRes.data?.[0]?.id || '',
        date: new Date().toISOString().split('T')[0],
      }));
    } catch (err) {
      console.error('Error loading dropdowns:', err);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadInitialData();
    }
  }, [isOpen, defaultCustomer]);

  if (!isOpen) return null;

  // Calculations
  const qty = parseFloat(formData.quantity) || 0;
  const rate = parseFloat(formData.rate) || 0;
  const grossValue = qty * rate;

  const deductions = parseFloat(formData.totalDeductions) || 0;
  const netAmount = grossValue - deductions;

  const received = parseFloat(formData.receivedAmount) || 0;
  const dueAmount = netAmount - received;

  const selectedUnit = units.find((u) => u.id === formData.unitId)?.code || 'QTL';

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.partyId) {
      toast.error('Please select a customer or rice mill!');
      return;
    }
    if (!formData.commodityId) {
      toast.error('Please select a grain commodity!');
      return;
    }
    if (qty <= 0) {
      toast.error('Please enter a valid grain quantity!');
      return;
    }
    if (rate <= 0) {
      toast.error('Please enter a valid sale rate!');
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch('/api/sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          quantity: qty,
          rate: rate,
          totalDeductions: deductions,
          receivedAmount: received,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || 'Failed to record sale');
      }

      toast.success('🎉 Grain Sale Invoice (बिक्री पर्ची) Recorded Successfully!');
      if (onSuccess) onSuccess(json.data);
      onClose();
    } catch (err) {
      toast.error(`❌ ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="glass-modal rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden border border-slate-200/80 dark:border-slate-800 animate-in fade-in zoom-in duration-200 text-slate-900 dark:text-white my-8 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-purple-700/40 bg-gradient-to-r from-purple-900 via-purple-800 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold shadow-lg shadow-amber-500/30">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-extrabold text-lg text-white">Record Grain Sale (बिक्री पर्ची / चालान)</h2>
              <p className="text-xs text-purple-200">Commercial Sales to Rice Mills & Grain Buyers</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition hover:scale-105">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto flex-1">
          {/* Sale Date & Customer / Rice Mill Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="app-label">
                <Calendar className="w-3.5 h-3.5 text-purple-500" /> Sale Date (बिक्री तिथि) *
              </label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="app-input"
              />
            </div>

            <div>
              <label className="app-label">Select Customer / Rice Mill *</label>
              <select
                value={formData.partyId}
                onChange={(e) => setFormData({ ...formData, partyId: e.target.value })}
                disabled={Boolean(defaultCustomer)}
                className="app-select font-extrabold text-purple-600 dark:text-purple-300 disabled:opacity-70"
              >
                <option value="">Select Buyer / Rice Mill</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                    🏢 {c.name} ({c.roles?.join(', ') || 'Customer'}) {c.phone ? `— 📞 ${c.phone}` : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Commodity & Source Godown */}
          <div className="bg-purple-500/5 p-4 rounded-2xl border border-purple-500/15 space-y-3">
            <label className="app-label mb-0 text-purple-800 dark:text-purple-300">
              Grain & Warehouse Outflow Source
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="app-label text-[10px]">Commodity (अनाज)</label>
                <select
                  value={formData.commodityId}
                  onChange={(e) => setFormData({ ...formData, commodityId: e.target.value })}
                  className="app-select"
                >
                  {commodities.map((c) => (
                    <option key={c.id} value={c.id} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                      🌾 {c.localName || c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="app-label text-[10px]">Source Godown (निकासी गोदाम)</label>
                <select
                  value={formData.godownId}
                  onChange={(e) => setFormData({ ...formData, godownId: e.target.value })}
                  className="app-select font-bold"
                >
                  {godowns.map((g) => (
                    <option key={g.id} value={g.id} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                      🏛️ {g.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="app-label text-[10px]">Unit (इकाई)</label>
                <select
                  value={formData.unitId}
                  onChange={(e) => setFormData({ ...formData, unitId: e.target.value })}
                  className="app-select"
                >
                  {units.map((u) => (
                    <option key={u.id} value={u.id} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                      {u.name} ({u.code})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Quantity & Sale Rate */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="app-label">
                <Scale className="w-3.5 h-3.5 text-amber-500" /> Sale Quantity (मात्रा - {selectedUnit}) *
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="e.g. 250.00"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  className="app-input pr-12 font-black text-slate-900 dark:text-white"
                />
                <span className="absolute right-3.5 top-2.5 text-xs font-black text-slate-400">{selectedUnit}</span>
              </div>
            </div>

            <div>
              <label className="app-label">
                <DollarSign className="w-3.5 h-3.5 text-purple-500" /> Sale Rate per {selectedUnit} (दर ₹/{selectedUnit}) *
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 text-xs font-black text-slate-400">₹</span>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="e.g. 2450.00"
                  value={formData.rate}
                  onChange={(e) => setFormData({ ...formData, rate: e.target.value })}
                  className="app-input pl-8 font-black text-slate-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Transport Info (Vehicle & Driver) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="app-label">
                <Truck className="w-3.5 h-3.5 text-slate-500" /> Transport Vehicle (गाड़ी)
              </label>
              <select
                value={formData.vehicleId}
                onChange={(e) => setFormData({ ...formData, vehicleId: e.target.value })}
                className="app-select"
              >
                <option value="">Select Transport Vehicle</option>
                {vehicles.map((v) => (
                  <option key={v.id} value={v.id}>
                    🚛 {v.vehicleNumber} ({v.vehicleType})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="app-label">
                <User className="w-3.5 h-3.5 text-slate-500" /> Driver (ड्राइवर)
              </label>
              <select
                value={formData.driverId}
                onChange={(e) => setFormData({ ...formData, driverId: e.target.value })}
                className="app-select"
              >
                <option value="">Select Driver</option>
                {drivers.map((d) => (
                  <option key={d.id} value={d.id}>
                    👨‍✈️ {d.fullName}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Deductions / Discounts */}
          <div>
            <label className="app-label text-rose-600 dark:text-rose-400">
              Freight Discount / Deductions (कटौती/छूट ₹)
            </label>
            <input
              type="number"
              step="0.01"
              placeholder="0.00"
              value={formData.totalDeductions}
              onChange={(e) => setFormData({ ...formData, totalDeductions: e.target.value })}
              className="app-input text-rose-600 dark:text-rose-300"
            />
          </div>

          {/* Payment Collection: Received Amount & Mode */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="app-label text-emerald-700 dark:text-emerald-400">
                <CreditCard className="w-3.5 h-3.5" /> Payment Received (प्राप्त राशि ₹)
              </label>
              <input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={formData.receivedAmount}
                onChange={(e) => setFormData({ ...formData, receivedAmount: e.target.value })}
                className="app-input font-black text-emerald-600 dark:text-emerald-400"
              />
            </div>

            <div>
              <label className="app-label">Payment Mode</label>
              <select
                value={formData.paymentMode}
                onChange={(e) => setFormData({ ...formData, paymentMode: e.target.value })}
                className="app-select"
              >
                <option value="BANK_TRANSFER">BANK TRANSFER / RTGS / NEFT</option>
                <option value="CASH">CASH (नकद)</option>
                <option value="CHEQUE">CHEQUE (चेक)</option>
                <option value="UPI">UPI / GPay / PhonePe</option>
              </select>
            </div>
          </div>

          {/* Summary Box */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-purple-950 to-slate-900 text-white border border-purple-500/30 space-y-2 shadow-xl">
            <div className="flex items-center justify-between text-xs text-slate-300">
              <span>Gross Sale Value ({qty.toFixed(2)} {selectedUnit} × ₹{rate.toFixed(2)}):</span>
              <span className="font-bold text-white">₹{grossValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>

            {deductions > 0 && (
              <div className="flex items-center justify-between text-xs text-rose-300">
                <span>- Discounts / Freight Deduction:</span>
                <span className="font-bold text-rose-400">-₹{deductions.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
            )}

            <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-slate-400 uppercase">Total Invoice Amount</div>
                <div className="text-lg font-black text-purple-400">
                  ₹{netAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </div>
              </div>

              <div className="text-right">
                <div className="text-xs font-bold text-amber-400 uppercase">Balance Receivable</div>
                <div className="text-lg font-black text-amber-400">
                  ₹{dueAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </div>
              </div>
            </div>
          </div>

          {/* Remarks */}
          <div>
            <label className="app-label">Remarks / Notes</label>
            <input
              type="text"
              placeholder="e.g. Paddy dispatched to Mahavir Rice Mill, Vidisha via Truck MP04AB1234"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="app-input"
            />
          </div>

          {/* Buttons */}
          <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white font-extrabold text-xs shadow-lg shadow-purple-950/20 transition flex items-center gap-2 disabled:opacity-50"
            >
              {submitting ? 'Saving Sale...' : 'Save Grain Sale (बिक्री पर्ची दर्ज करें)'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
