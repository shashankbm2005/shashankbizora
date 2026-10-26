import type { ServiceDetail, ServiceType } from '../types/enquiry.ts';

export const BIZORA_PHONE = '+91 8147827430';
export const BIZORA_WHATSAPP_NUMBER = '918147827430';

export function getWhatsAppUrl(customMessage?: string): string {
  const message = customMessage || 'Hello BIZORA, I would like to discuss digital solutions for my business. Please share the details.';
  return `https://wa.me/${BIZORA_WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

export function getCustomerWhatsAppUrl(phone: string, customerName: string, businessName: string, refId: string): string {
  // Clean phone to digits
  const cleaned = phone.replace(/\D/g, '');
  let targetNumber = cleaned;
  if (targetNumber.length === 10) {
    targetNumber = `91${targetNumber}`;
  }
  const message = `Hello ${customerName}, this is Shashank from BIZORA regarding your enquiry [${refId}] for "${businessName}". I have reviewed your requirement and would like to discuss the best digital solution for your business.`;
  return `https://wa.me/${targetNumber}?text=${encodeURIComponent(message)}`;
}

export const SERVICES: ServiceDetail[] = [
  {
    id: 'website_dev',
    title: 'Business Website Development',
    tagline: 'High-speed, conversion-focused websites engineered for Indian businesses.',
    shortDesc: 'Mobile-first, lightning-fast business websites with clear calls-to-action, local SEO optimization, and WhatsApp chat triggers.',
    detailedDesc: 'Most small businesses lose potential customers because their website is either non-existent, outdated, slow on mobile networks, or confusing to navigate. We build modern, mobile-optimized business websites designed specifically to turn searchers into enquiries.',
    features: [
      'Responsive design tested on budget to flagship mobile devices',
      'Instant WhatsApp & phone click-to-call integrations',
      'Local SEO setup (Google Business Profile & schema metadata)',
      'Sub-2-second load times on 4G and 5G connections',
      'Clear enquiry capture forms with lead alerts',
      'Domain, SSL, and reliable cloud hosting setup',
    ],
    deliverables: [
      '5 to 10 structured pages (Home, About, Services, Gallery/Portfolio, Contact)',
      'Integrated lead capture form with instant email/WhatsApp routing',
      'Google Maps & business location embedding',
      'Search engine indexation & XML sitemap submission',
    ],
    idealFor: [
      'Clinics & Healthcare Providers',
      'Manufacturing & Industrial Suppliers',
      'Professional Service Firms (CA, Law, Architecture)',
      'Contractors & Local Service Providers',
    ],
    timelineEstimate: '7 to 14 working days',
  },
  {
    id: 'digital_catalogue',
    title: 'Digital Catalogues & Online Presence',
    tagline: 'Showcase your complete product inventory with direct enquiry buttons.',
    shortDesc: 'Interactive product catalogues that allow customers to browse your products, view specs, and request quotes instantly on WhatsApp.',
    detailedDesc: 'Stop sending heavy, outdated 50MB PDF brochures that customers never open. We build lightweight, interactive online product catalogues where customers can search, filter categories, view pricing or specs, and click one button to enquire about any item on WhatsApp.',
    features: [
      'Category-based product browsing and live search',
      'Direct "Enquire on WhatsApp for this Product" button',
      'Variant options (sizes, finishes, specifications)',
      'Simple admin interface to add, edit, or archive products',
      'Optimized image compression for fast opening on mobile',
      'QR codes for print menus, trade show booths, and store counters',
    ],
    deliverables: [
      'Custom catalogue interface with category taxonomy',
      'Initial catalogue setup of up to 50 products',
      'Product enquiry routing to your sales phone',
      'Print-ready QR code assets for your physical store or brochures',
    ],
    idealFor: [
      'Wholesalers & Distributors',
      'Boutiques, Jewellery & Apparel Stores',
      'Hardware, Tiles & Sanitaryware Showrooms',
      'Equipment & Machine Component Sellers',
    ],
    timelineEstimate: '10 to 18 working days',
  },
  {
    id: 'appointment_enquiry',
    title: 'Appointment & Customer Enquiry Systems',
    tagline: 'Streamlined booking schedules and lead intake without double-bookings.',
    shortDesc: 'Automated booking and enquiry portals that capture customer needs, schedule time slots, and eliminate manual phone tag.',
    detailedDesc: 'Managing customer bookings across WhatsApp chats and phone calls leads to missed appointments, forgotten follow-ups, and double-bookings. Our booking systems give your clients a frictionless booking link while giving your team a clean daily schedule.',
    features: [
      'Custom booking calendar with your working hours and buffer times',
      'Automated confirmation via SMS/WhatsApp and email',
      'Pre-booking questionnaire to qualify requirements upfront',
      'Google Calendar synchronization to avoid schedule conflicts',
      'Admin view of upcoming appointments and past customer history',
      'Cancellation and rescheduling self-service links',
    ],
    deliverables: [
      'Dedicated booking portal styled to your brand',
      'Staff schedule configuration & blackout date rules',
      'Customer intake form tailored to your service type',
      'Real-time booking notification to your team',
    ],
    idealFor: [
      'Doctors, Dentists & Diagnostic Centers',
      'Fitness Studios & Physiotherapy Clinics',
      'Consultants, Lawyers & Chartered Accountants',
      'Salons, Spas & Wellness Centers',
    ],
    timelineEstimate: '7 to 12 working days',
  },
  {
    id: 'whatsapp_automation',
    title: 'WhatsApp Communication & Workflow Automation',
    tagline: 'Engage customers instantly on India’s most popular messaging channel.',
    shortDesc: 'Automated WhatsApp response flows, enquiry confirmations, payment reminders, and notification pipelines that save hours daily.',
    detailedDesc: 'In India, business happens on WhatsApp. We design structured communication workflows that welcome new leads immediately, provide FAQs, confirm orders, send payment links, and notify your staff—without keeping customers waiting for hours.',
    features: [
      'Instant greeting and business info auto-responders',
      'Structured menu navigation for services, pricing, and location',
      'Lead qualification questionnaires right inside WhatsApp',
      'Internal team notifications when a high-value enquiry arrives',
      'Follow-up sequences for pending quotes or reminders',
      'Compliance with WhatsApp Business Platform policies',
    ],
    deliverables: [
      'WhatsApp Business setup & template message configuration',
      'Custom conversational decision trees for your business',
      'Integration with your website enquiry forms or CRM',
      'Team handbook on managing chats and broadcasts',
    ],
    idealFor: [
      'E-commerce & D2C Brands',
      'Educational Institutes & Coaching Academies',
      'Real Estate Brokers & Property Developers',
      'Hospitality & Event Venues',
    ],
    timelineEstimate: '10 to 20 working days',
  },
  {
    id: 'ai_assistant',
    title: 'AI Assistants & Business Workflows',
    tagline: 'Practical AI tools that answer customer questions and summarize operational data.',
    shortDesc: 'Domain-trained AI assistants that understand your specific business products, pricing rules, and documentation to assist staff and customers.',
    detailedDesc: 'We build practical, domain-specific AI workflows that actually save your business time. From customer support bots trained strictly on your product catalogue to document summarization for contracts, invoices, and service logs.',
    features: [
      'AI assistant grounded strictly in your business knowledge base',
      'Automated enquiry extraction from emails or inquiry forms',
      '24/7 basic query answering with human escalation trigger',
      'Multilingual assistance (English, Hindi, Kannada, Tamil, etc.)',
      'Automated quotation draft generation for your sales team',
      'Audit log of all AI interactions with human-in-the-loop oversight',
    ],
    deliverables: [
      'Knowledge-base ingestion pipeline (PDFs, catalogues, FAQ sheets)',
      'Custom web or WhatsApp-accessible AI assistant widget',
      'Safety guardrails preventing hallucinated answers or rogue pricing',
      'Admin monitoring console for unanswered or flagged questions',
    ],
    idealFor: [
      'B2B Suppliers with complex product specifications',
      'Customer Support Centers with repetitive FAQs',
      'EdTech & Training Institutes',
      'Travel & Tour Planners',
    ],
    timelineEstimate: '14 to 28 working days',
  },
  {
    id: 'custom_software',
    title: 'Custom Software Solutions',
    tagline: 'Tailor-made internal tools, portals, and dashboards for your unique business operations.',
    shortDesc: 'When off-the-shelf software doesn’t fit your business model, we build custom web portals, inventory trackers, and billing dashboards.',
    detailedDesc: 'Off-the-shelf software often forces you to change how your business operates or charges exorbitant per-user monthly subscriptions. We architect custom, owned software designed specifically for your exact business processes, customer intake, and reporting.',
    features: [
      'Custom relational database architecture (Supabase / PostgreSQL)',
      'Role-based access control (Admin, Manager, Staff, Customer)',
      'Order fulfillment, job tracking, or inventory management dashboards',
      'Custom PDF invoice, challan, and quotation generation',
      'Secure REST/GraphQL API integration with existing systems',
      'Zero monthly per-seat licensing fees—you own the application',
    ],
    deliverables: [
      'Technical architecture document & database schema design',
      'Full-stack custom web application with responsive UI',
      'Automated backup configuration & disaster recovery manual',
      'Admin training session & 30-day post-launch warranty support',
    ],
    idealFor: [
      'Manufacturers & Job-work Units',
      'Fleet, Logistics & Warehouse Operators',
      'Multi-branch Retail Chains',
      'Specialized B2B Service Companies',
    ],
    timelineEstimate: '3 to 8 weeks depending on scope',
  },
];
