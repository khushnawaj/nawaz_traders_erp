'use client';

import { useState } from 'react';
import { X, Camera, Upload, Trash2, Check, User, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

const PRESET_AVATARS = [
  { id: 'p0', label: 'NT Stamp', url: '/images/nawaz-traders-circular.png' },
  { id: 'p1', label: 'Farmer', url: 'https://images.unsplash.com/photo-1595273670150-bd0c3c392e46?w=200&auto=format&fit=crop&q=80' },
  { id: 'p2', label: 'Mill Owner', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80' },
  { id: 'p3', label: 'Mandi Trader', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80' },
  { id: 'p4', label: 'Driver', url: 'https://images.unsplash.com/photo-1628157582853-a796fa650a6a?w=200&auto=format&fit=crop&q=80' },
  { id: 'p5', label: 'Accountant', url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80' },
];

export default function ProfileAvatarModal({
  isOpen,
  onClose,
  currentAvatar = '',
  entityName = '',
  apiEndpoint = '',
  onSuccess,
}) {
  const [selectedAvatar, setSelectedAvatar] = useState(currentAvatar || '');
  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB!');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setSelectedAvatar(reader.result);
      toast.success('Photo loaded! Click Save to apply.');
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(apiEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ avatarUrl: selectedAvatar }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to update photo');

      toast.success('Profile picture updated successfully!');
      if (onSuccess) onSuccess(json.data);
      onClose();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to remove this profile picture?')) return;

    setSaving(true);
    try {
      const res = await fetch(apiEndpoint, { method: 'DELETE' });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to remove photo');

      setSelectedAvatar('');
      toast.success('Profile picture removed!');
      if (onSuccess) onSuccess(json.data);
      onClose();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4">
      <div className="glass-modal rounded-3xl max-w-md w-full shadow-2xl overflow-hidden border border-slate-200/80 dark:border-slate-800 animate-in fade-in zoom-in duration-200 text-slate-900 dark:text-white p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-xl border border-amber-500/20">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                Profile Photo ({entityName || 'Profile'})
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Upload or choose a photo</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Avatar Display */}
        <div className="flex flex-col items-center justify-center space-y-3">
          <div className="relative group">
            <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-emerald-500/30 shadow-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
              {selectedAvatar ? (
                <img src={selectedAvatar} alt={entityName} className="w-full h-full object-cover" />
              ) : (
                <User className="w-12 h-12 text-slate-400" />
              )}
            </div>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400">
            {selectedAvatar ? 'Photo selected' : 'No photo uploaded'}
          </p>
        </div>

        {/* File Upload Button */}
        <div>
          <label className="app-label">
            Upload From Device
          </label>
          <label className="w-full border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-emerald-500 dark:hover:border-emerald-500 bg-slate-50 dark:bg-slate-950/60 p-3.5 rounded-2xl flex items-center justify-center gap-2 cursor-pointer transition text-xs font-extrabold text-slate-700 dark:text-slate-300 hover:shadow-md">
            <Upload className="w-4 h-4 text-emerald-500" />
            <span>Click to Browse Image File</span>
            <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
          </label>
        </div>

        {/* Quick Avatar Presets */}
        <div className="space-y-2">
          <label className="app-label">
            Or Pick Preset Avatar
          </label>
          <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1">
            {PRESET_AVATARS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => setSelectedAvatar(preset.url)}
                className={`relative flex-shrink-0 w-12 h-12 rounded-full overflow-hidden border-2 transition ${
                  selectedAvatar === preset.url
                    ? 'border-emerald-500 scale-110 shadow-lg shadow-emerald-500/30'
                    : 'border-slate-300 dark:border-slate-700 opacity-70 hover:opacity-100'
                }`}
                title={preset.label}
              >
                <img src={preset.url} alt={preset.label} className="w-full h-full object-cover" />
                {selectedAvatar === preset.url && (
                  <div className="absolute inset-0 bg-emerald-600/40 flex items-center justify-center">
                    <Check className="w-5 h-5 text-white stroke-[3]" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
          {currentAvatar ? (
            <button
              type="button"
              onClick={handleDelete}
              disabled={saving}
              className="px-3.5 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/20 text-xs font-extrabold flex items-center gap-1.5 transition"
            >
              <Trash2 className="w-4 h-4" /> Remove
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving || !selectedAvatar}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-extrabold text-xs shadow-lg shadow-emerald-950/20 transition flex items-center gap-1.5 disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Profile Photo'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
