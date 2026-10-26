import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SESSIONS_DIR = path.resolve(__dirname, '../data/chat_sessions');
if (!fs.existsSync(SESSIONS_DIR)) {
  fs.mkdirSync(SESSIONS_DIR, { recursive: true });
}

export interface ChatMessageItem {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  suggestedAction?: 'consultation' | 'whatsapp' | 'call' | null;
  serviceId?: string;
}

export interface ExtractedCustomerContext {
  customerName?: string;
  businessName?: string;
  businessType?: string;
  city?: string;
  phone?: string;
  email?: string;
  requestedService?: string;
  budgetRange?: string;
  preferredContactMethod?: 'whatsapp' | 'phone';
  keyRequirements?: string[];
  lastTopic?: string;
  leadStage?: 'exploring' | 'needs_clarification' | 'ready_to_quote' | 'submitted';
  conversationSummary?: string;
}

export interface ChatSession {
  sessionId: string;
  conversationId: string;
  createdAt: string;
  updatedAt: string;
  messages: ChatMessageItem[];
  context: ExtractedCustomerContext;
}

export class ChatMemoryManager {
  private inMemoryCache: Map<string, ChatSession> = new Map();

  private getSessionPath(sessionId: string): string {
    // Sanitize sessionId to alphanumeric and dashes only for path traversal safety
    const safeId = sessionId.replace(/[^a-zA-Z0-9_-]/g, '').substring(0, 64);
    return path.join(SESSIONS_DIR, `${safeId}.json`);
  }

  public getOrCreateSession(sessionId?: string, conversationId?: string): ChatSession {
    const finalSessionId = sessionId && sessionId.trim() ? sessionId.trim() : `sess_${crypto.randomUUID()}`;
    const finalConvId = conversationId && conversationId.trim() ? conversationId.trim() : `conv_${crypto.randomUUID()}`;

    // 1. Check in-memory cache
    if (this.inMemoryCache.has(finalSessionId)) {
      const sess = this.inMemoryCache.get(finalSessionId)!;
      return sess;
    }

    // 2. Check disk persistence
    const filePath = this.getSessionPath(finalSessionId);
    if (fs.existsSync(filePath)) {
      try {
        const raw = fs.readFileSync(filePath, 'utf-8');
        const session: ChatSession = JSON.parse(raw);
        this.inMemoryCache.set(finalSessionId, session);
        return session;
      } catch (err) {
        console.warn('[ChatMemory] Error reading session file, resetting:', err);
      }
    }

    // 3. Create fresh session
    const now = new Date().toISOString();
    const newSession: ChatSession = {
      sessionId: finalSessionId,
      conversationId: finalConvId,
      createdAt: now,
      updatedAt: now,
      messages: [],
      context: {
        keyRequirements: [],
        leadStage: 'exploring',
      },
    };

    this.saveSession(newSession);
    return newSession;
  }

  public saveSession(session: ChatSession): void {
    session.updatedAt = new Date().toISOString();
    this.inMemoryCache.set(session.sessionId, session);

    try {
      const filePath = this.getSessionPath(session.sessionId);
      fs.writeFileSync(filePath, JSON.stringify(session, null, 2), 'utf-8');
    } catch (err) {
      console.error('[ChatMemory] Failed to persist session to disk:', err);
    }
  }

  public addMessage(
    sessionId: string,
    role: 'user' | 'assistant',
    content: string,
    suggestedAction?: 'consultation' | 'whatsapp' | 'call' | null,
    serviceId?: string
  ): ChatMessageItem {
    const session = this.getOrCreateSession(sessionId);

    const message: ChatMessageItem = {
      id: crypto.randomUUID(),
      role,
      content,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      suggestedAction,
      serviceId,
    };

    session.messages.push(message);

    // Keep reasonable history bounds (last 50 messages)
    if (session.messages.length > 50) {
      // Summarize older messages before trimming
      this.condenseOldMessages(session);
    }

    this.saveSession(session);
    return message;
  }

  public updateContext(sessionId: string, updates: Partial<ExtractedCustomerContext>): void {
    const session = this.getOrCreateSession(sessionId);
    session.context = {
      ...session.context,
      ...updates,
      keyRequirements: [
        ...(session.context.keyRequirements || []),
        ...(updates.keyRequirements || []),
      ],
    };
    this.saveSession(session);
  }

  public clearSession(sessionId: string): ChatSession {
    const freshSession = this.getOrCreateSession(sessionId);
    freshSession.messages = [];
    freshSession.context = {
      leadStage: 'exploring',
      keyRequirements: [],
    };
    freshSession.conversationId = `conv_${crypto.randomUUID()}`;
    this.saveSession(freshSession);
    return freshSession;
  }

  /**
   * For long conversations, compress older turns into a conversation summary
   */
  private condenseOldMessages(session: ChatSession): void {
    const overflowCount = session.messages.length - 30;
    if (overflowCount <= 0) return;

    const olderTurns = session.messages.slice(0, overflowCount);
    session.messages = session.messages.slice(overflowCount);

    const keyPoints = olderTurns
      .filter((m) => m.role === 'user')
      .map((m) => m.content.substring(0, 100))
      .join('; ');

    session.context.conversationSummary = `Earlier context: Customer discussed [${keyPoints}]. Current focus: ${session.context.lastTopic || 'General requirements'}.`;
  }
}

export const chatMemory = new ChatMemoryManager();
