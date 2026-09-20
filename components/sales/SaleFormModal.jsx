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

  // Live Stock State
  const [liveStock, setLiveStock] = useState({ stockKg: 0, loading: false });

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

  const fetchLiveStock = async (gdnId, cmdId) => {
    if (!gdnId || !cmdId) return;
    setLiveStock((prev) => ({ ...prev, loading: true }));
    try {
      const res = await fetch(`/api/godowns/stock?godownId=${gdnId}&commodityId=${cmdId}`);
      const json = await res.json();
      if (json.success && json.data) {
        setLiveStock({ stockKg: json.data.stockKg || 0, loading: false });
      } else {
        setLiveStock({ stockKg: 0, loading: false });
      }
    } catch (err) {
      setLiveStock({ stockKg: 0, loading: false });
    }
  };

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

      const initCommodityId = cmdRes.data?.commodities?.[0]?.id || '';
      const initGodownId = gdnRes.data?.[0]?.id || '';

      setFormData((prev) => ({
        ...prev,
        partyId: defaultCustomer?.id || (customers[0]?.id || ''),
        commodityId: initCommodityId,
        unitId: cmdRes.data?.units?.find((u) => u.code === 'QTL')?.id || cmdRes.data?.units?.[0]?.id || '',
        godownId: initGodownId,
        date: new Date().toISOString().split('T')[0],
      }));

      if (initGodownId && initCommodityId) {
        fetchLiveStock(initGodownId, initCommodityId);
      }
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

  useEffect(() => {
    if (formData.godownId && formData.commodityId) {
      fetchLiveStock(formData.godownId, formData.commodityId);
    }
  }, [formData.godownId, formData.commodityId]);

  if (!isOpen) return null;

  // Calculations
  const qty = parseFloat(formData.quantity) || 0;
  const rate = parseFloat(formData.rate) || 0;
  const grossValue = qty * rate;

  const deductions = parseFloat(formData.totalDeductions) || 0;
  const netAmount = grossValue - deductions;

  const received = parseFloat(formData.receivedAmount) || 0;
  const dueAmount = netAmount - received;

  const currentUnitObj = units.find((u) => u.id === formData.unitId);
  const selectedUnit = currentUnitObj?.code || 'QTL';
  const conversionFactor = parseFloat(currentUnitObj?.baseConversionFactor) || 100;

  const availableStockInUnit = liveStock.stockKg / conversionFactor;
  const isStockExceeded = qty > availableStockInUnit;

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
    if (isStockExceeded) {
      toast.error(
        `Insufficient stock! Only ${availableStockInUnit.toFixed(2)} ${selectedUnit} available in selected Godown.`
      );
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

      toast.success('Grain Sale Invoice Recorded Successfully!');
      if (onSuccess) onSuccess(json.data);
      onClose();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="glass-modal rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden border border-slate-200/80 dark:border-slate-800 animate-in fade-in zoom-in duration-200 text-slate-900 dark:text-white my-8 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-purple-700/40 bg-gradient-to-r from-purple-900 via-purple-800 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-semibold shadow-md">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-semibold text-base sm:text-lg text-white">Record Grain Sale Invoice</h2>
              <p className="text-xs text-purple-200/80 font-normal">Commercial Sales to Rice Mills & Grain Buyers</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition hover:scale-105">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1">
          {/* Sale Date & Customer / Rice Mill Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="app-label">
                <Calendar className="w-3.5 h-3.5 text-purple-500" /> Sale Date *
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
                className="app-select font-semibold text-purple-600 dark:text-purple-300 disabled:opacity-70"
              >
                <option value="">Select Buyer / Rice Mill</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                    {c.name} ({c.roles?.join(', ') || 'Customer'}) {c.phone ? `— ${c.phone}` : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Commodity & Source Godown */}
          <div className="bg-purple-500/5 p-4 rounded-2xl border border-purple-500/15 space-y-3">
            <div className="flex items-center justify-between">
              <label className="app-label mb-0 text-purple-800 dark:text-purple-300 font-semibold">
                Grain & Warehouse Outflow Source
              </label>

              {/* Live Stock Indicator Badge */}
              <div className={`px-2.5 py-1 rounded-xl text-[11px] font-extrabold flex items-center gap-1.5 border font-mono ${
                liveStock.loading
                  ? 'bg-slate-100 text-slate-500 border-slate-300'
                  : availableStockInUnit > 0
                  ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30'
                  : 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30 animate-pulse'
              }`}>
                {liveStock.loading ? (
                  <span>Checking Stock...</span>
                ) : availableStockInUnit > 0 ? (
                  <>
                    <span>🟢 Live Stock:</span>
                    <strong className="text-emerald-800 dark:text-emerald-200">
                      {availableStockInUnit.toFixed(2)} {selectedUnit}
                    </strong>
                    <span className="text-[10px] text-slate-500">({liveStock.stockKg.toFixed(0)} KG)</span>
                  </>
                ) : (
                  <>
                    <span>🔴 Out of Stock:</span>
                    <strong>0.00 {selectedUnit} Available</strong>
                  </>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="app-label text-[10px]">Commodity</label>
                <select
                  value={formData.commodityId}
                  onChange={(e) => setFormData({ ...formData, commodityId: e.target.value })}
                  className="app-select"
                >
                  {commodities.map((c) => (
                    <option key={c.id} value={c.id} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="app-label text-[10px]">Source Godown</label>
                <select
                  value={formData.godownId}
                  onChange={(e) => setFormData({ ...formData, godownId: e.target.value })}
                  className="app-select"
                >
                  {godowns.map((g) => (
                    <option key={g.id} value={g.id} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                      {g.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="app-label text-[10px]">Unit</label>
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <div className="flex items-center justify-between">
                <label className="app-label">
                  <Scale className="w-3.5 h-3.5 text-amber-500" /> Sale Quantity ({selectedUnit}) *
                </label>
                <span className="text-[10px] font-bold text-slate-500">
                  Max: {availableStockInUnit.toFixed(2)} {selectedUnit}
                </span>
              </div>
              <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="e.g. 250.00"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  className={`app-input pr-12 font-semibold ${
                    isStockExceeded
                      ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500 text-rose-600 bg-rose-500/5'
                      : 'text-slate-900 dark:text-white'
                  }`}
                />
                <span className="absolute right-3.5 top-2.5 text-xs font-medium text-slate-400">{selectedUnit}</span>
              </div>
              {isStockExceeded && (
                <p className="text-[11px] text-rose-600 dark:text-rose-400 font-bold mt-1 animate-pulse">
                  ⚠️ Requested sale ({qty.toFixed(2)} {selectedUnit}) exceeds available godown stock ({availableStockInUnit.toFixed(2)} {selectedUnit})!
                </p>
              )}
            </div>

            <div>
              <label className="app-label">
                <DollarSign className="w-3.5 h-3.5 text-purple-500" /> Sale Rate per {selectedUnit} (₹/{selectedUnit}) *
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 text-xs font-semibold text-slate-400">₹</span>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="e.g. 2450.00"
                  value={formData.rate}
                  onChange={(e) => setFormData({ ...formData, rate: e.target.value })}
                  className="app-input pl-8 font-semibold text-slate-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Transport Info (Vehicle & Driver) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="app-label">
                <Truck className="w-3.5 h-3.5 text-slate-500" /> Transport Vehicle
              </label>
              <select
                value={formData.vehicleId}
                onChange={(e) => setFormData({ ...formData, vehicleId: e.target.value })}
                className="app-select"
              >
                <option value="">Select Transport Vehicle</option>
                {vehicles.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.vehicleNumber} ({v.vehicleType})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="app-label">
                <User className="w-3.5 h-3.5 text-slate-500" /> Driver
              </label>
              <select
                value={formData.driverId}
                onChange={(e) => setFormData({ ...formData, driverId: e.target.value })}
                className="app-select"
              >
                <option value="">Select Driver</option>
                {drivers.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.fullName}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Deductions / Discounts */}
          <div>
            <label className="app-label text-rose-600 dark:text-rose-400">
              Freight Discount / Deductions (₹)
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
                <CreditCard className="w-3.5 h-3.5" /> Payment Received (₹)
              </label>
              <input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={formData.receivedAmount}
                onChange={(e) => setFormData({ ...formData, receivedAmount: e.target.value })}
                className="app-input font-semibold text-emerald-600 dark:text-emerald-400"
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
                <option value="CASH">CASH</option>
                <option value="CHEQUE">CHEQUE</option>
                <option value="UPI">UPI / GPay / PhonePe</option>
              </select>
            </div>
          </div>

          {/* Summary Box */}
          <div className="p-4 rounded-2xl bg-slate-900 text-white border border-purple-500/30 space-y-2 shadow-md">
            <div className="flex items-center justify-between text-xs text-slate-300 font-normal">
              <span>Gross Sale Value ({qty.toFixed(2)} {selectedUnit} × ₹{rate.toFixed(2)}):</span>
              <span className="font-semibold text-white">₹{grossValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>

            {deductions > 0 && (
              <div className="flex items-center justify-between text-xs text-rose-300 font-normal">
                <span>- Discounts / Freight Deduction:</span>
                <span className="font-semibold text-rose-400">-₹{deductions.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
            )}

            <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
              <div>
                <div className="text-[11px] font-medium text-slate-400 uppercase">Total Invoice Amount</div>
                <div className="text-base font-bold text-purple-400">
                  ₹{netAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </div>
              </div>

              <div className="text-right">
                <div className="text-[11px] font-medium text-amber-400 uppercase">Balance Receivable</div>
                <div className="text-base font-bold text-amber-400">
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
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white font-semibold text-xs shadow-md transition flex items-center gap-2 disabled:opacity-50"
            >
              {submitting ? 'Saving Sale...' : 'Save Grain Sale Invoice'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
