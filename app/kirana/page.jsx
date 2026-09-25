'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Store,
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  Search,
  CreditCard,
  QrCode,
  DollarSign,
  UserCheck,
  Package,
  AlertTriangle,
  CheckCircle2,
  FileText,
  Printer,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  Clock,
  RefreshCw,
  TrendingUp,
  Receipt,
  X,
  Check,
  Phone,
  ArrowDownLeft,
  Edit,
  Save,
  Keyboard,
  Users,
  Building,
  Filter,
  CheckSquare,
  Sun,
  Moon,
  Banknote,
  Wheat,
  Upload,
  Image as ImageIcon,
  Truck,
  ArrowUpRight,
  FileSpreadsheet,
  ShieldCheck,
  Tag,
  Boxes,
  Zap,
  Calendar,
  User,
  History,
  BookOpen,
} from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { useTheme } from 'next-themes';

const KRN_UNITS = [
  { code: 'Kg', label: 'Kg (Kilogram / किलो)' },
  { code: 'Quintal', label: 'Quintal / Qtl (100 Kg / क्विंटल)' },
  { code: '1/2 Kg', label: '1/2 Kg (500g / आधा किलो)' },
  { code: '1/4 Kg', label: '1/4 Kg (250g / पाव 250g)' },
  { code: '100g', label: '100g (100 Grams / 100 ग्राम)' },
  { code: '50g', label: '50g (50 Grams / 50 ग्राम)' },
  { code: 'Ton', label: 'Ton (Metric Ton / 1000 Kg)' },
  { code: 'Pkt', label: 'Packet (Pkt / पैकेट)' },
  { code: 'Pcs', label: 'Piece (Pcs / पीस)' },
  { code: 'Ltr', label: 'Litre (Ltr / लीटर)' },
  { code: '500ml', label: '500ml (1/2 Litre / आधा लीटर)' },
  { code: 'Bag', label: 'Bori / Bag (50 Kg / बोरी)' },
  { code: 'Box', label: 'Box / Dabba (डिब्बा)' },
  { code: 'Dozen', label: 'Dozen (12 Pcs / दर्जन)' },
];

export default function KiranaStoreERPPage() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  const [activeTab, setActiveTab] = useState('billing'); // 'billing', 'inward', 'khata', 'employees', 'inventory', 'licenses'
  const [products, setProducts] = useState([]);
  const [parties, setParties] = useState([]);
  const [licenses, setLicenses] = useState([]);
  const [salesHistory, setSalesHistory] = useState([]);
  const [purchasesHistory, setPurchasesHistory] = useState([]);
  const [purchasesSummary, setPurchasesSummary] = useState({ totalInwardCost: 0, totalSupplierDue: 0, totalReceipts: 0 });
  const [khataData, setKhataData] = useState({ khataParties: [], totalStoreUdhaar: 0, employees: [] });
  const [loading, setLoading] = useState(true);

  // Khata Specific State
  const [selectedKhataCustomer, setSelectedKhataCustomer] = useState(null);
  const [khataSearchText, setKhataSearchText] = useState('');
  const [khataFilter, setKhataFilter] = useState('ALL'); // 'ALL', 'HAS_DUE', 'CLEARED'
  const [showPassbookPrintModal, setShowPassbookPrintModal] = useState(false);
  const [showNewCustomerModal, setShowNewCustomerModal] = useState(false);
  const [newCustomerForm, setNewCustomerForm] = useState({
    name: '',
    phone: '',
    city: 'Robertsganj, Sonebhadra',
    initialBalance: '0',
  });

  // Category filter for POS gallery
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  // Billing Grid Entry State
  const [itemSearchText, setItemSearchText] = useState('');
  const [cashTendered, setCashTendered] = useState('');

  // Invoice Table Grid Items
  const [invoiceRows, setInvoiceRows] = useState([]);
  const [overallDiscount, setOverallDiscount] = useState(0);
  const [paymentMode, setPaymentMode] = useState('CASH'); // CASH, UPI, CREDIT
  const [selectedPartyId, setSelectedPartyId] = useState('');
  const [customerName, setCustomerName] = useState('Counter Cash Customer');
  const [customerPhone, setCustomerPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Modals
  const [showProductModal, setShowProductModal] = useState(false);
  const [showBulkStockModal, setShowBulkStockModal] = useState(false);
  const [bulkInputText, setBulkInputText] = useState('');
  const [showJamaModal, setShowJamaModal] = useState(false);
  const [showEmployeeModal, setShowEmployeeModal] = useState(false);
  const [showInwardModal, setShowInwardModal] = useState(false);

  // Jama & Supplier Payout Modals
  const [supplierLedgers, setSupplierLedgers] = useState([]);
  const [showSupplierPayoutModal, setShowSupplierPayoutModal] = useState(false);
  const [selectedSupplierForPayout, setSelectedSupplierForPayout] = useState(null);
  const [supplierPayoutAmount, setSupplierPayoutAmount] = useState('');
  const [supplierPayoutMode, setSupplierPayoutMode] = useState('CASH');
  const [supplierPayoutNotes, setSupplierPayoutNotes] = useState('');
  const [isAddingNewSupplier, setIsAddingNewSupplier] = useState(false);

  const [jamaCustomer, setJamaCustomer] = useState(null);
  const [jamaAmount, setJamaAmount] = useState('');
  const [jamaMode, setJamaMode] = useState('CASH');
  const [jamaNotes, setJamaNotes] = useState('');

  // Receipt Modal
  const [completedBill, setCompletedBill] = useState(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);

  // Product Form State (Add / Edit)
  const [productForm, setProductForm] = useState({
    id: null,
    name: '',
    localName: '',
    category: 'Groceries & Spices',
    mrp: '',
    purchasePrice: '',
    sellingPrice: '',
    unit: 'Pkt',
    currentStock: '50',
    minStockLevel: '10',
    barcode: '',
  });

  // Employee Form State
  const [employeeForm, setEmployeeForm] = useState({
    fullName: '',
    role: 'COUNTER_SALES',
    phone: '',
    salaryType: 'MONTHLY',
    baseSalary: '',
  });

  // Inward Purchase / Mandi Buying Form State
  const [inwardForm, setInwardForm] = useState({
    date: new Date().toISOString().split('T')[0],
    supplierName: '',
    supplierPhone: '',
    invoiceNo: '',
    taxCharges: '0',
    paidAmount: '',
    paymentMode: 'CASH',
    parchiDocUrl: '',
    notes: '',
  });

  const [inwardRows, setInwardRows] = useState([
    { productId: '', itemName: 'Aaloo (Potato)', unit: 'Kg', quantity: '100', purchasePrice: '20' },
    { productId: '', itemName: 'Pyaj (Onion)', unit: 'Kg', quantity: '50', purchasePrice: '30' },
  ]);

  const [uploadingDoc, setUploadingDoc] = useState(false);
  const searchInputRef = useRef(null);

  useEffect(() => {
    setMounted(true);
    fetchInitialData();

    // Keyboard shortcuts for ERP billing (F2, F3, F4, F5, F8, F9)
    const handleKeyDown = (e) => {
      if (e.key === 'F2') {
        e.preventDefault();
        setActiveTab('billing');
      } else if (e.key === 'F3') {
        e.preventDefault();
        setActiveTab('inward');
      } else if (e.key === 'F4') {
        e.preventDefault();
        setActiveTab('khata');
      } else if (e.key === 'F5') {
        e.preventDefault();
        setActiveTab('employees');
      } else if (e.key === 'F8') {
        e.preventDefault();
        setActiveTab('inventory');
      } else if (e.key === 'F9') {
        e.preventDefault();
        setActiveTab('licenses');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [prodRes, partyRes, licRes, salesRes, khataRes, purRes] = await Promise.all([
        fetch('/api/kirana/products'),
        fetch('/api/parties'),
        fetch('/api/compliance/licenses'),
        fetch('/api/kirana/sales'),
        fetch('/api/kirana/khata'),
        fetch('/api/kirana/purchases'),
      ]);

      const prodData = await prodRes.json();
      const partyData = await partyRes.json();
      const licData = await licRes.json();
      const salesData = await salesRes.json();
      const khataJson = await khataRes.json();
      const purJson = await purRes.json();

      if (prodData.success) setProducts(prodData.data);
      if (partyData.success) setParties(partyData.data);
      if (licData.success) setLicenses(licData.data);
      if (salesData.success) setSalesHistory(salesData.data || []);
      if (khataJson.success) {
        setKhataData(khataJson.data);
        const partiesList = khataJson.data.khataParties || [];
        if (partiesList.length > 0) {
          setSelectedKhataCustomer((prev) => {
            if (prev) {
              const updated = partiesList.find((p) => p.id === prev.id);
              return updated || partiesList[0];
            }
            return partiesList[0];
          });
        }
      }
      if (purJson.success) {
        setPurchasesHistory(purJson.data || []);
        setSupplierLedgers(purJson.supplierLedgers || []);
        setPurchasesSummary(purJson.summary || { totalInwardCost: 0, totalSupplierDue: 0, totalReceipts: 0 });
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load Kirana store ERP data');
    } finally {
      setLoading(false);
    }
  };

  const isDarkMode = (resolvedTheme || theme) === 'dark';

  const toggleTheme = () => {
    setTheme(isDarkMode ? 'light' : 'dark');
  };

  // Upload Parchi Photo Handler
  const handleParchiUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const data = new FormData();
    data.append('file', file);

    setUploadingDoc(true);
    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: data,
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Upload failed');

      setInwardForm((prev) => ({ ...prev, parchiDocUrl: json.url }));
      toast.success('Parchi / Bill receipt uploaded successfully!');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setUploadingDoc(false);
    }
  };

  // Save Stock Inward Purchase / Mandi Receipt
  const handleSaveInwardPurchase = async (e) => {
    e.preventDefault();

    if (!inwardForm.supplierName) {
      toast.error('Please enter Supplier / Mandi Trader Name');
      return;
    }

    if (inwardRows.length === 0) {
      toast.error('Add at least one item');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/kirana/purchases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...inwardForm,
          items: inwardRows,
          taxCharges: parseFloat(inwardForm.taxCharges || 0),
          paidAmount: inwardForm.paidAmount !== '' ? parseFloat(inwardForm.paidAmount) : undefined,
        }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success(`Stock Inward #${data.data.purchaseNo} saved! Stock credited to inventory! 🎉`);
        setShowInwardModal(false);
        setInwardForm({
          date: new Date().toISOString().split('T')[0],
          supplierName: '',
          supplierPhone: '',
          invoiceNo: '',
          taxCharges: '0',
          paidAmount: '',
          paymentMode: 'CASH',
          parchiDocUrl: '',
          notes: '',
        });
        setInwardRows([{ productId: '', itemName: '', unit: 'Kg', quantity: '1', purchasePrice: '0', sellingPrice: '', mrp: '' }]);
        fetchInitialData();
      } else {
        toast.error(data.error || 'Failed to save stock inward');
      }
    } catch (err) {
      console.error(err);
      toast.error('Error saving inward purchase');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Add Item Row in Inward Form
  const handleAddInwardRow = () => {
    setInwardRows([...inwardRows, { productId: '', itemName: '', unit: 'Kg', quantity: '1', purchasePrice: '0', sellingPrice: '', mrp: '' }]);
  };

  const handleRemoveInwardRow = (index) => {
    setInwardRows(inwardRows.filter((_, i) => i !== index));
  };

  const handleUpdateInwardRow = (index, field, value) => {
    const updated = [...inwardRows];
    updated[index][field] = value;

    if (field === 'productId' && value) {
      const prod = products.find((p) => p.id === value);
      if (prod) {
        updated[index].itemName = prod.name;
        updated[index].unit = prod.unit || 'Kg';
        updated[index].purchasePrice = prod.purchasePrice || '0';
        updated[index].sellingPrice = prod.sellingPrice || prod.mrp || '0';
        updated[index].mrp = prod.mrp || prod.sellingPrice || '0';
      }
    }
    setInwardRows(updated);
  };

  // Inward Total Calculations
  const inwardItemsTotal = inwardRows.reduce(
    (sum, r) => sum + parseFloat(r.quantity || 0) * parseFloat(r.purchasePrice || 0),
    0
  );
  const inwardGrandTotal = inwardItemsTotal + parseFloat(inwardForm.taxCharges || 0);

  // Real-Time Bulk Stock Upload Parser & Total Valuation Calculator
  const parsedBulkSummary = (() => {
    if (!bulkInputText.trim()) {
      return { itemsCount: 0, totalQty: 0, totalPurchaseValue: 0, totalRetailValue: 0, margin: 0 };
    }
    const lines = bulkInputText.split('\n').filter((l) => l.trim().length > 0);
    let itemsCount = 0;
    let totalQty = 0;
    let totalPurchaseValue = 0;
    let totalRetailValue = 0;

    for (const line of lines) {
      if (line.toLowerCase().includes('item name') || line.toLowerCase().includes('selling price')) continue;
      const parts = line.split(',').map((p) => p.trim());
      if (parts.length >= 1 && parts[0]) {
        itemsCount += 1;
        const mrp = parts[2] ? parseFloat(parts[2]) : undefined;
        const buyPrice = parts[3] ? parseFloat(parts[3]) : 0;
        const sellPrice = parts[4] ? parseFloat(parts[4]) : mrp || 10;
        const stockQty = parts[6] ? parseFloat(parts[6]) : parts[1] && !isNaN(parseFloat(parts[1])) ? parseFloat(parts[1]) : 50;

        totalQty += stockQty;
        totalPurchaseValue += stockQty * buyPrice;
        totalRetailValue += stockQty * sellPrice;
      }
    }
    const margin = totalRetailValue - totalPurchaseValue;
    return { itemsCount, totalQty, totalPurchaseValue, totalRetailValue, margin };
  })();

  const handleSendWhatsAppReminder = (customer) => {
    if (!customer?.phone || customer.phone === 'N/A') {
      toast.error('Customer phone number not available!');
      return;
    }
    const cleanPhone = customer.phone.replace(/[^0-9]/g, '');
    const dueAmt = Math.abs(parseFloat(customer.currentBalance || 0)).toFixed(2);
    const msg = `Namaste ${customer.name} Ji! 🙏\nYour remaining Kirana & Mandi store credit (Udhaar) balance at *Nawaz Traders Kirana* is *₹${dueAmt}*.\n\nPlease drop by or pay via UPI when convenient. Thank you! 🌾`;
    window.open(`https://wa.me/91${cleanPhone}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  // Add Product to Cart Grid
  const handleAddToCart = (product, quantityToAdd = 1) => {
    const qty = parseFloat(quantityToAdd || 1);
    const rate = parseFloat(product.sellingPrice);
    const grossAmount = qty * rate;

    const existingIndex = invoiceRows.findIndex((r) => r.productId === product.id);
    if (existingIndex >= 0) {
      const updated = [...invoiceRows];
      const newQty = updated[existingIndex].quantity + qty;
      const newGross = newQty * rate;
      updated[existingIndex] = {
        ...updated[existingIndex],
        quantity: newQty,
        totalAmount: newGross,
      };
      setInvoiceRows(updated);
    } else {
      setInvoiceRows([
        ...invoiceRows,
        {
          productId: product.id,
          sku: product.sku,
          name: product.name,
          localName: product.localName,
          unit: product.unit,
          mrp: parseFloat(product.mrp),
          quantity: qty,
          sellingPrice: rate,
          discountPct: 0,
          totalAmount: grossAmount,
        },
      ]);
    }
    toast.success(`Added ${product.name} to cart`, { duration: 600 });
  };

  const handleRemoveRow = (index) => {
    setInvoiceRows(invoiceRows.filter((_, i) => i !== index));
  };

  const handleUpdateRowQty = (index, newQty) => {
    if (newQty <= 0) return;
    const updated = [...invoiceRows];
    const row = updated[index];
    const gross = newQty * row.sellingPrice;
    updated[index] = {
      ...row,
      quantity: newQty,
      totalAmount: gross,
    };
    setInvoiceRows(updated);
  };

  // Billing Totals
  const subtotal = invoiceRows.reduce((sum, r) => sum + r.totalAmount, 0);
  const netTotal = Math.max(0, subtotal - parseFloat(overallDiscount || 0));
  const totalQtyCount = invoiceRows.reduce((sum, r) => sum + r.quantity, 0);

  // Save & Print Invoice [F10]
  const handleSaveInvoice = async (shouldPrint = true) => {
    if (invoiceRows.length === 0) {
      toast.error('Cart is empty!');
      return;
    }

    if (paymentMode === 'CREDIT' && !selectedPartyId && !customerPhone) {
      toast.error('For Udhaar (Credit) sale, select a Farmer/Party or enter Customer Phone!');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        customerName: customerName || 'Counter Cash Customer',
        customerPhone: customerPhone || undefined,
        partyId: selectedPartyId || undefined,
        paymentMode: paymentMode,
        discountAmount: parseFloat(overallDiscount || 0),
        taxAmount: 0,
        paidAmount: paymentMode === 'CREDIT' ? 0 : netTotal,
        items: invoiceRows.map((r) => ({
          productId: r.productId,
          sku: r.sku,
          name: r.name,
          quantity: r.quantity,
          unit: r.unit,
          mrp: r.mrp,
          sellingPrice: r.sellingPrice,
          totalAmount: r.totalAmount,
        })),
      };

      const res = await fetch('/api/kirana/sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        toast.success(`POS Invoice ${data.data.invoiceNo} saved!`);
        if (shouldPrint) {
          setCompletedBill(data.data);
          setShowReceiptModal(true);
        }
        // Clear cart
        setInvoiceRows([]);
        setCustomerName('Counter Cash Customer');
        setCustomerPhone('');
        setSelectedPartyId('');
        setOverallDiscount(0);
        setPaymentMode('CASH');
        fetchInitialData();
      } else {
        toast.error(data.error || 'Failed to save invoice');
      }
    } catch (err) {
      console.error(err);
      toast.error('Error completing sale invoice');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Save Product (Add / Edit)
  const handleSaveProduct = async (e) => {
    e.preventDefault();
    if (!productForm.name || !productForm.sellingPrice) {
      toast.error('Product Name and Selling Price are required!');
      return;
    }

    try {
      const isEdit = !!productForm.id;
      const url = '/api/kirana/products';
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productForm),
      });

      const data = await res.json();
      if (data.success) {
        toast.success(isEdit ? 'Product updated!' : 'New product created!');
        setShowProductModal(false);
        setProductForm({
          id: null,
          name: '',
          localName: '',
          category: 'Groceries & Spices',
          mrp: '',
          purchasePrice: '',
          sellingPrice: '',
          unit: 'Pkt',
          currentStock: '50',
          minStockLevel: '10',
          barcode: '',
        });
        fetchInitialData();
      } else {
        toast.error(data.error || 'Failed to save product');
      }
    } catch (err) {
      toast.error('Error saving product');
    }
  };

  // Save Jama / Recovery Payment
  const handleSaveJama = async (e) => {
    e.preventDefault();
    if (!jamaAmount || parseFloat(jamaAmount) <= 0) {
      toast.error('Enter valid recovery amount');
      return;
    }

    try {
      const res = await fetch('/api/kirana/khata', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          partyId: jamaCustomer?.partyId || jamaCustomer?.id,
          customerName: jamaCustomer?.name,
          customerPhone: jamaCustomer?.phone,
          amount: parseFloat(jamaAmount),
          paymentMode: jamaMode,
          notes: jamaNotes,
        }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success(`₹${jamaAmount} Jama payment recorded for ${jamaCustomer.name}!`);
        setShowJamaModal(false);
        setJamaAmount('');
        setJamaNotes('');
        fetchInitialData();
      } else {
        toast.error(data.error || 'Jama payment failed');
      }
    } catch (err) {
      toast.error('Error processing Jama payment');
    }
  };

  // Save Payout / Cash Parchi Payment to Mandi Supplier
  const handleSaveSupplierPayout = async (e) => {
    e.preventDefault();
    if (!supplierPayoutAmount || parseFloat(supplierPayoutAmount) <= 0) {
      toast.error('Enter valid payout amount');
      return;
    }

    if (!selectedSupplierForPayout?.supplierName) {
      toast.error('Select a Mandi Supplier first');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/kirana/purchases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'RECORD_SUPPLIER_PAYOUT',
          supplierName: selectedSupplierForPayout.supplierName,
          supplierPhone: selectedSupplierForPayout.supplierPhone,
          partyId: selectedSupplierForPayout.partyId,
          amount: parseFloat(supplierPayoutAmount),
          paymentMode: supplierPayoutMode,
          notes: supplierPayoutNotes,
        }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success(`₹${supplierPayoutAmount} payout paid to Mandi Supplier ${selectedSupplierForPayout.supplierName}!`);
        setShowSupplierPayoutModal(false);
        setSupplierPayoutAmount('');
        setSupplierPayoutNotes('');
        setSelectedSupplierForPayout(null);
        fetchInitialData();
      } else {
        toast.error(data.error || 'Failed to record supplier payout');
      }
    } catch (err) {
      toast.error('Error saving supplier payout');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Save New Employee
  const handleSaveEmployee = async (e) => {
    e.preventDefault();
    if (!employeeForm.fullName || !employeeForm.baseSalary) {
      toast.error('Employee Name & Salary required');
      return;
    }

    try {
      const res = await fetch('/api/employees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: employeeForm.fullName,
          designation: employeeForm.role,
          phone: employeeForm.phone,
          salaryType: employeeForm.salaryType,
          baseSalary: parseFloat(employeeForm.baseSalary),
          department: 'KIRANA_STORE',
        }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success('Staff employee created!');
        setShowEmployeeModal(false);
        setEmployeeForm({ fullName: '', role: 'COUNTER_SALES', phone: '', salaryType: 'MONTHLY', baseSalary: '' });
        fetchInitialData();
      } else {
        toast.error(data.error || 'Failed to add employee');
      }
    } catch (err) {
      toast.error('Error creating staff member');
    }
  };

  // Create New Credit Customer Profile
  const handleCreateNewCustomer = async (e) => {
    e.preventDefault();
    if (!newCustomerForm.name || !newCustomerForm.phone) {
      toast.error('Customer Full Name & Mobile Phone are required!');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/parties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newCustomerForm.name,
          phone: newCustomerForm.phone,
          city: newCustomerForm.city || 'Robertsganj, Sonebhadra',
          roles: ['CUSTOMER'],
          openingBalance: parseFloat(newCustomerForm.initialBalance || 0),
          balanceType: 'RECEIVABLE',
          status: 'ACTIVE',
        }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success(`Credit Customer "${newCustomerForm.name}" created!`);
        setShowNewCustomerModal(false);
        setNewCustomerForm({ name: '', phone: '', city: 'Robertsganj, Sonebhadra', initialBalance: '0' });
        fetchInitialData();
      } else {
        const errorMsg = data.details
          ? data.details.map((d) => `${d.path?.join('.')}: ${d.message}`).join(', ')
          : data.error || 'Failed to add customer profile';
        toast.error(errorMsg);
      }
    } catch (err) {
      console.error(err);
      toast.error('Error creating credit customer');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Quick Single-Tap Stock Adjuster (+ / -)
  const handleQuickStockAdjust = async (productId, stockChange) => {
    try {
      const res = await fetch('/api/kirana/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'QUICK_STOCK_ADJUST',
          productId,
          stockChange,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Stock updated (${stockChange > 0 ? '+' : ''}${stockChange})!`);
        fetchInitialData();
      } else {
        toast.error(data.error || 'Stock adjustment failed');
      }
    } catch (err) {
      toast.error('Failed to update stock');
    }
  };

  // Bulk Batch Stock Import & Multi-Line Quick Text Paste
  const handleSaveBulkStock = async (e) => {
    e.preventDefault();
    if (!bulkInputText.trim()) {
      toast.error('Paste or type items to import');
      return;
    }

    setIsSubmitting(true);
    try {
      const lines = bulkInputText.split('\n').filter((l) => l.trim().length > 0);
      const bulkItems = [];

      for (const line of lines) {
        if (line.toLowerCase().includes('item name') || line.toLowerCase().includes('selling price')) continue;

        const parts = line.split(',').map((p) => p.trim());
        if (parts.length >= 1 && parts[0]) {
          const name = parts[0];
          const category = parts[1] && isNaN(parseFloat(parts[1])) ? parts[1] : 'Groceries & Spices';
          const mrp = parts[2] ? parseFloat(parts[2]) : undefined;
          const purchasePrice = parts[3] ? parseFloat(parts[3]) : undefined;
          const sellingPrice = parts[4] ? parseFloat(parts[4]) : mrp || 10;
          const unit = parts[5] || 'Kg';
          const currentStock = parts[6] ? parseFloat(parts[6]) : parts[1] && !isNaN(parseFloat(parts[1])) ? parseFloat(parts[1]) : 50;

          bulkItems.push({
            name,
            category,
            mrp: mrp || sellingPrice,
            purchasePrice: purchasePrice || 0,
            sellingPrice,
            unit,
            currentStock,
          });
        }
      }

      if (bulkItems.length === 0) {
        toast.error('No valid items parsed');
        setIsSubmitting(false);
        return;
      }

      const res = await fetch('/api/kirana/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bulkItems }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success(`Successfully imported ${data.data?.length || bulkItems.length} items to inventory!`);
        setShowBulkStockModal(false);
        setBulkInputText('');
        fetchInitialData();
      } else {
        toast.error(data.error || 'Bulk import failed');
      }
    } catch (err) {
      toast.error('Error importing bulk stock');
    } finally {
      setIsSubmitting(false);
    }
  };

  const categories = ['ALL', 'Groceries & Spices', 'Vegetables & Mandi', 'Snacks & Drinks', 'Oils & Ghee', 'Personal Care', 'Household Items', 'Dairy & Bakery'];

  const filteredProducts = products.filter((p) => {
    const matchesCat = selectedCategory === 'ALL' || p.category === selectedCategory;
    const matchesSearch =
      !itemSearchText ||
      p.name.toLowerCase().includes(itemSearchText.toLowerCase()) ||
      (p.localName && p.localName.toLowerCase().includes(itemSearchText.toLowerCase())) ||
      (p.sku && p.sku.toLowerCase().includes(itemSearchText.toLowerCase())) ||
      (p.barcode && p.barcode.includes(itemSearchText));
    return matchesCat && matchesSearch;
  });

  const filteredKhataParties = (khataData.khataParties || []).filter((p) => {
    const matchesSearch =
      !khataSearchText ||
      p.name.toLowerCase().includes(khataSearchText.toLowerCase()) ||
      (p.phone && p.phone.includes(khataSearchText)) ||
      (p.partyCode && p.partyCode.toLowerCase().includes(khataSearchText.toLowerCase())) ||
      (p.city && p.city.toLowerCase().includes(khataSearchText.toLowerCase()));

    const matchesFilter =
      khataFilter === 'ALL' ||
      (khataFilter === 'HAS_DUE' && p.currentBalance > 0) ||
      (khataFilter === 'CLEARED' && p.currentBalance <= 0);

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white font-sans pb-16 transition-colors duration-200">
      {/* 🏢 STORE HEADER NAV BAR WITH RICH #70161E DEEP WINE BURGUNDY THEME */}
      <header className="bg-gradient-to-r from-[#70161E] via-[#561117] to-[#420D12] text-white sticky top-0 z-40 border-b border-[#70161E]/80 shadow-md backdrop-blur-md">
        <div className="max-w-[1650px] mx-auto px-4 sm:px-6 lg:px-8 py-2.5">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            {/* Store Brand Header */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-400/20 text-amber-300 border border-amber-400/30 font-black flex items-center justify-center font-outfit shadow-sm shrink-0">
                <Store className="w-5 h-5 text-amber-300" />
              </div>
              <div>
                <h1 className="text-base font-extrabold tracking-tight text-white uppercase font-outfit flex items-center gap-2">
                  NAWAZ TRADERS • RETAIL &amp; MANDI STORE
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-amber-400/20 text-amber-300 border border-amber-400/30 font-outfit">
                    <Building className="w-3 h-3 text-amber-300" /> ROBERTSGANJ (UP-64)
                  </span>
                </h1>
                <p className="text-[11px] text-rose-200/90 font-medium tracking-wide flex items-center gap-1.5 mt-0.5 font-outfit">
                  <ShieldCheck className="w-3.5 h-3.5 shrink-0 text-amber-300" />
                  <span>Robertsganj Mandi Yard • UP Mandi Tax 1.5% + Cess 0.5% • FSDA UP • Scale Tax Stamp</span>
                </p>
              </div>
            </div>

            {/* Metrics & Theme Toggle & ERP Link */}
            <div className="flex flex-wrap items-center gap-2.5 text-xs font-outfit">
              <div className="bg-black/30 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/15 shadow-sm flex items-center gap-2 font-mono">
                <FileText className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span className="text-rose-200/80 text-[10px] font-bold uppercase tracking-wider">STORE UDHAAR:</span>
                <span className="text-amber-300 font-black text-sm font-bahi">
                  ₹{(parseFloat(khataData?.totalStoreUdhaar) || 0).toFixed(2)}
                </span>
              </div>

              <div className="bg-black/30 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/15 shadow-sm flex items-center gap-2 font-mono">
                <Truck className="w-3.5 h-3.5 text-rose-300 shrink-0" />
                <span className="text-rose-200/80 text-[10px] font-bold uppercase tracking-wider">SUPPLIER DUE:</span>
                <span className="text-rose-200 font-black text-sm font-bahi">
                  ₹{(parseFloat(purchasesSummary?.totalSupplierDue) || 0).toFixed(2)}
                </span>
              </div>

              {/* Theme Toggle Button */}
              {mounted && (
                <button
                  onClick={toggleTheme}
                  title="Toggle Light/Dark Theme"
                  className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/15 transition shadow-sm flex items-center justify-center"
                >
                  {isDarkMode ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4 text-rose-200" />}
                </button>
              )}

              <Link
                href="/"
                className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl shadow-md transition text-xs font-outfit uppercase tracking-wider flex items-center gap-1.5"
              >
                <Wheat className="w-3.5 h-3.5 shrink-0 text-slate-950" />
                <span>Main Grain ERP</span>
                <ArrowRight className="w-3.5 h-3.5 shrink-0 text-slate-950" />
              </Link>
            </div>
          </div>

          {/* STORE SHORTCUT TABS BAR MATCHING ERP NAV PILLS */}
          <div className="mt-2.5 pt-2 border-t border-white/15">
            <nav className="flex items-center gap-1.5 bg-black/25 p-1 rounded-2xl border border-white/15 backdrop-blur-md overflow-x-auto text-xs font-outfit">
              <button
                onClick={() => setActiveTab('billing')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl transition ${
                  activeTab === 'billing'
                    ? 'bg-white text-[#70161E] font-extrabold shadow-md'
                    : 'text-rose-100 hover:text-white hover:bg-white/15 font-semibold'
                }`}
              >
                <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${activeTab === 'billing' ? 'bg-[#70161E]/15 text-[#70161E]' : 'bg-black/30 text-amber-300'}`}>F2</span>
                <ShoppingCart className="w-3.5 h-3.5 shrink-0" />
                <span>POS Billing Counter</span>
              </button>

              <button
                onClick={() => setActiveTab('inward')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl transition ${
                  activeTab === 'inward'
                    ? 'bg-white text-[#70161E] font-extrabold shadow-md'
                    : 'text-rose-100 hover:text-white hover:bg-white/15 font-semibold'
                }`}
              >
                <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${activeTab === 'inward' ? 'bg-[#70161E]/15 text-[#70161E]' : 'bg-black/30 text-amber-300'}`}>F3</span>
                <Truck className="w-3.5 h-3.5 shrink-0" />
                <span>Stock Inward &amp; Mandi Purchases ({purchasesHistory.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('khata')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl transition ${
                  activeTab === 'khata'
                    ? 'bg-white text-[#70161E] font-extrabold shadow-md'
                    : 'text-rose-100 hover:text-white hover:bg-white/15 font-semibold'
                }`}
              >
                <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${activeTab === 'khata' ? 'bg-[#70161E]/15 text-[#70161E]' : 'bg-black/30 text-amber-300'}`}>F4</span>
                <BookOpen className="w-3.5 h-3.5 shrink-0" />
                <span>Store Udhaar Daily Register ({khataData.khataParties?.length || 0})</span>
              </button>

              <button
                onClick={() => setActiveTab('employees')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl transition ${
                  activeTab === 'employees'
                    ? 'bg-white text-[#70161E] font-extrabold shadow-md'
                    : 'text-rose-100 hover:text-white hover:bg-white/15 font-semibold'
                }`}
              >
                <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${activeTab === 'employees' ? 'bg-[#70161E]/15 text-[#70161E]' : 'bg-black/30 text-amber-300'}`}>F5</span>
                <Users className="w-3.5 h-3.5 shrink-0" />
                <span>Store Staff ({khataData.employees?.length || 0})</span>
              </button>

              <button
                onClick={() => setActiveTab('inventory')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl transition ${
                  activeTab === 'inventory'
                    ? 'bg-white text-[#70161E] font-extrabold shadow-md'
                    : 'text-rose-100 hover:text-white hover:bg-white/15 font-semibold'
                }`}
              >
                <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${activeTab === 'inventory' ? 'bg-[#70161E]/15 text-[#70161E]' : 'bg-black/30 text-amber-300'}`}>F8</span>
                <Package className="w-3.5 h-3.5 shrink-0" />
                <span>Stock Master ({products.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('licenses')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl transition ${
                  activeTab === 'licenses'
                    ? 'bg-amber-400 text-slate-950 font-extrabold shadow-md'
                    : 'text-rose-100 hover:text-white hover:bg-white/15 font-semibold'
                }`}
              >
                <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${activeTab === 'licenses' ? 'bg-slate-950/20 text-slate-950' : 'bg-black/30 text-amber-300'}`}>F9</span>
                <ShieldAlert className="w-3.5 h-3.5 shrink-0 text-amber-300" />
                <span>UP Sonebhadra Compliance ({licenses.length})</span>
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* 🏢 MAIN STORE WORKSPACE MATCHING ERP MAIN LAYOUT */}
      <main className="max-w-[1650px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 animate-in fade-in duration-200">
        {/* VIEW 1: RETAIL POS BILLING TERMINAL [F2] */}
        {activeTab === 'billing' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* LEFT 7 COLS: CATALOG & CATEGORIES */}
            <div className="lg:col-span-7 space-y-4">
              {/* Search Bar & Category Filter Pills */}
              <div className="glass-card p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-3">
                <div className="relative">
                  <Search className="w-4 h-4 text-[#70161E] dark:text-[#A8323E] absolute left-3.5 top-3.5" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Search grocery item, barcode, or Hindi name (e.g. Kurkure, Atta, Mustard Oil, Aaloo)..."
                    value={itemSearchText}
                    onChange={(e) => setItemSearchText(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:border-[#70161E] dark:focus:border-[#A8323E] transition-all shadow-inner font-outfit"
                  />
                  {itemSearchText && (
                    <button
                      onClick={() => setItemSearchText('')}
                      className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Categories */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-outfit">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3 py-1.5 rounded-xl font-semibold whitespace-nowrap transition ${
                        selectedCategory === cat
                          ? 'bg-[#70161E] text-white font-extrabold shadow-md'
                          : 'bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200/60 dark:border-slate-800/60'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Product Cards Visual Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5 max-h-[630px] overflow-y-auto pr-1">
                {filteredProducts.map((p) => {
                  const isLow = parseFloat(p.currentStock) <= parseFloat(p.minStockLevel);
                  return (
                    <div
                      key={p.id}
                      onClick={() => handleAddToCart(p, 1)}
                      className="glass-card p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 hover:border-[#70161E] dark:hover:border-[#A8323E] transition-all duration-200 cursor-pointer group flex flex-col justify-between shadow-sm hover:shadow-md"
                    >
                      <div>
                        <div className="flex justify-between items-start gap-1 mb-2">
                          <span className="text-[10px] font-mono text-[#70161E] dark:text-[#A8323E] font-bold bg-[#70161E]/10 px-2 py-0.5 rounded-md border border-[#70161E]/20">
                            {p.sku}
                          </span>
                          <span
                            className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                              isLow
                                ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                                : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                            }`}
                          >
                            Stock: {p.currentStock} {p.unit}
                          </span>
                        </div>

                        <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 flex items-center justify-center text-[#70161E] dark:text-[#A8323E] mb-2 group-hover:scale-105 transition-transform">
                          <Package className="w-5 h-5" />
                        </div>

                        <h3 className="font-extrabold text-xs text-slate-900 dark:text-white group-hover:text-[#70161E] dark:group-hover:text-rose-400 transition font-outfit line-clamp-1">
                          {p.name}
                        </h3>
                        {p.localName && (
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium italic mt-0.5 font-outfit">
                            {p.localName}
                          </div>
                        )}
                      </div>

                      <div className="mt-3 flex justify-between items-end pt-2.5 border-t border-slate-100 dark:border-slate-800/60">
                        <div>
                          <div className="text-[10px] text-slate-400 line-through font-bahi">MRP ₹{p.mrp}</div>
                          <div className="text-base font-black text-slate-900 dark:text-white font-bahi">
                            ₹{p.sellingPrice}
                            <span className="text-[10px] text-slate-400 font-normal"> / {p.unit}</span>
                          </div>
                        </div>

                        <button className="w-8 h-8 rounded-xl bg-[#70161E] text-white hover:bg-[#561117] flex items-center justify-center font-black transition group-hover:scale-105 shadow-sm">
                          <Plus className="w-4 h-4 shrink-0" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* RIGHT 5 COLS: POS CART & CHECKOUT DRAWER */}
            <div className="lg:col-span-5 space-y-4">
              <div className="glass-card p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-xl space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-slate-800/80 pb-3">
                  <div className="flex items-center gap-2">
                    <Receipt className="w-5 h-5 text-[#70161E] dark:text-[#A8323E] shrink-0" />
                    <h2 className="font-extrabold text-sm text-slate-900 dark:text-white font-outfit uppercase tracking-tight">
                      Active POS Bill Cart
                    </h2>
                  </div>
                  <span className="text-xs font-mono font-bold text-[#70161E] dark:text-[#A8323E] bg-[#70161E]/10 px-2.5 py-1 rounded-lg border border-[#70161E]/20">
                    KRN-2026-{String(salesHistory.length + 1).padStart(4, '0')}
                  </span>
                </div>

                {/* Customer Details */}
                <div className="space-y-3 text-xs font-outfit">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase font-outfit block mb-1">
                        Customer Name / Walk-In
                      </label>
                      <input
                        type="text"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="e.g. Ramesh Patel"
                        className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:border-[#70161E] dark:focus:border-[#A8323E]"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase font-outfit block mb-1">
                        Customer Phone / Mobile
                      </label>
                      <input
                        type="text"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        placeholder="e.g. 9876543210"
                        className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:border-[#70161E] dark:focus:border-[#A8323E]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase font-outfit block mb-1">
                      Link Farmer / Party Profile (For Kirana Udhaar Advance)
                    </label>
                    <select
                      value={selectedPartyId}
                      onChange={(e) => {
                        setSelectedPartyId(e.target.value);
                        const found = parties.find((p) => p.id === e.target.value);
                        if (found) setCustomerName(found.name);
                      }}
                      className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:border-[#70161E] dark:focus:border-[#A8323E]"
                    >
                      <option value="">-- Counter Walk-In (No Udhaar Link) --</option>
                      {parties.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.partyCode} • {p.city || 'Sonebhadra'})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Payment Terms Selector */}
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase font-outfit block mb-1">
                      Payment Method
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => setPaymentMode('CASH')}
                        className={`py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                          paymentMode === 'CASH'
                            ? 'bg-[#70161E] text-white font-extrabold shadow-sm'
                            : 'bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800'
                        }`}
                      >
                        <Banknote className="w-4 h-4 shrink-0" />
                        <span>CASH</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPaymentMode('UPI')}
                        className={`py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                          paymentMode === 'UPI'
                            ? 'bg-[#70161E] text-white font-extrabold shadow-sm'
                            : 'bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800'
                        }`}
                      >
                        <QrCode className="w-4 h-4 shrink-0" />
                        <span>UPI QR</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPaymentMode('CREDIT')}
                        className={`py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                          paymentMode === 'CREDIT'
                            ? 'bg-amber-500 text-slate-950 font-black shadow-sm'
                            : 'bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800'
                        }`}
                      >
                        <CreditCard className="w-4 h-4 shrink-0" />
                        <span>UDHAAR</span>
                      </button>
                    </div>
                  </div>

                  {paymentMode === 'CREDIT' && selectedPartyId && (
                    <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-600 dark:text-amber-400 flex items-center gap-2 font-medium">
                      <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
                      <span>
                        <strong>Kirana Udhaar Auto-Sync:</strong> Posted as an <strong>APPROVED Farmer Advance</strong> in Farmer Profile &amp; Grain ERP settlement!
                      </span>
                    </div>
                  )}
                </div>

                {/* Cart Table */}
                <div className="border border-slate-200/80 dark:border-slate-800/80 rounded-xl overflow-hidden max-h-60 overflow-y-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 text-[10px] font-bold uppercase tracking-wider border-b border-slate-200/80 dark:border-slate-800/80">
                      <tr>
                        <th className="p-2.5">Item</th>
                        <th className="p-2.5 text-right">Price</th>
                        <th className="p-2.5 text-center">Qty</th>
                        <th className="p-2.5 text-right">Total</th>
                        <th className="p-2.5 text-center">Del</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                      {invoiceRows.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="p-6 text-center text-slate-400 font-outfit">
                            Cart is empty. Click items from catalog to add.
                          </td>
                        </tr>
                      ) : (
                        invoiceRows.map((row, index) => (
                          <tr key={row.productId} className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition">
                            <td className="p-2.5 font-bold text-slate-900 dark:text-white">
                              {row.name}
                              {row.localName && <div className="text-[10px] text-slate-500 dark:text-slate-400">{row.localName}</div>}
                            </td>
                            <td className="p-2.5 text-right font-bahi font-bold">₹{row.sellingPrice}</td>
                            <td className="p-2.5 text-center">
                              <div className="flex items-center justify-center gap-1">
                                <button
                                  onClick={() => handleUpdateRowQty(index, row.quantity - 1)}
                                  className="w-5 h-5 rounded bg-slate-200 dark:bg-slate-800 font-bold hover:bg-slate-300 flex items-center justify-center"
                                >
                                  -
                                </button>
                                <span className="font-bold font-bahi px-1">{row.quantity}</span>
                                <button
                                  onClick={() => handleUpdateRowQty(index, row.quantity + 1)}
                                  className="w-5 h-5 rounded bg-slate-200 dark:bg-slate-800 font-bold hover:bg-slate-300 flex items-center justify-center"
                                >
                                  +
                                </button>
                              </div>
                            </td>
                            <td className="p-2.5 text-right font-bahi font-extrabold text-[#70161E] dark:text-[#A8323E]">
                              ₹{(parseFloat(row.totalAmount) || 0).toFixed(2)}
                            </td>
                            <td className="p-2.5 text-center">
                              <button
                                onClick={() => handleRemoveRow(index)}
                                className="text-rose-500 hover:text-rose-700 p-1 inline-flex items-center justify-center"
                              >
                                <Trash2 className="w-3.5 h-3.5 shrink-0" />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Totals & Submit */}
                <div className="pt-2 space-y-3 border-t border-slate-200/80 dark:border-slate-800/80 font-outfit">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500 dark:text-slate-400">Subtotal ({totalQtyCount} items):</span>
                    <span className="font-bold font-bahi text-slate-900 dark:text-white">₹{(parseFloat(subtotal) || 0).toFixed(2)}</span>
                  </div>

                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500 dark:text-slate-400">Overall Discount (₹):</span>
                    <input
                      type="number"
                      value={overallDiscount}
                      onChange={(e) => setOverallDiscount(e.target.value)}
                      className="w-20 px-2 py-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded text-right font-bold text-slate-900 dark:text-white font-bahi text-xs"
                    />
                  </div>

                  <div className="flex justify-between items-center p-3.5 rounded-xl bg-gradient-to-br from-[#70161E]/10 to-amber-500/10 border border-[#70161E]/20 dark:border-[#70161E]/20">
                    <span className="font-black text-xs text-slate-900 dark:text-white font-outfit uppercase">GRAND TOTAL:</span>
                    <span className="font-black text-2xl text-[#70161E] dark:text-[#A8323E] font-bahi">₹{(parseFloat(netTotal) || 0).toFixed(2)}</span>
                  </div>

                  {paymentMode === 'CASH' && (
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2 text-xs font-outfit">
                      <div className="flex justify-between items-center">
                        <label className="font-bold text-slate-700 dark:text-slate-300">Cash Given by Customer (₹):</label>
                        <input
                          type="number"
                          placeholder="e.g. 500"
                          value={cashTendered}
                          onChange={(e) => setCashTendered(e.target.value)}
                          className="w-24 px-2 py-1 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded text-right font-bold text-slate-900 dark:text-white font-bahi"
                        />
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setCashTendered(String(netTotal))}
                          className="px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-[10px] font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-300"
                        >
                          Exact (₹{netTotal.toFixed(0)})
                        </button>
                        <button
                          type="button"
                          onClick={() => setCashTendered('500')}
                          className="px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-[10px] font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-300"
                        >
                          ₹500
                        </button>
                        <button
                          type="button"
                          onClick={() => setCashTendered('1000')}
                          className="px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-[10px] font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-300"
                        >
                          ₹1000
                        </button>
                      </div>

                      {parseFloat(cashTendered) >= netTotal && (
                        <div className="flex justify-between items-center p-2 rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-extrabold border border-emerald-500/20 text-xs">
                          <span>CHANGE RETURN TO CUSTOMER:</span>
                          <span className="text-sm font-black font-bahi">₹{(parseFloat(cashTendered) - netTotal).toFixed(2)}</span>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      disabled={isSubmitting || invoiceRows.length === 0}
                      onClick={() => handleSaveInvoice(false)}
                      className="py-3 rounded-xl bg-slate-800 hover:bg-slate-900 active:scale-95 text-white font-extrabold text-xs uppercase tracking-wider transition shadow-md flex items-center justify-center gap-1.5 font-outfit disabled:opacity-50"
                      title="Save sale and update stock/udhaar ledger without opening print modal"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Quick Save</span>
                    </button>

                    <button
                      disabled={isSubmitting || invoiceRows.length === 0}
                      onClick={() => handleSaveInvoice(true)}
                      className="py-3 rounded-xl bg-[#70161E] hover:bg-[#561117] active:scale-95 text-white font-extrabold text-xs uppercase tracking-wider transition shadow-md flex items-center justify-center gap-1.5 font-outfit disabled:opacity-50"
                      title="Save sale and view thermal print receipt"
                    >
                      <Printer className="w-4 h-4 text-amber-300 shrink-0" />
                      <span>Save &amp; Print Bill</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 2: STOCK INWARD & MANDI PURCHASES REGISTER [F3] */}
        {activeTab === 'inward' && (
          <div className="space-y-5">
            {/* KPI Summary Banner (Bahi Cards) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bahi-card-blue p-5 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wider font-outfit">Total Stock Inward Value</div>
                  <div className="text-2xl font-black text-[#70161E] dark:text-[#A8323E] font-bahi mt-1">
                    ₹{(parseFloat(purchasesSummary?.totalInwardCost) || 0).toFixed(2)}
                  </div>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-[#70161E]/10 text-[#70161E] dark:text-[#A8323E] flex items-center justify-center">
                  <TrendingUp className="w-6 h-6" />
                </div>
              </div>

              <div className="bahi-card p-5 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wider font-outfit">Outstanding Supplier Balance</div>
                  <div className="text-2xl font-black text-amber-600 dark:text-amber-400 font-bahi mt-1">
                    ₹{(parseFloat(purchasesSummary?.totalSupplierDue) || 0).toFixed(2)}
                  </div>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                  <Clock className="w-6 h-6" />
                </div>
              </div>

              <div className="bahi-card-blue p-5 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wider font-outfit">Total Mandi Purchases Logged</div>
                  <div className="text-2xl font-black text-slate-900 dark:text-white font-mono mt-1">
                    {purchasesSummary.totalReceipts || 0} Receipts
                  </div>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
                  <Truck className="w-6 h-6" />
                </div>
              </div>
            </div>

            {/* Action Bar */}
            <div className="glass-card p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-extrabold text-slate-900 dark:text-white font-outfit uppercase tracking-tight flex items-center gap-2">
                  <Truck className="w-5 h-5 text-[#70161E] dark:text-[#A8323E]" />
                  Stock Inward &amp; Mandi Purchases Register
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-outfit">
                  Record inward receipts from mandi traders (Aaloo, Pyaj, Bags @ Quintal rate + Palledari) &amp; track cash collector payouts
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    if (supplierLedgers.length > 0) {
                      setSelectedSupplierForPayout(supplierLedgers[0]);
                    } else {
                      setSelectedSupplierForPayout({ supplierName: 'Robertsganj Mandi Trader', totalDue: 0 });
                    }
                    setShowSupplierPayoutModal(true);
                  }}
                  className="px-3.5 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition shadow-md flex items-center justify-center gap-1.5 font-outfit"
                >
                  <Banknote className="w-4 h-4 shrink-0" />
                  <span>💸 Record Supplier Payout (भुगतान)</span>
                </button>

                <button
                  onClick={() => setShowInwardModal(true)}
                  className="px-4 py-2.5 bg-[#70161E] hover:bg-[#561117] active:scale-95 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition shadow-md flex items-center justify-center gap-2 font-outfit"
                >
                  <Plus className="w-4 h-4 shrink-0" />
                  <span>Record Stock Inward Receipt</span>
                </button>
              </div>
            </div>

            {/* MANDI SUPPLIER DUES DIRECTORY CARDS */}
            {supplierLedgers.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-extrabold text-xs text-slate-900 dark:text-white font-outfit uppercase tracking-wider flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-[#70161E] dark:text-[#A8323E]" />
                    Mandi Supplier Outstanding Dues &amp; Collector Payouts ({supplierLedgers.length})
                  </h3>
                  <span className="text-[10px] text-slate-400 font-outfit">
                    Click &quot;Pay Cash&quot; when mandi collector arrives for cash collection
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {supplierLedgers.map((supp, idx) => (
                    <div
                      key={idx}
                      className="glass-card p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm flex items-center justify-between"
                    >
                      <div>
                        <div className="font-extrabold text-xs text-slate-900 dark:text-white font-outfit">
                          {supp.supplierName}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                          Inward Trips: {supp.purchasesCount} • {supp.supplierPhone}
                        </div>
                        <div className="text-[11px] font-bold text-amber-600 dark:text-amber-400 font-bahi mt-1">
                          Supplier Left Due: ₹{(parseFloat(supp.totalDue) || 0).toFixed(2)}
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          setSelectedSupplierForPayout(supp);
                          setSupplierPayoutAmount(String(parseFloat(supp.totalDue || 0).toFixed(0)));
                          setShowSupplierPayoutModal(true);
                        }}
                        className="px-3 py-1.5 bg-[#70161E] hover:bg-[#561117] active:scale-95 text-white font-extrabold text-[11px] uppercase tracking-wider rounded-xl transition shadow-sm font-outfit flex items-center gap-1"
                      >
                        <Banknote className="w-3.5 h-3.5" />
                        <span>Pay Cash</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Inward History Table */}
            <div className="glass-card rounded-2xl overflow-hidden border border-slate-200/80 dark:border-slate-800/80 shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100/90 dark:bg-slate-900/90 text-slate-700 dark:text-slate-300 text-[10px] font-bold uppercase tracking-wider border-b border-slate-200/80 dark:border-slate-800/80">
                    <tr>
                      <th className="p-3">Inward #</th>
                      <th className="p-3">Date</th>
                      <th className="p-3">Supplier / Mandi Trader</th>
                      <th className="p-3">Items Summary</th>
                      <th className="p-3 text-right">Items Cost</th>
                      <th className="p-3 text-right">Taxes &amp; Freight</th>
                      <th className="p-3 text-right">Grand Total</th>
                      <th className="p-3 text-right">Paid</th>
                      <th className="p-3 text-right">Left Due</th>
                      <th className="p-3 text-center">Status</th>
                      <th className="p-3 text-center">Parchi Receipt</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                    {purchasesHistory.length === 0 ? (
                      <tr>
                        <td colSpan={11} className="p-8 text-center text-slate-400 font-outfit">
                          No stock inward purchases recorded yet. Click &quot;Record Stock Inward Receipt&quot; to log your first mandi arrival.
                        </td>
                      </tr>
                    ) : (
                      purchasesHistory.map((pur) => (
                        <tr key={pur.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition">
                          <td className="p-3 font-mono font-bold text-[#70161E] dark:text-[#A8323E]">{pur.purchaseNo}</td>
                          <td className="p-3 font-mono text-slate-600 dark:text-slate-300">
                            {new Date(pur.date).toLocaleDateString('en-IN')}
                          </td>
                          <td className="p-3 font-bold text-slate-900 dark:text-white">
                            {pur.supplierName}
                            {pur.supplierPhone && <div className="text-[10px] text-slate-400 font-normal">{pur.supplierPhone}</div>}
                          </td>
                          <td className="p-3">
                            <div className="flex flex-wrap gap-1 max-w-xs">
                              {pur.items?.map((item, idx) => (
                                <span
                                  key={idx}
                                  className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] font-semibold border border-slate-200 dark:border-slate-700"
                                >
                                  {item.itemName}: {item.quantity} {item.unit} @ ₹{item.purchasePrice}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="p-3 text-right font-bahi font-semibold">₹{(parseFloat(pur.totalAmount) || 0).toFixed(2)}</td>
                          <td className="p-3 text-right font-bahi font-semibold text-slate-500">₹{(parseFloat(pur.taxCharges) || 0).toFixed(2)}</td>
                          <td className="p-3 text-right font-bahi font-extrabold text-slate-900 dark:text-white">
                            ₹{(parseFloat(pur.grandTotal) || 0).toFixed(2)}
                          </td>
                          <td className="p-3 text-right font-bahi font-bold text-emerald-600 dark:text-emerald-400">
                            ₹{(parseFloat(pur.paidAmount) || 0).toFixed(2)}
                          </td>
                          <td className="p-3 text-right font-bahi font-bold text-amber-600 dark:text-amber-400">
                            ₹{(parseFloat(pur.dueAmount) || 0).toFixed(2)}
                          </td>
                          <td className="p-3 text-center">
                            <span
                              className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold ${
                                pur.paymentStatus === 'PAID'
                                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                                  : pur.paymentStatus === 'PARTIAL'
                                  ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                                  : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                              }`}
                            >
                              {pur.paymentStatus}
                            </span>
                          </td>
                          <td className="p-3 text-center">
                            {pur.parchiDocUrl ? (
                              <a
                                href={pur.parchiDocUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-[#70161E] hover:text-white text-slate-700 dark:text-slate-300 font-bold transition flex items-center justify-center gap-1 text-[10px]"
                              >
                                <ImageIcon className="w-3.5 h-3.5 shrink-0" />
                                <span>Parchi</span>
                              </a>
                            ) : (
                              <span className="text-slate-400 text-[10px]">No Photo</span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 3: STORE UDHAAR DAILY REGISTER & CUSTOMER PASSBOOK TIMELINE [F4] */}
        {activeTab === 'khata' && (
          <div className="space-y-5">
            {/* KPI Overview Banner */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="bahi-card p-4 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wider font-outfit">Total Store Udhaar Outstanding</div>
                  <div className="text-xl font-black text-amber-600 dark:text-amber-400 font-bahi mt-0.5">
                    ₹{(parseFloat(khataData?.totalStoreUdhaar) || 0).toFixed(2)}
                  </div>
                </div>
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                  <CreditCard className="w-5 h-5" />
                </div>
              </div>

              <div className="bahi-card-blue p-4 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wider font-outfit">Active Udhaar Customers</div>
                  <div className="text-xl font-black text-[#70161E] dark:text-[#A8323E] font-mono mt-0.5">
                    {(khataData.khataParties || []).length} Accounts
                  </div>
                </div>
                <div className="w-10 h-10 rounded-xl bg-[#70161E]/10 text-[#70161E] dark:text-[#A8323E] flex items-center justify-center">
                  <Users className="w-5 h-5" />
                </div>
              </div>

              <div className="bahi-card-blue p-4 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wider font-outfit">Selected Account Balance</div>
                  <div className="text-xl font-black text-slate-900 dark:text-white font-bahi mt-0.5">
                    ₹{Math.abs(parseFloat(selectedKhataCustomer?.currentBalance) || 0).toFixed(2)}
                  </div>
                </div>
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
                  <BookOpen className="w-5 h-5" />
                </div>
              </div>

              <div className="glass-card p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wider font-outfit">Quick Jama Entry</div>
                  <button
                    onClick={() => {
                      if (selectedKhataCustomer) {
                        setJamaCustomer(selectedKhataCustomer);
                        setShowJamaModal(true);
                      } else {
                        toast.error('Select a customer first!');
                      }
                    }}
                    className="mt-1 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition shadow-sm flex items-center gap-1.5 font-outfit"
                  >
                    <Plus className="w-4 h-4 shrink-0" />
                    <span>Record Jama</span>
                  </button>
                </div>
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                  <Banknote className="w-5 h-5" />
                </div>
              </div>
            </div>

            {/* Split Screen Register */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              {/* LEFT 5 COLS: STORE CUSTOMER DIRECTORY */}
              <div className="lg:col-span-5 space-y-4">
                <div className="glass-card p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <h2 className="font-extrabold text-sm text-slate-900 dark:text-white font-outfit uppercase tracking-tight flex items-center gap-2">
                      <Users className="w-4 h-4 text-[#70161E] dark:text-[#A8323E]" />
                      Udhaar Customer Directory
                    </h2>
                    <button
                      onClick={() => setShowNewCustomerModal(true)}
                      className="px-3.5 py-2 bg-[#70161E] hover:bg-[#561117] active:scale-95 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition shadow-sm flex items-center gap-1.5 font-outfit"
                    >
                      <Plus className="w-4 h-4 shrink-0" />
                      <span>+ New Customer</span>
                    </button>
                  </div>

                  {/* Search Bar & Status Filters */}
                  <div className="space-y-2">
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="text"
                        placeholder="Search by Customer Name, Phone, Village..."
                        value={khataSearchText}
                        onChange={(e) => setKhataSearchText(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-900 dark:text-white font-outfit"
                      />
                    </div>

                    <div className="flex items-center gap-1.5 text-[11px] font-outfit">
                      <button
                        onClick={() => setKhataFilter('ALL')}
                        className={`px-2.5 py-1 rounded-lg font-bold transition ${
                          khataFilter === 'ALL'
                            ? 'bg-[#70161E] text-white shadow-sm'
                            : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        All ({khataData.khataParties?.length || 0})
                      </button>

                      <button
                        onClick={() => setKhataFilter('HAS_DUE')}
                        className={`px-2.5 py-1 rounded-lg font-bold transition ${
                          khataFilter === 'HAS_DUE'
                            ? 'bg-amber-500 text-slate-950 shadow-sm'
                            : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        Has Due ({khataData.khataParties?.filter((p) => p.currentBalance > 0).length || 0})
                      </button>

                      <button
                        onClick={() => setKhataFilter('CLEARED')}
                        className={`px-2.5 py-1 rounded-lg font-bold transition ${
                          khataFilter === 'CLEARED'
                            ? 'bg-emerald-600 text-white shadow-sm'
                            : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        Cleared
                      </button>
                    </div>
                  </div>

                  {/* Customer List */}
                  <div className="divide-y divide-slate-100 dark:divide-slate-800/60 max-h-[580px] overflow-y-auto space-y-1">
                    {filteredKhataParties.length === 0 ? (
                      <div className="p-8 text-center text-slate-400 text-xs font-outfit">
                        No credit customer matching filter.
                      </div>
                    ) : (
                      filteredKhataParties.map((party) => {
                        const isSelected = selectedKhataCustomer?.id === party.id;
                        const hasDue = party.currentBalance > 0;
                        return (
                          <div
                            key={party.id}
                            onClick={() => setSelectedKhataCustomer(party)}
                            className={`p-3.5 rounded-xl transition cursor-pointer flex items-center justify-between border ${
                              isSelected
                                ? 'bg-[#70161E]/10 border-[#70161E]/40 shadow-sm'
                                : 'bg-transparent border-transparent hover:bg-slate-100/60 dark:hover:bg-slate-900/60'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center font-bold text-slate-700 dark:text-slate-300 font-outfit text-sm">
                                {party.name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <div className="font-extrabold text-xs text-slate-900 dark:text-white font-outfit">
                                  {party.name}
                                </div>
                                <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1.5 mt-0.5">
                                  <span>{party.phone}</span>
                                  <span>•</span>
                                  <span>{party.city}</span>
                                </div>
                              </div>
                            </div>

                            <div className="text-right">
                              <div className="text-sm font-black font-bahi text-amber-600 dark:text-amber-400">
                                ₹{Math.abs(parseFloat(party?.currentBalance) || 0).toFixed(2)}
                              </div>
                              <span
                                className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                                  hasDue
                                    ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                                    : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                                }`}
                              >
                                {hasDue ? 'DUE' : 'CLEARED'}
                              </span>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>

              {/* RIGHT 7 COLS: DETAILED CUSTOMER PASSBOOK & DAILY REGISTER TIMELINE */}
              <div className="lg:col-span-7 space-y-4">
                {!selectedKhataCustomer ? (
                  <div className="glass-card p-12 text-center rounded-2xl border border-slate-200/80 dark:border-slate-800/80 text-slate-400 font-outfit space-y-2">
                    <BookOpen className="w-10 h-10 mx-auto text-[#70161E]/40" />
                    <div className="font-bold">Select a customer from the left directory</div>
                    <div className="text-xs">View when they took credit, when they paid, and their exact remaining balance statement.</div>
                  </div>
                ) : (
                  <div className="glass-card p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-md space-y-4">
                    {/* Customer Profile Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 dark:border-slate-800/80 pb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-[#70161E] text-white font-black flex items-center justify-center font-outfit text-lg shadow-sm">
                          {selectedKhataCustomer.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-black text-base text-slate-900 dark:text-white font-outfit uppercase">
                              {selectedKhataCustomer.name}
                            </h3>
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                              {selectedKhataCustomer.partyCode}
                            </span>
                            {selectedKhataCustomer.partyId && (
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 font-outfit flex items-center gap-1">
                                🌾 FARMER (ERP LINKED)
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-slate-500 font-medium flex items-center gap-2 mt-0.5 font-outfit">
                            <span>📞 {selectedKhataCustomer.phone}</span>
                            <span>•</span>
                            <span>📍 {selectedKhataCustomer.city}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleSendWhatsAppReminder(selectedKhataCustomer)}
                          className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-sm transition font-outfit flex items-center gap-1.5"
                          title="Send instant WhatsApp Udhaar Reminder"
                        >
                          <Phone className="w-4 h-4 shrink-0" />
                          <span>WhatsApp Reminder</span>
                        </button>

                        <button
                          onClick={() => {
                            setJamaCustomer(selectedKhataCustomer);
                            setShowJamaModal(true);
                          }}
                          className="px-3.5 py-2 bg-[#70161E] hover:bg-[#561117] active:scale-95 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-sm transition font-outfit flex items-center gap-1.5"
                        >
                          <Banknote className="w-4 h-4 shrink-0" />
                          <span>Record Jama</span>
                        </button>

                        <button
                          onClick={() => setShowPassbookPrintModal(true)}
                          className="px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-95 text-slate-700 dark:text-slate-200 font-extrabold text-xs uppercase tracking-wider rounded-xl transition font-outfit flex items-center gap-1.5 border border-slate-200 dark:border-slate-700"
                        >
                          <Printer className="w-4 h-4 shrink-0 text-[#70161E] dark:text-[#A8323E]" />
                          <span>Passbook</span>
                        </button>
                      </div>
                    </div>

                    {selectedKhataCustomer.partyId && (
                      <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-700 dark:text-amber-300 font-outfit flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
                        <span>
                          <strong>Grain ERP Auto-Sync Active:</strong> Udhaar purchases by <strong>{selectedKhataCustomer.name}</strong> are synced as an <strong>Approved Farmer Advance</strong> in Nawaz Traders ERP. Automatically reimbursed &amp; settled to Kirana Store when {selectedKhataCustomer.name} delivers crop in the Mandi.
                        </span>
                      </div>
                    )}

                    {/* Financial Overview Cards */}
                    <div className="grid grid-cols-3 gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 font-outfit">
                      <div>
                        <div className="text-[10px] text-slate-400 uppercase font-bold">Total Udhaar Taken</div>
                        <div className="text-sm font-black text-slate-900 dark:text-white font-bahi mt-0.5">
                          ₹{(parseFloat(selectedKhataCustomer.totalUdhaarTaken) || 0).toFixed(2)}
                        </div>
                      </div>

                      <div>
                        <div className="text-[10px] text-slate-400 uppercase font-bold">Total Jama Paid</div>
                        <div className="text-sm font-black text-emerald-600 dark:text-emerald-400 font-bahi mt-0.5">
                          ₹{(parseFloat(selectedKhataCustomer.totalJamaPaid) || 0).toFixed(2)}
                        </div>
                      </div>

                      <div>
                        <div className="text-[10px] text-slate-400 uppercase font-bold">Current Left Due</div>
                        <div className="text-base font-black text-amber-600 dark:text-amber-400 font-bahi mt-0.5">
                          ₹{Math.abs(parseFloat(selectedKhataCustomer.currentBalance) || 0).toFixed(2)}
                        </div>
                      </div>
                    </div>

                    {/* Daily Register Passbook Timeline Table */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-extrabold text-slate-900 dark:text-white uppercase font-outfit flex items-center gap-1.5">
                          <History className="w-4 h-4 text-[#70161E] dark:text-[#A8323E]" />
                          Customer Daily Passbook Ledger Timeline
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">
                          {selectedKhataCustomer.ledger?.length || 0} Transactions Recorded
                        </span>
                      </div>

                      <div className="border border-slate-200/80 dark:border-slate-800/80 rounded-xl overflow-hidden">
                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-xs">
                            <thead className="bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 text-[10px] font-bold uppercase tracking-wider border-b border-slate-200/80 dark:border-slate-800/80">
                              <tr>
                                <th className="p-2.5">Date &amp; Time</th>
                                <th className="p-2.5">Ref / Bill #</th>
                                <th className="p-2.5">Type</th>
                                <th className="p-2.5">Particulars / Items</th>
                                <th className="p-2.5 text-right">Udhaar (+)</th>
                                <th className="p-2.5 text-right">Jama (-)</th>
                                <th className="p-2.5 text-right">Balance Left</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-outfit">
                              {selectedKhataCustomer.ledger?.length === 0 ? (
                                <tr>
                                  <td colSpan={7} className="p-6 text-center text-slate-400 font-outfit">
                                    No transaction ledger history recorded for this customer yet.
                                  </td>
                                </tr>
                              ) : (
                                selectedKhataCustomer.ledger?.map((tx, idx) => {
                                  const isJama = tx.type === 'JAMA_PAYMENT';
                                  const isErpSettlement = tx.paymentMode === 'ERP_GRAIN_SETTLEMENT' || (tx.particulars && tx.particulars.includes('ERP Settlement'));
                                  return (
                                    <tr
                                      key={tx.id || idx}
                                      className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition"
                                    >
                                      <td className="p-2.5 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                                        {new Date(tx.date).toLocaleDateString('en-IN', {
                                          day: '2-digit',
                                          month: 'short',
                                          year: 'numeric',
                                        })}
                                      </td>
                                      <td className="p-2.5 font-mono font-bold text-[#70161E] dark:text-[#A8323E] whitespace-nowrap">
                                        {tx.billNo}
                                      </td>
                                      <td className="p-2.5 whitespace-nowrap">
                                        <span
                                          className={`px-2 py-0.5 rounded text-[9px] font-extrabold ${
                                            isErpSettlement
                                              ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20'
                                              : isJama
                                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                                              : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                                          }`}
                                        >
                                          {isErpSettlement ? '🏛️ ERP SETTLED' : isJama ? '💵 JAMA PAID' : '🛍️ UDHAAR TAKEN'}
                                        </span>
                                      </td>
                                      <td className="p-2.5 text-slate-700 dark:text-slate-300 font-medium max-w-xs truncate">
                                        {tx.particulars}
                                      </td>
                                      <td className="p-2.5 text-right font-bahi font-bold text-amber-600 dark:text-amber-400">
                                        {tx.debitAmount > 0 ? `+₹${parseFloat(tx.debitAmount).toFixed(2)}` : '-'}
                                      </td>
                                      <td className="p-2.5 text-right font-bahi font-bold text-emerald-600 dark:text-emerald-400">
                                        {tx.creditAmount > 0 ? `-₹${parseFloat(tx.creditAmount).toFixed(2)}` : '-'}
                                      </td>
                                      <td className="p-2.5 text-right font-bahi font-black text-slate-900 dark:text-white">
                                        ₹{(parseFloat(tx.runningBalance) || 0).toFixed(2)}
                                      </td>
                                    </tr>
                                  );
                                })
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* VIEW 4: STORE STAFF & SALARY [F5] */}
        {activeTab === 'employees' && (
          <div className="space-y-4">
            <div className="glass-card p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-extrabold text-slate-900 dark:text-white font-outfit uppercase tracking-tight flex items-center gap-2">
                  <Users className="w-5 h-5 text-[#70161E] dark:text-[#A8323E]" />
                  Store Staff &amp; Helper Ledger
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-outfit">
                  Manage counter sales boys, helper staff, attendance &amp; salary advances
                </p>
              </div>

              <button
                onClick={() => setShowEmployeeModal(true)}
                className="px-4 py-2.5 bg-[#70161E] hover:bg-[#561117] active:scale-95 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition shadow-md flex items-center justify-center gap-2 font-outfit"
              >
                <Plus className="w-4 h-4 shrink-0" />
                <span>Add New Store Staff</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {khataData.employees?.map((emp) => (
                <div
                  key={emp.id}
                  className="glass-card p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm hover:shadow-md transition space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-900 flex items-center justify-center font-bold text-[#70161E] dark:text-[#A8323E]">
                      <UserCheck className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                      ACTIVE STAFF
                    </span>
                  </div>

                  <div>
                    <h3 className="font-extrabold text-sm text-slate-900 dark:text-white font-outfit">{emp.fullName}</h3>
                    <div className="text-xs text-slate-500 font-medium font-outfit">{emp.designation || 'Counter Helper'}</div>
                    <div className="text-xs text-slate-400 font-mono mt-1">{emp.phone || 'No Contact'}</div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800/60 flex justify-between items-center text-xs">
                    <span className="text-slate-400">Base Salary:</span>
                    <span className="font-bold font-bahi text-slate-900 dark:text-white">₹{emp.baseSalary}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* VIEW 5: STOCK MASTER [F8] */}
        {activeTab === 'inventory' && (
          <div className="space-y-4">
            <div className="glass-card p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-extrabold text-slate-900 dark:text-white font-outfit uppercase tracking-tight flex items-center gap-2">
                  <Package className="w-5 h-5 text-[#70161E] dark:text-[#A8323E]" />
                  Kirana &amp; Mandi Inventory Master
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-outfit">
                  Manage MRP, selling rates, current stock levels, and quick stock updates
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowBulkStockModal(true)}
                  className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition shadow-md flex items-center justify-center gap-2 font-outfit"
                >
                  <Upload className="w-4 h-4 shrink-0" />
                  <span>Bulk Upload / Paste</span>
                </button>

                <button
                  onClick={() => {
                    setProductForm({
                      id: null,
                      name: '',
                      localName: '',
                      category: 'Groceries & Spices',
                      mrp: '',
                      purchasePrice: '',
                      sellingPrice: '',
                      unit: 'Kg',
                      currentStock: '50',
                      minStockLevel: '10',
                      barcode: '',
                    });
                    setShowProductModal(true);
                  }}
                  className="px-4 py-2.5 bg-[#70161E] hover:bg-[#561117] active:scale-95 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition shadow-md flex items-center justify-center gap-2 font-outfit"
                >
                  <Plus className="w-4 h-4 shrink-0" />
                  <span>Add Single Item</span>
                </button>
              </div>
            </div>

            <div className="glass-card rounded-2xl overflow-hidden border border-slate-200/80 dark:border-slate-800/80 shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 text-[10px] font-bold uppercase tracking-wider border-b border-slate-200/80 dark:border-slate-800/80">
                    <tr>
                      <th className="p-3">SKU / Barcode</th>
                      <th className="p-3">Item Name</th>
                      <th className="p-3">Category</th>
                      <th className="p-3 text-right">MRP</th>
                      <th className="p-3 text-right">Selling Rate</th>
                      <th className="p-3 text-center">Unit</th>
                      <th className="p-3 text-right">Current Stock</th>
                      <th className="p-3 text-center">Quick Stock Adjust</th>
                      <th className="p-3 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-outfit">
                    {products.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition">
                        <td className="p-3 font-mono font-bold text-[#70161E] dark:text-[#A8323E]">{p.sku}</td>
                        <td className="p-3 font-bold text-slate-900 dark:text-white font-outfit">
                          {p.name}
                          {p.localName && <span className="text-[10px] text-slate-400 block font-normal">{p.localName}</span>}
                        </td>
                        <td className="p-3 text-slate-600 dark:text-slate-300 font-semibold font-outfit">{p.category}</td>
                        <td className="p-3 text-right font-bahi line-through text-slate-400">₹{p.mrp}</td>
                        <td className="p-3 text-right font-bahi font-extrabold text-[#70161E] dark:text-[#A8323E]">
                          ₹{p.sellingPrice}
                        </td>
                        <td className="p-3 text-center font-bold text-amber-600 dark:text-amber-400 font-mono">{p.unit}</td>
                        <td className="p-3 text-right font-mono font-black text-sm text-slate-900 dark:text-white">
                          {p.currentStock} <span className="text-[10px] font-normal text-slate-400">{p.unit}</span>
                        </td>
                        <td className="p-3 text-center">
                          <div className="flex items-center justify-center gap-1 font-mono text-[10px]">
                            <button
                              onClick={() => handleQuickStockAdjust(p.id, 10)}
                              className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500 hover:text-white border border-emerald-500/20 font-bold transition"
                              title="Add +10 to Stock"
                            >
                              +10
                            </button>
                            <button
                              onClick={() => handleQuickStockAdjust(p.id, 50)}
                              className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500 hover:text-white border border-emerald-500/20 font-bold transition"
                              title="Add +50 to Stock"
                            >
                              +50
                            </button>
                            <button
                              onClick={() => handleQuickStockAdjust(p.id, 100)}
                              className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500 hover:text-white border border-amber-500/20 font-bold transition"
                              title="Add +100 to Stock"
                            >
                              +100
                            </button>
                            <button
                              onClick={() => handleQuickStockAdjust(p.id, -5)}
                              className="px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500 hover:text-white border border-rose-500/20 font-bold transition"
                              title="Subtract -5 from Stock"
                            >
                              -5
                            </button>
                          </div>
                        </td>
                        <td className="p-3 text-center">
                          <button
                            onClick={() => {
                              setProductForm(p);
                              setShowProductModal(true);
                            }}
                            className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-[#70161E] hover:text-white text-slate-600 dark:text-slate-300 transition"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 6: COMPLIANCE & LICENSES [F9] */}
        {activeTab === 'licenses' && (
          <div className="space-y-4">
            <div className="glass-card p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm">
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white font-outfit uppercase tracking-tight flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-amber-500" />
                UP Sonebhadra Compliance &amp; Licenses Vault
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-outfit">
                Active certificates for Mandi Trade, FSDA Food Safety License, Scale Stamping Tax, and GSTIN
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {licenses.map((lic) => (
                <div
                  key={lic.id}
                  className="glass-card p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-[#70161E] dark:text-[#A8323E]">{lic.licenseNo}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                      VALID CERTIFICATE
                    </span>
                  </div>

                  <div>
                    <h3 className="font-extrabold text-sm text-slate-900 dark:text-white font-outfit">{lic.title}</h3>
                    <div className="text-xs text-slate-400 font-medium font-outfit">Issued by: {lic.authority}</div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800/60 flex justify-between items-center text-xs font-outfit">
                    <span className="text-slate-400">Expiry Date:</span>
                    <span className="font-bold font-mono text-slate-900 dark:text-white">
                      {new Date(lic.expiryDate).toLocaleDateString('en-IN')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* 📜 MODAL 1: RECORD STOCK INWARD & MANDI PURCHASES */}
      {showInwardModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="glass-modal max-w-3xl w-full p-6 shadow-2xl space-y-4 my-8 rounded-2xl">
            <div className="flex justify-between items-center border-b border-slate-200/80 dark:border-slate-800/80 pb-3">
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-[#70161E] dark:text-[#A8323E]" />
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white font-outfit uppercase">
                  Record Stock Inward Receipt (Mandi Arrival)
                </h3>
              </div>
              <button onClick={() => setShowInwardModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveInwardPurchase} className="space-y-4 text-xs font-outfit">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Receipt Date</label>
                  <input
                    type="date"
                    value={inwardForm.date}
                    onChange={(e) => setInwardForm({ ...inwardForm, date: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl font-semibold"
                  />
                </div>

                <div className="sm:col-span-2">
                  <div className="flex justify-between items-center mb-1">
                    <label className="font-bold text-slate-700 dark:text-slate-300 block">
                      Select / Add Mandi Supplier *
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setIsAddingNewSupplier(!isAddingNewSupplier);
                        if (!isAddingNewSupplier) {
                          setInwardForm({ ...inwardForm, supplierName: '', supplierPhone: '', partyId: '' });
                        }
                      }}
                      className="text-[10px] font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1 font-outfit"
                    >
                      {isAddingNewSupplier ? '← Select Saved Supplier Dropdown' : '➕ Add New Mandi Supplier'}
                    </button>
                  </div>

                  {!isAddingNewSupplier ? (
                    <select
                      value={inwardForm.partyId || inwardForm.supplierName}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === 'NEW_SUPPLIER') {
                          setIsAddingNewSupplier(true);
                          setInwardForm({ ...inwardForm, supplierName: '', supplierPhone: '', partyId: '' });
                        } else {
                          const foundParty = parties.find((p) => p.id === val);
                          const foundLedger = supplierLedgers.find((s) => s.supplierName === val || s.partyId === val);
                          if (foundParty) {
                            setInwardForm({
                              ...inwardForm,
                              supplierName: foundParty.name,
                              supplierPhone: foundParty.phone || '',
                              partyId: foundParty.id,
                            });
                          } else if (foundLedger) {
                            setInwardForm({
                              ...inwardForm,
                              supplierName: foundLedger.supplierName,
                              supplierPhone: foundLedger.supplierPhone !== 'N/A' ? foundLedger.supplierPhone : '',
                              partyId: foundLedger.partyId || '',
                            });
                          } else {
                            setInwardForm({ ...inwardForm, supplierName: val, partyId: '' });
                          }
                        }
                      }}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl font-bold font-outfit text-xs text-slate-900 dark:text-white"
                    >
                      <option value="">-- Select Saved Mandi Supplier / Vendor --</option>
                      {supplierLedgers.map((s, idx) => (
                        <option key={idx} value={s.supplierName}>
                          🏢 {s.supplierName} {s.supplierPhone !== 'N/A' ? `(${s.supplierPhone})` : ''} {s.totalDue > 0 ? `• Due: ₹${s.totalDue.toFixed(0)}` : ''}
                        </option>
                      ))}
                      {parties
                        .filter(
                          (p) =>
                            (p.roles?.includes('SUPPLIER') || p.roles?.includes('VENDOR')) &&
                            !supplierLedgers.some((s) => s.partyId === p.id || s.supplierName === p.name)
                        )
                        .map((p) => (
                          <option key={p.id} value={p.id}>
                            🚚 {p.name} ({p.partyCode} • {p.phone || 'No Mobile'})
                          </option>
                        ))}
                      <option value="NEW_SUPPLIER">➕ Add New Mandi Supplier / Trader...</option>
                    </select>
                  ) : (
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        required
                        placeholder="Supplier / Trader Name (e.g. Ramesh Verma)"
                        value={inwardForm.supplierName}
                        onChange={(e) => setInwardForm({ ...inwardForm, supplierName: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl font-semibold"
                      />
                      <input
                        type="text"
                        placeholder="Mobile Phone (e.g. 9876543210)"
                        value={inwardForm.supplierPhone}
                        onChange={(e) => setInwardForm({ ...inwardForm, supplierPhone: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl font-semibold"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Items Table */}
              <div className="space-y-2 border border-slate-200/80 dark:border-slate-800/80 rounded-xl p-3 bg-slate-50 dark:bg-slate-900">
                <div className="flex justify-between items-center font-bold text-slate-900 dark:text-white">
                  <span>Purchased Stock Items (Aaloo, Pyaj, Spices, Groceries)</span>
                  <button
                    type="button"
                    onClick={handleAddInwardRow}
                    className="px-2.5 py-1 rounded-lg bg-[#70161E] text-white text-[10px] font-extrabold"
                  >
                    + Add Item
                  </button>
                </div>

                {/* Column Headers */}
                <div className="grid grid-cols-12 gap-1.5 items-center text-[10px] font-extrabold uppercase text-slate-400 px-1 font-outfit">
                  <div className="col-span-3">Item Name</div>
                  <div className="col-span-1 text-center">Qty</div>
                  <div className="col-span-2 text-center">Unit</div>
                  <div className="col-span-2 text-right">Purchase Rate (₹)</div>
                  <div className="col-span-2 text-right">Selling Rate (₹)</div>
                  <div className="col-span-1 text-right">MRP (₹)</div>
                  <div className="col-span-1 text-center"></div>
                </div>

                {inwardRows.map((row, idx) => (
                  <div key={idx} className="grid grid-cols-12 gap-1.5 items-center bg-white dark:bg-slate-950 p-1.5 rounded-xl border border-slate-200 dark:border-slate-800">
                    <div className="col-span-3">
                      <input
                        type="text"
                        placeholder="Item Name (e.g. Aaloo)"
                        value={row.itemName}
                        onChange={(e) => handleUpdateInwardRow(idx, 'itemName', e.target.value)}
                        className="w-full px-2 py-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-semibold"
                      />
                    </div>
                    <div className="col-span-1">
                      <input
                        type="number"
                        placeholder="Qty"
                        value={row.quantity}
                        onChange={(e) => handleUpdateInwardRow(idx, 'quantity', e.target.value)}
                        className="w-full px-1 py-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-mono text-center font-bold"
                      />
                    </div>
                    <div className="col-span-2">
                      <select
                        value={row.unit}
                        onChange={(e) => handleUpdateInwardRow(idx, 'unit', e.target.value)}
                        className="w-full px-1 py-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-center font-semibold text-slate-900 dark:text-white"
                      >
                        {KRN_UNITS.map((u) => (
                          <option key={u.code} value={u.code}>
                            {u.code}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="col-span-2">
                      <input
                        type="number"
                        placeholder="Buy Rate ₹"
                        value={row.purchasePrice}
                        onChange={(e) => handleUpdateInwardRow(idx, 'purchasePrice', e.target.value)}
                        className="w-full px-1.5 py-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-bahi font-bold text-right text-rose-600 dark:text-rose-400"
                        title="Purchase Cost Rate per unit from supplier"
                      />
                    </div>
                    <div className="col-span-2">
                      <input
                        type="number"
                        placeholder="Sell Rate ₹"
                        value={row.sellingPrice || ''}
                        onChange={(e) => handleUpdateInwardRow(idx, 'sellingPrice', e.target.value)}
                        className="w-full px-1.5 py-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-bahi font-bold text-right text-emerald-600 dark:text-emerald-400"
                        title="Store Selling Rate per unit"
                      />
                    </div>
                    <div className="col-span-1">
                      <input
                        type="number"
                        placeholder="MRP ₹"
                        value={row.mrp || ''}
                        onChange={(e) => handleUpdateInwardRow(idx, 'mrp', e.target.value)}
                        className="w-full px-1 py-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-bahi font-bold text-right text-slate-500"
                        title="Printed MRP per unit"
                      />
                    </div>
                    <div className="col-span-1 text-center">
                      <button
                        type="button"
                        onClick={() => handleRemoveInwardRow(idx)}
                        className="text-rose-500 p-1 hover:text-rose-700"
                        title="Remove Item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Tax & Charges & Payments */}
              <div className="space-y-2">
                <div className="text-[10px] text-amber-600 dark:text-amber-400 font-bold font-outfit flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <span>Unit &amp; Rate Tip: For Potato/Onion in Bags (Bori), 2 Bags = 1 Quintal (100 Kg). Enter buying rate per Quintal or per Bag.</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Palledari, Hamali &amp; Freight Charges (₹)
                    </label>
                    <input
                      type="number"
                      value={inwardForm.taxCharges}
                      onChange={(e) => setInwardForm({ ...inwardForm, taxCharges: e.target.value })}
                      placeholder="e.g. 200 (Palledari/Labor)"
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl font-bold font-bahi"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Upfront Paid Amount (₹)</label>
                    <input
                      type="number"
                      placeholder={`Full Total: ₹${(parseFloat(inwardGrandTotal) || 0).toFixed(2)}`}
                      value={inwardForm.paidAmount}
                      onChange={(e) => setInwardForm({ ...inwardForm, paidAmount: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl font-bold font-bahi text-[#70161E] dark:text-[#A8323E]"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Upload Parchi Receipt Photo</label>
                    <input type="file" onChange={handleParchiUpload} className="w-full text-xs text-slate-500" />
                    {uploadingDoc && <span className="text-[10px] text-amber-500">Uploading Parchi Photo...</span>}
                  </div>
                </div>

                {/* Real-Time Live Inward Bill & Supplier Balance Summary */}
                <div className="p-3.5 rounded-xl bg-slate-900 text-white flex flex-wrap items-center justify-between gap-3 font-outfit text-xs border border-slate-800 shadow-inner">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Items Total Cost</span>
                    <span className="text-sm font-black font-bahi">₹{inwardItemsTotal.toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">+ Palledari &amp; Freight</span>
                    <span className="text-sm font-black font-bahi text-amber-300">₹{(parseFloat(inwardForm.taxCharges) || 0).toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Grand Total Inward Bill</span>
                    <span className="text-base font-black font-bahi text-emerald-400">₹{inwardGrandTotal.toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Upfront Cash Paid</span>
                    <span className="text-sm font-black font-bahi text-rose-300">₹{(parseFloat(inwardForm.paidAmount) || 0).toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Supplier Left Due</span>
                    <span className="text-sm font-black font-bahi text-amber-400">₹{Math.max(0, inwardGrandTotal - (parseFloat(inwardForm.paidAmount) || 0)).toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-200/80 dark:border-slate-800/80">
                <button
                  type="button"
                  onClick={() => setShowInwardModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-95 text-slate-700 dark:text-slate-200 font-extrabold text-xs uppercase tracking-wider transition border border-slate-200 dark:border-slate-700 font-outfit"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-[#70161E] hover:bg-[#561117] active:scale-95 text-white font-extrabold text-xs uppercase tracking-wider transition shadow-md font-outfit disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  Save Inward &amp; Credit Inventory Stock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 📜 MODAL 2: ADD / EDIT PRODUCT */}
      {showProductModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-modal max-w-lg w-full p-6 shadow-2xl space-y-4 rounded-2xl">
            <div className="flex justify-between items-center border-b border-slate-200/80 dark:border-slate-800/80 pb-3">
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white font-outfit uppercase">
                {productForm.id ? 'Edit Inventory Item' : 'Add New Inventory Item'}
              </h3>
              <button onClick={() => setShowProductModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-3 text-xs font-outfit">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Item Name *</label>
                <input
                  type="text"
                  required
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  placeholder="e.g. Fortune Mustard Oil 1L"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Local Hindi Name</label>
                  <input
                    type="text"
                    value={productForm.localName || ''}
                    onChange={(e) => setProductForm({ ...productForm, localName: e.target.value })}
                    placeholder="e.g. सरसों का तेल"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl font-semibold"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Category</label>
                  <select
                    value={productForm.category}
                    onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl font-semibold"
                  >
                    {categories.filter((c) => c !== 'ALL').map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">MRP ₹</label>
                  <input
                    type="number"
                    value={productForm.mrp}
                    onChange={(e) => setProductForm({ ...productForm, mrp: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl font-bold font-bahi"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Selling Rate ₹ *</label>
                  <input
                    type="number"
                    required
                    value={productForm.sellingPrice}
                    onChange={(e) => setProductForm({ ...productForm, sellingPrice: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl font-bold font-bahi text-[#70161E] dark:text-[#A8323E]"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Unit (इकाई) *</label>
                  <select
                    value={productForm.unit}
                    onChange={(e) => setProductForm({ ...productForm, unit: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl font-bold font-outfit"
                  >
                    {KRN_UNITS.map((u) => (
                      <option key={u.code} value={u.code}>
                        {u.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Real-Time Single Item Valuation Calculator */}
              <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-outfit flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px]">
                  Estimated Total Retail Stock Valuation:
                </span>
                <span className="font-black text-sm text-emerald-600 dark:text-emerald-400 font-bahi">
                  ₹{((parseFloat(productForm.currentStock) || 0) * (parseFloat(productForm.sellingPrice) || 0)).toFixed(2)}
                  <span className="text-[10px] font-normal text-slate-400"> ({productForm.currentStock || 0} {productForm.unit} @ ₹{productForm.sellingPrice || 0})</span>
                </span>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-200/80 dark:border-slate-800/80">
                <button
                  type="button"
                  onClick={() => setShowProductModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-95 text-slate-700 dark:text-slate-200 font-extrabold text-xs uppercase tracking-wider transition border border-slate-200 dark:border-slate-700 font-outfit"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#70161E] hover:bg-[#561117] active:scale-95 text-white font-extrabold text-xs uppercase tracking-wider transition shadow-md font-outfit flex items-center justify-center gap-2"
                >
                  Save Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 📜 MODAL 3: JAMA / RECOVERY PAYMENT */}
      {showJamaModal && jamaCustomer && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-modal max-w-md w-full p-6 shadow-2xl space-y-4 rounded-2xl">
            <div className="flex justify-between items-center border-b border-slate-200/80 dark:border-slate-800/80 pb-3">
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white font-outfit uppercase">
                Record Udhaar Jama Payment
              </h3>
              <button onClick={() => setShowJamaModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveJama} className="space-y-3 text-xs font-outfit">
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <div className="font-extrabold text-sm text-slate-900 dark:text-white font-outfit">{jamaCustomer.name}</div>
                <div className="text-xs text-amber-600 dark:text-amber-400 font-bold font-bahi mt-1">
                  Current Udhaar Balance: ₹{Math.abs(parseFloat(jamaCustomer?.currentBalance) || 0).toFixed(2)}
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Jama / Received Amount (₹) *</label>
                <input
                  type="number"
                  required
                  value={jamaAmount}
                  onChange={(e) => setJamaAmount(e.target.value)}
                  placeholder="e.g. 500"
                  className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl font-black font-bahi text-lg text-emerald-600 dark:text-emerald-400"
                />

                <div className="flex items-center gap-1.5 mt-2">
                  <button
                    type="button"
                    onClick={() => setJamaAmount(String(Math.abs(parseFloat(jamaCustomer?.currentBalance || 0))))}
                    className="px-2.5 py-1 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-[10px] font-bold"
                  >
                    Full Clear (₹{Math.abs(parseFloat(jamaCustomer?.currentBalance || 0)).toFixed(0)})
                  </button>
                  <button
                    type="button"
                    onClick={() => setJamaAmount(String(Math.round(Math.abs(parseFloat(jamaCustomer?.currentBalance || 0)) / 2)))}
                    className="px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-bold"
                  >
                    50% (₹{Math.round(Math.abs(parseFloat(jamaCustomer?.currentBalance || 0)) / 2)})
                  </button>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Payment Method</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setJamaMode('CASH')}
                    className={`py-2 rounded-xl font-bold ${
                      jamaMode === 'CASH'
                        ? 'bg-[#70161E] text-white font-black shadow-sm'
                        : 'bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    CASH
                  </button>
                  <button
                    type="button"
                    onClick={() => setJamaMode('UPI')}
                    className={`py-2 rounded-xl font-bold ${
                      jamaMode === 'UPI'
                        ? 'bg-[#70161E] text-white font-black shadow-sm'
                        : 'bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    UPI QR
                  </button>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Payment Notes / Remarks</label>
                <input
                  type="text"
                  value={jamaNotes}
                  onChange={(e) => setJamaNotes(e.target.value)}
                  placeholder="e.g. Received at counter from son"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl font-semibold"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-200/80 dark:border-slate-800/80">
                <button
                  type="button"
                  onClick={() => setShowJamaModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-95 text-slate-700 dark:text-slate-200 font-extrabold text-xs uppercase tracking-wider transition border border-slate-200 dark:border-slate-700 font-outfit"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#70161E] hover:bg-[#561117] active:scale-95 text-white font-extrabold text-xs uppercase tracking-wider transition shadow-md font-outfit flex items-center justify-center gap-2"
                >
                  Save Jama Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 📜 MODAL 4: ADD STAFF MEMBER */}
      {showEmployeeModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-modal max-w-md w-full p-6 shadow-2xl space-y-4 rounded-2xl">
            <div className="flex justify-between items-center border-b border-slate-200/80 dark:border-slate-800/80 pb-3">
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white font-outfit uppercase">
                Add Store Staff Helper
              </h3>
              <button onClick={() => setShowEmployeeModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEmployee} className="space-y-3 text-xs font-outfit">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={employeeForm.fullName}
                  onChange={(e) => setEmployeeForm({ ...employeeForm, fullName: e.target.value })}
                  placeholder="e.g. Shyam Sundar"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl font-semibold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Phone Number</label>
                <input
                  type="text"
                  value={employeeForm.phone}
                  onChange={(e) => setEmployeeForm({ ...employeeForm, phone: e.target.value })}
                  placeholder="e.g. 9876543210"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl font-semibold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Base Monthly Salary (₹) *</label>
                <input
                  type="number"
                  required
                  value={employeeForm.baseSalary}
                  onChange={(e) => setEmployeeForm({ ...employeeForm, baseSalary: e.target.value })}
                  placeholder="e.g. 12000"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl font-bold font-bahi"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-200/80 dark:border-slate-800/80">
                <button
                  type="button"
                  onClick={() => setShowEmployeeModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-95 text-slate-700 dark:text-slate-200 font-extrabold text-xs uppercase tracking-wider transition border border-slate-200 dark:border-slate-700 font-outfit"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#70161E] hover:bg-[#561117] active:scale-95 text-white font-extrabold text-xs uppercase tracking-wider transition shadow-md font-outfit flex items-center justify-center gap-2"
                >
                  Save Staff Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 📜 MODAL 5: POS RECEIPT THERMAL PRINT PREVIEW */}
      {showReceiptModal && completedBill && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white text-slate-900 rounded-2xl max-w-sm w-full p-5 shadow-2xl space-y-4 font-mono text-xs border border-slate-200 print-area thermal-receipt-print">
            <div className="text-center border-b pb-3 border-dashed border-slate-300">
              <h2 className="font-black text-sm uppercase">NAWAZ TRADERS</h2>
              <div className="text-[10px]">Robertsganj Mandi Yard, Sonebhadra (UP-64)</div>
              <div className="text-[10px]">GSTIN: 09ABCDE1234F1Z5 • Mob: 9876543210</div>
            </div>

            <div className="space-y-1 text-[11px]">
              <div>Bill #: {completedBill.invoiceNo}</div>
              <div>Date: {new Date(completedBill.createdAt).toLocaleString('en-IN')}</div>
              <div>Customer: {completedBill.customerName}</div>
              <div>Payment: {completedBill.paymentMode}</div>
            </div>

            <div className="border-t border-b border-dashed border-slate-300 py-2 space-y-1">
              {completedBill.items?.map((item, idx) => (
                <div key={idx} className="flex justify-between">
                  <span>
                    {item.name} (x{item.quantity})
                  </span>
                  <span>₹{(parseFloat(item?.totalAmount) || 0).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="space-y-1 text-right font-bold">
              <div>Subtotal: ₹{(parseFloat(completedBill?.subTotal) || 0).toFixed(2)}</div>
              <div>Discount: -₹{(parseFloat(completedBill?.discountAmount) || 0).toFixed(2)}</div>
              <div className="text-sm font-black pt-1 border-t border-slate-300">
                Grand Total: ₹{(parseFloat(completedBill?.netAmount) || 0).toFixed(2)}
              </div>
            </div>

            <div className="pt-3 flex justify-between gap-2 border-t border-dashed border-slate-300 no-print">
              <button
                onClick={() => setShowReceiptModal(false)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-95 text-slate-700 dark:text-slate-200 font-extrabold text-xs uppercase tracking-wider transition border border-slate-200 dark:border-slate-700 font-outfit"
              >
                Close
              </button>
              <button
                onClick={() => {
                  window.print();
                }}
                className="px-5 py-2.5 rounded-xl bg-[#70161E] hover:bg-[#561117] active:scale-95 text-white font-extrabold text-xs uppercase tracking-wider flex items-center gap-1.5 font-outfit shadow-md"
              >
                <Printer className="w-4 h-4 shrink-0" />
                <span>Print Bill</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 📜 MODAL 6: CUSTOMER PASSBOOK STATEMENT PRINT MODAL */}
      {showPassbookPrintModal && selectedKhataCustomer && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white text-slate-900 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4 font-mono text-xs border border-slate-200 print-area">
            <div className="text-center border-b pb-4 border-slate-300">
              <h2 className="font-black text-base uppercase font-outfit text-[#0D5C3A]">NAWAZ TRADERS • STORE UDHAAR PASSBOOK</h2>
              <div className="text-xs">Robertsganj Mandi Yard, Sonebhadra (UP-64) • Mob: 9876543210</div>
              <div className="text-[10px] text-slate-500 mt-1">Customer Credit Statement • Generated on {new Date().toLocaleDateString('en-IN')}</div>
            </div>

            {/* Customer Details Box */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-2 gap-2 text-xs">
              <div>
                <div><strong>Customer:</strong> {selectedKhataCustomer.name}</div>
                <div><strong>Phone:</strong> {selectedKhataCustomer.phone}</div>
                <div><strong>Location:</strong> {selectedKhataCustomer.city}</div>
              </div>
              <div className="text-right">
                <div><strong>Total Udhaar:</strong> ₹{(parseFloat(selectedKhataCustomer.totalUdhaarTaken) || 0).toFixed(2)}</div>
                <div><strong>Total Jama Paid:</strong> ₹{(parseFloat(selectedKhataCustomer.totalJamaPaid) || 0).toFixed(2)}</div>
                <div className="text-sm font-black text-amber-700 mt-1">
                  <strong>Remaining Balance Left:</strong> ₹{Math.abs(parseFloat(selectedKhataCustomer.currentBalance) || 0).toFixed(2)}
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="border border-slate-300 rounded-xl overflow-hidden max-h-80 overflow-y-auto">
              <table className="w-full text-left text-[11px]">
                <thead className="bg-slate-100 font-bold border-b border-slate-300">
                  <tr>
                    <th className="p-2">Date</th>
                    <th className="p-2">Ref #</th>
                    <th className="p-2">Type</th>
                    <th className="p-2">Particulars</th>
                    <th className="p-2 text-right">Debit (+)</th>
                    <th className="p-2 text-right">Jama (-)</th>
                    <th className="p-2 text-right">Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {selectedKhataCustomer.ledger?.map((tx, idx) => (
                    <tr key={idx}>
                      <td className="p-2 font-mono">{new Date(tx.date).toLocaleDateString('en-IN')}</td>
                      <td className="p-2 font-mono font-bold">{tx.billNo}</td>
                      <td className="p-2 font-bold">{tx.type === 'JAMA_PAYMENT' ? 'JAMA' : 'UDHAAR'}</td>
                      <td className="p-2 max-w-xs truncate">{tx.particulars}</td>
                      <td className="p-2 text-right text-amber-700">{tx.debitAmount > 0 ? `+₹${parseFloat(tx.debitAmount).toFixed(2)}` : '-'}</td>
                      <td className="p-2 text-right text-emerald-700">{tx.creditAmount > 0 ? `-₹${parseFloat(tx.creditAmount).toFixed(2)}` : '-'}</td>
                      <td className="p-2 text-right font-black">₹{(parseFloat(tx.runningBalance) || 0).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="pt-3 flex justify-between gap-2 border-t border-slate-300 font-outfit no-print">
              <button
                onClick={() => setShowPassbookPrintModal(false)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-95 text-slate-700 dark:text-slate-200 font-extrabold text-xs uppercase tracking-wider transition border border-slate-200 dark:border-slate-700 font-outfit"
              >
                Close
              </button>
              <button
                onClick={() => window.print()}
                className="px-5 py-2.5 rounded-xl bg-[#70161E] hover:bg-[#561117] active:scale-95 text-white font-extrabold text-xs uppercase tracking-wider flex items-center gap-1.5 font-outfit shadow-md"
              >
                <Printer className="w-4 h-4 shrink-0" />
                <span>Print Statement</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 📜 MODAL 7: ADD NEW CREDIT CUSTOMER */}
      {showNewCustomerModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-modal max-w-md w-full p-6 shadow-2xl space-y-4 rounded-2xl">
            <div className="flex justify-between items-center border-b border-slate-200/80 dark:border-slate-800/80 pb-3">
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white font-outfit uppercase flex items-center gap-2">
                <User className="w-5 h-5 text-[#70161E]" />
                Add New Store Credit Customer
              </h3>
              <button onClick={() => setShowNewCustomerModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateNewCustomer} className="space-y-3 text-xs font-outfit">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Customer Full Name *</label>
                <input
                  type="text"
                  required
                  value={newCustomerForm.name}
                  onChange={(e) => setNewCustomerForm({ ...newCustomerForm, name: e.target.value })}
                  placeholder="e.g. Ramesh Verma"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl font-semibold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Mobile Phone Number *</label>
                <input
                  type="text"
                  required
                  value={newCustomerForm.phone}
                  onChange={(e) => setNewCustomerForm({ ...newCustomerForm, phone: e.target.value })}
                  placeholder="e.g. 9876543210"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl font-semibold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Village / City / Address</label>
                <input
                  type="text"
                  value={newCustomerForm.city}
                  onChange={(e) => setNewCustomerForm({ ...newCustomerForm, city: e.target.value })}
                  placeholder="e.g. Robertsganj, Sonebhadra (UP-64)"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl font-semibold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Opening Left Due Balance (₹)</label>
                <input
                  type="number"
                  value={newCustomerForm.initialBalance}
                  onChange={(e) => setNewCustomerForm({ ...newCustomerForm, initialBalance: e.target.value })}
                  placeholder="e.g. 0 (or previous left balance)"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl font-bold font-bahi text-amber-600"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-200/80 dark:border-slate-800/80">
                <button
                  type="button"
                  onClick={() => setShowNewCustomerModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-95 text-slate-700 dark:text-slate-200 font-extrabold text-xs uppercase tracking-wider transition border border-slate-200 dark:border-slate-700 font-outfit"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-[#70161E] hover:bg-[#561117] active:scale-95 text-white font-extrabold text-xs uppercase tracking-wider transition shadow-md font-outfit disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  Create Customer Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 📜 MODAL 8: BULK STOCK UPLOAD & MULTI-LINE QUICK TEXT PASTE */}
      {showBulkStockModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-modal max-w-2xl w-full p-6 shadow-2xl space-y-4 rounded-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center border-b border-slate-200/80 dark:border-slate-800/80 pb-3">
              <div className="flex items-center gap-2">
                <Upload className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white font-outfit uppercase">
                  Easy Bulk Inventory &amp; Stock Upload
                </h3>
              </div>
              <button onClick={() => setShowBulkStockModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveBulkStock} className="space-y-4 text-xs font-outfit">
              <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 space-y-1">
                <div className="font-extrabold flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-emerald-500" /> Fast Multi-Item Batch Adder (Paste from Excel, WhatsApp or CSV)
                </div>
                <div className="text-[11px] leading-relaxed">
                  Paste item lines below. Format per line: <br />
                  <code className="font-mono bg-black/20 px-1.5 py-0.5 rounded text-amber-300">Item Name, Category, MRP, PurchasePrice, SellingPrice, Unit, Stock</code>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300 block">
                    Paste / Type Multiple Inventory Lines:
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setBulkInputText(
                        `Aaloo, Vegetables & Mandi, 25, 18, 20, Kg, 200\nPyaj, Vegetables & Mandi, 40, 30, 35, Kg, 150\nLahsun, Vegetables & Mandi, 180, 140, 160, Kg, 50\nAdrak, Vegetables & Mandi, 120, 90, 110, Kg, 40\nTata Salt 1kg, Groceries & Spices, 28, 22, 25, Pkt, 100\nFortune Soyabean Oil 1L, Oils & Ghee, 140, 115, 125, Ltr, 60\nWheat Gehu Flour (Bori), Groceries & Spices, 1400, 1150, 1250, Bag, 30`
                      );
                    }}
                    className="text-[10px] font-bold text-amber-600 dark:text-amber-400 hover:underline"
                  >
                    Load Sample Mandi &amp; Grocery Template
                  </button>
                </div>
                <textarea
                  rows={7}
                  value={bulkInputText}
                  onChange={(e) => setBulkInputText(e.target.value)}
                  placeholder={`e.g.\nAaloo, Vegetables & Mandi, 25, 18, 20, Kg, 200\nPyaj, Vegetables & Mandi, 40, 30, 35, Kg, 150\nTata Salt 1kg, Groceries & Spices, 28, 22, 25, Pkt, 100`}
                  className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl font-mono text-xs text-slate-900 dark:text-white leading-relaxed focus:border-emerald-500"
                />
              </div>

              {/* Real-Time Bulk Stock Parser & Live Total Valuation Banner */}
              {parsedBulkSummary.itemsCount > 0 && (
                <div className="p-3.5 rounded-xl bg-slate-900 text-white grid grid-cols-2 sm:grid-cols-4 gap-3 font-outfit text-xs border border-slate-800 shadow-inner">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Parsed Items</span>
                    <span className="text-sm font-black font-mono text-white">{parsedBulkSummary.itemsCount} Items</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Total Stock Qty</span>
                    <span className="text-sm font-black font-mono text-amber-300">{parsedBulkSummary.totalQty} Units</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Purchase Investment</span>
                    <span className="text-sm font-black font-bahi text-rose-300">₹{parsedBulkSummary.totalPurchaseValue.toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Retail Sales Value</span>
                    <span className="text-sm font-black font-bahi text-emerald-400">₹{parsedBulkSummary.totalRetailValue.toFixed(2)}</span>
                  </div>
                </div>
              )}

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-200/80 dark:border-slate-800/80">
                <button
                  type="button"
                  onClick={() => setShowBulkStockModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-95 text-slate-700 dark:text-slate-200 font-extrabold text-xs uppercase tracking-wider transition border border-slate-200 dark:border-slate-700 font-outfit"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-extrabold text-xs uppercase tracking-wider shadow-md flex items-center justify-center gap-1.5 font-outfit disabled:opacity-50"
                >
                  <Upload className="w-4 h-4 shrink-0" />
                  <span>Import All Items to Inventory</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 📜 MODAL 9: RECORD MANDI SUPPLIER PAYOUT (CASH/UPI) */}
      {showSupplierPayoutModal && selectedSupplierForPayout && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-modal max-w-md w-full p-6 shadow-2xl space-y-4 rounded-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center border-b border-slate-200/80 dark:border-slate-800/80 pb-3">
              <div className="flex items-center gap-2">
                <Banknote className="w-5 h-5 text-[#70161E] dark:text-[#A8323E]" />
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white font-outfit uppercase">
                  Record Mandi Supplier Payout (भुगतान)
                </h3>
              </div>
              <button onClick={() => setShowSupplierPayoutModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSupplierPayout} className="space-y-3 text-xs font-outfit">
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <div className="font-extrabold text-sm text-slate-900 dark:text-white font-outfit">{selectedSupplierForPayout.supplierName}</div>
                <div className="text-xs text-amber-600 dark:text-amber-400 font-bold font-bahi mt-1 flex items-center justify-between">
                  <span>Current Outstanding Due to Supplier:</span>
                  <span>₹{(parseFloat(selectedSupplierForPayout.totalDue) || 0).toFixed(2)}</span>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Payout / Cash Given Amount (₹) *</label>
                <input
                  type="number"
                  required
                  value={supplierPayoutAmount}
                  onChange={(e) => setSupplierPayoutAmount(e.target.value)}
                  placeholder="e.g. 1500"
                  className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl font-black font-bahi text-lg text-[#70161E] dark:text-[#A8323E]"
                />

                <div className="flex items-center gap-1.5 mt-2">
                  <button
                    type="button"
                    onClick={() => setSupplierPayoutAmount(String(parseFloat(selectedSupplierForPayout.totalDue || 0).toFixed(0)))}
                    className="px-2.5 py-1 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-[10px] font-bold"
                  >
                    Full Clear (₹{(parseFloat(selectedSupplierForPayout.totalDue) || 0).toFixed(0)})
                  </button>
                  <button
                    type="button"
                    onClick={() => setSupplierPayoutAmount(String(Math.round(parseFloat(selectedSupplierForPayout.totalDue || 0) / 2)))}
                    className="px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-bold"
                  >
                    50% (₹{Math.round(parseFloat(selectedSupplierForPayout.totalDue || 0) / 2)})
                  </button>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Payment Method</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSupplierPayoutMode('CASH')}
                    className={`py-2 rounded-xl font-bold ${
                      supplierPayoutMode === 'CASH'
                        ? 'bg-[#70161E] text-white font-black shadow-sm'
                        : 'bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    CASH
                  </button>
                  <button
                    type="button"
                    onClick={() => setSupplierPayoutMode('UPI')}
                    className={`py-2 rounded-xl font-bold ${
                      supplierPayoutMode === 'UPI'
                        ? 'bg-[#70161E] text-white font-black shadow-sm'
                        : 'bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    UPI / BANK
                  </button>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Payment Notes / Remarks</label>
                <input
                  type="text"
                  value={supplierPayoutNotes}
                  onChange={(e) => setSupplierPayoutNotes(e.target.value)}
                  placeholder="e.g. Paid cash to mandi collector Ramesh at shop counter"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl font-semibold"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-200/80 dark:border-slate-800/80">
                <button
                  type="button"
                  onClick={() => setShowSupplierPayoutModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-95 text-slate-700 dark:text-slate-200 font-extrabold text-xs uppercase tracking-wider transition border border-slate-200 dark:border-slate-700 font-outfit"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-[#70161E] hover:bg-[#561117] active:scale-95 text-white font-extrabold text-xs uppercase tracking-wider transition shadow-md font-outfit disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  Save Supplier Payout
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
