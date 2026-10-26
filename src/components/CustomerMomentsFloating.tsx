import React from 'react';
import { ArrowRight, MessageSquare, CheckCircle2, TrendingUp, Sparkles, MapPin } from 'lucide-react';
import { getWhatsAppUrl, BIZORA_PHONE } from '../data/servicesData.ts';

interface CustomerMomentsFloatingProps {
  onOpenConsultation: (serviceId?: string) => void;
}

interface CustomerMoment {
  id: number;
  businessName: string;
  category: string;
  city: string;
  image: string;
  serviceId: string;
  serviceTitle: string;
  highlightMetric: string;
  customerStory: string;
  quote: string;
  floatClass: string;
}

const MOMENTS: CustomerMoment[] = [
  {
    id: 1,
    businessName: 'Innovate BLR Tech Space',
    category: 'Consulting & Workspace',
    city: 'Bengaluru, Karnataka',
    image: '/images/slide1.jpg',
    serviceId: 'website_dev',
    serviceTitle: 'Custom Business Web Portal',
    highlightMetric: '+240% Discovery Calls',
    customerStory: 'Replaced a generic template with a blazing-fast corporate website connected to real-time lead capture.',
    quote: 'Our client enquiries now come directly with business requirements and zero missing details.',
    floatClass: 'animate-float',
  },
  {
    id: 2,
    businessName: 'Mumbai General Store',
    category: 'Retail & Supermarket',
    city: 'Mumbai, Maharashtra',
    image: '/images/slide2.jpg',
    serviceId: 'digital_catalogue',
    serviceTitle: 'Interactive Online Catalogue',
    highlightMetric: '1,200+ WhatsApp Enquiries',
    customerStory: 'Shifted from manual price enquiries over the phone to a live mobile digital catalogue with 1-click WhatsApp order buttons.',
    quote: 'Customers browse items on their phones and send their order directly to our shop WhatsApp.',
    floatClass: 'animate-float-delayed',
  },
  {
    id: 3,
    businessName: 'CareWell Clinic',
    category: 'Healthcare & Specialists',
    city: 'Bengaluru, Karnataka',
    image: '/images/slide3.jpg',
    serviceId: 'appointment_enquiry',
    serviceTitle: 'Smart Clinic Appointment Portal',
    highlightMetric: 'Zero Missed Appointments',
    customerStory: 'Automated patient booking and doctor slot schedules with automated SMS & WhatsApp confirmations.',
    quote: 'Our reception is no longer flooded with appointment calls. Patients book their slot in 30 seconds.',
    floatClass: 'animate-float-slow',
  },
  {
    id: 4,
    businessName: 'VoltTech Energy & Electronics',
    category: 'Industrial & Battery Store',
    city: 'Pune, Maharashtra',
    image: '/images/slide4.jpg',
    serviceId: 'digital_catalogue',
    serviceTitle: 'B2B Product & Specs Catalogue',
    highlightMetric: '3.5x Faster Deal Closure',
    customerStory: 'Replaced a 40MB PDF brochure with a searchable online specifications catalogue and direct quotation request.',
    quote: 'Contractors check battery specs and inverter compatibility online and immediately click to order.',
    floatClass: 'animate-float',
  },
  {
    id: 5,
    businessName: 'Technovate Solutions',
    category: 'Enterprise IT & Services',
    city: 'Hyderabad, Telangana',
    image: '/images/slide5.jpg',
    serviceId: 'custom_software',
    serviceTitle: 'Internal Workflow Automation',
    highlightMetric: '85% Less Manual Paperwork',
    customerStory: 'Unified fragmented client spreadsheets into a secure PostgreSQL lead pipeline and real-time dashboard.',
    quote: 'Our founder team now tracks every prospective client milestone with complete clarity.',
    floatClass: 'animate-float-delayed',
  },
  {
    id: 6,
    businessName: 'Curated Crafts Boutique',
    category: 'Artisanal & Lifestyle',
    city: 'Jaipur / Pan-India',
    image: '/images/slide6.jpg',
    serviceId: 'whatsapp_automation',
    serviceTitle: 'Direct WhatsApp Storefront',
    highlightMetric: '+180% Repeat Buyer Rate',
    customerStory: 'Connected customer mobile browsing with automated WhatsApp greetings, order status, and instant founder support.',
    quote: 'Operating our boutique on smartphone with BIZORA feels effortless and our customers love it.',
    floatClass: 'animate-float-slow',
  },
];

export const CustomerMomentsFloating: React.FC<CustomerMomentsFloatingProps> = ({
  onOpenConsultation,
}) => {
  return (
    <section className="py-20 bg-slate-900 text-white relative overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute top-1/4 -left-20 w-80 h-80 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-emerald-600/15 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-bold uppercase tracking-wider text-blue-400">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span>Real Business Transformations</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white text-balance">
            Real Customers. Real Digital Moments.
          </h2>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            See how Indian retail shops, clinics, suppliers, and tech businesses operate smoothly with BIZORA websites, online catalogues, and appointment portals.
          </p>
        </div>

        {/* Floating Cards Grid (3 cols on desktop, 2 on tablet, 1 on mobile) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {MOMENTS.map((moment) => (
            <div
              key={moment.id}
              className={`group bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 hover:border-blue-500/60 rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl hover:shadow-blue-900/20 transition-all duration-300 flex flex-col justify-between backdrop-blur-sm ${moment.floatClass}`}
            >
              <div>
                {/* Photo Header with subtle zoom on hover */}
                <div className="relative aspect-[16/10] overflow-hidden bg-slate-950">
                  <img
                    src={moment.image}
                    alt={`${moment.businessName} - ${moment.category}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent" />

                  {/* Highlight Metric Badge */}
                  <div className="absolute top-3 right-3 bg-emerald-500/90 text-white text-xs font-bold px-2.5 py-1 rounded-full backdrop-blur-md shadow-md flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    <span>{moment.highlightMetric}</span>
                  </div>

                  {/* Business Name & City on bottom of image */}
                  <div className="absolute bottom-3 left-3 right-3 text-white">
                    <span className="text-[11px] font-semibold text-blue-400 uppercase tracking-wider block">
                      {moment.category}
                    </span>
                    <h3 className="text-lg font-bold text-white drop-shadow-xs">
                      {moment.businessName}
                    </h3>
                    <div className="flex items-center gap-1 text-slate-300 text-[11px] mt-0.5">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      <span>{moment.city}</span>
                    </div>
                  </div>
                </div>

                {/* Content Body */}
                <div className="p-5 space-y-3.5">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-blue-950/80 text-blue-300 border border-blue-800/60">
                      {moment.serviceTitle}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    {moment.customerStory}
                  </p>

                  {/* Customer Quote */}
                  <blockquote className="border-l-2 border-emerald-500/80 pl-3 py-1 text-xs text-slate-300 italic bg-slate-900/40 rounded-r-md">
                    &ldquo;{moment.quote}&rdquo;
                  </blockquote>
                </div>
              </div>

              {/* Card Footer CTA */}
              <div className="p-5 pt-0 border-t border-slate-700/50 mt-4 flex items-center justify-between gap-3">
                <button
                  onClick={() => onOpenConsultation(moment.serviceId)}
                  className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                >
                  <span>Build This For My Business</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Banner with Founder Call & WhatsApp Action */}
        <div className="mt-14 p-6 sm:p-8 bg-gradient-to-r from-slate-800 to-slate-800/90 border border-slate-700 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="space-y-1 text-center md:text-left">
            <h4 className="text-lg font-bold text-white">
              Want similar results for your shop, clinic, or firm?
            </h4>
            <p className="text-xs text-slate-300 max-w-xl">
              Talk directly with BIZORA founder Shashank. We build practical digital solutions tailored to your real everyday workflow.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0 w-full sm:w-auto">
            <a
              href="tel:+918147827430"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md transition-colors"
            >
              Call Founder: {BIZORA_PHONE}
            </a>
            <button
              onClick={() => onOpenConsultation()}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md transition-colors cursor-pointer"
            >
              Get Free Consultation
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
