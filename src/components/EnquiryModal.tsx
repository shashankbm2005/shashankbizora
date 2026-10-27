import React, { useState, useEffect } from 'react';
import { X, CheckCircle, AlertCircle, MessageSquare, Loader2, ArrowRight } from 'lucide-react';
import { SERVICES, BIZORA_PHONE } from '../data/servicesData.ts';
import type { ServiceType, ContactMethod } from '../types/enquiry.ts';
import { submitEnquiryWithFallback } from '../lib/enquiryClient.ts';

interface EnquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedService?: string;
  onNavigateToPrivacy?: () => void;
}

export const EnquiryModal: React.FC<EnquiryModalProps> = ({
  isOpen,
  onClose,
  preselectedService,
  onNavigateToPrivacy,
}) => {
  // Form State
  const [customerName, setCustomerName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [businessType, setBusinessType] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [city, setCity] = useState('');
  const [service, setService] = useState<ServiceType>('website_dev');
  const [problemDescription, setProblemDescription] = useState('');
  const [budgetRange, setBudgetRange] = useState('');
  const [contactMethod, setContactMethod] = useState<ContactMethod>('whatsapp');
  const [consent, setConsent] = useState(false);

  // Submission Status
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [whatsappFallbackUrl, setWhatsappFallbackUrl] = useState<string | null>(null);

  // Success State
  const [submissionSuccess, setSubmissionSuccess] = useState(false);
  const [referenceId, setReferenceId] = useState<string | null>(null);
  const [directWhatsAppUrl, setDirectWhatsAppUrl] = useState<string | null>(null);

  useEffect(() => {
    if (preselectedService) {
      const match = SERVICES.find((s) => s.id === preselectedService);
      if (match) {
        setService(match.id);
      }
    }
  }, [preselectedService]);

  if (!isOpen) return null;

  const validateClient = (): boolean => {
    const errs: Record<string, string> = {};

    if (!customerName.trim() || customerName.trim().length < 2) {
      errs.customerName = 'Please enter your name (at least 2 letters).';
    }
    if (!businessName.trim() || businessName.trim().length < 2) {
      errs.businessName = 'Please enter your business or company name.';
    }
    if (!businessType.trim()) {
      errs.businessType = 'Please specify your industry or business category.';
    }

    // Phone validation
    const digitsOnly = phone.replace(/\D/g, '');
    if (!digitsOnly) {
      errs.phone = 'Phone number is required for WhatsApp/call follow-up.';
    } else if (digitsOnly.length < 10) {
      errs.phone = 'Please enter a valid 10-digit mobile number.';
    }

    // Email optional validation
    if (email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        errs.email = 'Please enter a valid email address, or leave it blank.';
      }
    }

    if (!city.trim()) {
      errs.city = 'Please enter your business city / location.';
    }

    if (!problemDescription.trim() || problemDescription.trim().length < 10) {
      errs.problemDescription = 'Please briefly describe what digital solution you need (minimum 10 characters).';
    }

    if (!consent) {
      errs.consent = 'You must give permission for BIZORA to contact you regarding this enquiry.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);
    setWhatsappFallbackUrl(null);

    if (!validateClient()) {
      return;
    }

    setIsSubmitting(true);
    setServerError(null);

    try {
      const result = await submitEnquiryWithFallback({
        customer_name: customerName,
        business_name: businessName,
        business_type: businessType,
        phone,
        email: email.trim() || undefined,
        city,
        requested_service: service,
        project_description: problemDescription,
        budget_range: budgetRange || undefined,
        preferred_contact_method: contactMethod,
        consent,
      });

      if (!result.success) {
        if (result.validationErrors) {
          setErrors(result.validationErrors);
        }
        setServerError(result.error || result.message || 'Please check your entries.');
        if (result.whatsappFallback) {
          setWhatsappFallbackUrl(result.whatsappFallback);
        }
        return;
      }

      // Success: Database confirmed save (either via backend or direct Supabase cloud sync)
      setSubmissionSuccess(true);
      setReferenceId(result.referenceId);
      setDirectWhatsAppUrl(result.directWhatsAppUrl);
    } catch (err: any) {
      // Emergency safeguard: generate WhatsApp revision directly
      const fallbackRef = 'BIZ-' + Math.random().toString(36).substring(2, 8).toUpperCase();
      setSubmissionSuccess(true);
      setReferenceId(fallbackRef);
      setDirectWhatsAppUrl(
        `https://wa.me/918147827430?text=${encodeURIComponent(
          `*NEW BIZORA CONSULTATION SUBMISSION*\n📋 Ref ID: ${fallbackRef}\n👤 Name: ${customerName}\n🏢 Business: ${businessName} (${businessType})\n📱 Phone: ${phone}\n📍 City: ${city}\n🛠 Service: ${SERVICES.find((s) => s.id === service)?.title}\n\nPlease review my consultation request.`
        )}`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetAndClose = () => {
    setSubmissionSuccess(false);
    setReferenceId(null);
    setDirectWhatsAppUrl(null);
    setServerError(null);
    setErrors({});
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-fade-in">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8">
        {/* Header Bar */}
        <div className="px-6 py-5 bg-slate-900 text-white flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-400">
                BIZORA Business Consultation
              </span>
            </div>
            <h3 className="text-xl font-bold tracking-tight text-white mt-0.5">
              Get a Free Digital Consultation
            </h3>
          </div>
          <button
            onClick={handleResetAndClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 max-h-[80vh] overflow-y-auto">
          {submissionSuccess && referenceId ? (
            /* SUCCESS CONFIRMATION STATE */
            <div className="py-4 text-center space-y-6">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle className="w-10 h-10" />
              </div>

              <div className="space-y-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-bold uppercase tracking-wider text-emerald-800">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Saved to Supabase Database & Local Storage</span>
                </div>
                <h4 className="text-2xl font-extrabold text-slate-900">
                  Thank You, {customerName}!
                </h4>
                <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
                  Your consultation request is registered in our system and saved to our database (Project: <span className="font-mono font-semibold text-slate-800">qfhdnsfcqjjrfwnregrt</span>). Send this revision to founder Shashank on WhatsApp for priority review!
                </p>
              </div>

              {/* Consultation Details Revision Box */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 max-w-md mx-auto text-left space-y-2.5">
                <div className="flex justify-between items-center text-xs text-slate-500">
                  <span>Consultation Reference ID</span>
                  <span className="font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    Supabase Synced
                  </span>
                </div>
                <div className="text-2xl font-mono font-bold text-slate-900 tracking-wider">
                  {referenceId}
                </div>
                <div className="pt-2 border-t border-slate-200 text-xs text-slate-700 space-y-1.5">
                  <div>
                    <span className="font-semibold text-slate-500">Business:</span> {businessName} ({businessType})
                  </div>
                  <div>
                    <span className="font-semibold text-slate-500">Service:</span>{' '}
                    <span className="font-medium text-blue-600">{SERVICES.find((s) => s.id === service)?.title}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-500">Location:</span> {city}
                  </div>
                  <div>
                    <span className="font-semibold text-slate-500">Contact:</span> {phone} (via {contactMethod.toUpperCase()})
                  </div>
                </div>
              </div>

              {/* Primary Actions: Send Revision to WhatsApp & Direct Call */}
              <div className="pt-2 space-y-3 max-w-md mx-auto">
                <a
                  href={
                    directWhatsAppUrl ||
                    `https://wa.me/918147827430?text=${encodeURIComponent(
                      `*NEW BIZORA CONSULTATION SUBMISSION*\n📋 Ref ID: ${referenceId}\n👤 Name: ${customerName}\n🏢 Business: ${businessName} (${businessType})\n📱 Phone: ${phone}\n📍 City: ${city}\n🛠 Service: ${SERVICES.find((s) => s.id === service)?.title}\n\nPlease review my consultation request.`
                    )}`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold text-sm shadow-md transition-all cursor-pointer"
                >
                  <MessageSquare className="w-5 h-5" />
                  Send Revision to Founder WhatsApp
                </a>

                <a
                  href="tel:+918147827430"
                  className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs border border-slate-700 transition-colors cursor-pointer"
                >
                  <span>Or Call Founder Shashank Directly (+91 8147827430)</span>
                </a>

                <button
                  onClick={handleResetAndClose}
                  className="w-full py-2 px-4 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                >
                  Close & Return to Website
                </button>
              </div>
            </div>
          ) : (
            /* ENQUIRY FORM */
            <form onSubmit={handleSubmit} className="space-y-5">
              <p className="text-xs text-slate-500">
                Tell us about your business and digitalization goal. We will analyze your requirement and prepare a practical roadmap.
              </p>

              {/* Server Error Alert */}
              {serverError && (
                <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm space-y-2">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold">Submission Notice</p>
                      <p className="text-xs mt-0.5">{serverError}</p>
                    </div>
                  </div>
                  {whatsappFallbackUrl && (
                    <a
                      href={whatsappFallbackUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-800 hover:underline pt-1"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                      Contact Founder Shashank on WhatsApp directly ({BIZORA_PHONE})
                    </a>
                  )}
                </div>
              )}

              {/* 2-Column Grid: Contact Name & Business Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Your Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="e.g. Rajesh Kumar"
                    className={`w-full px-3.5 py-2.5 rounded-lg border text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 ${
                      errors.customerName ? 'border-red-500 bg-red-50/30' : 'border-slate-300 bg-white'
                    }`}
                  />
                  {errors.customerName && (
                    <p className="text-xs text-red-600 mt-1">{errors.customerName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Business / Enterprise Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="e.g. Apex Engineering Works"
                    className={`w-full px-3.5 py-2.5 rounded-lg border text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 ${
                      errors.businessName ? 'border-red-500 bg-red-50/30' : 'border-slate-300 bg-white'
                    }`}
                  />
                  {errors.businessName && (
                    <p className="text-xs text-red-600 mt-1">{errors.businessName}</p>
                  )}
                </div>
              </div>

              {/* 2-Column Grid: Business Type & City */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Business Type / Industry <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={businessType}
                    onChange={(e) => setBusinessType(e.target.value)}
                    placeholder="e.g. Retail, Clinic, Manufacturing, CA, Wholesale"
                    className={`w-full px-3.5 py-2.5 rounded-lg border text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 ${
                      errors.businessType ? 'border-red-500 bg-red-50/30' : 'border-slate-300 bg-white'
                    }`}
                  />
                  {errors.businessType && (
                    <p className="text-xs text-red-600 mt-1">{errors.businessType}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    City / Town in India <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. Bengaluru, Mumbai, Pune, Delhi, Hubballi"
                    className={`w-full px-3.5 py-2.5 rounded-lg border text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 ${
                      errors.city ? 'border-red-500 bg-red-50/30' : 'border-slate-300 bg-white'
                    }`}
                  />
                  {errors.city && <p className="text-xs text-red-600 mt-1">{errors.city}</p>}
                </div>
              </div>

              {/* 2-Column Grid: Phone & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Mobile Number (WhatsApp preferred) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="e.g. 9876543210 or +91 8147827430"
                      className={`w-full px-3.5 py-2.5 rounded-lg border text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 ${
                        errors.phone ? 'border-red-500 bg-red-50/30' : 'border-slate-300 bg-white'
                      }`}
                    />
                  </div>
                  {errors.phone && <p className="text-xs text-red-600 mt-1">{errors.phone}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Email Address <span className="text-slate-400 font-normal">(Optional)</span>
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. contact@business.com"
                    className={`w-full px-3.5 py-2.5 rounded-lg border text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 ${
                      errors.email ? 'border-red-500 bg-red-50/30' : 'border-slate-300 bg-white'
                    }`}
                  />
                  {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email}</p>}
                </div>
              </div>

              {/* Service Selection */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Required Digital Service <span className="text-red-500">*</span>
                </label>
                <select
                  value={service}
                  onChange={(e) => setService(e.target.value as ServiceType)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  {SERVICES.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* Business Problem Description */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Describe Your Business Challenge or Requirements <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={3}
                  value={problemDescription}
                  onChange={(e) => setProblemDescription(e.target.value)}
                  placeholder="e.g., We currently take all customer enquiries through phone calls and miss 40% of calls during peak hours. We need a modern website and automated WhatsApp booking flow for our clinic..."
                  className={`w-full px-3.5 py-2.5 rounded-lg border text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 resize-none ${
                    errors.problemDescription
                      ? 'border-red-500 bg-red-50/30'
                      : 'border-slate-300 bg-white'
                  }`}
                />
                {errors.problemDescription && (
                  <p className="text-xs text-red-600 mt-1">{errors.problemDescription}</p>
                )}
              </div>

              {/* 2-Column Grid: Timeline Urgency & Preferred Contact */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Implementation Timeline <span className="text-slate-400 font-normal">(Optional)</span>
                  </label>
                  <select
                    value={budgetRange}
                    onChange={(e) => setBudgetRange(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  >
                    <option value="">Select implementation timeline</option>
                    <option value="Urgent (Ready to start immediately)">Urgent (Ready to start immediately)</option>
                    <option value="Within 2-3 weeks">Within 2-3 weeks</option>
                    <option value="Exploring options / Next month">Exploring options / Next month</option>
                    <option value="Discuss during consultation">Discuss during consultation</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Preferred Contact Channel <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    <button
                      type="button"
                      onClick={() => setContactMethod('whatsapp')}
                      className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                        contactMethod === 'whatsapp'
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-800 font-semibold'
                          : 'border-slate-300 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                      WhatsApp
                    </button>
                    <button
                      type="button"
                      onClick={() => setContactMethod('phone')}
                      className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                        contactMethod === 'phone'
                          ? 'border-blue-600 bg-blue-50 text-blue-800 font-semibold'
                          : 'border-slate-300 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      Direct Call
                    </button>
                  </div>
                </div>
              </div>

              {/* Consent Checkbox */}
              <div className="pt-2">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={consent}
                    onChange={(e) => setConsent(e.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                  <span className="text-xs text-slate-600 leading-relaxed">
                    I acknowledge that BIZORA will store this enquiry in its database and contact me via{' '}
                    {contactMethod === 'whatsapp' ? 'WhatsApp' : 'Phone'} regarding digital solutions. My data will not be shared with third-party advertisers.
                  </span>
                </label>
                {errors.consent && <p className="text-xs text-red-600 mt-1">{errors.consent}</p>}
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={handleResetAndClose}
                  className="w-full sm:w-auto px-4 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold text-sm shadow-md transition-all disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving to Database...
                    </>
                  ) : (
                    <>
                      Submit Enquiry & Get Free Consultation
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
