'use client';

import { useState } from 'react';
import { X, ExternalLink, Download, FileText, ZoomIn, ZoomOut, Printer } from 'lucide-react';

export default function DocumentPreviewModal({ isOpen, onClose, docUrl, title = 'Document Preview' }) {
  const [zoom, setZoom] = useState(1);

  if (!isOpen || !docUrl) return null;

  const isPdf = docUrl.toLowerCase().endsWith('.pdf');

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.25, 2.5));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.25, 0.5));

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="glass-modal rounded-3xl max-w-4xl w-full shadow-2xl overflow-hidden my-auto border border-slate-200/80 dark:border-slate-800 text-slate-900 dark:text-white max-h-[92vh] flex flex-col">
        {/* Modal Header */}
        <div className="bg-slate-900 text-white p-4 px-6 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-400" />
            <h3 className="font-semibold text-sm sm:text-base text-white">{title}</h3>
          </div>

          <div className="flex items-center gap-2">
            {!isPdf && (
              <>
                <button
                  onClick={handleZoomOut}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <span className="text-xs text-slate-400 font-mono">{Math.round(zoom * 100)}%</span>
                <button
                  onClick={handleZoomIn}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                  title="Zoom In"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
              </>
            )}

            <a
              href={docUrl}
              download
              target="_blank"
              rel="noreferrer"
              className="p-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition flex items-center gap-1 text-xs font-medium px-3"
              title="Download File"
            >
              <Download className="w-3.5 h-3.5" /> Download
            </a>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-600 text-white transition"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-4 bg-slate-950/90 flex-1 overflow-auto flex items-center justify-center min-h-[400px]">
          {isPdf ? (
            <iframe
              src={docUrl}
              title={title}
              className="w-full h-[70vh] rounded-2xl border border-slate-800"
            />
          ) : (
            <div className="overflow-auto max-h-[75vh] flex items-center justify-center">
              <img
                src={docUrl}
                alt={title}
                style={{ transform: `scale(${zoom})`, transformOrigin: 'center center' }}
                className="max-w-full h-auto object-contain rounded-xl shadow-2xl transition-transform duration-200"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
