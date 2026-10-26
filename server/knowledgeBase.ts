/**
 * BIZORA Knowledge Base & Retrieval System
 * Verified facts, capabilities, service specifications, pricing policies, and operational details.
 */

export interface KnowledgeDocument {
  id: string;
  category: 'company' | 'service' | 'pricing' | 'timeline' | 'technical' | 'faq' | 'contact';
  title: string;
  tags: string[];
  content: string;
}

export const KNOWLEDGE_BASE: KnowledgeDocument[] = [
  {
    id: 'bizora-overview',
    category: 'company',
    title: 'About BIZORA and Target Customers',
    tags: ['about', 'company', 'mission', 'who', 'sme', 'india', 'founder', 'bengaluru'],
    content: `BIZORA is a digital transformation agency and software solutions provider based in Bengaluru, Karnataka, India.
Tagline: "Making Every Business Digital."
Founder: Shashank (WhatsApp & Phone: +91 8147827430).
Primary Mission: Help Indian small and medium-sized enterprises (SMEs) transition from offline or fragmented operations into modern, automated digital businesses.
Target Customers: Local retail shops, battery & electronics stores, healthcare clinics, wellness centers, industrial suppliers, contractors, CA/legal firms, and boutique brands across India.
Core Value Proposition: We build fast, mobile-first websites, interactive catalogues, and WhatsApp customer enquiry systems that convert visitors into paying clients without complex or expensive monthly lock-ins.`,
  },
  {
    id: 'service-websites',
    category: 'service',
    title: 'Business Website Development',
    tags: ['website', 'web development', 'site', 'mobile-first', 'seo', 'pages', 'google'],
    content: `Business Website Development by BIZORA:
- Description: High-speed, conversion-focused websites engineered specifically for Indian businesses and mobile shoppers.
- Key Capabilities: Sub-2-second load times on 4G/5G mobile connections, local Google SEO setup (Google Business Profile optimization and schema markup), responsive design tested across budget to flagship smartphones.
- Inclusions: 5 to 10 structured pages (Home, About, Services/Products, Portfolio/Gallery, Contact), custom enquiry capture forms, Google Maps integration, direct click-to-call and WhatsApp triggers.
- Ideal For: Clinics, manufacturing suppliers, professional service firms (CAs, lawyers, architects), local service contractors, and retailers.
- Delivery Timeline: Standard business websites are delivered in 7 to 14 working days once content and brand details are gathered.`,
  },
  {
    id: 'service-catalogues',
    category: 'service',
    title: 'Digital Catalogues & Online Presence',
    tags: ['catalogue', 'catalog', 'products', 'inventory', 'brochure', 'pdf', 'whatsapp order'],
    content: `Digital Catalogues by BIZORA:
- Description: Interactive online product catalogues that replace heavy 40MB PDF files that customers rarely open or struggle to read on mobile.
- Key Capabilities: Category-based product browsing, instant search, product photos, variant specs (sizes, models, ratings), and a direct "Enquire on WhatsApp for this Product" button for every item.
- Customer Experience: Customers browse smoothly on their smartphone and send instant WhatsApp messages with the exact product title prefilled.
- Ideal For: Battery & electronics stores, hardware distributors, industrial component suppliers, furniture showrooms, clothing and lifestyle boutiques.
- Delivery Timeline: 7 to 14 business days depending on the number of categories and items.`,
  },
  {
    id: 'service-appointments',
    category: 'service',
    title: 'Appointment & Enquiry Management Portals',
    tags: ['appointment', 'booking', 'clinic', 'doctor', 'slots', 'schedule', 'reception', 'enquiry'],
    content: `Appointment & Enquiry Management Portals:
- Description: Online appointment booking systems designed to eliminate missed phone calls and receptionist bottleneck during peak business hours.
- Key Capabilities: 24/7 patient/client slot selection, doctor/consultant calendar availability, automated WhatsApp & SMS confirmation alerts, internal staff dashboard to view, reschedule, or manage customer appointments.
- Inclusions: Doctor/staff schedule management, cancellation policies, patient intake details, exportable appointment history.
- Ideal For: Healthcare clinics, dental practices, physiotherapy centers, wellness salons, diagnostic labs, and consulting firms.
- Delivery Timeline: 10 to 18 business days.`,
  },
  {
    id: 'service-whatsapp',
    category: 'service',
    title: 'WhatsApp Business Automation & Customer Workflows',
    tags: ['whatsapp', 'automation', 'bot', 'leads', 'greetings', 'instant reply', 'pipeline'],
    content: `WhatsApp Business Automation by BIZORA:
- Description: Automated customer communication workflows built around WhatsApp—the primary communication channel used by Indian consumers.
- Key Capabilities: Instant automated greeting messages within seconds (even outside business hours), structured lead intake collecting customer requirement, automated order confirmations, and smart routing to founder or staff.
- Business Benefit: Prevents customer drop-off when staff are busy serving in-store clients.
- Delivery Timeline: 5 to 10 business days for standalone automation; integrated into websites and catalogues as standard.`,
  },
  {
    id: 'service-ai-assistants',
    category: 'service',
    title: 'AI Business Assistants & Workflow Automation',
    tags: ['ai', 'assistant', 'chatbot', 'smart', 'faq', 'customer service', 'gemini'],
    content: `AI Business Assistants by BIZORA:
- Description: Custom conversational AI agents and intelligent customer advisors built on Google Gemini and modern LLM architecture.
- Key Capabilities: Natural customer enquiry handling, multi-turn dialogue memory, understanding business services, answering FAQs 24/7, and qualifying customer leads before handing off to human sales reps.
- Delivery Timeline: 2 to 4 weeks depending on internal workflows and knowledge ingestion needs.`,
  },
  {
    id: 'service-custom-software',
    category: 'service',
    title: 'Custom Software & Database Solutions',
    tags: ['custom software', 'software', 'database', 'postgres', 'portal', 'dashboard', 'spreadsheets'],
    content: `Custom Software Solutions by BIZORA:
- Description: Lightweight client management web portals, order tracking pipelines, and database dashboards that replace disorganized paper notebooks and Excel spreadsheets.
- Architecture: Built using standard modern frameworks (React, Node.js, PostgreSQL/Supabase) with full client data ownership.
- Delivery Timeline: 3 to 6 weeks based on architectural scope and milestones.`,
  },
  {
    id: 'pricing-policy',
    category: 'pricing',
    title: 'Pricing Philosophy & Quotation Process',
    tags: ['pricing', 'price', 'cost', 'charge', 'quote', 'package', 'discount', 'free'],
    content: `BIZORA Pricing Policy:
- Philosophy: We avoid generic, overpriced one-size-fits-all packages. Every business has unique scope, catalogue size, and workflow needs.
- Quotation Process: We conduct a Free 15-Minute Discovery Call to assess the exact requirements, timeline, and integrations.
- Transparent Quotation: Following discovery, we prepare a clear written quotation specifying exact deliverables, milestones, and payment terms with zero hidden fees.
- Customer Ownership: Unlike proprietary monthly SaaS builders that lock you in, customers own their code, domain, and database completely.
- Consultation Cost: The initial discovery consultation and requirements analysis with founder Shashank are 100% Free with zero sales pressure.
- Unverified Prices: The AI Assistant must never invent specific price numbers (e.g. "Rs 5,000" or "Rs 20,000") unless confirmed in a verified proposal, because pricing depends strictly on scope.`,
  },
  {
    id: 'timelines-delivery',
    category: 'timeline',
    title: 'Project Delivery Timelines & Milestones',
    tags: ['timeline', 'delivery', 'duration', 'how long', 'fast', 'milestones'],
    content: `Delivery Timelines:
- Business Website (5-10 pages): 7 to 14 working days.
- Digital Catalogue & Online Inventory: 7 to 14 working days.
- Clinic/Consultant Appointment Portal: 10 to 18 working days.
- Standalone WhatsApp Business Automation: 5 to 10 working days.
- Custom Software / Database Web Applications: 3 to 6 weeks.
- Workflow: Step 1 Requirement submission -> Step 2 Feasibility analysis -> Step 3 Discovery call -> Step 4 Written quotation -> Step 5 Iterative preview build -> Step 6 Final deployment and staff handover.`,
  },
  {
    id: 'contact-details',
    category: 'contact',
    title: 'Contact Information & Founder Hotline',
    tags: ['contact', 'phone', 'whatsapp', 'founder', 'shashank', 'location', 'office', 'bengaluru'],
    content: `Direct Contact Information:
- Founder & Principal Consultant: Shashank
- Phone Hotline: +91 8147827430
- WhatsApp Link: https://wa.me/918147827430
- Operational Hours: 9:30 AM – 7:30 PM IST (Monday through Saturday).
- Office Location: Bengaluru, Karnataka, India (Serving clients across all Indian states and union territories).
- Website Consultation Form: Available 24/7 on website via "Get Free Consultation" modal.`,
  },
  {
    id: 'data-privacy',
    category: 'technical',
    title: 'Data Privacy, Security & Database Storage',
    tags: ['privacy', 'security', 'database', 'supabase', 'postgres', 'gdpr', 'safety', 'storage'],
    content: `Data Security & Privacy at BIZORA:
- Database Storage: Customer enquiries and appointment submissions are stored securely in Supabase PostgreSQL database with Row Level Security (RLS) and fail-safe local persistence.
- Customer Privacy: Customer contact details are used solely to discuss the requested digital project. We do not sell data, spam customers, or disclose client lists publicly.
- Lead Protection: Every submission generates a unique tracking Reference ID (e.g., BIZ-2026-XXXX).`,
  },
];

/**
 * Perform keyword and semantic token matching over the knowledge base
 */
export function retrieveKnowledge(query: string, limit: number = 3): KnowledgeDocument[] {
  const normalized = query.toLowerCase();
  const queryTokens = normalized
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter((t) => t.length > 2);

  const scoredDocs = KNOWLEDGE_BASE.map((doc) => {
    let score = 0;

    // Check tags match
    for (const tag of doc.tags) {
      if (normalized.includes(tag.toLowerCase())) {
        score += 3;
      }
      for (const token of queryTokens) {
        if (tag.toLowerCase().includes(token)) {
          score += 2;
        }
      }
    }

    // Check title match
    const titleLower = doc.title.toLowerCase();
    for (const token of queryTokens) {
      if (titleLower.includes(token)) {
        score += 2.5;
      }
    }

    // Check content match
    const contentLower = doc.content.toLowerCase();
    for (const token of queryTokens) {
      if (contentLower.includes(token)) {
        score += 0.5;
      }
    }

    return { doc, score };
  });

  scoredDocs.sort((a, b) => b.score - a.score);

  // Return documents with score > 0, up to limit (minimum fallback to top doc if no direct token match)
  const matches = scoredDocs.filter((item) => item.score > 0).slice(0, limit);
  if (matches.length === 0) {
    return [KNOWLEDGE_BASE[0]]; // Default to BIZORA overview
  }
  return matches.map((m) => m.doc);
}
