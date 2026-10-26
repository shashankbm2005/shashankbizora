import React from 'react';
import {
  FileText,
  Search,
  PhoneCall,
  Scale,
  FileCheck,
  Rocket,
  CheckCircle2,
  ArrowRight,
  MessageSquare,
} from 'lucide-react';
import { BIZORA_PHONE, getWhatsAppUrl } from '../data/servicesData.ts';

interface HowItWorksPageProps {
  onOpenConsultation: () => void;
}

const steps = [
  {
    number: '01',
    title: 'Customer Submits Business Requirement',
    icon: <FileText className="w-6 h-6 text-blue-600" />,
    summary: 'Fill out our brief consultation form on the website with your business type, current digital challenge, and location.',
    customerAction: 'Provide your name, phone number, business name, and a short description of what you need.',
    bizoraAction: 'Our system creates a unique reference number and permanently logs your request in our private database.',
    turnaround: 'Instant reference number generation',
  },
  {
    number: '02',
    title: 'BIZORA Reviews Your Requirement',
    icon: <Search className="w-6 h-6 text-indigo-600" />,
    summary: 'Our founder personally analyzes your enquiry, looks at your industry competitors in your city, and evaluates suitable tech architectures.',
    customerAction: 'Keep your WhatsApp or phone reachable.',
    bizoraAction: 'We determine whether an off-the-shelf template, a custom React website, or an automated WhatsApp workflow is the most cost-effective path.',
    turnaround: 'Within 2 to 4 hours during business days',
  },
  {
    number: '03',
    title: 'BIZORA Contacts You for Discovery',
    icon: <PhoneCall className="w-6 h-6 text-emerald-600" />,
    summary: 'We connect directly on WhatsApp or phone call (according to your chosen preference) to discuss your business in detail.',
    customerAction: 'Share your specific product range, target customers, current pain points, and any reference designs you like.',
    bizoraAction: 'We ask focused questions to clarify volume, inventory size, integrations, and administrative needs.',
    turnaround: '15-to-20 minute initial consultation call',
  },
  {
    number: '04',
    title: 'Scope, Budget & Timeline Discussion',
    icon: <Scale className="w-6 h-6 text-amber-600" />,
    summary: 'We openly talk about project boundaries: what is included in version 1, what can wait for later phases, and what budget works for you.',
    customerAction: 'Set realistic budget boundaries and deadline expectations.',
    bizoraAction: 'We provide honest technical feedback—advising against unnecessary complex features that waste your money.',
    turnaround: 'Same day as discovery call',
  },
  {
    number: '05',
    title: 'BIZORA Prepares a Written Proposal',
    icon: <FileCheck className="w-6 h-6 text-purple-600" />,
    summary: 'We draft a clear, plain-language proposal detailing the exact page list, deliverables, database architecture, hosting fees, and payment schedule.',
    customerAction: 'Review the written proposal, request any adjustments, and approve the deliverables.',
    bizoraAction: 'We lock in the delivery milestones and provide a clear milestone payment breakdown (usually 50% advance / 50% on verified launch).',
    turnaround: 'Within 24 hours of scope agreement',
  },
  {
    number: '06',
    title: 'Work Starts After Agreement',
    icon: <Rocket className="w-6 h-6 text-cyan-600" />,
    summary: 'Development begins immediately. You receive preview links to test the real interface on your phone as we build.',
    customerAction: 'Provide brand logos, photos, product lists, and provide feedback on the preview link.',
    bizoraAction: 'We engineer, configure security rules, optimize mobile performance, connect domains, and train your staff on how to use it.',
    turnaround: '7 to 21 working days based on agreed scope',
  },
];

export const HowItWorksPage: React.FC<HowItWorksPageProps> = ({ onOpenConsultation }) => {
  return (
    <div className="space-y-20 pb-20 pt-8">
      {/* Header */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <span className="text-xs font-bold uppercase tracking-wider text-blue-600 block mb-2">
          Transparent Client Journey
        </span>
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight text-balance">
          How BIZORA Delivers Your Digital Solution
        </h1>
        <p className="text-base text-slate-600 mt-4 leading-relaxed max-w-2xl mx-auto">
          We believe in complete transparency. We never start work without a signed agreement, agreed scope, and clear milestones. Here is our step-by-step engagement workflow.
        </p>
      </section>

      {/* Step by Step Timeline */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {steps.map((step, idx) => (
          <div
            key={idx}
            className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs hover:border-slate-300 transition-colors"
          >
            <div className="flex flex-col sm:flex-row items-start gap-6">
              {/* Step Badge */}
              <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col items-center justify-center shrink-0">
                <span className="text-xs font-mono font-bold text-slate-400">STEP</span>
                <span className="text-lg font-bold text-blue-600">{step.number}</span>
              </div>

              {/* Step Details */}
              <div className="flex-1 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <h3 className="text-xl font-bold text-slate-900">{step.title}</h3>
                  <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md self-start">
                    {step.turnaround}
                  </span>
                </div>

                <p className="text-sm text-slate-600 leading-relaxed">{step.summary}</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-xs space-y-1">
                    <span className="font-bold text-slate-800 block">Your Role:</span>
                    <p className="text-slate-600">{step.customerAction}</p>
                  </div>

                  <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 text-xs space-y-1">
                    <span className="font-bold text-blue-900 block">BIZORA Responsibility:</span>
                    <p className="text-slate-700">{step.bizoraAction}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* CTA Box */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-900 rounded-2xl p-8 sm:p-10 text-white text-center space-y-5">
          <h3 className="text-2xl font-bold">Ready to Start Step 1?</h3>
          <p className="text-xs sm:text-sm text-slate-300 max-w-lg mx-auto">
            Submitting an enquiry takes less than 2 minutes. We review it and get in touch to discuss the right approach for your business.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={onOpenConsultation}
              className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-md transition-colors cursor-pointer"
            >
              Submit Business Requirement
            </button>
            <a
              href={getWhatsAppUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs transition-colors"
            >
              <MessageSquare className="w-4 h-4 text-emerald-400" />
              Direct WhatsApp ({BIZORA_PHONE})
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};
