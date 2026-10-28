import type { EnquirySubmissionData, ServiceType } from '../src/types/enquiry.ts';
import crypto from 'crypto';

const ALLOWED_SERVICES: ServiceType[] = [
  'website_dev',
  'digital_catalogue',
  'appointment_enquiry',
  'whatsapp_automation',
  'ai_assistant',
  'custom_software',
];

export interface ValidationResult {
  valid: boolean;
  errors: Record<string, string>;
  normalizedData?: EnquirySubmissionData;
}

export function normalizeAndValidatePhone(rawPhone: string): { valid: boolean; normalized: string; display: string } {
  if (!rawPhone || typeof rawPhone !== 'string') {
    return { valid: false, normalized: '', display: '' };
  }

  // Remove whitespace, dashes, parens, plus
  const cleaned = rawPhone.replace(/[\s\-\(\)\.]/g, '');

  // Check Indian formats
  let digits = cleaned;
  if (digits.startsWith('+')) {
    digits = digits.substring(1);
  }

  // If 10 digits starting with 6-9
  if (/^[6-9]\d{9}$/.test(digits)) {
    const fullNormalized = `91${digits}`;
    const display = `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`;
    return { valid: true, normalized: fullNormalized, display };
  }

  // If starts with 91 followed by 10 digits starting with 6-9
  if (/^91[6-9]\d{9}$/.test(digits)) {
    const localDigits = digits.substring(2);
    const display = `+91 ${localDigits.slice(0, 5)} ${localDigits.slice(5)}`;
    return { valid: true, normalized: digits, display };
  }

  // If starts with 0 followed by 10 digits starting with 6-9
  if (/^0[6-9]\d{9}$/.test(digits)) {
    const localDigits = digits.substring(1);
    const fullNormalized = `91${localDigits}`;
    const display = `+91 ${localDigits.slice(0, 5)} ${localDigits.slice(5)}`;
    return { valid: true, normalized: fullNormalized, display };
  }

  // International general validation (10 to 15 digits)
  if (/^\d{10,15}$/.test(digits)) {
    return { valid: true, normalized: digits, display: `+${digits}` };
  }

  return { valid: false, normalized: '', display: '' };
}

export function stripHtmlTags(raw: any): string {
  if (!raw || typeof raw !== 'string') return '';
  return raw
    .replace(/<[^>]*>/g, '')
    .replace(/[<>]/g, '')
    .trim();
}

export function validateEnquiryInput(body: any): ValidationResult {
  const errors: Record<string, string> = {};

  if (!body || typeof body !== 'object') {
    return { valid: false, errors: { form: 'Invalid request body.' } };
  }

  // 1. Customer Name (Sanitized)
  const customer_name = stripHtmlTags(body.customer_name);
  if (!customer_name) {
    errors.customer_name = 'Your name is required.';
  } else if (customer_name.length < 2) {
    errors.customer_name = 'Name must be at least 2 characters.';
  } else if (customer_name.length > 100) {
    errors.customer_name = 'Name must not exceed 100 characters.';
  }

  // 2. Business Name (Sanitized)
  const business_name = stripHtmlTags(body.business_name);
  if (!business_name) {
    errors.business_name = 'Business name is required.';
  } else if (business_name.length < 2) {
    errors.business_name = 'Business name must be at least 2 characters.';
  } else if (business_name.length > 120) {
    errors.business_name = 'Business name must not exceed 120 characters.';
  }

  // 3. Business Type / Industry (Sanitized)
  const business_type = stripHtmlTags(body.business_type);
  if (!business_type) {
    errors.business_type = 'Please select or enter your business type/industry.';
  } else if (business_type.length > 100) {
    errors.business_type = 'Business type must not exceed 100 characters.';
  }

  // 4. Phone Number
  const rawPhone = typeof body.phone === 'string' ? body.phone.trim() : '';
  const phoneValidation = normalizeAndValidatePhone(rawPhone);
  if (!rawPhone) {
    errors.phone = 'Phone number is required for WhatsApp or call contact.';
  } else if (!phoneValidation.valid) {
    errors.phone = 'Please enter a valid 10-digit mobile number (e.g. 9876543210).';
  }

  // 5. Email (Optional)
  const rawEmail = typeof body.email === 'string' ? body.email.trim() : '';
  if (rawEmail) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(rawEmail) || rawEmail.length > 150) {
      errors.email = 'Please provide a valid email address, or leave it blank.';
    }
  }

  // 6. City (Sanitized)
  const city = stripHtmlTags(body.city);
  if (!city) {
    errors.city = 'City or location is required.';
  } else if (city.length > 100) {
    errors.city = 'City must not exceed 100 characters.';
  }

  // 7. Requested Service
  const requested_service = body.requested_service as ServiceType;
  if (!requested_service || !ALLOWED_SERVICES.includes(requested_service)) {
    errors.requested_service = 'Please select one of the available digital services.';
  }

  // 8. Project Description / Business Problem (Sanitized)
  const project_description = stripHtmlTags(body.project_description);
  if (!project_description) {
    errors.project_description = 'Please describe your business problem or what you need.';
  } else if (project_description.length < 10) {
    errors.project_description = 'Please describe in a little more detail (at least 10 characters).';
  } else if (project_description.length > 3000) {
    errors.project_description = 'Description must not exceed 3000 characters.';
  }

  // 9. Budget Range (Optional, Sanitized)
  const budget_range = stripHtmlTags(body.budget_range);

  // 10. Preferred Contact Method
  const preferred_contact_method = body.preferred_contact_method === 'phone' ? 'phone' : 'whatsapp';

  // 11. Consent Checkbox (Mandatory)
  const consent = body.consent === true || body.consent === 'true';
  if (!consent) {
    errors.consent = 'You must agree to the privacy notice so BIZORA can respond to your enquiry.';
  }

  if (Object.keys(errors).length > 0) {
    return { valid: false, errors };
  }

  return {
    valid: true,
    errors: {},
    normalizedData: {
      customer_name,
      business_name,
      business_type,
      phone: phoneValidation.display, // Stored nicely formatted: +91 81478 27430
      email: rawEmail || undefined,
      city,
      requested_service,
      project_description,
      budget_range: budget_range || undefined,
      preferred_contact_method,
      consent: true,
    },
  };
}

export function generateReferenceId(): string {
  // Format: BIZ-XXXXXX (6 alphanumeric random uppercase chars)
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let rand = '';
  const bytes = crypto.randomBytes(6);
  for (let i = 0; i < 6; i++) {
    rand += chars[bytes[i] % chars.length];
  }
  return `BIZ-${rand}`;
}

// In-Memory Rate Limiter
interface RateBucket {
  count: number;
  resetAt: number;
}

const rateLimitBuckets = new Map<string, RateBucket>();

export function checkRateLimit(key: string, maxRequests: number, windowMs: number): { allowed: boolean; retryAfterSec?: number } {
  const now = Date.now();
  const bucket = rateLimitBuckets.get(key);

  if (!bucket || now > bucket.resetAt) {
    rateLimitBuckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true };
  }

  if (bucket.count >= maxRequests) {
    const retryAfterSec = Math.ceil((bucket.resetAt - now) / 1000);
    return { allowed: false, retryAfterSec };
  }

  bucket.count++;
  return { allowed: true };
}
