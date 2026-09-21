'use client';

import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('UI Component Error Boundary Caught Exception:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 my-4 glass-card rounded-3xl border border-rose-500/30 text-center space-y-4 max-w-lg mx-auto shadow-xl">
          <div className="w-12 h-12 bg-rose-500/10 text-rose-500 rounded-2xl flex items-center justify-center mx-auto border border-rose-500/20">
            <AlertTriangle className="w-6 h-6" />
          </div>

          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-900 dark:text-white font-outfit">
              Component Error Encountered
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Something went wrong while rendering this section. You can safely reload this module.
            </p>
          </div>

          {this.state.error?.message && (
            <div className="p-2.5 bg-rose-950/20 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 rounded-xl text-[11px] font-mono text-left overflow-x-auto border border-rose-800/30">
              {this.state.error.message}
            </div>
          )}

          <div className="flex items-center justify-center gap-2 pt-1">
            <button
              onClick={this.handleReset}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white text-xs font-bold shadow-md transition font-outfit"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Try Again
            </button>
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 text-xs font-bold transition font-outfit"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
