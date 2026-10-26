import { GoogleGenAI } from '@google/genai';
import { retrieveKnowledge, KnowledgeDocument } from './knowledgeBase.ts';
import { chatMemory, ChatSession, ChatMessageItem } from './chatMemory.ts';
import {
  analyzeUserIntent,
  sanitizeAssistantResponse,
  calculateSimilarity,
  generateSuggestedChips,
} from './responseQuality.ts';

export interface ChatResponsePayload {
  reply: string;
  sessionId: string;
  conversationId: string;
  suggestedAction?: 'consultation' | 'whatsapp' | 'call' | null;
  serviceId?: string;
  suggestedChips: string[];
  isAiPowered: boolean;
  contextSummary?: string;
}

/**
 * Build rich system prompt with retrieved knowledge, conversation goals, and anti-repetition rules.
 */
function buildSystemPrompt(
  session: ChatSession,
  retrievedDocs: KnowledgeDocument[],
  intentAnalysis: ReturnType<typeof analyzeUserIntent>
): string {
  const context = session.context;

  let prompt = `You are the official BIZORA AI Assistant, an expert digital business consultant inspired by ChatGPT and Google Assistant.
BIZORA is a digital transformation agency in Bengaluru, India. Tagline: "Making Every Business Digital." Founder: Shashank (+91 8147827430).

### VERIFIED BIZORA KNOWLEDGE BASE (Use these facts strictly; do NOT fabricate prices, timelines, or guarantees):
${retrievedDocs.map((d) => `[${d.title}]\n${d.content}`).join('\n\n')}

### CURRENT CUSTOMER MEMORY & CONTEXT:
- Session ID: ${session.sessionId}
${context.businessType ? `- Known Business Type: "${context.businessType}"` : '- Business Type: Not specified yet'}
${context.customerName ? `- Customer Name: "${context.customerName}"` : ''}
${context.city ? `- Location: "${context.city}"` : ''}
${context.lastTopic ? `- Active Project Topic: "${context.lastTopic}"` : ''}
${context.keyRequirements?.length ? `- Identified Requirements: ${context.keyRequirements.join(', ')}` : ''}
${context.conversationSummary ? `- Prior Summary: ${context.conversationSummary}` : ''}

### CONVERSATIONAL RULES (CRITICAL):
1. UNDERSTAND CONTEXT & FOLLOW-UPS:
   - When the user asks "How much does it cost?", "What about the second option?", "Explain differently", or "How do I get started?", look at the conversation history and known business type to answer that exact question.
   - Example: If the customer previously said they sell batteries or run a clinic, tailor your response to that exact business type without asking them again what shop they have!
2. NEVER REPEAT WORD-FOR-WORD:
   - Never start with the same canned greeting or intro ("At BIZORA, we build...") on consecutive messages.
   - If the user asks the same or similar question again, or says "you already told me that" or "explain differently", acknowledge that and provide a simpler explanation, concrete example, or actionable breakdown.
3. PRICING INQUIRIES:
   - BIZORA does not use generic packages because every business has different feature needs.
   - Never invent numbers (e.g. "Rs 15,000"). Explain that pricing is scoped during a Free 15-Minute Discovery Call with founder Shashank and confirmed in a clear written quotation with zero hidden charges.
4. COMMERCIAL INTENT & LEAD GUIDANCE:
   - Guide the customer toward a practical next step: booking a Free Consultation or chatting directly with founder Shashank on WhatsApp (+91 8147827430).
5. TONE:
   - Natural, professional, friendly, and crisp like ChatGPT.
   - Use bullet points when helpful. Keep responses concise (under 180 words unless in-depth details are requested).`;

  if (intentAnalysis.userRequestsAlternative) {
    prompt += `\n\nNOTE: The customer indicated your previous answer was unhelpful or repetitive. Provide a fresh, simplified perspective with a real-world example instead of repeating previous facts.`;
  }

  if (intentAnalysis.userExpressesConfusion) {
    prompt += `\n\nNOTE: The customer is confused. Explain in very simple, plain English without any technical jargon.`;
  }

  return prompt;
}

/**
 * Context-aware intelligent fallback generator when Gemini API key is missing or timing out.
 * Ensures the chatbot behaves naturally like ChatGPT with multi-turn memory even in fallback!
 */
export function generateContextAwareFallback(
  userQuery: string,
  session: ChatSession,
  retrievedDocs: KnowledgeDocument[],
  intentAnalysis: ReturnType<typeof analyzeUserIntent>
): string {
  const q = userQuery.toLowerCase().trim();
  const context = session.context;
  const recentTurns = session.messages.slice(-4);
  const lastAssistantMsg = recentTurns.filter((m) => m.role === 'assistant').pop()?.content || '';

  // 1. Check if user is sharing business type (e.g. "I sell batteries", "hardware shop", "dental clinic")
  const shopMatch = q.match(/(?:i sell|i run|my shop is|we sell|we are a|business is)\s+([a-zA-Z\s]+)/i);
  if (shopMatch || intentAnalysis.userSharesBusinessDetails) {
    const identified = shopMatch ? shopMatch[1].trim() : q;
    context.businessType = identified;
    session.context.businessType = identified;
    chatMemory.updateContext(session.sessionId, { businessType: identified });

    return `For a **${identified}**, here is how BIZORA can help you grow online:

• **Interactive Online Catalogue / Website:** Showcase your product models, brands, and specifications so local buyers find you on Google Search.
• **Instant WhatsApp Inquiries:** Customers can tap one button to ask about prices or stock directly on your WhatsApp.
• **Location & Directions:** Embedded Google Maps so walk-in customers find your shop easily.

Would you like customers to also request delivery or quotations through the website?`;
  }

  // 2. Follow-up: "How much?", "What is the cost?", "Price?"
  if (intentAnalysis.userAsksPriceFollowUp) {
    const businessContext = context.businessType ? `for your ${context.businessType}` : 'for your business';
    return `Because project scope varies based on what features you need (catalogue size, WhatsApp integration, or booking forms), we don't quote arbitrary fixed prices.

Here is our honest quotation process:
1. **Free 15-Minute Discovery:** We review your exact requirements with founder Shashank.
2. **Written Proposal:** We share a transparent quotation with guaranteed delivery timeline and zero hidden costs.
3. **Full Ownership:** You own your domain, code, and database completely.

Would you like to schedule a **Free Consultation** call, or would you prefer a quick chat with Shashank on WhatsApp (+91 8147827430)?`;
  }

  // 3. User says "you already told me that", "explain differently", "didn't help"
  if (intentAnalysis.userRequestsAlternative || intentAnalysis.userExpressesConfusion) {
    return `Understood! Let me put it more simply:

Think of BIZORA as your digital team. Instead of you spending hours answering the same price questions or losing customers when your phone is busy, we build a simple mobile link for your business.

Customers click the link on Google or WhatsApp, see your items or services, and send their order directly to your phone.

Would you like to see a real example or discuss your specific shop with founder Shashank?`;
  }

  // 4. Follow-up: "What about the second option?", "second option", "option 2"
  if (q.includes('second option') || q.includes('option 2') || q.includes('next one')) {
    return `The **Digital Catalogue** option is designed specifically for businesses with multiple products:

• Replaces heavy PDF brochures with an instant mobile catalogue.
• Every item has an **"Order / Enquire on WhatsApp"** button.
• Shows photos, model specifications, and stock status.
• Delivered in **7 to 14 business days**.

Would you like to discuss setting this up for your inventory?`;
  }

  // 5. User asks "How do I get started?" or "How to start?"
  if (q.includes('get started') || q.includes('how to start') || q.includes('what next')) {
    return `Getting started with BIZORA is straightforward:

1. **Submit Your Details:** Click **"Get a Free Consultation"** on this page or tell me your business name and city here.
2. **15-Min Discovery Call:** Founder Shashank will call or WhatsApp you to understand your exact requirements.
3. **Quotation & Kickoff:** You receive a transparent milestone plan and work begins!

Shall I open the consultation form for you now?`;
  }

  // 6. Timeline question
  if (q.includes('timeline') || q.includes('how long') || q.includes('days') || q.includes('delivery')) {
    return `Standard delivery timelines at BIZORA:
• **Business Websites (5-10 pages):** 7 to 14 working days
• **Digital Product Catalogues:** 7 to 14 working days
• **Clinic & Appointment Portals:** 10 to 18 working days
• **WhatsApp Business Automations:** 5 to 10 working days
• **Custom Software & Database Portals:** 3 to 6 weeks

We provide preview links during development so you can test everything before launch!`;
  }

  // 7. Founder contact question
  if (q.includes('founder') || q.includes('shashank') || q.includes('phone') || q.includes('contact') || q.includes('call')) {
    return `You can reach BIZORA founder **Shashank** directly:
• **Phone Hotline:** +91 8147827430
• **WhatsApp:** https://wa.me/918147827430
• **Office:** Bengaluru, Karnataka (Serving clients Pan-India)
• **Hours:** 9:30 AM – 7:30 PM IST (Mon–Sat)

Feel free to call directly or message on WhatsApp anytime!`;
  }

  // 8. General service questions with top retrieved knowledge
  if (retrievedDocs.length > 0 && retrievedDocs[0].id !== 'bizora-overview') {
    const topDoc = retrievedDocs[0];
    return `Regarding **${topDoc.title}**:

${topDoc.content.split('\n').slice(1, 6).join('\n')}

Would you like more details on this, or shall we arrange a free discovery call with our team?`;
  }

  // 9. Default contextual welcoming
  return `Hello! I am your **BIZORA AI Assistant**.

We help Indian businesses modernize their operations with:
• **High-speed Business Websites** (Google SEO & mobile-ready)
• **Digital Product Catalogues** (with 1-click WhatsApp orders)
• **Clinic & Appointment Portals** (automated patient scheduling)
• **WhatsApp Business Automation** (24/7 lead capture)

Tell me what type of business you run, and I will recommend the best solution for you!`;
}

/**
 * Handle synchronous AI Chat queries
 */
export async function executeAiChat(
  userQuery: string,
  sessionId?: string,
  conversationId?: string
): Promise<ChatResponsePayload> {
  const session = chatMemory.getOrCreateSession(sessionId, conversationId);
  const userMsg = chatMemory.addMessage(session.sessionId, 'user', userQuery);

  // Retrieve relevant knowledge
  const retrievedDocs = retrieveKnowledge(userQuery, 3);

  // Analyze intent & context
  const intentAnalysis = analyzeUserIntent(userQuery, session.messages);

  // Update session context if business type was mentioned
  if (intentAnalysis.extractedTopic) {
    session.context.lastTopic = intentAnalysis.extractedTopic;
    chatMemory.updateContext(session.sessionId, { lastTopic: intentAnalysis.extractedTopic });
  }

  const apiKey = process.env.GEMINI_API_KEY?.trim();
  const isKeyValid = apiKey && !apiKey.includes('MY_GEMINI_API_KEY');

  let generatedReply = '';
  let isAiPowered = false;

  if (isKeyValid) {
    try {
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      const systemPrompt = buildSystemPrompt(session, retrievedDocs, intentAnalysis);

      // Prepare conversation history (last 8 turns for tight latency)
      const contents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];

      const historyTurns = session.messages.slice(-8);
      for (const turn of historyTurns) {
        contents.push({
          role: turn.role === 'user' ? 'user' : 'model',
          parts: [{ text: turn.content }],
        });
      }

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents,
        config: {
          systemInstruction: systemPrompt,
          temperature: 0.6,
          maxOutputTokens: 500,
        },
      });

      const rawText = response.text?.trim();
      if (rawText) {
        generatedReply = rawText;
        isAiPowered = true;
      }
    } catch (err: any) {
      console.warn('[AIEngine] Gemini API error, using context fallback:', err.message);
    }
  }

  if (!generatedReply) {
    generatedReply = generateContextAwareFallback(userQuery, session, retrievedDocs, intentAnalysis);
    isAiPowered = false;
  }

  // Quality check: Prevent repeating identical text
  const previousAssistantMessages = session.messages
    .filter((m) => m.role === 'assistant')
    .map((m) => m.content);

  generatedReply = sanitizeAssistantResponse(generatedReply, previousAssistantMessages);

  // Check similarity against immediate previous assistant turn
  const lastAssistantMsg = previousAssistantMessages[previousAssistantMessages.length - 1];
  if (lastAssistantMsg && calculateSimilarity(generatedReply, lastAssistantMsg) > 0.75) {
    generatedReply = `As mentioned, for your ${session.context.businessType || 'business'}, the key next step is reviewing your exact deliverables with founder Shashank. Would you like me to open the Free Consultation form, or would you prefer a direct WhatsApp chat?`;
  }

  // Action detection
  const replyLower = generatedReply.toLowerCase();
  let suggestedAction: 'consultation' | 'whatsapp' | 'call' | null = null;
  let serviceTarget: string | undefined = session.context.lastTopic;

  if (replyLower.includes('consultation') || replyLower.includes('written quotation') || replyLower.includes('schedule a free')) {
    suggestedAction = 'consultation';
  } else if (replyLower.includes('whatsapp') || replyLower.includes('chat with founder')) {
    suggestedAction = 'whatsapp';
  } else if (replyLower.includes('call') || replyLower.includes('hotline')) {
    suggestedAction = 'call';
  }

  // Add assistant message to memory
  chatMemory.addMessage(session.sessionId, 'assistant', generatedReply, suggestedAction, serviceTarget);

  // Generate dynamic question chips
  const suggestedChips = generateSuggestedChips(userQuery, generatedReply, session.context.lastTopic);

  return {
    reply: generatedReply,
    sessionId: session.sessionId,
    conversationId: session.conversationId,
    suggestedAction,
    serviceId: serviceTarget,
    suggestedChips,
    isAiPowered,
    contextSummary: session.context.conversationSummary,
  };
}

/**
 * Handle streaming AI Chat queries via Server-Sent Events (SSE)
 */
export async function executeAiChatStream(
  userQuery: string,
  sessionId: string | undefined,
  conversationId: string | undefined,
  onToken: (token: string) => void,
  onComplete: (payload: ChatResponsePayload) => void
): Promise<void> {
  const session = chatMemory.getOrCreateSession(sessionId, conversationId);
  chatMemory.addMessage(session.sessionId, 'user', userQuery);

  const retrievedDocs = retrieveKnowledge(userQuery, 3);
  const intentAnalysis = analyzeUserIntent(userQuery, session.messages);

  if (intentAnalysis.extractedTopic) {
    session.context.lastTopic = intentAnalysis.extractedTopic;
    chatMemory.updateContext(session.sessionId, { lastTopic: intentAnalysis.extractedTopic });
  }

  const apiKey = process.env.GEMINI_API_KEY?.trim();
  const isKeyValid = apiKey && !apiKey.includes('MY_GEMINI_API_KEY');

  let accumulated = '';
  let isAiPowered = false;

  if (isKeyValid) {
    try {
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      const systemPrompt = buildSystemPrompt(session, retrievedDocs, intentAnalysis);

      const contents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];
      const historyTurns = session.messages.slice(-8);
      for (const turn of historyTurns) {
        contents.push({
          role: turn.role === 'user' ? 'user' : 'model',
          parts: [{ text: turn.content }],
        });
      }

      const stream = await ai.models.generateContentStream({
        model: 'gemini-3.8-flash',
        contents,
        config: {
          systemInstruction: systemPrompt,
          temperature: 0.6,
          maxOutputTokens: 500,
        },
      });

      for await (const chunk of stream) {
        const text = chunk.text;
        if (text) {
          accumulated += text;
          onToken(text);
        }
      }

      if (accumulated.trim()) {
        isAiPowered = true;
      }
    } catch (err: any) {
      console.warn('[AIEngine] Gemini stream error, falling back:', err.message);
    }
  }

  if (!accumulated.trim()) {
    accumulated = generateContextAwareFallback(userQuery, session, retrievedDocs, intentAnalysis);
    isAiPowered = false;

    // Emulate streaming for fallback so user gets immediate visual feedback
    const words = accumulated.split(' ');
    for (let i = 0; i < words.length; i++) {
      const piece = (i === 0 ? '' : ' ') + words[i];
      onToken(piece);
    }
  }

  // Quality check
  const previousAssistantMessages = session.messages
    .filter((m) => m.role === 'assistant')
    .map((m) => m.content);

  let finalReply = sanitizeAssistantResponse(accumulated, previousAssistantMessages);

  // Check similarity against immediate previous assistant turn
  const lastAssistantMsg = previousAssistantMessages[previousAssistantMessages.length - 1];
  if (lastAssistantMsg && calculateSimilarity(finalReply, lastAssistantMsg) > 0.75) {
    finalReply = `As mentioned, for your ${session.context.businessType || 'business'}, the key next step is reviewing your exact deliverables with founder Shashank. Would you like me to open the Free Consultation form, or would you prefer a direct WhatsApp chat?`;
  }

  const replyLower = finalReply.toLowerCase();
  let suggestedAction: 'consultation' | 'whatsapp' | 'call' | null = null;
  let serviceTarget: string | undefined = session.context.lastTopic;

  if (replyLower.includes('consultation') || replyLower.includes('written quotation') || replyLower.includes('schedule a free')) {
    suggestedAction = 'consultation';
  } else if (replyLower.includes('whatsapp') || replyLower.includes('chat with founder')) {
    suggestedAction = 'whatsapp';
  } else if (replyLower.includes('call') || replyLower.includes('hotline')) {
    suggestedAction = 'call';
  }

  chatMemory.addMessage(session.sessionId, 'assistant', finalReply, suggestedAction, serviceTarget);
  const suggestedChips = generateSuggestedChips(userQuery, finalReply, session.context.lastTopic);

  onComplete({
    reply: finalReply,
    sessionId: session.sessionId,
    conversationId: session.conversationId,
    suggestedAction,
    serviceId: serviceTarget,
    suggestedChips,
    isAiPowered,
    contextSummary: session.context.conversationSummary,
  });
}

