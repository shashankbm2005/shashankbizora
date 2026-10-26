import React from 'react';
import { Target, Shield, HeartHandshake, Code, MessageSquare, ArrowRight } from 'lucide-react';
import { BIZORA_PHONE, getWhatsAppUrl } from '../data/servicesData.ts';

interface AboutPageProps {
  onOpenConsultation: () => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ onOpenConsultation }) => {
  return (
    <div className="space-y-20 pb-20 pt-8">
      {/* Hero Section */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <span className="text-xs font-bold uppercase tracking-wider text-blue-600 block mb-2">
          About BIZORA
        </span>
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight text-balance">
          Making Every Business Digital.
        </h1>
        <p className="text-base text-slate-600 mt-4 leading-relaxed max-w-2xl mx-auto">
          BIZORA was founded with a single mission: to provide Indian small and medium-sized enterprises with high-quality, practical digital solutions that actually bring customers and streamline operations.
        </p>
      </section>

      {/* The Honest Story */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-12 shadow-xs space-y-6">
          <h2 className="text-2xl font-bold text-slate-900">Why BIZORA Exists</h2>
          <div className="text-sm text-slate-700 leading-relaxed space-y-4">
            <p>
              In India today, millions of hard-working local businesses—wholesalers, clinics, manufacturers, traders, retailers, and service consultants—excel at their trade, but remain largely invisible or inefficient online.
            </p>
            <p>
              When they look for digital help, they face two extremes:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-slate-600">
              <li>
                <strong className="text-slate-800">Generic DIY website builders</strong> that look cheap, load slowly on mobile, don’t rank on Google, and require dozens of hours of manual struggle.
              </li>
              <li>
                <strong className="text-slate-800">Large digital agencies</strong> that quote hundreds of thousands of rupees for buzzword-heavy decks, take months to deliver, and leave the client stranded without post-launch support.
              </li>
            </ul>
            <p>
              BIZORA bridges this gap. We are an agile, engineering-first technology practice that treats every business like an important partner. We build production-ready digital assets that small business owners can actually understand, operate, and rely on.
            </p>
          </div>
        </div>
      </section>

      {/* Our 4 Core Principles */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600 block mb-2">
            Our Commitments
          </span>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            How We Operate
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Target className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Practical Utility First</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              We never recommend shiny technology or expensive features unless they directly help your business earn revenue or save operational hours.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Direct Founder Communication</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              You talk directly with the engineer building your project. No junior account managers, broken phone trees, or dropped messages.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Code className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Zero Lock-In</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              You own all your code, design assets, database, and domain names. If you ever choose to migrate, your data is yours.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Shield className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Honesty Over Hype</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              We will never fabricate testimonials, invent fake award badges, or promise impossible overnight Google rankings.
            </p>
          </div>
        </div>
      </section>

      {/* Founder Direct Reach */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-900 text-white rounded-2xl p-8 sm:p-12 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-blue-400">
                Direct Contact
              </span>
              <h3 className="text-2xl font-bold mt-1">Talk Directly with BIZORA Founder</h3>
            </div>
            <a
              href={getWhatsAppUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors self-start sm:self-auto"
            >
              <MessageSquare className="w-4 h-4" />
              WhatsApp: {BIZORA_PHONE}
            </a>
          </div>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Have a question about whether a digital catalogue, custom website, or WhatsApp automation is right for your business? Send a message directly on WhatsApp. We are happy to review your situation and offer advice with no obligation.
          </p>

          <div className="pt-2">
            <button
              onClick={onOpenConsultation}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-md transition-colors cursor-pointer"
            >
              Request a Formal Consultation
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
