'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { 
  Settings, 
  Sun, 
  Moon, 
  User, 
  ShieldCheck, 
  Lock, 
  Key, 
  Phone, 
  Mail, 
  CheckCircle, 
  RefreshCw,
  Server,
  Users,
  Camera,
  Upload,
  Trash2,
  Check
} from 'lucide-react';
import { useTheme } from 'next-themes';
import toast from 'react-hot-toast';
import UserManagementSection from '@/components/settings/UserManagementSection';

export default function SettingsPage() {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get('tab') || 'theme';

  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [activeTab, setActiveTab] = useState(initialTab);

  // Profile Form
  const [profileForm, setProfileForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    avatarUrl: '',
    password: '',
    confirmPassword: '',
  });

  const handleDeviceFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB!');
      return;
    }

    setUploadingPhoto(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Upload failed');
      }

      setProfileForm((prev) => ({ ...prev, avatarUrl: data.url }));
      toast.success('🎉 Profile photo uploaded from device!');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setUploadingPhoto(false);
    }
  };

  useEffect(() => {
    setMounted(true);
    fetchUserProfile();
  }, []);

  useEffect(() => {
    if (!loading && user && !['OWNER', 'CO_OWNER', 'ADMIN'].includes(user.role) && activeTab === 'roles') {
      setActiveTab('profile');
    }
  }, [user, loading, activeTab]);

  const fetchUserProfile = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/me');
      const data = await res.json();
      if (data.success && data.user) {
        setUser(data.user);
        setProfileForm({
          fullName: data.user.fullName || '',
          email: data.user.email || '',
          phone: data.user.phone || '',
          avatarUrl: data.user.avatarUrl || '',
          password: '',
          confirmPassword: '',
        });
      }
    } catch (err) {
      toast.error('Failed to load profile settings');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (profileForm.password && profileForm.password.length < 4) {
      toast.error('Password must be at least 4 characters');
      return;
    }

    if (profileForm.password && profileForm.password !== profileForm.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`/api/users/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: profileForm.fullName,
          email: profileForm.email,
          phone: profileForm.phone,
          avatarUrl: profileForm.avatarUrl,
          ...(profileForm.password ? { password: profileForm.password } : {}),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to update settings');
      }

      toast.success('🎉 Profile & password updated successfully!');
      setProfileForm((prev) => ({ ...prev, password: '', confirmPassword: '' }));
      fetchUserProfile();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const currentTheme = resolvedTheme || theme;

  const isOwnerOrAdmin = user && ['OWNER', 'CO_OWNER', 'ADMIN'].includes(user.role);

  return (
    <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="bahi-card p-6 border border-slate-200/60 dark:border-slate-800/60 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 mb-2 font-outfit">
            <Settings className="w-3.5 h-3.5" /> ERP Preferences & Settings
          </div>
          <h1 className="font-extrabold text-2xl sm:text-3xl text-slate-900 dark:text-white font-outfit tracking-tight">
            System Settings & Controls
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-normal mt-1">
            Configure display themes, manage user access roles, and update profile credentials
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200/60 dark:border-slate-800/60 flex gap-2 overflow-x-auto pb-0.5">
        {[
          { id: 'theme', label: 'Theme & Appearance', icon: Sun },
          { id: 'profile', label: 'My Account Profile', icon: User },
          ...(isOwnerOrAdmin ? [{ id: 'roles', label: 'User Roles & Permissions', icon: ShieldCheck }] : []),
          { id: 'system', label: 'System Info & Security', icon: Server },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition whitespace-nowrap ${
                isActive
                  ? 'bg-gradient-to-r from-emerald-600 to-emerald-500 text-white shadow-md'
                  : 'bg-slate-100/80 dark:bg-slate-900/80 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB 1: THEME SETTINGS */}
      {activeTab === 'theme' && (
        <div className="glass-card p-6 rounded-3xl border border-slate-200/60 dark:border-slate-800/60 shadow-xl space-y-6">
          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white font-outfit">Display Theme Preferences</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Select your preferred color theme for Nawaz Traders ERP interface.
            </p>
          </div>

          {mounted && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl">
              {/* Dark Theme Card */}
              <div
                onClick={() => setTheme('dark')}
                className={`cursor-pointer p-5 rounded-3xl border-2 transition-all duration-200 space-y-3 ${
                  currentTheme === 'dark'
                    ? 'bg-slate-900 text-white border-emerald-500 shadow-xl ring-2 ring-emerald-500/20'
                    : 'bg-slate-900/40 text-slate-400 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-slate-800 text-amber-400">
                      <Moon className="w-5 h-5" />
                    </div>
                    <span className="font-bold text-sm font-outfit">Dark Mode (Recommended)</span>
                  </div>
                  {currentTheme === 'dark' && <CheckCircle className="w-5 h-5 text-emerald-500" />}
                </div>
                <p className="text-xs text-slate-400 font-normal">
                  Sleek dark glassmorphism layout tailored for long mandi operating hours and high contrast financial data.
                </p>
              </div>

              {/* Light Theme Card */}
              <div
                onClick={() => setTheme('light')}
                className={`cursor-pointer p-5 rounded-3xl border-2 transition-all duration-200 space-y-3 ${
                  currentTheme === 'light'
                    ? 'bg-white text-slate-900 border-emerald-500 shadow-xl ring-2 ring-emerald-500/20'
                    : 'bg-white/60 text-slate-600 border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
                      <Sun className="w-5 h-5" />
                    </div>
                    <span className="font-bold text-sm font-outfit">Light Mode</span>
                  </div>
                  {currentTheme === 'light' && <CheckCircle className="w-5 h-5 text-emerald-600" />}
                </div>
                <p className="text-xs text-slate-500 font-normal">
                  Clean bright daylight aesthetic with high legibility paper white backgrounds.
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: ACCOUNT PROFILE */}
      {activeTab === 'profile' && (
        <div className="glass-card p-6 rounded-3xl border border-slate-200/60 dark:border-slate-800/60 shadow-xl space-y-6">
          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white font-outfit">Account Credentials & Profile</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Set profile picture, update account details, or change your login password.
            </p>
          </div>

          {loading ? (
            <div className="p-8 text-center text-slate-500 text-xs flex items-center justify-center gap-2">
              <RefreshCw className="w-4 h-4 animate-spin text-emerald-500" /> Loading account details...
            </div>
          ) : (
            <form onSubmit={handleUpdateProfile} className="space-y-6 max-w-2xl">
              {/* Profile Picture / Avatar Section */}
              <div className="p-5 rounded-3xl bg-slate-50/80 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/60 space-y-4">
                <div className="flex flex-col sm:flex-row items-center gap-5">
                  <div className="relative shrink-0">
                    {profileForm.avatarUrl ? (
                      <img
                        src={profileForm.avatarUrl}
                        alt={profileForm.fullName}
                        className="w-20 h-20 rounded-full object-cover border-2 border-emerald-500 shadow-md"
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-emerald-600 via-emerald-500 to-amber-500 flex items-center justify-center text-white text-2xl font-black shadow-md font-outfit">
                        {profileForm.fullName ? profileForm.fullName.charAt(0).toUpperCase() : 'U'}
                      </div>
                    )}
                    {uploadingPhoto && (
                      <div className="absolute inset-0 rounded-full bg-slate-950/70 flex items-center justify-center text-emerald-400">
                        <RefreshCw className="w-6 h-6 animate-spin" />
                      </div>
                    )}
                  </div>

                  <div className="space-y-2 w-full">
                    <label className="app-label text-slate-900 dark:text-white font-bold flex items-center gap-1.5">
                      <Camera className="w-4 h-4 text-emerald-500" /> Profile Photo (Upload from Device)
                    </label>

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                      <label className="flex-1 border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-emerald-500 dark:hover:border-emerald-500 bg-white dark:bg-slate-950/80 p-3 rounded-2xl flex items-center justify-center gap-2 cursor-pointer transition text-xs font-bold text-slate-700 dark:text-slate-200 hover:shadow-sm">
                        <Upload className="w-4 h-4 text-emerald-500" />
                        <span>{uploadingPhoto ? 'Uploading from device...' : 'Choose Image File from Device'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          disabled={uploadingPhoto}
                          onChange={handleDeviceFileUpload}
                          className="hidden"
                        />
                      </label>

                      {profileForm.avatarUrl && (
                        <button
                          type="button"
                          onClick={() => setProfileForm({ ...profileForm, avatarUrl: '' })}
                          className="px-3.5 py-3 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/20 text-xs font-bold flex items-center justify-center gap-1.5 transition"
                          title="Remove Photo"
                        >
                          <Trash2 className="w-4 h-4" /> Remove
                        </button>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-normal">
                      Select any photo (PNG, JPG, WEBP) directly from your phone or computer. Max 5MB.
                    </p>
                  </div>
                </div>
              </div>

              {/* Personal Information */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="app-label">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={profileForm.fullName}
                    onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })}
                    className="app-input"
                  />
                </div>

                <div>
                  <label className="app-label">Username (Read Only)</label>
                  <input
                    type="text"
                    disabled
                    value={user?.username || ''}
                    className="app-input opacity-60 cursor-not-allowed font-mono text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="app-label">
                    <Mail className="w-3.5 h-3.5 text-slate-400" /> Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="e.g. user@nawaztraders.com"
                    value={profileForm.email}
                    onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                    className="app-input"
                  />
                </div>

                <div>
                  <label className="app-label">
                    <Phone className="w-3.5 h-3.5 text-slate-400" /> Mobile Phone Number
                  </label>
                  <input
                    type="tel"
                    placeholder="e.g. 9826012345"
                    value={profileForm.phone}
                    onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                    className="app-input"
                  />
                </div>
              </div>

              {/* Change Password Section */}
              <div className="pt-4 border-t border-slate-200/60 dark:border-slate-800/60 space-y-4">
                <div className="flex items-center gap-2">
                  <Key className="w-4 h-4 text-amber-500" />
                  <h4 className="font-bold text-xs uppercase tracking-wider text-amber-500 font-outfit">
                    Change Account Password
                  </h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="app-label">New Password</label>
                    <input
                      type="password"
                      placeholder="Leave blank to keep current password..."
                      value={profileForm.password}
                      onChange={(e) => setProfileForm({ ...profileForm, password: e.target.value })}
                      className="app-input"
                    />
                  </div>

                  <div>
                    <label className="app-label">Confirm New Password</label>
                    <input
                      type="password"
                      placeholder="Re-enter new password..."
                      value={profileForm.confirmPassword}
                      onChange={(e) => setProfileForm({ ...profileForm, confirmPassword: e.target.value })}
                      className="app-input"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="bahi-btn-primary py-2.5 px-6"
                >
                  {saving ? 'Updating Profile...' : 'Save Profile & Password Settings'}
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* TAB 3: USER ROLES MANAGEMENT */}
      {activeTab === 'roles' && isOwnerOrAdmin && (
        <UserManagementSection />
      )}

      {/* TAB 4: SYSTEM INFO */}
      {activeTab === 'system' && (
        <div className="glass-card p-6 rounded-3xl border border-slate-200/60 dark:border-slate-800/60 shadow-xl space-y-6">
          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white font-outfit">System Environment & Data Vault</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-normal">
              Nawaz Traders ERP runtime operational statistics and security details.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-outfit">
            <div className="p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-950/60 border border-slate-200/60 dark:border-slate-800/60 space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">System Version</span>
              <span className="font-bold text-slate-900 dark:text-white text-sm">v2.5.0 (Digital Bahi)</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-950/60 border border-slate-200/60 dark:border-slate-800/60 space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Database Encryption</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400 text-sm flex items-center gap-1">
                <ShieldCheck className="w-4 h-4" /> 256-Bit Encrypted
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-950/60 border border-slate-200/60 dark:border-slate-800/60 space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Active User Role</span>
              <span className="font-bold text-amber-500 text-sm uppercase">{user?.role || 'Guest'}</span>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
