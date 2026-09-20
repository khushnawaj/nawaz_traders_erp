'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  CheckCircle, 
  XCircle, 
  Clock, 
  RotateCcw,
  CheckCheck,
  TrendingUp,
  Sparkles
} from 'lucide-react';
import toast from 'react-hot-toast';

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export default function AttendanceCalendar({ employeeId, employeeName, onAttendanceChange }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [attendanceMap, setAttendanceMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [savingDate, setSavingDate] = useState(null);
  const [bulkLoading, setBulkLoading] = useState(false);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1; // 1-indexed

  // Format date helper (YYYY-MM-DD)
  const formatDateKey = (y, m, d) => {
    const mm = m.toString().padStart(2, '0');
    const dd = d.toString().padStart(2, '0');
    return `${y}-${mm}-${dd}`;
  };

  const todayStr = formatDateKey(
    new Date().getFullYear(),
    new Date().getMonth() + 1,
    new Date().getDate()
  );

  // Fetch Attendance for the active month
  const fetchMonthAttendance = useCallback(async () => {
    if (!employeeId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/employees/${employeeId}/attendance?year=${year}&month=${month}`);
      const json = await res.json();
      if (json.success) {
        const map = {};
        json.data.forEach((item) => {
          const dateStr = item.date.split('T')[0];
          map[dateStr] = item;
        });
        setAttendanceMap(map);
      }
    } catch (err) {
      console.error('Error loading attendance calendar:', err);
      toast.error('Failed to load attendance');
    } finally {
      setLoading(false);
    }
  }, [employeeId, year, month]);

  useEffect(() => {
    fetchMonthAttendance();
  }, [fetchMonthAttendance]);

  // Navigate Months
  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, currentDate.getMonth() + 1, 1));
  };

  const handleGoToday = () => {
    setCurrentDate(new Date());
  };

  // Toggle Day Attendance (UNMARKED -> PRESENT -> ABSENT -> UNMARKED)
  const handleDayClick = async (dateStr, dayNum, isSunday) => {
    const currentStatus = attendanceMap[dateStr]?.status || null;
    let nextStatus = null;

    if (!currentStatus) {
      nextStatus = 'PRESENT';
    } else if (currentStatus === 'PRESENT') {
      nextStatus = 'ABSENT';
    } else if (currentStatus === 'ABSENT') {
      nextStatus = 'UNMARKED';
    } else {
      nextStatus = 'PRESENT';
    }

    // Optimistic Update
    const prevRecord = attendanceMap[dateStr];
    setAttendanceMap((prev) => {
      const nextMap = { ...prev };
      if (nextStatus === 'UNMARKED') {
        delete nextMap[dateStr];
      } else {
        nextMap[dateStr] = { ...(prev[dateStr] || {}), status: nextStatus, date: dateStr };
      }
      return nextMap;
    });

    setSavingDate(dateStr);

    try {
      const res = await fetch(`/api/employees/${employeeId}/attendance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: dateStr,
          status: nextStatus,
        }),
      });

      const json = await res.json();
      if (!json.success) {
        throw new Error(json.error || 'Failed to save');
      }

      const formattedDateLabel = `${dayNum} ${MONTH_NAMES[month - 1].substring(0, 3)}`;
      if (nextStatus === 'PRESENT') {
        toast.success(`${formattedDateLabel}: PRESENT`, { duration: 1200 });
      } else if (nextStatus === 'ABSENT') {
        toast.error(`${formattedDateLabel}: ABSENT`, { duration: 1200 });
      } else {
        toast(`${formattedDateLabel}: UNMARKED`, { duration: 1200 });
      }

      if (onAttendanceChange) onAttendanceChange();
    } catch (err) {
      console.error('Error saving attendance:', err);
      toast.error(`Failed to update attendance`);
      setAttendanceMap((prev) => {
        const nextMap = { ...prev };
        if (prevRecord) {
          nextMap[dateStr] = prevRecord;
        } else {
          delete nextMap[dateStr];
        }
        return nextMap;
      });
    } finally {
      setSavingDate(null);
    }
  };

  // Days in current month calculation
  const daysInMonth = new Date(year, month, 0).getDate();
  const firstDayOfWeek = new Date(year, month - 1, 1).getDay(); // 0 = Sun
  const paddingDays = (firstDayOfWeek + 6) % 7; // Monday = 0

  // Calculate Month Stats
  let presentCount = 0;
  let absentCount = 0;
  let halfDayCount = 0;
  let totalOvertimeHrs = 0;

  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = formatDateKey(year, month, d);
    const rec = attendanceMap[dateStr];
    if (rec) {
      if (rec.status === 'PRESENT') presentCount++;
      if (rec.status === 'ABSENT') absentCount++;
      if (rec.status === 'HALF_DAY' || rec.status === 'LEAVE') halfDayCount++;
      totalOvertimeHrs += parseFloat(rec.overtimeHr || 0);
    }
  }

  const markedDaysCount = presentCount + absentCount + halfDayCount;
  const attendanceRate = markedDaysCount > 0 ? Math.round((presentCount / markedDaysCount) * 100) : 0;

  // Bulk Mark All Weekdays Present
  const handleBulkMarkPresent = async () => {
    const weekdayDates = [];
    for (let d = 1; d <= daysInMonth; d++) {
      const dateObj = new Date(year, month - 1, d);
      if (dateObj.getDay() !== 0) { // Exclude Sundays
        weekdayDates.push(formatDateKey(year, month, d));
      }
    }

    if (!confirm(`Mark all ${weekdayDates.length} weekdays of ${MONTH_NAMES[month - 1]} as PRESENT?`)) return;

    setBulkLoading(true);
    try {
      const res = await fetch(`/api/employees/${employeeId}/attendance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'BULK_MARK_PRESENT',
          dates: weekdayDates,
        }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success(`Marked ${weekdayDates.length} weekdays as PRESENT!`);
        fetchMonthAttendance();
        if (onAttendanceChange) onAttendanceChange();
      }
    } catch (err) {
      toast.error('Failed bulk update');
    } finally {
      setBulkLoading(false);
    }
  };

  // Bulk Clear Month
  const handleBulkClearMonth = async () => {
    const allMonthDates = [];
    for (let d = 1; d <= daysInMonth; d++) {
      allMonthDates.push(formatDateKey(year, month, d));
    }

    if (!confirm(`Clear all attendance for ${MONTH_NAMES[month - 1]}?`)) return;

    setBulkLoading(true);
    try {
      const res = await fetch(`/api/employees/${employeeId}/attendance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'BULK_CLEAR',
          dates: allMonthDates,
        }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success(`Cleared attendance for ${MONTH_NAMES[month - 1]}`);
        setAttendanceMap({});
        if (onAttendanceChange) onAttendanceChange();
      }
    } catch (err) {
      toast.error('Failed to clear month');
    } finally {
      setBulkLoading(false);
    }
  };

  return (
    <div className="glass-card p-4 sm:p-5 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 shadow-lg space-y-4 max-w-4xl mx-auto">
      {/* Compact Top Navigation Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-200/60 dark:border-slate-800/60 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-lg">
            <CalendarIcon className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
              Attendance Log
              <span className="text-[10px] text-slate-400 font-normal hidden sm:inline">(Click date to toggle Present/Absent)</span>
            </h3>
          </div>
        </div>

        {/* Compact Controls */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
          <div className="flex items-center bg-slate-100 dark:bg-slate-900 p-0.5 rounded-xl border border-slate-200/60 dark:border-slate-800/60 text-xs">
            <button
              onClick={handlePrevMonth}
              className="p-1 hover:bg-white dark:hover:bg-slate-800 rounded-lg transition text-slate-700 dark:text-slate-300"
              title="Previous Month"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <span className="px-2.5 font-bold font-mono text-slate-900 dark:text-white min-w-[110px] text-center text-xs">
              {MONTH_NAMES[month - 1].substring(0, 3)} {year}
            </span>
            <button
              onClick={handleNextMonth}
              className="p-1 hover:bg-white dark:hover:bg-slate-800 rounded-xl transition text-slate-700 dark:text-slate-300"
              title="Next Month"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            onClick={handleGoToday}
            className="px-2 py-1 text-[11px] font-semibold text-purple-600 dark:text-purple-400 bg-purple-500/10 hover:bg-purple-500/20 rounded-lg transition"
          >
            Today
          </button>

          <div className="flex items-center gap-1 pl-1 border-l border-slate-200/60 dark:border-slate-800/60">
            <button
              onClick={handleBulkMarkPresent}
              disabled={bulkLoading}
              title="Mark all weekdays as Present"
              className="p-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg shadow-sm transition flex items-center gap-1 disabled:opacity-50"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Fill Mon-Sat</span>
            </button>
            <button
              onClick={handleBulkClearMonth}
              disabled={bulkLoading}
              title="Clear active month"
              className="p-1.5 text-xs bg-slate-100 dark:bg-slate-800 hover:text-rose-600 rounded-lg transition text-slate-500 disabled:opacity-50"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Minimalist Inline Summary Pill Strip */}
      <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-50/80 dark:bg-slate-950/60 px-3 py-2 rounded-xl border border-slate-200/50 dark:border-slate-800/50 text-xs">
        <div className="flex items-center gap-3 flex-wrap font-medium">
          <span className="flex items-center gap-1 text-emerald-700 dark:text-emerald-300">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="font-semibold">{presentCount}</span> Present
          </span>

          <span className="flex items-center gap-1 text-rose-700 dark:text-rose-300">
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            <span className="font-semibold">{absentCount}</span> Absent
          </span>

          {halfDayCount > 0 && (
            <span className="flex items-center gap-1 text-amber-700 dark:text-amber-300">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span className="font-semibold">{halfDayCount}</span> Leave
            </span>
          )}

          <span className="text-slate-400">•</span>

          <span className="text-purple-600 dark:text-purple-400 font-semibold">
            {attendanceRate}% Rate
          </span>

          {totalOvertimeHrs > 0 && (
            <>
              <span className="text-slate-400">•</span>
              <span className="text-indigo-600 dark:text-indigo-400">
                {totalOvertimeHrs}h OT
              </span>
            </>
          )}
        </div>

        <div className="text-[11px] text-slate-400 font-normal">
          Click cell to cycle: <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Present</span> → <span className="text-rose-600 dark:text-rose-400 font-semibold">Absent</span> → Unmarked
        </div>
      </div>

      {/* Compact Calendar Grid */}
      {loading ? (
        <div className="py-12 text-center">
          <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      ) : (
        <div className="space-y-1">
          {/* Weekday Headers */}
          <div className="grid grid-cols-7 gap-1 text-center">
            {WEEKDAYS.map((day, idx) => (
              <div
                key={day}
                className={`py-1 text-[11px] font-semibold uppercase tracking-wider ${
                  idx === 6 ? 'text-rose-500' : 'text-slate-400 dark:text-slate-500'
                }`}
              >
                {day}
              </div>
            ))}
          </div>

          {/* Compact Days Matrix */}
          <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
            {/* Empty Padding Cells */}
            {Array.from({ length: paddingDays }).map((_, i) => (
              <div key={`pad-${i}`} className="h-10 sm:h-12 rounded-xl bg-slate-100/30 dark:bg-slate-900/10 opacity-20 pointer-events-none" />
            ))}

            {/* Month Day Cells */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dayNum = i + 1;
              const dateStr = formatDateKey(year, month, dayNum);
              const isToday = dateStr === todayStr;
              
              const dayObj = new Date(year, month - 1, dayNum);
              const isSunday = dayObj.getDay() === 0;

              const record = attendanceMap[dateStr];
              const status = record?.status || null;
              const isSaving = savingDate === dateStr;

              // Minimalist Color Styling
              let cellStyle = 'bg-white dark:bg-slate-900/60 border-slate-200/60 dark:border-slate-800/60 hover:border-purple-500/50 text-slate-700 dark:text-slate-300';
              let badgeDot = null;

              if (status === 'PRESENT') {
                cellStyle = 'bg-emerald-500/20 dark:bg-emerald-500/20 border-emerald-500/40 text-emerald-800 dark:text-emerald-200 font-bold ring-1 ring-emerald-500/30';
                badgeDot = <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-sm" />;
              } else if (status === 'ABSENT') {
                cellStyle = 'bg-rose-500/20 dark:bg-rose-500/20 border-rose-500/40 text-rose-800 dark:text-rose-200 font-bold ring-1 ring-rose-500/30';
                badgeDot = <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shadow-sm" />;
              } else if (status === 'HALF_DAY' || status === 'LEAVE') {
                cellStyle = 'bg-amber-500/20 dark:bg-amber-500/20 border-amber-500/40 text-amber-800 dark:text-amber-200 font-bold ring-1 ring-amber-500/30';
                badgeDot = <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shadow-sm" />;
              }

              return (
                <button
                  key={dateStr}
                  onClick={() => handleDayClick(dateStr, dayNum, isSunday)}
                  disabled={isSaving}
                  title={`${dayNum} ${MONTH_NAMES[month - 1]}: ${status || 'Unmarked'}`}
                  className={`h-10 sm:h-12 rounded-xl border transition-all flex flex-col items-center justify-center relative select-none group cursor-pointer active:scale-95 ${cellStyle} ${
                    isToday ? 'ring-2 ring-purple-600 dark:ring-purple-400 font-bold' : ''
                  }`}
                >
                  <span className={`text-xs font-semibold ${
                    isSunday && !status ? 'text-rose-500/70 font-medium' : ''
                  }`}>
                    {dayNum}
                  </span>

                  {/* Indicator Dot or Loader */}
                  <div className="mt-0.5 h-2 flex items-center justify-center">
                    {isSaving ? (
                      <div className="w-2.5 h-2.5 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
                    ) : badgeDot ? (
                      badgeDot
                    ) : isToday ? (
                      <span className="w-1 h-1 rounded-full bg-purple-500" />
                    ) : null}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
