import React, { useState } from 'react';
import { Phone, MessageSquare, Clock, ShieldCheck, CheckCircle2, ArrowRight, Loader2 } from 'lucide-react';
import { BIZORA_PHONE, getWhatsAppUrl } from '../data/servicesData.ts';

interface DirectCallerSectionProps {
  onOpenConsultation: () => void;
}

export const DirectCallerSection: React.FC<DirectCallerSectionProps> = ({ onOpenConsultation }) => {
  const [quickPhone, setQuickPhone] = useState('');
  const [quickName, setQuickName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [callRequested, setCallRequested] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleQuickCallback = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const digitsOnly = quickPhone.replace(/\D/g, '');
    if (!quickName.trim() || quickName.trim().length < 2) {
      setErrorMessage('Please enter your name.');
      return;
    }
    if (!digitsOnly || digitsOnly.length < 10) {
      setErrorMessage('Please enter a valid 10-digit mobile number.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/enquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_name: quickName.trim(),
          business_name: `${quickName.trim()}'s Business (Quick Callback)`,
          business_type: 'General Enquiry',
          phone: quickPhone.trim(),
          city: 'India',
          requested_service: 'website_dev',
          project_description: 'Customer requested an urgent direct phone callback via the caller section.',
          preferred_contact_method: 'phone',
          consent: true,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to submit callback request.');
      }

      setCallRequested(true);
    } catch (err: any) {
      setErrorMessage(err.message || 'Unable to request callback. Please call directly using the button above.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="bg-slate-900 text-white py-16 relative overflow-hidden border-y border-slate-800">
      {/* Background ambient lighting */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left Column: Direct Call Pitch & Buttons */}
          <div className="lg:col-span-7 space-y-6">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Direct Founder Hotline</span>
              <span aria-hidden="true">·</span>
              <span>Available 9:30 AM – 7:30 PM IST</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight text-balance">
              Speak Directly with BIZORA Founder Shashank
            </h2>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-xl">
              Don’t want to fill out forms right now? Call or WhatsApp our founder directly. We discuss your business requirements, advise on the right digital architecture, and answer your questions with zero sales pressure.
            </p>

            {/* Direct Call & WhatsApp Action Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <a
                href="tel:+918147827430"
                className="inline-flex items-center justify-center gap-2.5 px-6 py-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold text-sm sm:text-base shadow-lg shadow-emerald-900/40 transition-all cursor-pointer"
              >
                <Phone className="w-5 h-5" />
                Call Now: {BIZORA_PHONE}
              </a>

              <a
                href={getWhatsAppUrl('Hello Shashank, I would like to discuss digital solutions for my business.')}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-sm sm:text-base border border-slate-700 transition-colors"
              >
                <MessageSquare className="w-5 h-5 text-emerald-400" />
                Chat on WhatsApp
              </a>
            </div>

            <div className="pt-2 flex flex-wrap items-center gap-6 text-xs text-slate-400">
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-blue-400" />
                <span>Quick 10-Min Discovery</span>
              </div>
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Zero Sales Spam Guarantee</span>
              </div>
            </div>
          </div>

          {/* Right Column: Instant Callback Box */}
          <div className="lg:col-span-5 bg-slate-800/90 rounded-2xl p-6 sm:p-8 border border-slate-700 shadow-xl backdrop-blur-md">
            {callRequested ? (
              <div className="text-center py-6 space-y-4">
                <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-white">Callback Request Confirmed!</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Thank you, <strong className="text-white">{quickName}</strong>. Our founder Shashank has received your phone number (<span className="font-mono">{quickPhone}</span>) and will call you shortly.
                </p>
                <div className="pt-2">
                  <a
                    href="tel:+918147827430"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400 hover:text-emerald-300"
                  >
                    Need to talk right now? Call +91 8147827430 &rarr;
                  </a>
                </div>
              </div>
            ) : (
              <form onSubmit={handleQuickCallback} className="space-y-4">
                <div>
                  <h3 className="text-lg font-bold text-white">Request an Instant Callback</h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Enter your name and mobile number. We will call you within 15 minutes.
                  </p>
                </div>

                {errorMessage && (
                  <div className="p-3 bg-red-950/60 border border-red-500/50 rounded-lg text-xs text-red-200">
                    {errorMessage}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Your Name
                  </label>
                  <input
                    type="text"
                    value={quickName}
                    onChange={(e) => setQuickName(e.target.value)}
                    placeholder="e.g. Anand Sharma"
                    className="w-full px-3.5 py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Mobile Number (WhatsApp/Call)
                  </label>
                  <input
                    type="tel"
                    value={quickPhone}
                    onChange={(e) => setQuickPhone(e.target.value)}
                    placeholder="e.g. 9876543210"
                    className="w-full px-3.5 py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    <>
                      Request Callback Now
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                <p className="text-[11px] text-slate-400 text-center">
                  Saved securely to our verified Supabase PostgreSQL database.
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
