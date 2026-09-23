'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Bell, 
  CheckCheck, 
  Wheat, 
  CreditCard, 
  Clock, 
  ShieldCheck, 
  RefreshCw,
  AlertCircle,
  Trash2,
  ExternalLink
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks';
import { fetchNotifications, markNotificationsRead, clearAllNotifications } from '@/lib/redux/slices/notificationsSlice';

export default function NotificationBell() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { list: notifications, unreadCount, loading } = useAppSelector((state) => state.notifications);
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    // Initial fetch
    dispatch(fetchNotifications());

    // Polling sync every 15 seconds for real-time dynamic updates
    const interval = setInterval(() => {
      dispatch(fetchNotifications());
    }, 15000);

    return () => clearInterval(interval);
  }, [dispatch]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAllAsRead = (e) => {
    e.stopPropagation();
    dispatch(markNotificationsRead([]));
  };

  const handleClearAll = (e) => {
    e.stopPropagation();
    dispatch(clearAllNotifications());
  };

  const handleNotificationClick = (n) => {
    dispatch(markNotificationsRead([n.id]));
    setOpen(false);
    if (n.link) {
      router.push(n.link);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'PURCHASE':
        return <Wheat className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />;
      case 'DUE_DATE':
        return <Clock className="w-4 h-4 text-amber-500" />;
      case 'ADVANCE':
        return <CreditCard className="w-4 h-4 text-purple-500" />;
      case 'RECONCILIATION':
        return <ShieldCheck className="w-4 h-4 text-blue-500" />;
      default:
        return <Bell className="w-4 h-4 text-slate-500" />;
    }
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return 'Just now';
    const date = new Date(dateStr);
    const diffMs = Date.now() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button with Unread Badge */}
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-xl bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 transition cursor-pointer"
        title="Notifications"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full bg-emerald-600 text-white text-[9px] font-bold flex items-center justify-center animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Dynamic Redux Notification Dropdown Drawer */}
      {open && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl z-50 overflow-hidden font-outfit text-slate-900 dark:text-white animate-in fade-in zoom-in-95 duration-150">
          {/* Header */}
          <div className="p-3.5 bg-slate-50 dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-xs">Live System Notifications</h4>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300/50">
                  {unreadCount} Unread
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => dispatch(fetchNotifications())}
                className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition"
                title="Refresh Notifications"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              </button>

              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="text-[10px] font-bold text-emerald-600 hover:underline flex items-center gap-0.5 cursor-pointer px-1 py-0.5 rounded hover:bg-emerald-50 dark:hover:bg-emerald-950/50"
                  title="Mark all as read"
                >
                  <CheckCheck className="w-3.5 h-3.5" /> Read
                </button>
              )}

              {notifications && notifications.length > 0 && (
                <button
                  onClick={handleClearAll}
                  className="text-[10px] font-bold text-rose-500 hover:underline flex items-center gap-0.5 cursor-pointer px-1.5 py-0.5 rounded hover:bg-rose-50 dark:hover:bg-rose-950/50"
                  title="Clear all notifications"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Clear All
                </button>
              )}
            </div>
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
            {!notifications || notifications.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400 space-y-1">
                <Bell className="w-6 h-6 mx-auto text-slate-300 dark:text-slate-700 opacity-60" />
                <p>No notifications right now</p>
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => handleNotificationClick(n)}
                  className={`p-3.5 flex items-start gap-3 transition cursor-pointer group ${
                    !n.read
                      ? 'bg-emerald-50/40 dark:bg-emerald-950/20 hover:bg-emerald-50/80 dark:hover:bg-emerald-950/40'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800/40 opacity-80'
                  }`}
                >
                  <div className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shrink-0 group-hover:scale-105 transition-transform">
                    {getIcon(n.type)}
                  </div>

                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                        {n.title}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">{formatTime(n.createdAt)}</span>
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed font-normal">
                      {n.message}
                    </p>
                    {n.link && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 group-hover:underline pt-0.5">
                        View Details <ExternalLink className="w-3 h-3" />
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-2.5 bg-slate-50 dark:bg-slate-950/80 border-t border-slate-200 dark:border-slate-800 text-center">
            <Link
              href="/reports/profit-loss"
              onClick={() => setOpen(false)}
              className="text-[11px] font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            >
              View System Logs & Financial Statements
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
