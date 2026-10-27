import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import dotenv from 'dotenv';
import { dbService } from './server/db.ts';
import {
  generateSessionToken,
  requireAdminAuth,
  verifyAdminPassword,
  verifySessionToken,
} from './server/auth.ts';
import {
  checkRateLimit,
  generateReferenceId,
  normalizeAndValidatePhone,
  validateEnquiryInput,
} from './server/validation.ts';
import { executeAiChat, executeAiChatStream } from './server/aiEngine.ts';
import { chatMemory } from './server/chatMemory.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = parseInt(process.env.PORT || '3000', 10);
const FOUNDER_WHATSAPP = '918147827430';

async function bootstrap() {
  const app = express();

  // Trust proxy for IP rate limiting behind reverse proxies
  app.set('trust proxy', 1);

  // Universal CORS & Preflight handling for dev server, production preview, and iframe embeds
  app.use((req: Request, res: Response, next) => {
    const origin = req.headers.origin || '*';
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Max-Age', '86400');

    if (req.method === 'OPTIONS') {
      return res.status(204).end();
    }
    next();
  });

  // Security headers & JSON parsing
  app.use(express.json({ limit: '1mb' }));

  // Helper: IP hash to protect visitor privacy while preventing spam
  const getClientIpHash = (req: Request): string => {
    const rawIp = req.ip || req.socket.remoteAddress || 'unknown';
    return crypto.createHash('sha256').update(rawIp + 'bizora_salt').digest('hex').substring(0, 16);
  };

  // --- PUBLIC API ROUTES ---

  // Health & System status
  app.get('/api/system/status', (req: Request, res: Response) => {
    const dbStatus = dbService.getStatus();
    res.json({
      status: 'operational',
      startupName: 'BIZORA',
      tagline: 'Making Every Business Digital.',
      founderWhatsApp: FOUNDER_WHATSAPP,
      database: {
        type: dbStatus.isSupabaseConfigured ? 'supabase_postgres' : 'local_storage',
        configured: dbStatus.isSupabaseConfigured,
        projectId: dbStatus.projectId,
        tableExistsInSupabase: dbStatus.tableExistsInSupabase,
        hasError: Boolean(dbStatus.lastError),
        lastError: dbStatus.lastError,
      },
      timestamp: new Date().toISOString(),
    });
  });

  // Submit Free Consultation Enquiry
  app.post('/api/enquiries', async (req: Request, res: Response) => {
    const ipHash = getClientIpHash(req);

    // 1. Rate limiting: 30 enquiries per 10 minutes per IP
    const rateCheck = checkRateLimit(`enquiry_${ipHash}`, 30, 10 * 60 * 1000);
    if (!rateCheck.allowed) {
      return res.status(429).json({
        success: false,
        error: `Too many submissions from your connection. Please wait ${rateCheck.retryAfterSec || 60} seconds before submitting again, or contact us directly on WhatsApp.`,
        whatsappFallback: `https://wa.me/${FOUNDER_WHATSAPP}?text=${encodeURIComponent(
          'Hello BIZORA, I tried submitting an enquiry on your website and would like to discuss digital services directly.'
        )}`,
      });
    }

    // 2. Validate input fields
    const validation = validateEnquiryInput(req.body);
    if (!validation.valid || !validation.normalizedData) {
      return res.status(400).json({
        success: false,
        error: 'Please correct the validation errors in the form.',
        validationErrors: validation.errors,
      });
    }

    const { normalizedData } = validation;

    try {
      // 3. Prevent duplicate submission within 5 minutes for the same phone & service
      const isDuplicate = await dbService.checkRecentDuplicate(
        normalizedData.phone,
        normalizedData.requested_service
      );
      if (isDuplicate) {
        return res.status(409).json({
          success: false,
          error: 'An identical enquiry from this phone number was received in the last 5 minutes. We are already reviewing it and will reach out shortly.',
        });
      }

      // 4. Generate unique reference ID
      const referenceId = generateReferenceId();

      // 5. Save to Supabase (or fallback persistent database)
      const savedEnquiry = await dbService.createEnquiry(normalizedData, referenceId, ipHash);

      // 6. Respond with reference ID and comprehensive WhatsApp consultation revision link
      const serviceTitleMap: Record<string, string> = {
        website_dev: 'Business Website Development',
        digital_catalogue: 'Digital Catalogue & Online Presence',
        appointment_enquiry: 'Appointment & Enquiry Management',
        whatsapp_automation: 'WhatsApp Business Automation',
        ai_assistant: 'AI Business Assistants',
        custom_software: 'Custom Software Solution',
      };
      const serviceDisplay = serviceTitleMap[savedEnquiry.requested_service] || savedEnquiry.requested_service;

      const prefilledWhatsAppText = `*NEW BIZORA CONSULTATION SUBMISSION*
📋 *Ref ID:* ${savedEnquiry.reference_id}
👤 *Client Name:* ${savedEnquiry.customer_name}
🏢 *Business:* ${savedEnquiry.business_name} (${savedEnquiry.business_type})
📱 *Phone:* ${savedEnquiry.phone}
📍 *City:* ${savedEnquiry.city}
🛠 *Requested Service:* ${serviceDisplay}
💬 *Project Details:* ${savedEnquiry.project_description}
${savedEnquiry.budget_range ? `💰 *Budget:* ${savedEnquiry.budget_range}\n` : ''}📞 *Preferred Contact:* ${savedEnquiry.preferred_contact_method.toUpperCase()}

Please confirm this consultation and connect with me.`;

      const directWhatsAppUrl = `https://wa.me/${FOUNDER_WHATSAPP}?text=${encodeURIComponent(
        prefilledWhatsAppText
      )}`;

      const dbStatus = dbService.getStatus();

      return res.status(201).json({
        success: true,
        referenceId: savedEnquiry.reference_id,
        enquiryId: savedEnquiry.id,
        message: 'Your enquiry has been received successfully! Our founder will contact you on WhatsApp or phone within 24 hours.',
        directWhatsAppUrl,
        supabaseSaved: dbStatus.tableExistsInSupabase,
        supabaseProject: dbStatus.projectId,
        enquirySummary: {
          reference_id: savedEnquiry.reference_id,
          customer_name: savedEnquiry.customer_name,
          business_name: savedEnquiry.business_name,
          requested_service: serviceDisplay,
          phone: savedEnquiry.phone,
          city: savedEnquiry.city,
          project_description: savedEnquiry.project_description,
          preferred_contact_method: savedEnquiry.preferred_contact_method,
          created_at: savedEnquiry.created_at,
        },
      });
    } catch (err: any) {
      console.error('[API] Enquiry submission failure:', err.message);
      return res.status(500).json({
        success: false,
        error: err.message || 'Unable to store enquiry at this moment. Please reach out to us directly on WhatsApp.',
        whatsappFallback: `https://wa.me/${FOUNDER_WHATSAPP}?text=${encodeURIComponent(
          'Hello BIZORA, I encountered an issue submitting the enquiry form and would like to talk directly about digital services.'
        )}`,
      });
    }
  });

  // AI Assistant Chatbot API Route (Synchronous)
  app.post('/api/chat', async (req: Request, res: Response) => {
    const ipHash = getClientIpHash(req);

    // Rate limit: 30 queries per minute per IP
    const rateCheck = checkRateLimit(`chat_${ipHash}`, 30, 60 * 1000);
    if (!rateCheck.allowed) {
      return res.status(429).json({
        success: false,
        error: `Please slow down. You can send another question in ${rateCheck.retryAfterSec || 10} seconds.`,
      });
    }

    const { message, sessionId, conversationId } = req.body;

    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a message or question.',
      });
    }

    try {
      const chatResult = await executeAiChat(message.trim(), sessionId, conversationId);
      return res.json({
        success: true,
        ...chatResult,
        timestamp: new Date().toISOString(),
      });
    } catch (err: any) {
      console.error('[API] AI Chat route failure:', err.message);
      return res.status(500).json({
        success: false,
        error: 'Unable to process query at this moment. Please try again or chat with our founder on WhatsApp.',
      });
    }
  });

  // AI Assistant Chatbot API Route (Real-Time SSE Streaming)
  app.post('/api/chat/stream', async (req: Request, res: Response) => {
    const ipHash = getClientIpHash(req);

    const rateCheck = checkRateLimit(`chat_stream_${ipHash}`, 30, 60 * 1000);
    if (!rateCheck.allowed) {
      return res.status(429).json({
        success: false,
        error: `Please slow down. You can send another question in ${rateCheck.retryAfterSec || 10} seconds.`,
      });
    }

    const { message, sessionId, conversationId } = req.body;

    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a message or question.',
      });
    }

    // Set Server-Sent Events headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders?.();

    try {
      await executeAiChatStream(
        message.trim(),
        sessionId,
        conversationId,
        (token: string) => {
          res.write(`data: ${JSON.stringify({ token })}\n\n`);
        },
        (payload) => {
          res.write(`data: ${JSON.stringify({ done: true, ...payload })}\n\n`);
          res.end();
        }
      );
    } catch (err: any) {
      console.error('[API] AI Stream error:', err.message);
      res.write(`data: ${JSON.stringify({ error: 'Stream interrupted. Please try again.' })}\n\n`);
      res.end();
    }
  });

  // Restore Chat Session History
  app.get('/api/chat/session/:sessionId', (req: Request, res: Response) => {
    const { sessionId } = req.params;
    if (!sessionId) {
      return res.status(400).json({ success: false, error: 'sessionId required' });
    }

    const session = chatMemory.getOrCreateSession(sessionId);
    return res.json({
      success: true,
      sessionId: session.sessionId,
      conversationId: session.conversationId,
      messages: session.messages,
      context: session.context,
    });
  });

  // Clear / Reset Chat Session History (User Privacy Control)
  app.delete('/api/chat/session/:sessionId', (req: Request, res: Response) => {
    const { sessionId } = req.params;
    if (!sessionId) {
      return res.status(400).json({ success: false, error: 'sessionId required' });
    }

    const refreshed = chatMemory.clearSession(sessionId);
    return res.json({
      success: true,
      message: 'Chat history cleared successfully.',
      sessionId: refreshed.sessionId,
      conversationId: refreshed.conversationId,
    });
  });

  // Direct Lead Submission from Chatbot
  app.post('/api/chat/lead', async (req: Request, res: Response) => {
    const ipHash = getClientIpHash(req);

    const { customer_name, business_name, business_type, phone, city, requested_service, project_description, consent, sessionId } = req.body;

    const validation = validateEnquiryInput({
      customer_name,
      business_name,
      business_type: business_type || 'Retail/Commercial',
      phone,
      city: city || 'India',
      requested_service: requested_service || 'website_dev',
      project_description: project_description || 'Inquiry originated via BIZORA AI Assistant chat.',
      preferred_contact_method: 'whatsapp',
      consent: Boolean(consent),
    });

    if (!validation.valid || !validation.normalizedData) {
      return res.status(400).json({
        success: false,
        error: 'Please provide required contact details.',
        validationErrors: validation.errors,
      });
    }

    try {
      const referenceId = generateReferenceId();
      const savedEnquiry = await dbService.createEnquiry(validation.normalizedData, referenceId, ipHash);

      if (sessionId) {
        chatMemory.updateContext(sessionId, {
          customerName: savedEnquiry.customer_name,
          businessName: savedEnquiry.business_name,
          phone: savedEnquiry.phone,
          leadStage: 'submitted',
        });
      }

      const prefilledWhatsAppText = `*NEW BIZORA CHATBOT CONSULTATION*
📋 *Ref ID:* ${savedEnquiry.reference_id}
👤 *Client Name:* ${savedEnquiry.customer_name}
🏢 *Business:* ${savedEnquiry.business_name} (${savedEnquiry.business_type})
📱 *Phone:* ${savedEnquiry.phone}
📍 *City:* ${savedEnquiry.city}
🛠 *Requested Service:* ${savedEnquiry.requested_service}
💬 *Requirements:* ${savedEnquiry.project_description}

Please review my consultation and get back to me.`;

      const directWhatsAppUrl = `https://wa.me/${FOUNDER_WHATSAPP}?text=${encodeURIComponent(prefilledWhatsAppText)}`;

      return res.status(201).json({
        success: true,
        referenceId: savedEnquiry.reference_id,
        enquiryId: savedEnquiry.id,
        directWhatsAppUrl,
        message: 'Your requirements have been saved to our database! Our founder will reach out shortly.',
      });
    } catch (err: any) {
      console.error('[API] Chat lead submission error:', err.message);
      return res.status(500).json({
        success: false,
        error: 'Unable to save enquiry at this time.',
      });
    }
  });

  // --- ADMINISTRATOR API ROUTES ---

  // Admin login
  app.post('/api/admin/login', (req: Request, res: Response) => {
    const ipHash = getClientIpHash(req);

    // Rate limit: 5 login attempts per 5 minutes per IP
    const rateCheck = checkRateLimit(`admin_login_${ipHash}`, 5, 5 * 60 * 1000);
    if (!rateCheck.allowed) {
      return res.status(429).json({
        success: false,
        error: `Too many login attempts. Please wait ${rateCheck.retryAfterSec || 60} seconds before trying again.`,
      });
    }

    const { password } = req.body;
    if (!password || typeof password !== 'string') {
      return res.status(400).json({ success: false, error: 'Password is required.' });
    }

    const isValid = verifyAdminPassword(password);
    if (!isValid) {
      return res.status(401).json({
        success: false,
        error: 'Invalid administrator password. Access denied.',
      });
    }

    const token = generateSessionToken();
    return res.json({
      success: true,
      token,
      role: 'founder',
      expiresIn: '24 hours',
    });
  });

  // Verify Admin Session
  app.get('/api/admin/verify', requireAdminAuth, (req: Request, res: Response) => {
    res.json({
      success: true,
      authenticated: true,
      session: (req as any).adminSession,
    });
  });

  // Admin Stats (Computed from real records)
  app.get('/api/admin/stats', requireAdminAuth, async (req: Request, res: Response) => {
    try {
      const stats = await dbService.getStats();
      const dbStatus = dbService.getStatus();
      res.json({
        success: true,
        stats,
        database: {
          isSupabase: dbStatus.isSupabaseConfigured,
          supabaseUrl: dbStatus.supabaseUrl,
          projectId: dbStatus.projectId,
          tableExistsInSupabase: dbStatus.tableExistsInSupabase,
          lastError: dbStatus.lastError,
        },
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Admin Enquiries List
  app.get('/api/admin/enquiries', requireAdminAuth, async (req: Request, res: Response) => {
    try {
      const { q, status, service } = req.query;
      const enquiries = await dbService.getEnquiries({
        search: typeof q === 'string' ? q : undefined,
        status: typeof status === 'string' ? status : undefined,
        service: typeof service === 'string' ? service : undefined,
      });

      res.json({
        success: true,
        count: enquiries.length,
        enquiries,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Admin Enquiry Detail
  app.get('/api/admin/enquiries/:id', requireAdminAuth, async (req: Request, res: Response) => {
    try {
      const enquiry = await dbService.getEnquiryById(req.params.id);
      if (!enquiry) {
        return res.status(404).json({ success: false, error: 'Customer enquiry not found.' });
      }
      res.json({ success: true, enquiry });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Admin Update Enquiry (status and internal notes)
  app.patch('/api/admin/enquiries/:id', requireAdminAuth, async (req: Request, res: Response) => {
    const { status, internal_notes } = req.body;
    const allowedStatuses = ['new', 'contacted', 'qualified', 'proposal_sent', 'won', 'lost'];

    if (status !== undefined && !allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: `Invalid status. Must be one of: ${allowedStatuses.join(', ')}`,
      });
    }

    try {
      const updated = await dbService.updateEnquiry(req.params.id, {
        status,
        internal_notes: typeof internal_notes === 'string' ? internal_notes : undefined,
      });

      if (!updated) {
        return res.status(404).json({ success: false, error: 'Enquiry not found.' });
      }

      res.json({ success: true, enquiry: updated });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Admin Export CSV
  app.get('/api/admin/export', requireAdminAuth, async (req: Request, res: Response) => {
    try {
      const enquiries = await dbService.getEnquiries({});

      // CSV Header
      const headers = [
        'Reference ID',
        'Customer Name',
        'Business Name',
        'Business Type',
        'Phone',
        'Email',
        'City',
        'Requested Service',
        'Status',
        'Budget Range',
        'Preferred Contact',
        'Project Description',
        'Internal Notes',
        'Created At',
      ];

      // Sanitize fields against CSV formula injection
      const sanitizeCell = (val: any): string => {
        if (val === null || val === undefined) return '""';
        let str = String(val).replace(/"/g, '""');
        if (/^[=\+\-\@\t\r]/.test(str)) {
          str = `'${str}`; // Prefix with single quote to neutralize formula injection
        }
        return `"${str}"`;
      };

      const rows = enquiries.map((e) => [
        sanitizeCell(e.reference_id),
        sanitizeCell(e.customer_name),
        sanitizeCell(e.business_name),
        sanitizeCell(e.business_type),
        sanitizeCell(e.phone),
        sanitizeCell(e.email || ''),
        sanitizeCell(e.city),
        sanitizeCell(e.requested_service),
        sanitizeCell(e.status),
        sanitizeCell(e.budget_range || ''),
        sanitizeCell(e.preferred_contact_method),
        sanitizeCell(e.project_description),
        sanitizeCell(e.internal_notes || ''),
        sanitizeCell(e.created_at),
      ]);

      const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');

      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="bizora-enquiries-${new Date().toISOString().slice(0, 10)}.csv"`
      );
      res.send(csvContent);
    } catch (err: any) {
      res.status(500).json({ success: false, error: 'CSV export failed: ' + err.message });
    }
  });

  // --- VITE & STATIC FILES MOUNT ---
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const publicPath = path.resolve(__dirname, 'public');
    if (fs.existsSync(publicPath)) {
      app.use(express.static(publicPath));
    }
    const distPath = path.resolve(__dirname, 'dist');
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get('*', (req: Request, res: Response) => {
        res.sendFile(path.resolve(distPath, 'index.html'));
      });
    } else {
      // Fallback if dist doesn't exist yet
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: 'spa',
      });
      app.use(vite.middlewares);
    }
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[BIZORA] Server running on http://0.0.0.0:${PORT}`);
  });
}

bootstrap().catch((err) => {
  console.error('[BIZORA] Fatal server startup error:', err);
  process.exit(1);
});
