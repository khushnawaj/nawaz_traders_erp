'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  Briefcase, 
  Wheat, 
  Warehouse, 
  Truck, 
  Users, 
  TrendingUp, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Plus, 
  Search, 
  Filter, 
  ArrowRight, 
  Scale, 
  Building2, 
  Sparkles, 
  ShieldCheck, 
  FileText, 
  X,
  ChevronRight,
  PieChart,
  DollarSign
} from 'lucide-react';
import toast from 'react-hot-toast';
import { formatCurrency } from '@/lib/utils';
import { useAppSelector } from '@/lib/redux/hooks';

const INITIAL_PROJECTS = [
  {
    id: 'PRJ-2026-001',
    title: 'Kharif 2026 Sharbati Wheat Farmer Initiative',
    category: 'CONTRACT_FARMING',
    categoryLabel: 'Contract Farming',
    status: 'IN_PROGRESS',
    statusLabel: 'Harvest & Inward',
    commodity: 'Sharbati Wheat (C-306)',
    location: 'Sehore & Ashta Cluster (M.P.)',
    targetTonnage: 6000,
    currentTonnage: 4450,
    unit: 'Quintals',
    contractValue: 17700000,
    advancesDisbursed: 3250000,
    enrolledFarmers: 48,
    leadManager: 'Nawaz Khan (Managing Partner)',
    deadline: 'May 2026',
    milestones: [
      { name: 'Seed & Fertilizer Advance Distribution', completed: true },
      { name: 'Pre-Harvest Moisture & Kernel Inspection', completed: true },
      { name: 'Mandi Yard Inward & Electronic Weighment', completed: true },
      { name: 'Final Farmer Khaata Ledger Settlement', completed: false },
    ],
  },
  {
    id: 'PRJ-2026-002',
    title: 'Adani Wilmar Institutional Basmati 1121 Bulk Supply',
    category: 'MILL_SUPPLY',
    categoryLabel: 'Institutional Supply',
    status: 'ACTIVE_DISPATCH',
    statusLabel: 'Active Dispatch',
    commodity: 'Paddy 1121 (Golden Sella)',
    location: 'Dispatches to Adani Wilmar Logistics',
    targetTonnage: 8000,
    currentTonnage: 6200,
    unit: 'Quintals',
    contractValue: 26400000,
    advancesDisbursed: 12500000,
    buyer: 'Adani Wilmar Agri Division',
    leadManager: 'Rashid Bhai (Logistics Lead)',
    deadline: 'June 2026',
    milestones: [
      { name: 'Quality Lab Verification (14% Moisture Cap)', completed: true },
      { name: 'Initial EMD Security Deposit Clearance', completed: true },
      { name: 'Fleet Truckload Loading & E-Way Bills', completed: true },
      { name: 'Final Buyer Delivery Receipt & Payout', completed: false },
    ],
  },
  {
    id: 'PRJ-2026-003',
    title: 'Mandi Godown Shed #4 Modern Expansion',
    category: 'INFRASTRUCTURE',
    categoryLabel: 'Infrastructure',
    status: 'UNDER_CONSTRUCTION',
    statusLabel: '60% Built',
    commodity: '15,000-Bag Storage Capacity',
    location: 'Krishi Upaj Mandi Yard, Plot #12',
    targetTonnage: 15000,
    currentTonnage: 9000,
    unit: 'Bags Capacity',
    contractValue: 4500000,
    advancesDisbursed: 2700000,
    contractor: 'Sehore Structural Works Ltd.',
    leadManager: 'Salim Engineer',
    deadline: 'July 2026',
    milestones: [
      { name: 'Mandi Board & Town Planning Approvals', completed: true },
      { name: 'Reinforced Concrete Plinth & Steel Trusses', completed: true },
      { name: 'Roofing Insulation & Aeration Flooring', completed: false },
      { name: 'Electronic Weighbridge Calibration', completed: false },
    ],
  },
  {
    id: 'PRJ-2026-004',
    title: 'ITC Choupal Yellow Soyabean Procurement Tender',
    category: 'MILL_SUPPLY',
    categoryLabel: 'Institutional Supply',
    status: 'IN_PROGRESS',
    statusLabel: 'In Progress',
    commodity: 'Soyabean (Yellow 9560)',
    location: 'ITC Choupal Sagar Collection Center',
    targetTonnage: 4500,
    currentTonnage: 2700,
    unit: 'Quintals',
    contractValue: 18900000,
    advancesDisbursed: 9000000,
    buyer: 'ITC Limited Agri Business',
    leadManager: 'Arif Patel',
    deadline: 'August 2026',
    milestones: [
      { name: 'Mandi Auction Registration', completed: true },
      { name: 'Daily Quality Assay & Cleaning', completed: true },
      { name: 'Direct Godown Dispatches', completed: false },
      { name: 'Direct Bank Settlement (RTGS)', completed: false },
    ],
  },
  {
    id: 'PRJ-2026-005',
    title: 'Organic Desi Chana (Gram) Farmer Cluster',
    category: 'CONTRACT_FARMING',
    categoryLabel: 'Contract Farming',
    status: 'IN_PROGRESS',
    statusLabel: 'Sowing Phase',
    commodity: 'Desi Chana (Organic Certified)',
    location: 'Ichhawar Belt Organic Villages',
    targetTonnage: 3000,
    currentTonnage: 1200,
    unit: 'Quintals',
    contractValue: 9600000,
    advancesDisbursed: 2100000,
    enrolledFarmers: 32,
    leadManager: 'Nawaz Khan',
    deadline: 'April 2026',
    milestones: [
      { name: 'Soil Certification & Organic Verification', completed: true },
      { name: 'Pre-Sowing Biocontrol Advances', completed: true },
      { name: 'Pod Development Monitoring', completed: false },
      { name: 'Cluster Crop Pooling & Bagging', completed: false },
    ],
  },
  {
    id: 'PRJ-2026-006',
    title: 'Rabi Mustard (Sarson) Bulk Supply to Oil Mills',
    category: 'CONTRACT_FARMING',
    categoryLabel: 'Contract Farming',
    status: 'COMPLETED',
    statusLabel: 'Near Final Stage',
    commodity: 'Mustard (42% Oil Content)',
    location: 'Shujalpur & Sehore Mandi Hubs',
    targetTonnage: 3000,
    currentTonnage: 2800,
    unit: 'Quintals',
    contractValue: 16500000,
    advancesDisbursed: 15400000,
    enrolledFarmers: 26,
    leadManager: 'Rashid Bhai',
    deadline: 'March 2026',
    milestones: [
      { name: 'Oil Yield Lab Pre-Testing', completed: true },
      { name: 'Mandi Procurement Completed', completed: true },
      { name: 'Crushing Mill Delivery', completed: true },
      { name: 'Final Payment Clearance', completed: true },
    ],
  },
];

export default function ProjectsHubPage() {
  const { user } = useAppSelector((state) => state.auth);
  const [projects, setProjects] = useState(INITIAL_PROJECTS);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProject, setSelectedProject] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New Project Form State
  const [formData, setFormData] = useState({
    title: '',
    category: 'CONTRACT_FARMING',
    commodity: 'Sharbati Wheat',
    location: 'Sehore Mandi Hub',
    targetTonnage: '',
    contractValue: '',
    leadManager: user?.fullName || 'Managing Partner',
    deadline: 'December 2026',
  });

  const categories = [
    { key: 'ALL', label: 'All Projects', count: projects.length },
    { key: 'CONTRACT_FARMING', label: '🌾 Contract Farming', count: projects.filter((p) => p.category === 'CONTRACT_FARMING').length },
    { key: 'MILL_SUPPLY', label: '🏭 Institutional Mill Supply', count: projects.filter((p) => p.category === 'MILL_SUPPLY').length },
    { key: 'INFRASTRUCTURE', label: '🏗️ Godown & Infra', count: projects.filter((p) => p.category === 'INFRASTRUCTURE').length },
  ];

  const filteredProjects = projects.filter((project) => {
    const matchesCategory = selectedCategory === 'ALL' || project.category === selectedCategory;
    const matchesSearch = 
      project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.commodity.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.location.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Calculate live portfolio summary metrics
  const totalVolume = projects.reduce((acc, p) => acc + (p.category !== 'INFRASTRUCTURE' ? p.targetTonnage : 0), 0);
  const currentVolume = projects.reduce((acc, p) => acc + (p.category !== 'INFRASTRUCTURE' ? p.currentTonnage : 0), 0);
  const totalValue = projects.reduce((acc, p) => acc + p.contractValue, 0);
  const totalAdvances = projects.reduce((acc, p) => acc + p.advancesDisbursed, 0);
  const overallProgress = Math.round((currentVolume / totalVolume) * 100);

  const handleCreateProject = (e) => {
    e.preventDefault();
    if (!formData.title || !formData.targetTonnage || !formData.contractValue) {
      toast.error('Please fill in required fields');
      return;
    }

    const newProject = {
      id: `PRJ-${Date.now().toString().slice(-4)}`,
      title: formData.title,
      category: formData.category,
      categoryLabel: formData.category === 'CONTRACT_FARMING' ? 'Contract Farming' : formData.category === 'MILL_SUPPLY' ? 'Institutional Supply' : 'Infrastructure',
      status: 'IN_PROGRESS',
      statusLabel: 'Newly Initiated',
      commodity: formData.commodity,
      location: formData.location,
      targetTonnage: Number(formData.targetTonnage),
      currentTonnage: 0,
      unit: formData.category === 'INFRASTRUCTURE' ? 'Bags Capacity' : 'Quintals',
      contractValue: Number(formData.contractValue),
      advancesDisbursed: 0,
      leadManager: formData.leadManager,
      deadline: formData.deadline,
      milestones: [
        { name: 'Initial Planning & Budget Allocation', completed: true },
        { name: 'Stakeholder Registration & Contracts', completed: false },
        { name: 'Procurement / Execution Phase', completed: false },
        { name: 'Final Inspection & Settlement', completed: false },
      ],
    };

    setProjects([newProject, ...projects]);
    setIsModalOpen(false);
    toast.success('New Project Created Successfully!');
    setFormData({
      title: '',
      category: 'CONTRACT_FARMING',
      commodity: 'Sharbati Wheat',
      location: 'Sehore Mandi Hub',
      targetTonnage: '',
      contractValue: '',
      leadManager: user?.fullName || 'Managing Partner',
      deadline: 'December 2026',
    });
  };

  return (
    <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-300">
      {/* Top Welcome / Navigation Header Bar */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5 p-6 rounded-3xl bg-gradient-to-r from-emerald-950/80 via-slate-900/90 to-amber-950/40 border border-emerald-500/30 shadow-2xl backdrop-blur-xl relative overflow-hidden">
        {/* Ambient Top Glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-wider font-outfit">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Nawaz Traders Commercial Ventures
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white font-outfit tracking-tight">
            Commercial Projects & Contracts Hub
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl font-medium leading-relaxed">
            Manage contract farming initiatives with village farmers, institutional supply tenders for rice & flour mills, and infrastructure expansion across Mandi yards.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-3 relative z-10 shrink-0">
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold text-xs shadow-lg shadow-amber-500/20 transition-transform active:scale-95 font-outfit"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" /> Propose New Project
          </button>

          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 font-bold text-xs backdrop-blur-md transition font-outfit"
          >
            <PieChart className="w-4 h-4" /> Open Operations Dashboard →
          </Link>
        </div>
      </div>

      {/* Portfolio Live KPI Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bahi-card p-4 rounded-3xl border border-slate-200/60 dark:border-slate-800/60 shadow-sm relative overflow-hidden group hover:border-emerald-500/40 transition-all duration-300">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider font-outfit">Active Projects</span>
            <div className="p-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl border border-emerald-500/20">
              <Briefcase className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-bahi">
            {projects.length} Initiatives
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Multi-mandi execution
          </div>
        </div>

        <div className="bahi-card p-4 rounded-3xl border border-slate-200/60 dark:border-slate-800/60 shadow-sm relative overflow-hidden group hover:border-amber-500/40 transition-all duration-300">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider font-outfit">Total Contract Portfolio</span>
            <div className="p-2 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-xl border border-amber-500/20">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-amber-600 dark:text-amber-400 font-bahi">
            {formatCurrency(totalValue)}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
            Active commercial commitment
          </div>
        </div>

        <div className="bahi-card p-4 rounded-3xl border border-slate-200/60 dark:border-slate-800/60 shadow-sm relative overflow-hidden group hover:border-blue-500/40 transition-all duration-300">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider font-outfit">Committed Grain Volume</span>
            <div className="p-2 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-xl border border-blue-500/20">
              <Scale className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-bahi">
            {totalVolume.toLocaleString('en-IN')} Qtl
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
            {currentVolume.toLocaleString('en-IN')} Qtl procured / delivered
          </div>
        </div>

        <div className="bahi-card p-4 rounded-3xl border border-slate-200/60 dark:border-slate-800/60 shadow-sm relative overflow-hidden group hover:border-purple-500/40 transition-all duration-300">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider font-outfit">Execution Velocity</span>
            <div className="p-2 bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-xl border border-purple-500/20">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-purple-600 dark:text-purple-400 font-bahi">
            {overallProgress}% Achieved
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
            Advances: {formatCurrency(totalAdvances)}
          </div>
        </div>
      </div>

      {/* Filter Tabs and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-200/60 dark:bg-slate-900/60 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 overflow-x-auto">
          {categories.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setSelectedCategory(cat.key)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition shrink-0 font-outfit ${
                selectedCategory === cat.key
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {cat.label} ({cat.count})
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72 shrink-0">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search projects, crops, buyers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40 transition"
          />
        </div>
      </div>

      {/* Project Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.map((project) => {
          const progressPercent = Math.min(
            100,
            Math.round((project.currentTonnage / project.targetTonnage) * 100)
          );

          return (
            <div
              key={project.id}
              className="bahi-card rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800/80 shadow-md hover:border-emerald-500/50 hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
            >
              <div className="space-y-4">
                {/* Header Badge */}
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-mono font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                    {project.id}
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase font-outfit border ${
                      project.status === 'COMPLETED'
                        ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                        : project.status === 'ACTIVE_DISPATCH'
                        ? 'bg-blue-500/10 text-blue-500 border-blue-500/20'
                        : project.status === 'UNDER_CONSTRUCTION'
                        ? 'bg-purple-500/10 text-purple-500 border-purple-500/20'
                        : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                    }`}
                  >
                    {project.statusLabel}
                  </span>
                </div>

                {/* Project Title */}
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white group-hover:text-emerald-500 transition font-outfit line-clamp-2">
                    {project.title}
                  </h3>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
                    <Wheat className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    <span>{project.commodity}</span>
                  </div>
                </div>

                {/* Progress Bar & Volume Metrics */}
                <div className="space-y-1.5 p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/60">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-slate-500 dark:text-slate-400">Execution Progress</span>
                    <span className="text-slate-900 dark:text-white font-mono font-bold">{progressPercent}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-amber-500 transition-all duration-500"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-0.5">
                    <span>Current: <strong className="text-slate-800 dark:text-slate-200">{project.currentTonnage.toLocaleString('en-IN')}</strong> {project.unit}</span>
                    <span>Target: <strong className="text-slate-800 dark:text-slate-200">{project.targetTonnage.toLocaleString('en-IN')}</strong> {project.unit}</span>
                  </div>
                </div>

                {/* Financial Summary */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-amber-500/5 border border-amber-500/15">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Contract Value</span>
                    <span className="font-extrabold text-amber-600 dark:text-amber-400 font-bahi text-sm">
                      {formatCurrency(project.contractValue)}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-emerald-500/5 border border-emerald-500/15">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Advances Disbursed</span>
                    <span className="font-extrabold text-emerald-600 dark:text-emerald-400 font-bahi text-sm">
                      {formatCurrency(project.advancesDisbursed)}
                    </span>
                  </div>
                </div>

                {/* Milestones Preview */}
                <div className="space-y-1.5 text-xs">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block font-outfit">
                    Active Milestones
                  </span>
                  {project.milestones.slice(0, 2).map((m, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                      {m.completed ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      ) : (
                        <Clock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      )}
                      <span className={`text-[11px] truncate ${m.completed ? 'line-through text-slate-400' : ''}`}>
                        {m.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="pt-4 mt-4 border-t border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between gap-2">
                <span className="text-[10px] text-slate-400 flex items-center gap-1 font-medium">
                  <Calendar className="w-3 h-3 text-slate-400" /> Due {project.deadline}
                </span>

                <button
                  onClick={() => setSelectedProject(project)}
                  className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 transition font-outfit"
                >
                  <span>Project Dossier</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Switch to Operational ERP Banner */}
      <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/80 backdrop-blur-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-2xl border border-emerald-500/20">
            <PieChart className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-base font-extrabold text-slate-900 dark:text-white font-outfit">
              Need to record daily farmer procurement & mandi invoices?
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Access the live double-entry ledger, crop weighment parchis, fleet tracking, and stock godowns.
            </p>
          </div>
        </div>

        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-md transition font-outfit shrink-0"
        >
          <span>Open Operations Dashboard</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* MODAL: Propose New Project */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-emerald-500" />
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white font-outfit">
                  Propose New Commercial Project
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateProject} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Project Title / Initiative Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rabi 2026 Wheat Procurement Tender"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-xs focus:ring-2 focus:ring-emerald-500/40 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Project Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-xs focus:outline-none font-medium"
                  >
                    <option value="CONTRACT_FARMING">🌾 Contract Farming</option>
                    <option value="MILL_SUPPLY">🏭 Institutional Mill Supply</option>
                    <option value="INFRASTRUCTURE">🏗️ Godown & Infrastructure</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Target Commodity / Asset
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sharbati Wheat"
                    value={formData.commodity}
                    onChange={(e) => setFormData({ ...formData, commodity: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Target Volume (Quintals / Bags) *
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 5000"
                    value={formData.targetTonnage}
                    onChange={(e) => setFormData({ ...formData, targetTonnage: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-xs focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Contract / Budget Value (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 15000000"
                    value={formData.contractValue}
                    onChange={(e) => setFormData({ ...formData, contractValue: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Mandi Cluster / Delivery Location
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-xs focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Completion Target Date
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. November 2026"
                    value={formData.deadline}
                    onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md"
                >
                  Create Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Project Dossier / Detailed Breakdown */}
      {selectedProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-xl p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold uppercase">
                  {selectedProject.id} • {selectedProject.categoryLabel}
                </span>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white font-outfit">
                  {selectedProject.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedProject(null)}
                className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
                <div className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-950">
                  <span className="text-[10px] text-slate-400 block font-bold uppercase">Target Commodity</span>
                  <span className="font-extrabold text-slate-900 dark:text-white font-outfit">{selectedProject.commodity}</span>
                </div>
                <div className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-950">
                  <span className="text-[10px] text-slate-400 block font-bold uppercase">Total Budget Value</span>
                  <span className="font-extrabold text-amber-500 font-bahi">{formatCurrency(selectedProject.contractValue)}</span>
                </div>
                <div className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-950">
                  <span className="text-[10px] text-slate-400 block font-bold uppercase">Target Volume</span>
                  <span className="font-extrabold text-emerald-500 font-mono">{selectedProject.targetTonnage.toLocaleString('en-IN')} {selectedProject.unit}</span>
                </div>
              </div>

              {/* Milestones Breakdown */}
              <div className="space-y-2">
                <h4 className="text-xs font-extrabold text-slate-900 dark:text-white font-outfit uppercase tracking-wider">
                  Operational Milestone Tracker
                </h4>
                <div className="space-y-2">
                  {selectedProject.milestones.map((m, idx) => (
                    <div
                      key={idx}
                      className={`p-3 rounded-2xl border text-xs flex items-center justify-between ${
                        m.completed
                          ? 'bg-emerald-500/5 border-emerald-500/20 text-slate-900 dark:text-white'
                          : 'bg-slate-50 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800 text-slate-500'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        {m.completed ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                        ) : (
                          <Clock className="w-4 h-4 text-amber-500 shrink-0" />
                        )}
                        <span className="font-medium">{m.name}</span>
                      </div>
                      <span className={`text-[10px] font-bold uppercase font-mono ${m.completed ? 'text-emerald-500' : 'text-amber-500'}`}>
                        {m.completed ? 'Cleared' : 'Pending'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Stakeholders Info */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Lead Operations Manager:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{selectedProject.leadManager}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Target Area / Hub:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{selectedProject.location}</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end">
              <button
                onClick={() => setSelectedProject(null)}
                className="px-5 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs"
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
