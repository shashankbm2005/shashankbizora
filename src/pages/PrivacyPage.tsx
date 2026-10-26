import React from 'react';
import { ShieldCheck, Lock, FileText, ArrowLeft, MessageSquare } from 'lucide-react';
import { BIZORA_PHONE, getWhatsAppUrl } from '../data/servicesData.ts';

interface PrivacyPageProps {
  onBack: () => void;
}

export const PrivacyPage: React.FC<PrivacyPageProps> = ({ onBack }) => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      <button
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Website
      </button>

      <div className="space-y-3">
        <span className="text-xs font-bold uppercase tracking-wider text-blue-600 block">
          Legal & Data Governance
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Privacy Notice & Data Policy
        </h1>
        <p className="text-xs text-slate-500 font-mono">Last updated: October 2026</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-10 shadow-xs space-y-8 text-sm text-slate-700 leading-relaxed">
        {/* Section 1 */}
        <div className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900">1. Information We Collect</h2>
          <p>
            When you submit a consultation enquiry on the BIZORA website, we collect the following business information:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
            <li>Customer Full Name</li>
            <li>Business / Enterprise Name</li>
            <li>Industry or Business Type</li>
            <li>Contact Phone Number (Mobile)</li>
            <li>Email Address (if provided voluntarily)</li>
            <li>City and State of operation</li>
            <li>Requested Digital Service category</li>
            <li>Description of your business requirement or challenge</li>
            <li>Indicative budget range (if provided)</li>
            <li>Preferred communication channel (WhatsApp or Phone)</li>
            <li>Timestamp of consent</li>
          </ul>
        </div>

        {/* Section 2 */}
        <div className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900">2. Purpose of Processing</h2>
          <p>
            The collected information is used strictly for:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
            <li>Reviewing your business requirement and preparing suitable technical solutions.</li>
            <li>Contacting you via WhatsApp or phone to discuss project scope, pricing, and timelines.</li>
            <li>Maintaining an internal audit reference for follow-up communications.</li>
          </ul>
          <p className="font-semibold text-slate-800">
            We do NOT sell, rent, trade, or share your contact information with third-party advertisers or data brokers.
          </p>
        </div>

        {/* Section 3 */}
        <div className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900">3. Database Storage & Security Architecture</h2>
          <p>
            Customer enquiries are persisted in a secured Supabase PostgreSQL database. Our security configuration includes:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
            <li><strong>Row Level Security (RLS):</strong> Enabled on all customer tables. Public visitors cannot query, read, update, or delete other customer records.</li>
            <li><strong>Least-Privilege API:</strong> Sensitive database credentials (service role keys) are strictly contained on the server-side backend and never transmitted to client browsers.</li>
            <li><strong>Rate Limiting:</strong> Public submission endpoints are protected by rate-limiting rules to mitigate denial-of-service and automated spam submissions.</li>
          </ul>
        </div>

        {/* Section 4 */}
        <div className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900">4. Data Retention & Erasure</h2>
          <p>
            We retain customer enquiry records for as long as necessary to conduct business discussions or fulfill active project contracts. If you would like your enquiry or contact details removed from our database, contact us at any time via WhatsApp at <strong>{BIZORA_PHONE}</strong> with your reference number, and we will purge the record.
          </p>
        </div>

        {/* Section 5 */}
        <div className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900">5. Contact Regarding Privacy</h2>
          <p>
            For any questions regarding your business data, please contact:
          </p>
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs space-y-1 text-slate-700">
            <p><strong>BIZORA Lead Management</strong></p>
            <p>WhatsApp: {BIZORA_PHONE}</p>
            <p>Attention: Founder & Data Controller</p>
          </div>
        </div>
      </div>
    </div>
  );
};
