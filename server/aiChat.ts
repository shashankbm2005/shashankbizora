import { GoogleGenAI } from '@google/genai';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

const SYSTEM_INSTRUCTION = `You are the official BIZORA AI Assistant, an intelligent, helpful, and courteous digital business advisor inspired by Google Assistant.
BIZORA is a digital transformation agency in Bengaluru, India. Tagline: "Making Every Business Digital."
Founder: Shashank (WhatsApp & Phone: +91 8147827430).

Your mission is to understand customer questions regarding going digital, explain BIZORA's capabilities, offer practical business advice, and guide them to schedule a free consultation or chat on WhatsApp.

Core Services Offered by BIZORA:
1. Business Website Development: High-speed, mobile-first websites with local Google SEO, sub-2s mobile loading, WhatsApp click-to-chat triggers, and responsive UI for Indian mobile shoppers (7-14 days delivery).
2. Digital Catalogues & Online Presence: Interactive product catalogues replacing heavy 40MB PDF files; customers can browse products, see specs, and order directly on WhatsApp.
3. Appointment & Enquiry Management: Web portals for doctors, clinics, salons, CA firms, and consultants with slot booking, SMS/WhatsApp confirmation, and zero missed calls.
4. WhatsApp Business Automation: Automated greetings, 24/7 enquiry intake, instant order updates, and customer routing.
5. AI Business Assistants: Custom conversational AI agents and intelligent customer support for websites and internal teams.
6. Custom Software Solutions: Lightweight client management web portals, order tracking, and PostgreSQL database dashboards replacing paper notebooks/spreadsheets.

Key Business Facts:
- Market: Small & medium businesses across India (retail shops, clinics, electronics stores, manufacturing suppliers, contractors, professional services).
- Database: All customer leads are securely stored in Supabase PostgreSQL database.
- Pricing Policy: Transparent, custom scoping based on exact requirements during a free discovery consultation call with founder Shashank. No vague or overpriced corporate packages.
- Founder Hotline: Shashank at +91 8147827430 (Calls & WhatsApp).

Tone & Persona:
- Helpful, sharp, polite, and realistic like Google Assistant.
- Structure answers with clean bullet points when explaining multiple features or steps.
- Suggest next actions (e.g. "Would you like me to guide you to our Free Consultation booking form, or connect with founder Shashank on WhatsApp?").
- If the user asks in Hindi/Hinglish or English, reply in natural, courteous English with warm Indian business etiquette.
- Keep responses concise (under 200 words unless in-depth explanation is requested).`;

// In-memory fallback answers if GEMINI_API_KEY is not set or network fails
function generateFallbackResponse(query: string): string {
  const q = query.toLowerCase();

  if (q.includes('website') || q.includes('web development') || q.includes('site')) {
    return `At BIZORA, we build high-speed, mobile-first **Business Websites** engineered specifically for Indian businesses. 

Here is what is included:
• **Sub-2-Second Loading:** Fast on 4G and 5G networks.
• **Google Search Visibility:** Local SEO optimization so nearby customers discover you.
• **WhatsApp Click-to-Chat:** Direct leads sent right to your phone.
• **Timeline:** Delivered in 7 to 14 business days.

Would you like to book a **Free Consultation** to discuss your website requirements?`;
  }

  if (q.includes('catalogue') || q.includes('catalog') || q.includes('product') || q.includes('inventory')) {
    return `Our **Interactive Digital Catalogues** replace slow 40MB PDF brochures that customers rarely read.

Key advantages:
• Clean mobile catalog with search and categories.
• Instant **"Enquire on WhatsApp for this Product"** button.
• Showcase specifications, variants, and product photos.

Perfect for retail stores, electronics distributors, hardware suppliers, and boutiques!`;
  }

  if (q.includes('appointment') || q.includes('booking') || q.includes('clinic') || q.includes('doctor')) {
    return `BIZORA's **Appointment & Enquiry Management** portals automate customer scheduling:

• **24/7 Self-Booking:** Patients and clients book available slots directly on mobile.
• **Zero Missed Enquiries:** Instant SMS and WhatsApp confirmation alerts.
• **Calendar Synchronization:** Your staff sees all upcoming bookings on an organized dashboard.

Ideal for clinics, wellness centers, CA firms, and consultants.`;
  }

  if (q.includes('whatsapp') || q.includes('automate') || q.includes('chat')) {
    return `We specialize in **WhatsApp Business Automation**:

• **Instant Greetings:** Greet customers within seconds, even after shop hours.
• **Automated Enquiry Intake:** Collect customer name, requirement, and preferred time.
• **Direct Lead Routing:** Send verified enquiries straight to your founder or sales team.

WhatsApp is where Indian customers love to do business!`;
  }

  if (q.includes('price') || q.includes('cost') || q.includes('charge') || q.includes('fee')) {
    return `At BIZORA, we believe in **transparent, honest scoping** rather than generic, overpriced packages.

Because every business requirement is unique (from a 5-page local business site to a custom database portal), we review your exact needs during a **Free 15-Minute Discovery Call** and provide a clear written quotation with zero hidden charges.

You can click **"Get a Free Consultation"** on this page or call founder Shashank directly at **+91 8147827430**!`;
  }

  if (q.includes('contact') || q.includes('phone') || q.includes('call') || q.includes('founder') || q.includes('shashank')) {
    return `You can connect directly with BIZORA founder **Shashank**:

• **Phone Call:** +91 8147827430
• **WhatsApp:** https://wa.me/918147827430
• **Location:** Bengaluru, Karnataka (Serving businesses Pan-India)

Feel free to call during business hours (9:30 AM – 7:30 PM IST) or send a WhatsApp message anytime!`;
  }

  return `Hello! I am your **BIZORA AI Assistant**, here to help your business go digital.

BIZORA helps Indian businesses with:
• **Professional Business Websites** (fast & mobile-first)
• **Interactive Digital Catalogues** (with 1-click WhatsApp orders)
• **Appointment Booking Portals** (clinics, consultants, firms)
• **WhatsApp Business Automations** & AI customer workflows
• **Lightweight Custom Software** & database dashboards

How can I assist your business today? Feel free to ask about our solutions or click **Get Free Consultation** to get started!`;
}

export async function handleAiChatQuery(
  userMessage: string,
  history: ChatMessage[] = []
): Promise<{ reply: string; isAiPowered: boolean }> {
  const apiKey = process.env.GEMINI_API_KEY?.trim();

  if (!apiKey || apiKey.includes('MY_GEMINI_API_KEY')) {
    console.log('[AI Assistant] GEMINI_API_KEY not configured. Using domain knowledge fallback.');
    return {
      reply: generateFallbackResponse(userMessage),
      isAiPowered: false,
    };
  }

  try {
    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    // Format conversation history for Gemini API
    const formattedContents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];

    // Add recent turns (limit to last 6 messages to stay fast and concise)
    const recentHistory = history.slice(-6);
    for (const msg of recentHistory) {
      formattedContents.push({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }],
      });
    }

    // Add current user prompt
    formattedContents.push({
      role: 'user',
      parts: [{ text: userMessage }],
    });

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: formattedContents,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.7,
        maxOutputTokens: 600,
      },
    });

    const replyText = response.text?.trim();
    if (replyText) {
      return {
        reply: replyText,
        isAiPowered: true,
      };
    }

    return {
      reply: generateFallbackResponse(userMessage),
      isAiPowered: false,
    };
  } catch (err: any) {
    console.error('[AI Assistant] Gemini API call error:', err.message);
    return {
      reply: generateFallbackResponse(userMessage),
      isAiPowered: false,
    };
  }
}
