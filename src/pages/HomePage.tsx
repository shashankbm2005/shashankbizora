import React from 'react';
import {
  ArrowRight,
  MessageSquare,
  Globe,
  ShoppingBag,
  CalendarCheck,
  Zap,
  Bot,
  Code2,
  CheckCircle2,
  HelpCircle,
  Clock,
  Sparkles,
} from 'lucide-react';
import { SERVICES, BIZORA_PHONE, getWhatsAppUrl } from '../data/servicesData.ts';
import { HeroCarousel } from '../components/HeroCarousel.tsx';
import { DirectCallerSection } from '../components/DirectCallerSection.tsx';
import realisticWorkspaceImg from '../assets/images/realistic_digital_workspace_1793195172945.jpg';

interface HomePageProps {
  onOpenConsultation: (serviceId?: string) => void;
  onNavigate: (tab: string) => void;
}

const serviceIcons: Record<string, React.ReactNode> = {
  website_dev: <Globe className="w-5 h-5 text-blue-600" />,
  digital_catalogue: <ShoppingBag className="w-5 h-5 text-indigo-600" />,
  appointment_enquiry: <CalendarCheck className="w-5 h-5 text-emerald-600" />,
  whatsapp_automation: <Zap className="w-5 h-5 text-amber-600" />,
  ai_assistant: <Bot className="w-5 h-5 text-purple-600" />,
  custom_software: <Code2 className="w-5 h-5 text-cyan-600" />,
};

export const HomePage: React.FC<HomePageProps> = ({ onOpenConsultation, onNavigate }) => {
  return (
    <div className="space-y-20 pb-20">
      {/* 1. 6-SLIDE PROFESSIONAL HERO IMAGE CAROUSEL */}
      <HeroCarousel onOpenConsultation={onOpenConsultation} onNavigate={onNavigate} />

      {/* 2. DIRECT FOUNDER CALLER SECTION */}
      <DirectCallerSection onOpenConsultation={() => onOpenConsultation()} />

      {/* 2. REAL BUSINESS PROBLEMS SOLVED */}
      <section className="bg-slate-100/70 py-16 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 block mb-2">
              Problems We Solve
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight text-balance">
              Why Traditional Small Businesses Get Left Behind
            </h2>
            <p className="text-sm text-slate-600 mt-2">
              Most businesses across India don’t need overpriced corporate jargon—they need practical digital systems that bring enquiries and reduce manual work.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-xs space-y-3">
              <div className="text-xs font-mono font-semibold text-blue-600">Problem 01</div>
              <h3 className="text-base font-bold text-slate-900">Missing Online Discovery</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                When nearby customers search for your products on Google, competitors with optimized websites take the customer calls.
              </p>
              <div className="text-xs text-emerald-700 font-semibold pt-1">
                &rarr; Solution: Mobile-first business websites with Google Search visibility.
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-xs space-y-3">
              <div className="text-xs font-mono font-semibold text-indigo-600">Problem 02</div>
              <h3 className="text-base font-bold text-slate-900">Bulky PDF Catalogues</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Sharing 40MB PDF files over WhatsApp wastes customer mobile data and gives no way to track what items they are interested in.
              </p>
              <div className="text-xs text-emerald-700 font-semibold pt-1">
                &rarr; Solution: Instant online catalogues with 1-click WhatsApp enquiry buttons.
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-xs space-y-3">
              <div className="text-xs font-mono font-semibold text-emerald-600">Problem 03</div>
              <h3 className="text-base font-bold text-slate-900">Missed Customer Enquiries</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Staff get overwhelmed during peak shop hours, leaving potential clients waiting hours for a reply until they hire someone else.
              </p>
              <div className="text-xs text-emerald-700 font-semibold pt-1">
                &rarr; Solution: Automated WhatsApp greeting & enquiry intake systems.
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-xs space-y-3">
              <div className="text-xs font-mono font-semibold text-amber-600">Problem 04</div>
              <h3 className="text-base font-bold text-slate-900">Clunky Paper Spreadsheets</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Managing orders, appointments, and supplier receipts across disjointed notebooks creates costly delivery delays and bookkeeping errors.
              </p>
              <div className="text-xs text-emerald-700 font-semibold pt-1">
                &rarr; Solution: Custom lightweight web portals and database dashboards.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. CORE SERVICES OVERVIEW */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div className="max-w-2xl">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 block mb-2">
              Our Digital Services
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight text-balance">
              Tailored Digital Solutions for Indian Enterprises
            </h2>
            <p className="text-sm text-slate-600 mt-2">
              Every business has unique operational needs. Select any service to discuss your project requirements directly with our team.
            </p>
          </div>

          <button
            onClick={() => {
              onNavigate('services');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-700 cursor-pointer"
          >
            View all specifications & deliverables &rarr;
          </button>
        </div>

        {/* 6 Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {SERVICES.map((s) => (
            <div
              key={s.id}
              className="bg-white rounded-xl border border-slate-200 p-6 flex flex-col justify-between hover:border-blue-400 transition-colors shadow-xs"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center">
                    {serviceIcons[s.id]}
                  </div>
                  <span className="text-xs font-mono text-slate-500 font-medium">
                    {s.timelineEstimate}
                  </span>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-slate-900">{s.title}</h3>
                  <p className="text-xs text-blue-600 font-medium mt-0.5">{s.tagline}</p>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">{s.shortDesc}</p>

                <div className="pt-2 border-t border-slate-100 space-y-1.5">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Key Features:
                  </p>
                  <ul className="text-xs text-slate-600 space-y-1">
                    {s.features.slice(0, 3).map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="pt-6 mt-6 border-t border-slate-100 flex items-center justify-between gap-3">
                <div className="text-xs">
                  <span className="text-slate-400 block text-[10px]">Scope:</span>
                  <span className="font-semibold text-slate-700">Custom tailored</span>
                </div>

                <button
                  onClick={() => onOpenConsultation(s.id)}
                  className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors cursor-pointer"
                >
                  Discuss Project
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. VISUAL SHOWCASE & CAPABILITY HIGHLIGHT */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center bg-slate-900 rounded-3xl p-8 sm:p-12 text-white">
          <div className="space-y-6">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-400">
              Modern Architecture
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-balance">
              Digital Tools That Keep You Ahead of the Competition
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              We combine enterprise database technology (PostgreSQL, Supabase) with high-speed frontend interfaces so your business runs seamlessly on any smartphone, desktop, or tablet.
            </p>

            <div className="space-y-3 pt-2">
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-blue-600/30 flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle2 className="w-4 h-4 text-blue-400" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white">Real-Time Lead Capture</h4>
                  <p className="text-xs text-slate-400">Every enquiry is permanently stored in your private database, not lost in spam folders.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-emerald-600/30 flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white">Direct WhatsApp Linkage</h4>
                  <p className="text-xs text-slate-400">Indian buyers prefer chatting on WhatsApp. We turn your digital assets into direct WhatsApp chat conversations.</p>
                </div>
              </div>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => onOpenConsultation()}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-xl text-white font-semibold text-xs transition-colors"
              >
                Schedule Free Consultation
              </button>
              <a
                href={getWhatsAppUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-slate-800 hover:bg-slate-700 rounded-xl text-white font-semibold text-xs border border-slate-700 transition-colors"
              >
                <MessageSquare className="w-4 h-4 text-emerald-400" />
                Chat With Founder
              </a>
            </div>
          </div>

            <div className="relative rounded-2xl overflow-hidden border border-slate-700 aspect-[4/3] shadow-2xl group">
              <img
                src={realisticWorkspaceImg}
                alt="BIZORA real-time modern digital business operations and WhatsApp management"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/images/realistic_digital_workspace.jpg';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent pointer-events-none" />
              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[11px] text-slate-200 bg-slate-900/85 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-700/60">
                <span className="font-medium text-emerald-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Live Cloud Sync Active
                </span>
                <span className="text-slate-400 font-mono text-[10px]">PostgreSQL + WhatsApp</span>
              </div>
            </div>
        </div>
      </section>

      {/* 5. ACTUAL WORKING PROCESS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600 block mb-2">
            Clear & Honest Working Process
          </span>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            How We Work Together
          </h2>
          <p className="text-sm text-slate-600 mt-2">
            No surprise invoices or vague timelines. Here is the exact path from initial conversation to delivery.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs relative">
            <span className="text-2xl font-extrabold text-blue-600 font-mono">01</span>
            <h3 className="text-base font-bold text-slate-900 mt-2">Submit Your Requirement</h3>
            <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
              Fill out our consultation form with your business name, city, service needed, and current operational bottleneck.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs relative">
            <span className="text-2xl font-extrabold text-blue-600 font-mono">02</span>
            <h3 className="text-base font-bold text-slate-900 mt-2">BIZORA Reviews Your Needs</h3>
            <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
              Our founder analyzes your requirement against standard architecture patterns to determine feasibility and optimal tech choices.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs relative">
            <span className="text-2xl font-extrabold text-blue-600 font-mono">03</span>
            <h3 className="text-base font-bold text-slate-900 mt-2">Discovery Discussion</h3>
            <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
              We reach out via your preferred method (WhatsApp or phone) to clarify workflow details, volume, and special requests.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs relative">
            <span className="text-2xl font-extrabold text-blue-600 font-mono">04</span>
            <h3 className="text-base font-bold text-slate-900 mt-2">Scope, Budget & Timeline</h3>
            <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
              We agree on exact deliverables, milestones, and payment structure before any commitment is made.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs relative">
            <span className="text-2xl font-extrabold text-blue-600 font-mono">05</span>
            <h3 className="text-base font-bold text-slate-900 mt-2">Transparent Proposal</h3>
            <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
              We prepare a clear written quotation specifying deliverable specs, testing requirements, and post-launch maintenance terms.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs relative">
            <span className="text-2xl font-extrabold text-blue-600 font-mono">06</span>
            <h3 className="text-base font-bold text-slate-900 mt-2">Execution & Handover</h3>
            <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
              Work commences upon agreement. You review preview builds during development, followed by full deployment and staff orientation.
            </p>
          </div>
        </div>
      </section>

      {/* 6. TRANSPARENT FAQS */}
      <section className="bg-slate-50 py-16 border-t border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 block mb-2">
              Frequently Asked Questions
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Straightforward Answers for Business Owners
            </h2>
          </div>

          <div className="space-y-4">
            <div className="bg-white p-6 rounded-xl border border-slate-200">
              <h3 className="text-sm font-bold text-slate-900">
                How do you determine the quote for my project?
              </h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Every business has specific requirements. We avoid generic pricing packages and instead prepare a clear, custom written proposal with exact deliverables, milestones, and timeline after our free discovery call.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200">
              <h3 className="text-sm font-bold text-slate-900">
                Do I own my website and data, or am I locked into high monthly fees?
              </h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                You retain complete ownership of your domain name, code, database, and content. Unlike proprietary SaaS builders that trap your business, we build using standard modern frameworks (React, PostgreSQL, Supabase) that can be hosted anywhere.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200">
              <h3 className="text-sm font-bold text-slate-900">
                Can customers contact me directly on WhatsApp from the website?
              </h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Yes. Every website and digital catalogue we develop comes with deep WhatsApp click-to-chat integration, including prefilled enquiry messages that identify which product or service the visitor is enquiring about.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200">
              <h3 className="text-sm font-bold text-slate-900">
                How long does development take from start to finish?
              </h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                A standard business website or booking system is delivered in 7 to 14 business days once content and brand details are gathered. More complex custom software portals or AI assistants require 3 to 6 weeks.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. BOTTOM CTA BLOCK */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-8 sm:p-12 text-white text-center space-y-6 shadow-xl">
          <span className="text-xs font-bold uppercase tracking-widest text-blue-200">
            Start Your Digital Journey Today
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight max-w-2xl mx-auto text-balance">
            Ready to Take Your Business Digital?
          </h2>
          <p className="text-sm text-blue-100 max-w-xl mx-auto leading-relaxed">
            Tell us about your business goals. We will study your operational requirements, provide honest pricing, and prepare a clear roadmap.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => onOpenConsultation()}
              className="w-full sm:w-auto px-8 py-3.5 bg-white text-blue-700 hover:bg-blue-50 font-bold text-sm rounded-xl shadow-md transition-all cursor-pointer"
            >
              Get a Free Consultation
            </button>
            <a
              href={getWhatsAppUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm rounded-xl shadow-md transition-colors"
            >
              <MessageSquare className="w-4 h-4" />
              Chat on WhatsApp ({BIZORA_PHONE})
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};
