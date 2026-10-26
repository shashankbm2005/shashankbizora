export type ServiceType =
  | 'website_dev'
  | 'digital_catalogue'
  | 'appointment_enquiry'
  | 'whatsapp_automation'
  | 'ai_assistant'
  | 'custom_software';

export type EnquiryStatus =
  | 'new'
  | 'contacted'
  | 'qualified'
  | 'proposal_sent'
  | 'won'
  | 'lost';

export type ContactMethod = 'whatsapp' | 'phone';

export interface CustomerEnquiry {
  id: string;
  reference_id: string;
  customer_name: string;
  business_name: string;
  business_type: string;
  phone: string;
  email?: string;
  city: string;
  requested_service: ServiceType;
  project_description: string;
  budget_range?: string;
  preferred_contact_method: ContactMethod;
  consent_at: string;
  status: EnquiryStatus;
  internal_notes?: string;
  created_at: string;
  updated_at: string;
}

export interface EnquirySubmissionData {
  customer_name: string;
  business_name: string;
  business_type: string;
  phone: string;
  email?: string;
  city: string;
  requested_service: ServiceType;
  project_description: string;
  budget_range?: string;
  preferred_contact_method: ContactMethod;
  consent: boolean;
}

export interface EnquiryStats {
  total: number;
  new: number;
  contacted: number;
  qualified: number;
  proposal_sent: number;
  won: number;
  lost: number;
}

export interface ServiceDetail {
  id: ServiceType;
  title: string;
  shortDesc: string;
  tagline: string;
  detailedDesc: string;
  features: string[];
  deliverables: string[];
  idealFor: string[];
  timelineEstimate: string;
}
