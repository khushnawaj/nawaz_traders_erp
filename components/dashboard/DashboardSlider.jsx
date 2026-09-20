'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, ArrowRight, Sparkles } from 'lucide-react';

const SLIDES = [
  {
    id: 1,
    title: 'Paddy & Rice Procurement',
    hindiTitle: 'Paddy & Grain Procurement',
    subtitle: 'Streamlined Mandi Weighments, Moisture Deductions & Farmer Ledgers',
    image: '/images/paddy_banner.jpg',
    badge: 'Harvest Season Live',
    ctaText: 'Record Purchase Slip',
    ctaLink: '/farmers',
  },
  {
    id: 2,
    title: 'Wheat Reserves & Godowns',
    hindiTitle: 'Wheat Storage & Warehousing',
    subtitle: 'Real-time Godown Capacity Tracking, Bag Counts & Quintal Balances',
    image: '/images/wheat_banner.jpg',
    badge: 'Live Godown Stock',
    ctaText: 'Check Godown Stock',
    ctaLink: '/godowns',
  },
  {
    id: 3,
    title: 'Rice Mill Wholesale Dispatch',
    hindiTitle: 'Commercial Rice Mill Sales',
    subtitle: 'Bulk Rice Mill Billings, Freight Calculation & Party Ledger Accounts',
    image: '/images/rice_banner.jpg',
    badge: 'Rice Mill Wholesale',
    ctaText: 'View Mill Sales',
    ctaLink: '/sales',
  },
];

export default function DashboardSlider() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
    }, 5500);
    return () => clearInterval(timer);
  }, []);

  const handlePrev = () => {
    setCurrentSlide((prev) => (prev === 0 ? SLIDES.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
  };

  return (
    <div className="relative rounded-3xl overflow-hidden shadow-lg border border-slate-200/60 dark:border-slate-800/60 group h-[340px] sm:h-[400px]">
      {/* Background Slides */}
      {SLIDES.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
          }`}
        >
          {/* Subtle Dark Vignette & Glass Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-slate-950/20 z-10" />
          <img
            src={slide.image}
            alt={slide.title}
            className="w-full h-full object-cover transform scale-102 transition-transform duration-10000 ease-linear"
          />

          {/* Slide Content */}
          <div className="absolute inset-0 z-20 p-6 sm:p-10 flex flex-col justify-between max-w-3xl text-white font-sans">
            <div className="flex items-center gap-2">
              <span className="px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-200 border border-emerald-400/30 backdrop-blur-md flex items-center gap-1.5 font-outfit">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" /> {slide.badge}
              </span>
            </div>

            <div className="space-y-3">
              <div className="text-xs font-extrabold text-amber-400 tracking-wider uppercase font-outfit">
                {slide.hindiTitle}
              </div>
              <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-snug text-white font-outfit">
                {slide.title}
              </h2>
              <p className="text-slate-200 text-xs sm:text-sm font-normal max-w-xl leading-relaxed">
                {slide.subtitle}
              </p>

              <div className="pt-3 flex flex-wrap items-center gap-3">
                <Link
                  href={slide.ctaLink}
                  className="bahi-btn-white"
                >
                  {slide.ctaText} <ArrowRight className="w-4 h-4 text-emerald-700" />
                </Link>

                <Link
                  href="/purchases"
                  className="bahi-btn-glass"
                >
                  Create Invoice
                </Link>
              </div>
            </div>

            {/* Bottom Minimal Status */}
            <div className="flex items-center justify-between pt-2 border-t border-white/15 text-[11px] text-slate-300 font-medium">
              <span>Nawaz Traders ERP</span>
              <span className="font-mono text-[10px]">0{currentSlide + 1} / 0{SLIDES.length}</span>
            </div>
          </div>
        </div>
      ))}

      {/* Manual Minimal Controls */}
      <button
        onClick={handlePrev}
        className="absolute left-3 top-1/2 -translate-y-1/2 z-30 p-2.5 rounded-xl bg-slate-950/30 hover:bg-slate-950/70 text-white border border-white/10 backdrop-blur-md opacity-0 group-hover:opacity-100 transition"
        aria-label="Previous Slide"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      <button
        onClick={handleNext}
        className="absolute right-3 top-1/2 -translate-y-1/2 z-30 p-2.5 rounded-xl bg-slate-950/30 hover:bg-slate-950/70 text-white border border-white/10 backdrop-blur-md opacity-0 group-hover:opacity-100 transition"
        aria-label="Next Slide"
      >
        <ChevronRight className="w-4 h-4" />
      </button>

      {/* Slider Minimal Dots */}
      <div className="absolute bottom-4 right-6 z-30 flex items-center gap-1.5">
        {SLIDES.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentSlide(idx)}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              idx === currentSlide ? 'w-6 bg-emerald-400' : 'w-1.5 bg-white/30 hover:bg-white/60'
            }`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
