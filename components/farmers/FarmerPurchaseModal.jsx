'use client';

import { useState, useEffect } from 'react';
import { X, Wheat, Calendar, Calculator, Scale, Plus, Check, Truck, CreditCard, DollarSign, Upload, FileText, Image as ImageIcon } from 'lucide-react';
import toast from 'react-hot-toast';

export default function FarmerPurchaseModal({ isOpen, onClose, defaultFarmer = null, onSuccess }) {
  const [farmers, setFarmers] = useState([]);
  const [commodities, setCommodities] = useState([]);
  const [units, setUnits] = useState([]);
  const [godowns, setGodowns] = useState([]);
  const [loadingData, setLoadingData] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingParchi, setUploadingParchi] = useState(false);

  // New Crop Form Inline Modal State
  const [showAddCropForm, setShowAddCropForm] = useState(false);
  const [newCrop, setNewCrop] = useState({ name: '', localName: '', category: 'Grains' });
  const [addingCrop, setAddingCrop] = useState(false);

  // Palledari Mode State
  const [palledariMode, setPalledariMode] = useState('PER_BAG'); // PER_BAG, PER_QTL, FIXED
  const [bagCount, setBagCount] = useState('');
  const [palledariRate, setPalledariRate] = useState('');

  const [formData, setFormData] = useState({
    partyId: '',
    commodityId: '',
    unitId: '',
    godownId: '',
    quantity: '',
    rate: '',
    labourCharges: '0',
    gstAmount: '0',
    otherExpenses: '0',
    totalDeductions: '0',
    advancePaid: '0',
    paymentMode: 'CASH',
    promisedDate: '',
    date: new Date().toISOString().split('T')[0],
    notes: '',
    parchiUrl: '',
  });

  const handleParchiUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const data = new FormData();
    data.append('file', file);

    setUploadingParchi(true);
    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: data,
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Upload failed');

      setFormData((prev) => ({ ...prev, parchiUrl: json.url }));
      toast.success('📷 Purchase slip / parchi uploaded successfully!');
    } catch (err) {
      toast.error(`❌ ${err.message}`);
    } finally {
      setUploadingParchi(false);
    }
  };

  const loadInitialData = async () => {
    setLoadingData(true);
    try {
      const [partiesRes, cmdRes, gdnRes] = await Promise.all([
        fetch('/api/parties?role=FARMER').then((res) => res.json()),
        fetch('/api/commodities').then((res) => res.json()),
        fetch('/api/godowns').then((res) => res.json()),
      ]);

      if (partiesRes.success) setFarmers(partiesRes.data || []);
      if (cmdRes.success) {
        setCommodities(cmdRes.data.commodities || []);
        setUnits(cmdRes.data.units || []);
      }
      if (gdnRes.success) setGodowns(gdnRes.data || []);

      setFormData((prev) => ({
        ...prev,
        partyId: defaultFarmer?.id || partiesRes.data?.[0]?.id || '',
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
  }, [isOpen, defaultFarmer]);

  // Recalculate Palledari / Labour Charges whenever bags, Palledari rate, or mode changes
  useEffect(() => {
    const bags = parseFloat(bagCount) || 0;
    const pRate = parseFloat(palledariRate) || 0;
    const qty = parseFloat(formData.quantity) || 0;

    let computedLabour = 0;
    if (palledariMode === 'PER_BAG') {
      computedLabour = bags * pRate;
    } else if (palledariMode === 'PER_QTL') {
      computedLabour = qty * pRate;
    } else if (palledariMode === 'FIXED') {
      computedLabour = pRate;
    }

    setFormData((prev) => ({
      ...prev,
      labourCharges: computedLabour.toString(),
    }));
  }, [bagCount, palledariRate, palledariMode, formData.quantity]);

  if (!isOpen) return null;

  // Inline dynamic crop registration handler
  const handleAddNewCrop = async () => {
    if (!newCrop.name) {
      toast.error('Please enter crop name!');
      return;
    }
    setAddingCrop(true);
    try {
      const res = await fetch('/api/commodities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCrop),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to add crop');

      toast.success(`🎉 New Crop "${json.data?.name || newCrop.name}" Added!`);
      setCommodities((prev) => [json.data, ...prev]);
      setFormData((prev) => ({ ...prev, commodityId: json.data.id }));
      setShowAddCropForm(false);
      setNewCrop({ name: '', localName: '', category: 'Grains' });
    } catch (err) {
      toast.error(`❌ ${err.message}`);
    } finally {
      setAddingCrop(false);
    }
  };

  // Calculations
  const qty = parseFloat(formData.quantity) || 0;
  const rate = parseFloat(formData.rate) || 0;
  const grossCropValue = qty * rate;

  const labour = parseFloat(formData.labourCharges) || 0;
  const gst = parseFloat(formData.gstAmount) || 0;
  const other = parseFloat(formData.otherExpenses) || 0;
  const totalCharges = labour + gst + other;

  const deductions = parseFloat(formData.totalDeductions) || 0;
  const netAmount = grossCropValue + totalCharges - deductions;

  const advance = parseFloat(formData.advancePaid) || 0;
  const dueAmount = netAmount - advance;

  const selectedUnit = units.find((u) => u.id === formData.unitId)?.code || 'QTL';

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.partyId) {
      toast.error('Please select a farmer!');
      return;
    }
    if (!formData.commodityId) {
      toast.error('Please select a crop!');
      return;
    }
    if (qty <= 0) {
      toast.error('Please enter a valid crop quantity!');
      return;
    }
    if (rate <= 0) {
      toast.error('Please enter a valid rate!');
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch('/api/purchases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          quantity: qty,
          rate: rate,
          labourCharges: labour,
          gstAmount: gst,
          otherExpenses: other,
          totalDeductions: deductions,
          advancePaid: advance,
          notes: `${formData.notes ? formData.notes + ' | ' : ''}Bags: ${bagCount || 'N/A'}, Palledari: ₹${labour}`,
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || 'Failed to record purchase');
      }

      toast.success('🎉 Crop Purchase Voucher (खरीदी पर्ची) Recorded Successfully!');
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
        <div className="p-5 border-b border-emerald-700/40 bg-gradient-to-r from-emerald-900 via-emerald-800 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold shadow-lg shadow-amber-500/30">
              <Wheat className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-extrabold text-lg text-white">Record Crop Purchase (फसल खरीदी पर्ची)</h2>
              <p className="text-xs text-emerald-200">Procurement Voucher, Palledari Charges & Settlement</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition hover:scale-105">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto flex-1">
          {/* Purchase Date & Farmer Selection Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="app-label">
                <Calendar className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> Purchase Date (खरीद तिथि) *
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
              <label className="app-label">Select Farmer (किसान चुनें) *</label>
              <select
                value={formData.partyId}
                onChange={(e) => setFormData({ ...formData, partyId: e.target.value })}
                disabled={Boolean(defaultFarmer)}
                className="app-select disabled:opacity-70"
              >
                {farmers.map((f) => (
                  <option key={f.id} value={f.id} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                    {f.name} ({f.partyCode}) {f.phone ? `— 📞 ${f.phone}` : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Crop Commodity Selection + Dynamic Add New Crop Feature */}
          <div className="bg-emerald-500/5 p-4 rounded-2xl border border-emerald-500/15 space-y-3">
            <div className="flex items-center justify-between">
              <label className="app-label mb-0 text-emerald-800 dark:text-emerald-300">
                <Wheat className="w-3.5 h-3.5 text-amber-500" /> Crop (फसल प्रकार) *
              </label>
              <button
                type="button"
                onClick={() => setShowAddCropForm(!showAddCropForm)}
                className="text-xs font-extrabold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add New Crop (नयी फसल जोड़ें)
              </button>
            </div>

            {/* Inline Add Crop Form Drawer */}
            {showAddCropForm && (
              <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-950 border border-amber-500/30 space-y-3 animate-in fade-in duration-150 shadow-md">
                <div className="text-xs font-bold text-amber-600 dark:text-amber-400 flex items-center justify-between">
                  <span>Register New Crop/Commodity</span>
                  <button type="button" onClick={() => setShowAddCropForm(false)} className="text-slate-400 hover:text-white">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Crop English Name (e.g. Soyabean)"
                    value={newCrop.name}
                    onChange={(e) => setNewCrop({ ...newCrop, name: e.target.value })}
                    className="app-input"
                  />
                  <input
                    type="text"
                    placeholder="Crop Hindi Name (e.g. सोयाबीन)"
                    value={newCrop.localName}
                    onChange={(e) => setNewCrop({ ...newCrop, localName: e.target.value })}
                    className="app-input"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleAddNewCrop}
                  disabled={addingCrop}
                  className="w-full py-2 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-extrabold rounded-xl text-xs transition flex items-center justify-center gap-1 disabled:opacity-50 shadow-md"
                >
                  <Check className="w-3.5 h-3.5" /> Save & Select Crop
                </button>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <select
                  value={formData.commodityId}
                  onChange={(e) => setFormData({ ...formData, commodityId: e.target.value })}
                  className="app-select"
                >
                  {commodities.map((c) => (
                    <option key={c.id} value={c.id} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                      {c.localName || c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <select
                  value={formData.unitId}
                  onChange={(e) => setFormData({ ...formData, unitId: e.target.value })}
                  className="app-select"
                >
                  {units.map((u) => (
                    <option key={u.id} value={u.id} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                      Unit: {u.name} ({u.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <select
                  value={formData.godownId}
                  onChange={(e) => setFormData({ ...formData, godownId: e.target.value })}
                  className="app-select"
                >
                  {godowns.map((g) => (
                    <option key={g.id} value={g.id} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                      Godown: {g.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Quantity & Rate */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="app-label">
                <Scale className="w-3.5 h-3.5 text-amber-500" /> Quantity / Weights (मात्रा - {selectedUnit}) *
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="e.g. 100.00"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  className="app-input pr-12 font-black text-slate-900 dark:text-white"
                />
                <span className="absolute right-3.5 top-2.5 text-xs font-black text-slate-500 dark:text-slate-400">
                  {selectedUnit}
                </span>
              </div>
            </div>

            <div>
              <label className="app-label">
                <Calculator className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> Rate per {selectedUnit} (दर ₹/{selectedUnit}) *
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 text-xs font-black text-slate-400">₹</span>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="e.g. 2200.00"
                  value={formData.rate}
                  onChange={(e) => setFormData({ ...formData, rate: e.target.value })}
                  className="app-input pl-8 font-black text-slate-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Palledari / Labour Pay Special Calculator Section */}
          <div className="bg-amber-500/5 p-4 rounded-2xl border border-amber-500/15 space-y-3">
            <div className="flex items-center justify-between">
              <label className="app-label mb-0 text-amber-800 dark:text-amber-300">
                Palledari / Labour Pay Calculator (पल्लेदारी दर)
              </label>
              <div className="flex items-center gap-1.5 text-[11px]">
                <button
                  type="button"
                  onClick={() => setPalledariMode('PER_BAG')}
                  className={`px-2.5 py-1 rounded-xl font-extrabold transition-colors duration-150 ${
                    palledariMode === 'PER_BAG'
                      ? 'bg-amber-500 text-slate-950 shadow'
                      : 'bg-slate-200/80 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-300 dark:hover:bg-slate-700'
                  }`}
                >
                  Per Bag (प्रति बोरी)
                </button>
                <button
                  type="button"
                  onClick={() => setPalledariMode('PER_QTL')}
                  className={`px-2.5 py-1 rounded-xl font-extrabold transition-colors duration-150 ${
                    palledariMode === 'PER_QTL'
                      ? 'bg-amber-500 text-slate-950 shadow'
                      : 'bg-slate-200/80 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-300 dark:hover:bg-slate-700'
                  }`}
                >
                  Per Qtl (प्रति क्विंटल)
                </button>
                <button
                  type="button"
                  onClick={() => setPalledariMode('FIXED')}
                  className={`px-2.5 py-1 rounded-xl font-extrabold transition-colors duration-150 ${
                    palledariMode === 'FIXED'
                      ? 'bg-amber-500 text-slate-950 shadow'
                      : 'bg-slate-200/80 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-300 dark:hover:bg-slate-700'
                  }`}
                >
                  Fixed (फिक्स)
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {palledariMode === 'PER_BAG' && (
                <div>
                  <label className="app-label">No. of Bags (बोरी कट्टा संख्या)</label>
                  <input
                    type="number"
                    placeholder="e.g. 200 bags"
                    value={bagCount}
                    onChange={(e) => setBagCount(e.target.value)}
                    className="app-input"
                  />
                </div>
              )}

              <div>
                <label className="app-label">
                  {palledariMode === 'PER_BAG' ? 'Rate per Bag (दर ₹/बोरी)' : palledariMode === 'PER_QTL' ? 'Rate per Qtl (दर ₹/क्विंटल)' : 'Fixed Amount (राशि ₹)'}
                </label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="e.g. 12"
                  value={palledariRate}
                  onChange={(e) => setPalledariRate(e.target.value)}
                  className="app-input"
                />
              </div>

              <div>
                <label className="app-label text-amber-700 dark:text-amber-400">
                  Calculated Labour Total (कुल हम्माली ₹)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.labourCharges}
                  onChange={(e) => setFormData({ ...formData, labourCharges: e.target.value })}
                  className="app-input font-black text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/30"
                />
              </div>
            </div>
          </div>

          {/* Other Charges & Deductions */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="app-label">GST / Mandi Tax (मंडी शुल्क ₹)</label>
              <input
                type="number"
                step="0.01"
                placeholder="0"
                value={formData.gstAmount}
                onChange={(e) => setFormData({ ...formData, gstAmount: e.target.value })}
                className="app-input"
              />
            </div>

            <div>
              <label className="app-label">Freight / Other (भाड़ा/अन्य ख़र्च ₹)</label>
              <input
                type="number"
                step="0.01"
                placeholder="0"
                value={formData.otherExpenses}
                onChange={(e) => setFormData({ ...formData, otherExpenses: e.target.value })}
                className="app-input"
              />
            </div>

            <div>
              <label className="app-label text-rose-600 dark:text-rose-400">
                Deductions (कटौती/नमी ₹)
              </label>
              <input
                type="number"
                step="0.01"
                placeholder="0"
                value={formData.totalDeductions}
                onChange={(e) => setFormData({ ...formData, totalDeductions: e.target.value })}
                className="app-input text-rose-600 dark:text-rose-300 border-rose-300 dark:border-rose-800/80"
              />
            </div>
          </div>

          {/* Settlement: Advance Paid & Promised Payment Date */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="app-label text-emerald-700 dark:text-emerald-400">
                <CreditCard className="w-3.5 h-3.5" /> Advance Paid (अग्रिम राशि ₹)
              </label>
              <input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={formData.advancePaid}
                onChange={(e) => setFormData({ ...formData, advancePaid: e.target.value })}
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
                <option value="CASH">CASH (नकद)</option>
                <option value="BANK_TRANSFER">BANK TRANSFER (बैंक)</option>
                <option value="UPI">UPI / PhonePe / GPay</option>
                <option value="CHEQUE">CHEQUE (चेक)</option>
              </select>
            </div>

            <div>
              <label className="app-label text-amber-700 dark:text-amber-400">
                <Calendar className="w-3.5 h-3.5" /> Promised Pay Date (वादा तारीख)
              </label>
              <input
                type="date"
                value={formData.promisedDate}
                onChange={(e) => setFormData({ ...formData, promisedDate: e.target.value })}
                className="app-input font-bold text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-800/60"
              />
            </div>
          </div>

          {/* Live Summary Calculation Box */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white border border-emerald-500/30 space-y-2 shadow-xl">
            <div className="flex items-center justify-between text-xs text-slate-300">
              <span>Gross Value ({qty.toFixed(2)} {selectedUnit} × ₹{rate.toFixed(2)}):</span>
              <span className="font-bold text-white">₹{grossCropValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>

            {totalCharges > 0 && (
              <div className="flex items-center justify-between text-xs text-slate-300">
                <span>+ Charges (Palledari + GST + Freight):</span>
                <span className="font-bold text-emerald-400">+₹{totalCharges.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
            )}

            {deductions > 0 && (
              <div className="flex items-center justify-between text-xs text-rose-300">
                <span>- Deductions (Moisture/Bags):</span>
                <span className="font-bold text-rose-400">-₹{deductions.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
            )}

            <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-slate-400 uppercase">Total Bill Amount</div>
                <div className="text-lg font-black text-emerald-400">
                  ₹{netAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </div>
              </div>

              <div className="text-right">
                <div className="text-xs font-bold text-amber-400 uppercase">Net Payable Remaining</div>
                <div className="text-lg font-black text-amber-400">
                  ₹{dueAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </div>
              </div>
            </div>

            {formData.promisedDate && (
              <div className="text-[11px] text-amber-300/90 font-medium flex items-center justify-end gap-1 pt-1">
                <Calendar className="w-3.5 h-3.5" /> Remaining payment due by: {new Date(formData.promisedDate).toLocaleDateString('en-IN')}
              </div>
            )}
          </div>

          {/* Remarks */}
          <div>
            <label className="app-label">Remarks / Transaction Notes (टिप्पणी)</label>
            <input
              type="text"
              placeholder="e.g. Sharbati Wheat procurement, 200 bags unloaded at Main Godown"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="app-input"
            />
          </div>

          {/* Upload Purchase Slip (खरीदी पर्ची लोड करें) */}
          <div className="bg-emerald-500/5 p-4 rounded-2xl border border-emerald-500/20 space-y-2">
            <label className="app-label mb-0 text-emerald-800 dark:text-emerald-300">
              <Upload className="w-3.5 h-3.5 text-amber-500" /> Upload Purchase Slip Scan / Photo (खरीदी पर्ची लोड करें)
            </label>
            
            <div className="flex items-center gap-3">
              <label className="cursor-pointer px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black transition flex items-center gap-2 shadow-md">
                <Upload className="w-3.5 h-3.5" />
                {uploadingParchi ? 'Uploading Slip...' : 'Select File from Device'}
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={handleParchiUpload}
                  disabled={uploadingParchi}
                  className="hidden"
                />
              </label>

              {formData.parchiUrl ? (
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/30">
                  <ImageIcon className="w-4 h-4 text-emerald-500" />
                  <a href={formData.parchiUrl} target="_blank" rel="noreferrer" className="underline hover:text-emerald-300 truncate max-w-[200px]">
                    View Uploaded Slip 📄
                  </a>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, parchiUrl: '' })}
                    className="text-rose-500 hover:text-rose-700 ml-1 font-extrabold"
                    title="Remove File"
                  >
                    ×
                  </button>
                </div>
              ) : (
                <span className="text-[11px] text-slate-400 italic">Upload mandi paper receipt or digital slip scan</span>
              )}
            </div>
          </div>

          {/* Footer Submit Buttons */}
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
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-extrabold text-xs shadow-lg shadow-emerald-950/20 transition flex items-center gap-2 disabled:opacity-50"
            >
              {submitting ? 'Saving Voucher...' : 'Save Crop Purchase (खरीदी पर्ची दर्ज करें)'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
