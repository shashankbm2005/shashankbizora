/**
 * BIZORA Response Quality & Anti-Repetition Layer
 * Ensures natural, non-repetitive, context-aware conversational behavior.
 */

export interface QualityAnalysis {
  isRepetitive: boolean;
  userExpressesConfusion: boolean;
  userRequestsAlternative: boolean;
  userAsksPriceFollowUp: boolean;
  userSharesBusinessDetails: boolean;
  extractedTopic?: string;
}

export function analyzeUserIntent(
  userQuery: string,
  recentMessages: Array<{ role: 'user' | 'assistant'; content: string }>
): QualityAnalysis {
  const q = userQuery.toLowerCase().trim();

  // 1. Confusion or dissatisfaction detection
  const confusionTriggers = [
    'i don\'t understand',
    'dont understand',
    'confused',
    'what do you mean',
    'simplify',
    'simple terms',
    'in english please',
  ];
  const userExpressesConfusion = confusionTriggers.some((t) => q.includes(t));

  // 2. Repetition complaint or alternative request
  const alternativeTriggers = [
    'already told me',
    'already said',
    'you repeated',
    'same thing',
    'explain differently',
    'different way',
    'give me another',
    'what else',
    'did not solve',
    'didn\'t solve',
    'not helpful',
    'unhelpful',
  ];
  const userRequestsAlternative = alternativeTriggers.some((t) => q.includes(t));

  // 3. Follow-up price / cost question
  const priceTriggers = [
    'how much',
    'what is the price',
    'what is the cost',
    'pricing',
    'how much does it cost',
    'how much for this',
    'charges',
    'rate',
    'approximate cost',
    'quote',
  ];
  const userAsksPriceFollowUp = priceTriggers.some((t) => q === t || q.startsWith(t) || q.includes(t));

  // 4. Sharing business details (e.g., "I sell batteries", "I run a clinic", "My shop is in Pune")
  const businessTypeTriggers = [
    'i sell',
    'i run',
    'my business is',
    'my shop is',
    'we are a',
    'we have a',
    'battery shop',
    'clinic',
    'doctor',
    'hardware',
    'retail',
    'supermarket',
    'restaurant',
    'manufacturing',
  ];
  const userSharesBusinessDetails = businessTypeTriggers.some((t) => q.includes(t));

  // 5. Extract topic
  let extractedTopic: string | undefined = undefined;
  if (q.includes('website') || q.includes('web development')) extractedTopic = 'website_dev';
  else if (q.includes('catalogue') || q.includes('catalog') || q.includes('product')) extractedTopic = 'digital_catalogue';
  else if (q.includes('appointment') || q.includes('booking') || q.includes('clinic')) extractedTopic = 'appointment_enquiry';
  else if (q.includes('whatsapp') || q.includes('automation')) extractedTopic = 'whatsapp_automation';
  else if (q.includes('software') || q.includes('dashboard')) extractedTopic = 'custom_software';

  return {
    isRepetitive: false,
    userExpressesConfusion,
    userRequestsAlternative,
    userAsksPriceFollowUp,
    userSharesBusinessDetails,
    extractedTopic,
  };
}

/**
 * Strips boilerplate repetitive intros from subsequent assistant turns.
 * e.g., prevents saying "At BIZORA, we build..." on every turn.
 */
export function sanitizeAssistantResponse(
  rawResponse: string,
  recentAssistantMessages: string[]
): string {
  let cleaned = rawResponse.trim();

  // If there have already been assistant messages, avoid repeating standard canned openers
  if (recentAssistantMessages.length > 0) {
    const repetitiveOpeners = [
      /^At BIZORA, we build high-speed, mobile-first \*\*Business Websites\*\* engineered specifically for Indian businesses\.\s*/i,
      /^Hello! I am your \*\*BIZORA AI Assistant\*\*, here to help your business go digital\.\s*/i,
      /^BIZORA is a digital transformation agency in Bengaluru, India\.\s*/i,
    ];

    for (const pattern of repetitiveOpeners) {
      if (pattern.test(cleaned)) {
        cleaned = cleaned.replace(pattern, '');
      }
    }
  }

  return cleaned.trim();
}

/**
 * Calculate Jaccard word similarity between two texts to avoid repeating the exact same message
 */
export function calculateSimilarity(textA: string, textB: string): number {
  const setA = new Set(textA.toLowerCase().split(/\W+/).filter((w) => w.length > 2));
  const setB = new Set(textB.toLowerCase().split(/\W+/).filter((w) => w.length > 2));

  if (setA.size === 0 || setB.size === 0) return 0;

  let intersection = 0;
  for (const word of setA) {
    if (setB.has(word)) intersection++;
  }

  const union = new Set([...setA, ...setB]).size;
  return intersection / union;
}

/**
 * Generate smart, topic-aware suggested question chips
 */
export function generateSuggestedChips(
  lastUserQuery: string,
  lastAssistantReply: string,
  contextTopic?: string
): string[] {
  const combined = `${lastUserQuery} ${lastAssistantReply} ${contextTopic || ''}`.toLowerCase();

  if (combined.includes('website') || combined.includes('web development')) {
    return [
      '💰 How is website pricing decided?',
      '⏱️ How long does a business website take to build?',
      '📱 Can you add direct WhatsApp leads to my site?',
      '📋 Schedule a free discovery call',
    ];
  }

  if (combined.includes('catalogue') || combined.includes('product') || combined.includes('battery')) {
    return [
      '🛒 How do customers order from the catalogue?',
      '💰 How much does a digital catalogue cost?',
      '📱 Can customers message me on WhatsApp directly?',
      '📋 Plan a catalogue for my shop',
    ];
  }

  if (combined.includes('appointment') || combined.includes('clinic') || combined.includes('doctor')) {
    return [
      '📅 How do patients pick their appointment slot?',
      '🔔 Does it send automated WhatsApp confirmations?',
      '💻 Can my receptionist view the daily calendar?',
      '📋 Book a consultation for our clinic',
    ];
  }

  if (combined.includes('price') || combined.includes('cost') || combined.includes('quote')) {
    return [
      '📋 How do I get a written quotation for my project?',
      '📞 Can I talk directly with founder Shashank?',
      '⏱️ What is the delivery timeline?',
      '💬 Chat on WhatsApp (+91 8147827430)',
    ];
  }

  // Default dynamic mix
  return [
    '🌐 How can a website help my business get customers?',
    '📱 How does the WhatsApp digital catalogue work?',
    '💰 How does BIZORA quotation work?',
    '📞 Speak with founder Shashank',
  ];
}
