import React from 'react';
import {
  Globe,
  ShoppingBag,
  CalendarCheck,
  Zap,
  Bot,
  Code2,
  CheckCircle2,
  Clock,
  ArrowRight,
  MessageSquare,
  Shield,
  Layers,
} from 'lucide-react';
import { SERVICES, BIZORA_PHONE, getWhatsAppUrl } from '../data/servicesData.ts';

interface ServicesPageProps {
  onOpenConsultation: (serviceId?: string) => void;
}

const serviceIcons: Record<string, React.ReactNode> = {
  website_dev: <Globe className="w-6 h-6 text-blue-600" />,
  digital_catalogue: <ShoppingBag className="w-6 h-6 text-indigo-600" />,
  appointment_enquiry: <CalendarCheck className="w-6 h-6 text-emerald-600" />,
  whatsapp_automation: <Zap className="w-6 h-6 text-amber-600" />,
  ai_assistant: <Bot className="w-6 h-6 text-purple-600" />,
  custom_software: <Code2 className="w-6 h-6 text-cyan-600" />,
};

export const ServicesPage: React.FC<ServicesPageProps> = ({ onOpenConsultation }) => {
  return (
    <div className="space-y-20 pb-20 pt-8">
      {/* Header Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center max-w-3xl">
        <div className="flex items-center justify-center gap-2 text-xs font-semibold tracking-wider uppercase text-blue-600 mb-2">
          <span>BIZORA Capabilities & Deliverables</span>
        </div>
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight text-balance">
          Digital Services Engineered for Real Business Growth
        </h1>
        <p className="text-base text-slate-600 mt-4 leading-relaxed">
          We provide custom engineering, website design, and communication automations. Every service below is delivered with transparent scope, agreed deliverables, and full client ownership.
        </p>
      </section>

      {/* Featured Visual Spotlight (Generated Image Asset) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl overflow-hidden border border-slate-200 bg-white grid grid-cols-1 lg:grid-cols-12 shadow-sm">
          <div className="lg:col-span-7 p-8 sm:p-12 flex flex-col justify-between space-y-6">
            <div className="space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
                Core Foundation
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Modern Websites & Digital Catalogues Built for Indian Shoppers
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                Indian buyers predominantly browse on mobile phones and prefer rapid interaction over WhatsApp. Our frontend applications are tested on high-latency mobile networks to guarantee instant browsing and direct enquiry generation.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-100 text-xs">
              <div>
                <span className="font-bold text-slate-900 block">Performance Target</span>
                <span className="text-slate-500">Under 2.0s initial load on mobile</span>
              </div>
              <div>
                <span className="font-bold text-slate-900 block">Lead Conversion</span>
                <span className="text-slate-500">Integrated WhatsApp click-to-chat</span>
              </div>
            </div>

            <div className="pt-2 flex items-center gap-4">
              <button
                onClick={() => onOpenConsultation('website_dev')}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors cursor-pointer"
              >
                Discuss Web Presence
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="lg:col-span-5 bg-slate-100 min-h-[280px]">
            <img
              src="/src/assets/images/service_web_catalogue_1792397377193.jpg"
              alt="Responsive business catalogue on laptop and smartphone"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>
      </section>

      {/* Detailed Services Breakdown */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {SERVICES.map((s, index) => (
          <div
            key={s.id}
            id={s.id}
            className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-10 shadow-xs hover:border-slate-300 transition-all"
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Column: Title, Description, and Problem */}
              <div className="lg:col-span-7 space-y-5">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center">
                    {serviceIcons[s.id]}
                  </div>
                  <div>
                    <span className="text-xs font-mono text-slate-400 font-medium">
                      Service 0{index + 1}
                    </span>
                    <h3 className="text-2xl font-bold text-slate-900">{s.title}</h3>
                  </div>
                </div>

                <p className="text-sm font-semibold text-blue-600">{s.tagline}</p>

                <p className="text-sm text-slate-600 leading-relaxed">{s.detailedDesc}</p>

                {/* Target Industries */}
                <div className="pt-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">
                    Ideal For:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {s.idealFor.map((item, idx) => (
                      <span
                        key={idx}
                        className="text-xs text-slate-700 bg-slate-100 px-2.5 py-1 rounded-md"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column: Features, Deliverables, Price, and CTA */}
              <div className="lg:col-span-5 bg-slate-50/80 rounded-xl p-6 border border-slate-200/80 space-y-5">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                    Deliverables Included:
                  </h4>
                  <ul className="text-xs text-slate-600 space-y-2">
                    {s.deliverables.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-4 border-t border-slate-200 space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500">Project Timeline:</span>
                    <span className="font-semibold text-slate-800">{s.timelineEstimate}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500">Scoping:</span>
                    <span className="font-semibold text-blue-600">Free Discovery Call</span>
                  </div>
                </div>

                <div className="pt-2 space-y-2">
                  <button
                    onClick={() => onOpenConsultation(s.id)}
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs transition-colors cursor-pointer"
                  >
                    Discuss Your {s.title} Project
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  <a
                    href={getWhatsAppUrl(
                      `Hello BIZORA, I would like to discuss ${s.title} for my business. Please share the details.`
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-semibold text-xs transition-colors"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                    Enquire on WhatsApp
                  </a>
                </div>
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* Honest Scope Clarification */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-6 bg-slate-100 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-2">
          <div className="flex items-center gap-2 text-slate-800 font-bold">
            <Shield className="w-4 h-4 text-blue-600" />
            <span>Honest Project Scoping & Delivery Guarantee</span>
          </div>
          <p className="leading-relaxed">
            Every business project is custom-scoped to your exact operational requirements. During our free consultation, we establish the exact scope, custom features, and integration requirements to provide a transparent written proposal. No surprise charges, hidden fees, or locked-in vendor traps.
          </p>
        </div>
      </section>
    </div>
  );
};
