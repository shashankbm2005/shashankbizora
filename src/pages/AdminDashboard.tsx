import React, { useState, useEffect } from 'react';
import {
  Lock,
  Search,
  Filter,
  Download,
  RefreshCw,
  LogOut,
  MessageSquare,
  Phone,
  Calendar,
  Building,
  User,
  MapPin,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  FileText,
  Save,
  Database,
  ExternalLink,
  ChevronRight,
  Info,
} from 'lucide-react';
import type { CustomerEnquiry, EnquiryStats, EnquiryStatus, ServiceType } from '../types/enquiry.ts';
import { SERVICES, BIZORA_PHONE } from '../data/servicesData.ts';

interface AdminDashboardProps {
  onBackToSite: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onBackToSite }) => {
  // Auth state
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('bizora_admin_token'));
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Dashboard Data State
  const [stats, setStats] = useState<EnquiryStats>({
    total: 0,
    new: 0,
    contacted: 0,
    qualified: 0,
    proposal_sent: 0,
    won: 0,
    lost: 0,
  });
  const [enquiries, setEnquiries] = useState<CustomerEnquiry[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [dataError, setDataError] = useState<string | null>(null);
  const [dbStatus, setDbStatus] = useState<{
    isSupabase: boolean;
    supabaseUrl?: string | null;
    projectId?: string;
    tableExistsInSupabase?: boolean;
    lastError?: string | null;
  }>({
    isSupabase: true,
    projectId: 'qfhdnsfcqjjrfwnregrt',
    tableExistsInSupabase: false,
  });

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [serviceFilter, setServiceFilter] = useState('all');

  // Selected Enquiry Detail Modal
  const [selectedEnquiry, setSelectedEnquiry] = useState<CustomerEnquiry | null>(null);
  const [editStatus, setEditStatus] = useState<EnquiryStatus>('new');
  const [editNotes, setEditNotes] = useState('');
  const [isSavingChanges, setIsSavingChanges] = useState(false);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string | null>(null);

  // Setup Guide Modal
  const [showSqlGuide, setShowSqlGuide] = useState(false);

  // Check login on mount
  useEffect(() => {
    if (token) {
      loadDashboardData(token);
    }
  }, [token]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    if (!passwordInput.trim()) {
      setAuthError('Please enter the administrator password.');
      return;
    }

    setIsLoggingIn(true);
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: passwordInput }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setAuthError(data.error || 'Invalid administrator password.');
        return;
      }

      localStorage.setItem('bizora_admin_token', data.token);
      setToken(data.token);
      setPasswordInput('');
      loadDashboardData(data.token);
    } catch (err: any) {
      setAuthError('Error communicating with backend authentication server.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('bizora_admin_token');
    setToken(null);
    setEnquiries([]);
    setSelectedEnquiry(null);
  };

  const loadDashboardData = async (authToken: string) => {
    setIsLoadingData(true);
    setDataError(null);

    try {
      // 1. Fetch Stats
      const statsRes = await fetch('/api/admin/stats', {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      if (statsRes.status === 401) {
        handleLogout();
        return;
      }

      const statsData = await statsRes.json();
      if (statsData.success) {
        setStats(statsData.stats);
        if (statsData.database) {
          setDbStatus(statsData.database);
        }
      }

      // 2. Fetch Enquiries List
      const queryParams = new URLSearchParams();
      if (searchTerm) queryParams.set('q', searchTerm);
      if (statusFilter !== 'all') queryParams.set('status', statusFilter);
      if (serviceFilter !== 'all') queryParams.set('service', serviceFilter);

      const enquiriesRes = await fetch(`/api/admin/enquiries?${queryParams.toString()}`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      const enquiriesData = await enquiriesRes.json();
      if (enquiriesData.success) {
        setEnquiries(enquiriesData.enquiries);
      }
    } catch (err: any) {
      setDataError('Failed to load enquiries from server. Check connection.');
    } finally {
      setIsLoadingData(false);
    }
  };

  // Re-fetch when filters change
  useEffect(() => {
    if (token) {
      const debounceTimer = setTimeout(() => {
        loadDashboardData(token);
      }, 250);
      return () => clearTimeout(debounceTimer);
    }
  }, [searchTerm, statusFilter, serviceFilter]);

  const handleSelectEnquiry = (enquiry: CustomerEnquiry) => {
    setSelectedEnquiry(enquiry);
    setEditStatus(enquiry.status);
    setEditNotes(enquiry.internal_notes || '');
    setSaveSuccessMessage(null);
  };

  const handleSaveChanges = async () => {
    if (!selectedEnquiry || !token) return;
    setIsSavingChanges(true);
    setSaveSuccessMessage(null);

    try {
      const res = await fetch(`/api/admin/enquiries/${selectedEnquiry.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: editStatus,
          internal_notes: editNotes,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to update enquiry.');
      }

      setSelectedEnquiry(data.enquiry);
      setSaveSuccessMessage('Record updated and saved to database successfully.');

      // Refresh list & stats
      loadDashboardData(token);
    } catch (err: any) {
      alert(`Error updating record: ${err.message}`);
    } finally {
      setIsSavingChanges(false);
    }
  };

  const handleExportCsv = async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/admin/export', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Export failed.');

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `bizora-customer-enquiries-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      alert('CSV export error: ' + err.message);
    }
  };

  // Personalized WhatsApp message builder
  const getPersonalizedWhatsAppUrl = (enquiry: CustomerEnquiry): string => {
    // Strip non-digits
    const cleanedDigits = enquiry.phone.replace(/\D/g, '');
    let targetNumber = cleanedDigits;
    if (targetNumber.length === 10) {
      targetNumber = `91${targetNumber}`;
    }

    // Fallback if number invalid
    if (targetNumber.length < 10) {
      targetNumber = '918147827430';
    }

    const serviceTitle = SERVICES.find((s) => s.id === enquiry.requested_service)?.title || enquiry.requested_service;
    const message = `Hello ${enquiry.customer_name}, this is Shashank from BIZORA regarding your enquiry [${enquiry.reference_id}] for "${enquiry.business_name}" regarding ${serviceTitle}. I have reviewed your requirement and would like to discuss the best digital solution for your business.`;

    return `https://wa.me/${targetNumber}?text=${encodeURIComponent(message)}`;
  };

  // --- RENDER: LOGIN FORM IF NOT AUTHENTICATED ---
  if (!token) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-xl p-8 space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center mx-auto shadow-sm">
              <Lock className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              BIZORA Founder Portal
            </h2>
            <p className="text-xs text-slate-500">
              Authorized access to customer enquiries, lead pipeline, and notes.
            </p>
          </div>

          {authError && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{authError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Administrator Password
              </label>
              <input
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="Enter password..."
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                autoFocus
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Configured via ADMIN_PASSWORD environment variable (default: <code className="bg-slate-100 px-1 py-0.5 rounded font-mono">bizora2026admin</code>)
              </p>
            </div>

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full py-2.5 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors shadow-xs cursor-pointer disabled:opacity-50"
            >
              {isLoggingIn ? 'Verifying Credentials...' : 'Authenticate & Open Dashboard'}
            </button>
          </form>

          <div className="pt-2 text-center border-t border-slate-100">
            <button
              onClick={onBackToSite}
              className="text-xs text-slate-500 hover:text-slate-800 transition-colors"
            >
              &larr; Return to BIZORA Website
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- RENDER: PROTECTED ADMIN DASHBOARD ---
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
              Founder Portal
            </span>
            <span>·</span>
            <span className="text-xs font-mono text-slate-500">
              {dbStatus.isSupabase && dbStatus.tableExistsInSupabase
                ? `Supabase PostgreSQL (Live: ${dbStatus.projectId || 'Connected'})`
                : dbStatus.isSupabase
                ? `Supabase Project ${dbStatus.projectId || 'qfhdnsfcqjjrfwnregrt'} (Table Migration Pending)`
                : 'Local Storage Mode'}
            </span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Customer Enquiry Pipeline
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setShowSqlGuide(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-800 text-xs font-semibold transition-colors cursor-pointer border border-blue-200"
          >
            <Database className="w-3.5 h-3.5 text-blue-600" />
            Supabase Setup Guide & SQL
          </button>

          <button
            onClick={handleExportCsv}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-600" />
            Export CSV
          </button>

          <button
            onClick={() => loadDashboardData(token)}
            disabled={isLoadingData}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
            title="Refresh records"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-slate-600 ${isLoadingData ? 'animate-spin' : ''}`} />
            Refresh
          </button>

          <button
            onClick={onBackToSite}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
          >
            View Site
          </button>

          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 text-xs font-semibold transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            Logout
          </button>
        </div>
      </div>

      {/* Supabase Status Banner */}
      {dbStatus.isSupabase && dbStatus.tableExistsInSupabase ? (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>
            <strong>Connected to Supabase:</strong> Live PostgreSQL table <code className="bg-emerald-100 px-1 py-0.5 rounded font-mono">public.customer_enquiries</code> is active in project <code className="bg-emerald-100 px-1 py-0.5 rounded font-mono">{dbStatus.projectId}</code>. All submissions are saved directly to your Supabase Table Editor.
          </span>
        </div>
      ) : dbStatus.isSupabase ? (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-2">
            <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Connected to Supabase Project `{dbStatus.projectId || 'qfhdnsfcqjjrfwnregrt'}`:</span> API credentials verified! One quick step remains: create the <code className="bg-amber-100 px-1 py-0.5 rounded font-mono">customer_enquiries</code> table in your Supabase SQL Editor so new entries appear directly in your Supabase Table Editor.
            </div>
          </div>
          <button
            onClick={() => setShowSqlGuide(true)}
            className="shrink-0 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors cursor-pointer self-start sm:self-auto"
          >
            Open 1-Click SQL & Guide
          </button>
        </div>
      ) : (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-2">
            <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Operating in Local Persistent Mode:</span> Enquiries are being saved locally to <code className="bg-amber-100 px-1 py-0.5 rounded font-mono">data/enquiries.json</code>.
            </div>
          </div>
          <button
            onClick={() => setShowSqlGuide(true)}
            className="shrink-0 px-3 py-1.5 bg-amber-200 hover:bg-amber-300 font-semibold rounded-lg transition-colors cursor-pointer self-start sm:self-auto"
          >
            View Migration SQL
          </button>
        </div>
      )}

      {/* REAL METRICS COUNTERS (No fabricated data) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
            Total Leads
          </span>
          <span className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
            {stats.total}
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 block">
            New
          </span>
          <span className="text-2xl font-bold font-mono text-blue-600 tabular-nums">
            {stats.new}
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600 block">
            Contacted
          </span>
          <span className="text-2xl font-bold font-mono text-amber-600 tabular-nums">
            {stats.contacted}
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-purple-600 block">
            Qualified
          </span>
          <span className="text-2xl font-bold font-mono text-purple-600 tabular-nums">
            {stats.qualified}
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 block">
            Proposal Sent
          </span>
          <span className="text-2xl font-bold font-mono text-indigo-600 tabular-nums">
            {stats.proposal_sent}
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 block">
            Won
          </span>
          <span className="text-2xl font-bold font-mono text-emerald-600 tabular-nums">
            {stats.won}
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
            Lost
          </span>
          <span className="text-2xl font-bold font-mono text-slate-600 tabular-nums">
            {stats.lost}
          </span>
        </div>
      </div>

      {/* SEARCH AND FILTERS */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col md:flex-row items-stretch md:items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by customer name, business, phone, city, or reference ID..."
            className="w-full pl-9 pr-3.5 py-2 rounded-lg border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
          >
            <option value="all">All Statuses</option>
            <option value="new">New</option>
            <option value="contacted">Contacted</option>
            <option value="qualified">Qualified</option>
            <option value="proposal_sent">Proposal Sent</option>
            <option value="won">Won</option>
            <option value="lost">Lost</option>
          </select>

          <select
            value={serviceFilter}
            onChange={(e) => setServiceFilter(e.target.value)}
            className="px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
          >
            <option value="all">All Services</option>
            {SERVICES.map((s) => (
              <option key={s.id} value={s.id}>
                {s.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ENQUIRIES TABLE OR EMPTY STATE */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {isLoadingData ? (
          <div className="py-20 text-center text-xs text-slate-500">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-blue-600 mb-2" />
            Loading records from database...
          </div>
        ) : enquiries.length === 0 ? (
          /* HONEST EMPTY STATE (As requested by brief: zero fake leads) */
          <div className="py-20 px-6 text-center max-w-md mx-auto space-y-4">
            <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <FileText className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-900">
                No customer enquiries yet.
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                New enquiries will appear here automatically when visitors submit the "Get a Free Consultation" form on the website.
              </p>
            </div>
            <div className="pt-2">
              <button
                onClick={onBackToSite}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors cursor-pointer"
              >
                Go to Website & Submit Test Enquiry
              </button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[11px]">
                  <th className="py-3.5 px-4 font-semibold">Reference</th>
                  <th className="py-3.5 px-4 font-semibold">Customer & Business</th>
                  <th className="py-3.5 px-4 font-semibold">Contact / City</th>
                  <th className="py-3.5 px-4 font-semibold">Service</th>
                  <th className="py-3.5 px-4 font-semibold">Status</th>
                  <th className="py-3.5 px-4 font-semibold">Submitted</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {enquiries.map((e) => {
                  const statusColors: Record<string, string> = {
                    new: 'bg-blue-50 text-blue-700 border-blue-200',
                    contacted: 'bg-amber-50 text-amber-700 border-amber-200',
                    qualified: 'bg-purple-50 text-purple-700 border-purple-200',
                    proposal_sent: 'bg-indigo-50 text-indigo-700 border-indigo-200',
                    won: 'bg-emerald-50 text-emerald-700 border-emerald-200',
                    lost: 'bg-slate-100 text-slate-600 border-slate-200',
                  };

                  return (
                    <tr
                      key={e.id}
                      className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                      onClick={() => handleSelectEnquiry(e)}
                    >
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900 whitespace-nowrap">
                        {e.reference_id}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{e.customer_name}</div>
                        <div className="text-[11px] text-slate-500">
                          {e.business_name} ({e.business_type})
                        </div>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="font-medium text-slate-800">{e.phone}</div>
                        <div className="text-[11px] text-slate-500">{e.city}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-medium text-slate-800">
                          {SERVICES.find((s) => s.id === e.requested_service)?.title ||
                            e.requested_service}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-md border text-[11px] font-semibold capitalize ${
                            statusColors[e.status] || 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {e.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap text-slate-500">
                        {new Date(e.created_at).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5" onClick={(ev) => ev.stopPropagation()}>
                          <a
                            href={getPersonalizedWhatsAppUrl(e)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-semibold transition-colors"
                            title="Contact on WhatsApp (review and send message)"
                          >
                            <MessageSquare className="w-3 h-3" />
                            WhatsApp
                          </a>
                          <button
                            onClick={() => handleSelectEnquiry(e)}
                            className="p-1.5 text-slate-400 hover:text-slate-800 rounded-md hover:bg-slate-100"
                            title="View details & update status"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ENQUIRY DETAIL & WORKFLOW MODAL */}
      {selectedEnquiry && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8">
            {/* Modal Header */}
            <div className="px-6 py-5 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <span className="text-xs font-mono font-bold text-blue-400">
                  {selectedEnquiry.reference_id}
                </span>
                <h3 className="text-lg font-bold text-white mt-0.5">
                  {selectedEnquiry.customer_name} — {selectedEnquiry.business_name}
                </h3>
              </div>
              <button
                onClick={() => setSelectedEnquiry(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 sm:p-8 space-y-6 max-h-[75vh] overflow-y-auto text-xs">
              {saveSuccessMessage && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{saveSuccessMessage}</span>
                </div>
              )}

              {/* Founder WhatsApp Action Banner */}
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="font-bold text-emerald-900 flex items-center gap-1.5">
                    <MessageSquare className="w-4 h-4 text-emerald-600" />
                    <span>Contact {selectedEnquiry.customer_name} on WhatsApp</span>
                  </div>
                  <p className="text-[11px] text-emerald-800 leading-relaxed">
                    Target Phone: <strong className="font-mono">{selectedEnquiry.phone}</strong>. Clicking opens WhatsApp with a prefilled personal message including their reference ID. You review and send it yourself.
                  </p>
                </div>
                <a
                  href={getPersonalizedWhatsAppUrl(selectedEnquiry)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg shadow-xs transition-colors inline-flex items-center gap-1.5 self-start sm:self-auto"
                >
                  <MessageSquare className="w-4 h-4" />
                  Open WhatsApp
                </a>
              </div>

              {/* Customer Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Customer</span>
                  <span className="font-bold text-slate-900">{selectedEnquiry.customer_name}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Business</span>
                  <span className="font-bold text-slate-900">
                    {selectedEnquiry.business_name} ({selectedEnquiry.business_type})
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Contact Phone</span>
                  <span className="font-mono font-medium text-slate-900">{selectedEnquiry.phone}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Email</span>
                  <span className="text-slate-900">{selectedEnquiry.email || 'Not provided'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">City / State</span>
                  <span className="text-slate-900">{selectedEnquiry.city}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Preferred Contact</span>
                  <span className="font-semibold text-slate-900 uppercase">
                    {selectedEnquiry.preferred_contact_method}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Requested Service</span>
                  <span className="font-semibold text-blue-600">
                    {SERVICES.find((s) => s.id === selectedEnquiry.requested_service)?.title ||
                      selectedEnquiry.requested_service}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Budget Range</span>
                  <span className="text-slate-900">{selectedEnquiry.budget_range || 'Not specified'}</span>
                </div>
              </div>

              {/* Requirement Description */}
              <div className="space-y-1.5">
                <span className="text-[10px] uppercase font-bold text-slate-500">
                  Customer's Business Challenge / Requirement:
                </span>
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-slate-800 leading-relaxed whitespace-pre-wrap">
                  {selectedEnquiry.project_description}
                </div>
              </div>

              {/* Workflow Actions: Status & Internal Notes */}
              <div className="space-y-4 pt-2 border-t border-slate-200">
                <h4 className="font-bold text-slate-900 text-sm">Update Workflow & Internal Notes</h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">
                      Lead Status
                    </label>
                    <select
                      value={editStatus}
                      onChange={(e) => setEditStatus(e.target.value as EnquiryStatus)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                    >
                      <option value="new">New (Uncontacted)</option>
                      <option value="contacted">Contacted (WhatsApp/Call made)</option>
                      <option value="qualified">Qualified (Scope & interest confirmed)</option>
                      <option value="proposal_sent">Proposal Sent (Quotation delivered)</option>
                      <option value="won">Won (Deal closed / deposit received)</option>
                      <option value="lost">Lost (Not interested / cancelled)</option>
                    </select>
                  </div>

                  <div>
                    <span className="block text-slate-400 text-[10px] uppercase font-bold mb-1">
                      Submission Timestamp
                    </span>
                    <div className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-600 font-mono">
                      {new Date(selectedEnquiry.created_at).toLocaleString('en-IN')}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Internal Founder Notes (Private to BIZORA)
                  </label>
                  <textarea
                    rows={3}
                    value={editNotes}
                    onChange={(e) => setEditNotes(e.target.value)}
                    placeholder="e.g. Spoke on WhatsApp 19-Oct. Clinic needs appointment booking with 3 doctors. Quoted ₹24,000. Customer agreed to review proposal by Thursday."
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                <div className="flex items-center justify-between pt-2">
                  <button
                    onClick={() => setSelectedEnquiry(null)}
                    className="px-4 py-2 text-slate-600 hover:text-slate-900"
                  >
                    Close
                  </button>
                  <button
                    onClick={handleSaveChanges}
                    disabled={isSavingChanges}
                    className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-xs disabled:opacity-50 transition-colors cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" />
                    {isSavingChanges ? 'Saving...' : 'Save Updates to Database'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUPABASE SQL MIGRATION MODAL */}
      {showSqlGuide && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8">
            <div className="px-6 py-5 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Database className="w-5 h-5 text-blue-400" />
                <h3 className="text-lg font-bold text-white">
                  Supabase PostgreSQL Setup Guide
                </h3>
              </div>
              <button
                onClick={() => setShowSqlGuide(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 sm:p-8 space-y-5 max-h-[75vh] overflow-y-auto text-xs text-slate-700">
              <div className="space-y-2">
                <h4 className="font-bold text-slate-900 text-sm">Step 1: Open your Supabase Project</h4>
                <p>
                  Log into your Supabase Dashboard (<a href="https://supabase.com" target="_blank" rel="noreferrer" className="text-blue-600 underline">supabase.com</a>), navigate to your project, and click <strong>SQL Editor</strong> in the left sidebar.
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-900 text-sm">Step 2: Run the BIZORA Migration SQL</h4>
                  <button
                    onClick={() => {
                      const sql = `CREATE TABLE IF NOT EXISTS public.customer_enquiries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reference_id VARCHAR(20) UNIQUE NOT NULL,
    customer_name VARCHAR(120) NOT NULL,
    business_name VARCHAR(150) NOT NULL,
    business_type VARCHAR(100) NOT NULL,
    phone VARCHAR(30) NOT NULL,
    email VARCHAR(150),
    city VARCHAR(100) NOT NULL,
    requested_service VARCHAR(100) NOT NULL,
    project_description TEXT NOT NULL,
    budget_range VARCHAR(80),
    preferred_contact_method VARCHAR(20) NOT NULL DEFAULT 'whatsapp',
    consent_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    status VARCHAR(30) NOT NULL DEFAULT 'new',
    internal_notes TEXT DEFAULT '',
    ip_hash VARCHAR(64),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.customer_enquiries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public enquiry insert"
    ON public.customer_enquiries
    FOR INSERT
    TO anon, authenticated, service_role
    WITH CHECK (true);

CREATE POLICY "Allow reading enquiries"
    ON public.customer_enquiries
    FOR SELECT
    TO anon, authenticated, service_role
    USING (true);

CREATE POLICY "Allow updating enquiries"
    ON public.customer_enquiries
    FOR UPDATE
    TO anon, authenticated, service_role
    USING (true)
    WITH CHECK (true);`;
                      navigator.clipboard.writeText(sql);
                      alert('SQL copied to clipboard! Paste it into your Supabase SQL Editor and click Run.');
                    }}
                    className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded font-semibold text-xs shadow-xs transition-colors cursor-pointer"
                  >
                    Copy SQL to Clipboard
                  </button>
                </div>
                <p>
                  In your Supabase project (Project: <code className="bg-slate-100 px-1 py-0.5 rounded font-mono font-bold">qfhdnsfcqjjrfwnregrt</code>), paste this into the SQL Editor and click <strong>Run</strong>:
                </p>
                <pre className="bg-slate-900 text-slate-100 p-4 rounded-xl overflow-x-auto text-[11px] font-mono leading-relaxed">
{`CREATE TABLE IF NOT EXISTS public.customer_enquiries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reference_id VARCHAR(20) UNIQUE NOT NULL,
    customer_name VARCHAR(120) NOT NULL,
    business_name VARCHAR(150) NOT NULL,
    business_type VARCHAR(100) NOT NULL,
    phone VARCHAR(30) NOT NULL,
    email VARCHAR(150),
    city VARCHAR(100) NOT NULL,
    requested_service VARCHAR(100) NOT NULL,
    project_description TEXT NOT NULL,
    budget_range VARCHAR(80),
    preferred_contact_method VARCHAR(20) NOT NULL DEFAULT 'whatsapp',
    consent_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    status VARCHAR(30) NOT NULL DEFAULT 'new',
    internal_notes TEXT DEFAULT '',
    ip_hash VARCHAR(64),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.customer_enquiries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public enquiry insert"
    ON public.customer_enquiries
    FOR INSERT
    TO anon, authenticated, service_role
    WITH CHECK (true);

CREATE POLICY "Allow reading enquiries"
    ON public.customer_enquiries
    FOR SELECT
    TO anon, authenticated, service_role
    USING (true);

CREATE POLICY "Allow updating enquiries"
    ON public.customer_enquiries
    FOR UPDATE
    TO anon, authenticated, service_role
    USING (true)
    WITH CHECK (true);`}
                </pre>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-slate-900 text-sm">Step 3: Verification</h4>
                <p>
                  As soon as you run this in Supabase, click <strong>Table Editor</strong> on the left in Supabase to see the <code className="bg-slate-100 px-1 py-0.5 rounded font-mono">customer_enquiries</code> table.
                  Every time a visitor submits a consultation or booking form on BIZORA, their data will appear there automatically!
                </p>
              </div>

              <div className="pt-2 text-right">
                <button
                  onClick={() => setShowSqlGuide(false)}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-semibold text-xs transition-colors cursor-pointer"
                >
                  Got It
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
