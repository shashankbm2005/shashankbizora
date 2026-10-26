import React from 'react';
import { Phone, MessageSquare, MapPin, Clock, ShieldCheck, Mail } from 'lucide-react';
import { BIZORA_PHONE, getWhatsAppUrl } from '../data/servicesData.ts';

interface ContactPageProps {
  onOpenConsultation: () => void;
  onNavigateToPrivacy: () => void;
}

export const ContactPage: React.FC<ContactPageProps> = ({
  onOpenConsultation,
  onNavigateToPrivacy,
}) => {
  return (
    <div className="space-y-16 pb-20 pt-8">
      {/* Header */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <span className="text-xs font-bold uppercase tracking-wider text-blue-600 block mb-2">
          Get in Touch
        </span>
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight text-balance">
          Contact BIZORA
        </h1>
        <p className="text-base text-slate-600 mt-4 leading-relaxed max-w-2xl mx-auto">
          Whether you need a new business website, want to automate order enquiries via WhatsApp, or need a custom software portal, we are ready to discuss your requirements.
        </p>
      </section>

      {/* Main Grid: Direct Contact Cards & Enquiry Launcher */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Contact Details Column */}
          <div className="lg:col-span-5 space-y-6">
            {/* WhatsApp Card */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Direct WhatsApp</h3>
                  <p className="text-xs text-emerald-700 font-medium">Fastest Response Time</p>
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                Connect directly with our founder Shashank on WhatsApp for rapid questions, quick quotes, or scoping discussions.
              </p>

              <div className="pt-2">
                <a
                  href={getWhatsAppUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-xs transition-colors"
                >
                  <MessageSquare className="w-4 h-4" />
                  Chat on WhatsApp ({BIZORA_PHONE})
                </a>
              </div>
            </div>

            {/* Phone & Operational Details */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-5">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Phone Support</h4>
                  <p className="text-xs text-slate-600 mt-0.5">{BIZORA_PHONE}</p>
                  <p className="text-[11px] text-slate-400 mt-1">Available for scheduled discovery calls</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-600 shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Working Hours</h4>
                  <p className="text-xs text-slate-600 mt-0.5">Monday to Saturday: 9:30 AM - 7:30 PM IST</p>
                  <p className="text-[11px] text-slate-400 mt-1">Sunday: Urgent emergency client support only</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-600 shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Location & Service Area</h4>
                  <p className="text-xs text-slate-600 mt-0.5">Headquartered in Karnataka, India</p>
                  <p className="text-[11px] text-slate-400 mt-1">Serving clients remotely across all Indian states</p>
                </div>
              </div>
            </div>

            {/* Privacy Promise */}
            <div className="p-5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-1.5">
              <div className="flex items-center gap-1.5 font-bold text-slate-800">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Strict Customer Privacy</span>
              </div>
              <p className="leading-relaxed">
                We only use your submitted information to discuss your enquiry. We never sell phone numbers or spam you with unsolicited marketing calls.
              </p>
            </div>
          </div>

          {/* Consultation Launcher Column */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-8 sm:p-10 shadow-xs space-y-6">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
              Free Consultation Form
            </span>
            <h2 className="text-2xl font-bold text-slate-900">
              Tell Us About Your Project
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Submit your business details through our secure consultation portal. Your enquiry is immediately stored in our database, assigned a reference ID, and scheduled for review.
            </p>

            <div className="bg-slate-50 rounded-xl p-6 border border-slate-200 space-y-4">
              <div className="space-y-2 text-xs text-slate-700">
                <p className="font-semibold text-slate-900">What happens after you submit?</p>
                <ol className="list-decimal pl-4 space-y-1 text-slate-600">
                  <li>You receive an instant confirmation and Reference ID.</li>
                  <li>Our founder inspects your requirements.</li>
                  <li>We contact you via WhatsApp or phone with practical options and pricing.</li>
                </ol>
              </div>

              <div className="pt-2">
                <button
                  onClick={onOpenConsultation}
                  className="w-full py-3.5 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-md transition-all cursor-pointer"
                >
                  Open Free Consultation Form
                </button>
              </div>
            </div>

            <div className="text-xs text-slate-500 pt-2 border-t border-slate-100 flex items-center justify-between">
              <span>Need help right now?</span>
              <a
                href={getWhatsAppUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-700 font-semibold hover:underline inline-flex items-center gap-1"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                WhatsApp Founder
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
