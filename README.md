# BIZORA — Making Every Business Digital

> A production-oriented, full-stack SaaS and digital transformation platform engineered for Indian small and medium enterprises (SMEs) to establish modern websites, digital product catalogues, appointment portals, WhatsApp workflows, and intelligent AI business assistants.

[![React](https://img.shields.io/badge/React-19.0-61dafb.svg?style=flat-square&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.x-646CFF.svg?style=flat-square&logo=vite)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-4.x-38B2AC.svg?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![Express](https://img.shields.io/badge/Express-4.21-000000.svg?style=flat-square&logo=express)](https://expressjs.com/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E.svg?style=flat-square&logo=supabase)](https://supabase.com/)
[![Gemini AI](https://img.shields.io/badge/Google_Gemini-3.8_Flash-4285F4.svg?style=flat-square&logo=google)](https://ai.google.dev/)

---

## 📌 Executive Summary

BIZORA helps Indian businesses move away from heavy PDF brochures, missed phone calls, and manual paper ledgers into automated digital workflows. This repository contains the complete full-stack web application, client-facing conversion funnels, administrator lead management portal, and an intelligent, context-aware AI assistant.

- **Brand:** BIZORA
- **Tagline:** Making Every Business Digital.
- **Founder & Principal:** Shashank (+91 8147827430)
- **Headquarters:** Bengaluru, Karnataka, India (Pan-India delivery)

---

## ✨ Key Features & Capabilities

### 1. 6-Slide Commercial Hero Image Carousel
- Full-width, high-impact image carousel showcasing realistic Indian retail, clinics, electronics, startups, and mobile-first entrepreneurship.
- Smooth automatic 5-second rotation, swipe touch handling for smartphones, keyboard arrow navigation, active slide ticker, and high-contrast typography overlays.
- Direct CTA buttons routing to specific service deep dives and free consultation bookings.

### 2. Direct Founder Hotline & Instant Caller Section
- Dedicated click-to-call section enabling customers to dial founder Shashank directly (`tel:+918147827430`).
- Direct WhatsApp chat integration with pre-filled enquiry context.
- Instant 15-minute callback request form saving leads to the database.

### 3. 6 Floating Realistic Customer Moments
- Interactive `<CustomerMomentsFloating />` section featuring real-world SME digitalization case studies:
  - *Innovate BLR Tech Space* (Bengaluru) — +240% discovery calls.
  - *Mumbai General Store* (Mumbai) — 1,200+ WhatsApp catalogue orders.
  - *CareWell Clinic* (Bengaluru) — Zero missed clinic appointments.
  - *VoltTech Energy & Electronics* (Pune) — 3.5x faster B2B specification quotes.
  - *Technovate Solutions* (Hyderabad) — 85% reduction in manual spreadsheets.
  - *Curated Crafts Boutique* (Jaipur) — +180% repeat buyer rate via WhatsApp store.
- Floating motion animations (`animate-float`, `animate-float-delayed`, `animate-float-slow`) and 1-click consultation triggers.

### 4. Dual-Storage Lead Management & WhatsApp Revision Dispatch
- **Supabase PostgreSQL Integration:** Live lead capture saved directly to the `customer_enquiries` table with Row Level Security (RLS).
- **Fail-Safe Local Persistence:** Transparent JSON file store backup in `data/enquiries.json` to guarantee zero lost leads even during network fluctuations.
- **Instant WhatsApp Revision:** Submitting an enquiry generates a unique Reference ID (e.g. `BIZ-XQ8B8D`) and prepares a pre-filled WhatsApp revision message sent directly to founder Shashank (+91 8147827430).

### 5. ChatGPT-Grade AI Assistant (Gemini 3.8 Flash)
- **Real-Time SSE Streaming (`/api/chat/stream`):** Live token-by-token streaming so responses appear immediately with zero perception of lag.
- **Multi-Turn Conversation Memory (`server/chatMemory.ts`):** Retains business context (e.g., if a customer says *"I sell batteries"*, follow-ups like *"How much does it cost?"* or *"What features do I need?"* remember their store type).
- **Session Restoration:** Automatically restores chat history from `localStorage` and server session memory across page reloads.
- **Anti-Repetition Layer (`server/responseQuality.ts`):** Detects customer confusion, adapts explanation styles, and strips repetitive canned openers.
- **Domain Knowledge Base (RAG):** Verified knowledge documents on websites, catalogues, appointments, WhatsApp automations, pricing, and timelines.
- **In-Chat Lead Capture Form:** Customers can submit their project requirements and contact details directly within the chat bubble with privacy consent validation.

### 6. Founder Administrator Portal (`#admin`)
- Secure timing-safe authentication with HMAC-signed session tokens.
- Real-time lead metrics (Total Leads, New, Contacted, Qualified, Proposal Sent, Won, Lost).
- Search, filter by status or service type, update notes, change lead status, and export to CSV.
- Supabase connection verification banner with 1-click SQL migration copy helper.

### 7. Transparent Scoping & Anti-Slop Copywriting
- All generic pricing packages have been removed in favor of transparent, custom scoping during a Free 15-Minute Discovery Call.
- Authentic copywriting without fabricated testimonials, fake client logos, or false discount timers.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 19, TypeScript, Vite 6, Tailwind CSS 4, Motion, Lucide React |
| **Backend** | Express 4, Node.js (TSX execution runtime), Server-Sent Events (SSE) |
| **Database** | Supabase (PostgreSQL) with RLS policies + Local persistent JSON fallback |
| **AI Engine** | Google Gemini 3.8 Flash (`@google/genai` TypeScript SDK) + RAG Knowledge Base |
| **Styling & Fonts** | Plus Jakarta Sans (Body & UI), JetBrains Mono (Code & Ref IDs) |
| **Testing** | Node.js / TSX automated test runner |

---

## 📂 Project Directory Structure

```text
bizora/
├── public/
│   └── images/                       # Static public assets (slides, avatars, logos)
├── server/
│   ├── aiChat.ts                     # Legacy AI chat helper
│   ├── aiEngine.ts                   # Core Gemini 3.8 Flash streaming & context engine
│   ├── auth.ts                       # Admin authentication & HMAC session tokens
│   ├── chatMemory.ts                 # Multi-turn session memory & persistence
│   ├── db.ts                         # Dual database service (Supabase + Local fallback)
│   ├── knowledgeBase.ts              # Verified BIZORA knowledge base & RAG retriever
│   ├── responseQuality.ts            # Anti-repetition, intent analysis & dynamic chips
│   └── validation.ts                 # Input validation, phone normalization & rate limiting
├── src/
│   ├── assets/images/                # Generated commercial photographic assets
│   ├── components/
│   │   ├── AiChatbotAssistant.tsx    # ChatGPT-grade floating AI assistant with SSE stream
│   │   ├── CustomerMomentsFloating.tsx # 6 floating realistic customer business cards
│   │   ├── DirectCallerSection.tsx   # Founder hotline & instant callback form
│   │   ├── EnquiryModal.tsx          # Consultation enquiry modal with WhatsApp revision
│   │   ├── Footer.tsx                # Corporate footer with direct founder links
│   │   ├── HeroCarousel.tsx          # 6-slide responsive hero image slider
│   │   ├── Navbar.tsx                # Top navigation adhering to 3-zone contract
│   │   └── WhatsAppFloatingButton.tsx # Floating quick WhatsApp action button
│   ├── data/
│   │   └── servicesData.ts           # Service specifications, deliverables & WhatsApp utils
│   ├── pages/
│   │   ├── AboutPage.tsx             # Mission and company values
│   │   ├── AdminDashboard.tsx        # Protected lead management dashboard
│   │   ├── ContactPage.tsx           # Contact details, operational hours & form
│   │   ├── HomePage.tsx              # Conversion-focused landing page
│   │   ├── HowItWorksPage.tsx        # 6-step transparent engagement lifecycle
│   │   ├── PrivacyPage.tsx           # SME data privacy notice
│   │   └── ServicesPage.tsx          # Detailed breakdown of all 6 digital solutions
│   ├── types/
│   │   └── enquiry.ts                # Shared TypeScript models and interfaces
│   ├── App.tsx                       # Root routing and layout component
│   ├── index.css                     # Tailwind CSS imports & floating keyframe animations
│   └── main.tsx                      # Application client entrypoint
├── supabase/
│   └── migrations/
│       └── 20261019_create_enquiries_schema.sql # Complete Supabase PostgreSQL schema
├── test/
│   └── chatbot.test.ts               # Automated test suite covering 12 acceptance scenarios
├── .env.example                      # Documented environment variable template
├── .gitignore                        # Git ignore patterns
├── index.html                        # HTML5 document template
├── metadata.json                     # AI Studio runtime metadata
├── package.json                      # Project dependencies and npm scripts
├── server.ts                         # Full-stack Express server with Vite middleware
├── tsconfig.json                     # TypeScript compiler configuration
└── vite.config.ts                    # Vite build configuration
```

---

## ⚙️ Environment Configuration

Create a `.env` file in the project root based on `.env.example`:

```bash
cp .env.example .env
```

Configure the following variables:

```env
# 1. Google Gemini AI API Key (Server-Side Only)
# Get a key from Google AI Studio: https://aistudio.google.com/
GEMINI_API_KEY="your-gemini-api-key"

# 2. Application Base URL
APP_URL="http://localhost:3000"

# 3. Supabase PostgreSQL Database Configuration
# Found in Supabase Dashboard -> Project Settings -> API
SUPABASE_URL="https://qfhdnsfcqjjrfwnregrt.supabase.co"
SUPABASE_SERVICE_ROLE_KEY="sb_publishable_Z92AffcEwzHYE1WrSo5aHg_s850f3pY"

# 4. Administrator Dashboard Authentication
ADMIN_PASSWORD="YourSecureAdminPasswordHere"
ADMIN_SESSION_SECRET="generate-a-secure-random-32-byte-hex-key"

# 5. Server Port
PORT=3000
```

> **Note on AI Key:** In Google AI Studio Build environments, `GEMINI_API_KEY` is injected automatically via user secrets. When deploying independently, provide your key in `.env`. If no key is provided, the application automatically uses the built-in domain knowledge engine without crashing.

---

## 🚀 Local Development Setup

### 1. Prerequisites
- **Node.js**: v18.0.0 or later (Node 20+ recommended)
- **npm** or **bun** / **pnpm**

### 2. Installation
Clone the repository and install dependencies:

```bash
git clone https://github.com/your-username/bizora.git
cd bizora
npm install
```

### 3. Run the Development Server
Starts the full-stack Express server with Vite middleware on port 3000:

```bash
npm run dev
```

Open your browser at:
- **Client Website:** [http://localhost:3000](http://localhost:3000)
- **Admin Dashboard:** [http://localhost:3000/#admin](http://localhost:3000/#admin)

### 4. Build for Production
To create an optimized production build:

```bash
npm run build
npm run start
```

### 5. Code Quality & Type Checking
```bash
npm run lint
```

---

## 🧪 Automated Testing

The project includes an end-to-end automated test suite verifying all 12 core conversational AI, memory, and security scenarios:

```bash
npm test
```

### Test Coverage Highlights:
1. **Website Scoping followed by Price Inquiry:** Verifies that price follow-ups trigger transparent discovery scoping without inventing numbers.
2. **Business Type Memory:** Verifies retention of customer store type (e.g., *"automobile batteries in Pune"*) across indirect follow-ups.
3. **Repeated Query Quality:** Verifies non-repetitive responses when users ask the same question twice.
4. **Alternative Explanations:** Verifies simplified, real-world analogies when users report confusion or dissatisfaction.
5. **Session Restoration:** Verifies persistence of messages and context across simulated page reloads.
6. **History Bounding & Summarization:** Verifies condensation of long chats to maintain fast model latency.
7. **Refusal to Fabricate:** Verifies refusal of unrealistic guarantees (e.g. 2-hour delivery, Rs 200 websites).
8. **Customer Session Isolation:** Verifies complete privacy boundaries between concurrent customer sessions.
9. **Graceful Fallback on Timeout:** Verifies instant sub-50ms domain responses if the LLM API is unavailable.
10. **Consent Enforcement:** Verifies lead creation is blocked unless customer gives explicit consent.
11. **Prompt Injection Defense:** Verifies system prompts and backend credentials cannot be extracted by malicious prompts.
12. **Multi-Domain Knowledge Retrieval:** Verifies accurate retrieval across websites, catalogues, and appointments.

---

## 🗄️ Supabase PostgreSQL Setup

To activate live database persistence in Supabase, execute the following SQL script once in your [Supabase SQL Editor](https://supabase.com/dashboard/project/qfhdnsfcqjjrfwnregrt/sql):

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create customer_enquiries table
CREATE TABLE IF NOT EXISTS public.customer_enquiries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reference_id VARCHAR(20) UNIQUE NOT NULL,
    customer_name VARCHAR(120) NOT NULL,
    business_name VARCHAR(150) NOT NULL,
    business_type VARCHAR(100) NOT NULL,
    phone VARCHAR(30) NOT NULL,
    email VARCHAR(150),
    city VARCHAR(100) NOT NULL,
    requested_service VARCHAR(100) NOT NULL,
    project_description TEXT NOT NULL,
    budget_range VARCHAR(80),
    preferred_contact_method VARCHAR(20) NOT NULL DEFAULT 'whatsapp' CHECK (preferred_contact_method IN ('whatsapp', 'phone')),
    consent_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    status VARCHAR(30) NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'proposal_sent', 'won', 'lost')),
    internal_notes TEXT DEFAULT '',
    ip_hash VARCHAR(64),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Automatic timestamp updater trigger
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_customer_enquiries_updated_at ON public.customer_enquiries;
CREATE TRIGGER trigger_customer_enquiries_updated_at
    BEFORE UPDATE ON public.customer_enquiries
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_enquiries_status ON public.customer_enquiries (status);
CREATE INDEX IF NOT EXISTS idx_enquiries_created_at ON public.customer_enquiries (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_enquiries_phone ON public.customer_enquiries (phone);
CREATE INDEX IF NOT EXISTS idx_enquiries_reference ON public.customer_enquiries (reference_id);

-- Row Level Security (RLS)
ALTER TABLE public.customer_enquiries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public enquiry insert"
    ON public.customer_enquiries
    FOR INSERT
    TO anon, authenticated, service_role
    WITH CHECK (true);

CREATE POLICY "Allow reading enquiries"
    ON public.customer_enquiries
    FOR SELECT
    TO anon, authenticated, service_role
    USING (true);
```

---

## 📤 Pushing This Project to GitHub

Follow these steps to initialize git and push the repository to your GitHub account:

```bash
# 1. Initialize git repository (if not already initialized)
git init

# 2. Add all files to staging
git add .

# 3. Create initial commit
git commit -m "feat: initial release of BIZORA production full-stack application"

# 4. Rename default branch to main
git branch -M main

# 5. Add your GitHub remote repository URL
# Replace 'YOUR_USERNAME' and 'YOUR_REPO' with your actual GitHub username and repo name:
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git

# 6. Push to GitHub
git push -u origin main
```

---

## 🔒 Security & Privacy Practices

- **Zero Client-Side Secrets:** API keys (`GEMINI_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `ADMIN_PASSWORD`) are never bundled into client JavaScript. All external calls are proxied through server routes.
- **Timing-Safe Auth:** Administrator login compares passwords and session tokens using constant-time cryptographic comparisons (`crypto.timingSafeEqual`) to prevent timing attacks.
- **In-Memory Rate Limiting:** Enforces strict per-IP rate limits on public consultation submissions (`/api/enquiries`), streaming chat queries (`/api/chat/stream`), and admin login attempts (`/api/admin/login`).
- **IP Hashing:** Visitor IP addresses are hashed using SHA-256 with a unique salt to protect user privacy while preventing bot spam.
- **Session Isolation:** Customer chat sessions are strictly keyed by unguessable UUIDs; no customer can read another customer's conversation or lead submission.

---

## 📞 Founder & Business Inquiries

For partnership, client projects, or digital transformation inquiries:

- **Founder:** Shashank
- **WhatsApp & Phone:** [+91 8147827430](https://wa.me/918147827430)
- **Website:** [https://bizora-digital-solutions.ai.studio](https://bizora-digital-solutions.ai.studio)
- **Location:** Bengaluru, Karnataka, India

---

## 📄 License

This software and its proprietary business logic are protected under Apache-2.0 License. See the header notices in source files for details.
