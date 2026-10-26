import { createClient, SupabaseClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import type { CustomerEnquiry, EnquirySubmissionData, EnquiryStatus, EnquiryStats } from '../src/types/enquiry.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const LOCAL_DATA_DIR = path.resolve(__dirname, '../data');
const LOCAL_DATA_FILE = path.resolve(LOCAL_DATA_DIR, 'enquiries.json');

// Ensure local directory exists
if (!fs.existsSync(LOCAL_DATA_DIR)) {
  fs.mkdirSync(LOCAL_DATA_DIR, { recursive: true });
}

// Ensure local file exists with empty array if not present (NO FAKE SEED DATA)
if (!fs.existsSync(LOCAL_DATA_FILE)) {
  fs.writeFileSync(LOCAL_DATA_FILE, JSON.stringify([], null, 2), 'utf-8');
}

export class DatabaseService {
  private supabase: SupabaseClient | null = null;
  private isSupabaseConfigured = false;
  private tableExistsInSupabase = false;
  private lastConnectionError: string | null = null;
  private projectId: string = 'qfhdnsfcqjjrfwnregrt';

  constructor() {
    this.initSupabase();
  }

  private async initSupabase() {
    const supabaseUrl = process.env.SUPABASE_URL?.trim() || 'https://qfhdnsfcqjjrfwnregrt.supabase.co';
    const apiKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || 'sb_publishable_Z92AffcEwzHYE1WrSo5aHg_s850f3pY')?.trim();

    if (
      supabaseUrl &&
      apiKey &&
      !supabaseUrl.includes('your-project-id') &&
      !apiKey.includes('your-supabase-service-role-key') &&
      supabaseUrl.startsWith('https://')
    ) {
      try {
        this.supabase = createClient(supabaseUrl, apiKey, {
          auth: {
            persistSession: false,
            autoRefreshToken: false,
          },
        });
        this.isSupabaseConfigured = true;
        console.log('[BIZORA DB] Supabase client initialized for Project:', supabaseUrl);

        // Check if table exists in schema cache
        await this.verifyTableExistence();
      } catch (err: any) {
        console.error('[BIZORA DB] Failed to create Supabase client:', err.message);
        this.lastConnectionError = err.message;
        this.isSupabaseConfigured = false;
      }
    } else {
      console.log('[BIZORA DB] Supabase credentials pending.');
      this.isSupabaseConfigured = false;
    }
  }

  public async verifyTableExistence(): Promise<boolean> {
    if (!this.supabase) return false;
    try {
      const { error } = await this.supabase
        .from('customer_enquiries')
        .select('id')
        .limit(1);

      if (error) {
        if (error.code === 'PGRST205' || error.message?.includes('schema cache')) {
          this.tableExistsInSupabase = false;
          this.lastConnectionError = "Table 'public.customer_enquiries' not found in Supabase schema cache. Run the SQL migration in Supabase SQL Editor.";
          console.warn('[BIZORA DB]', this.lastConnectionError);
          return false;
        }
        // Permission or other error
        this.lastConnectionError = error.message;
        console.warn('[BIZORA DB] Supabase table check notice:', error.message);
        return false;
      }

      this.tableExistsInSupabase = true;
      this.lastConnectionError = null;
      console.log('[BIZORA DB] Supabase table "customer_enquiries" verified and ready for live writes!');
      return true;
    } catch (err: any) {
      this.tableExistsInSupabase = false;
      this.lastConnectionError = err.message;
      return false;
    }
  }

  public getStatus() {
    return {
      isSupabaseConfigured: this.isSupabaseConfigured,
      tableExistsInSupabase: this.tableExistsInSupabase,
      projectId: this.projectId,
      supabaseUrl: this.isSupabaseConfigured ? (process.env.SUPABASE_URL || 'https://qfhdnsfcqjjrfwnregrt.supabase.co') : null,
      lastError: this.lastConnectionError,
    };
  }

  // --- Local JSON Storage Helpers ---
  private readLocal(): CustomerEnquiry[] {
    try {
      if (!fs.existsSync(LOCAL_DATA_FILE)) return [];
      const content = fs.readFileSync(LOCAL_DATA_FILE, 'utf-8');
      return JSON.parse(content || '[]');
    } catch (err) {
      console.error('[BIZORA DB] Error reading local enquiries file:', err);
      return [];
    }
  }

  private writeLocal(data: CustomerEnquiry[]): void {
    try {
      fs.writeFileSync(LOCAL_DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch (err) {
      console.error('[BIZORA DB] Error writing local enquiries file:', err);
      throw new Error('Failed to persist enquiry locally.');
    }
  }

  // --- Database Operations ---

  public async createEnquiry(
    enquiryData: EnquirySubmissionData,
    referenceId: string,
    ipHash?: string
  ): Promise<CustomerEnquiry> {
    const now = new Date().toISOString();
    const newEnquiry: CustomerEnquiry = {
      id: crypto.randomUUID(),
      reference_id: referenceId,
      customer_name: enquiryData.customer_name.trim(),
      business_name: enquiryData.business_name.trim(),
      business_type: enquiryData.business_type.trim(),
      phone: enquiryData.phone.trim(),
      email: enquiryData.email?.trim() || undefined,
      city: enquiryData.city.trim(),
      requested_service: enquiryData.requested_service,
      project_description: enquiryData.project_description.trim(),
      budget_range: enquiryData.budget_range?.trim() || undefined,
      preferred_contact_method: enquiryData.preferred_contact_method,
      consent_at: now,
      status: 'new',
      internal_notes: '',
      created_at: now,
      updated_at: now,
    };

    // Always persist to local store first to ensure 100% zero data loss guarantee
    const existing = this.readLocal();
    existing.unshift(newEnquiry);
    this.writeLocal(existing);

    // If Supabase is configured, attempt direct save to Supabase PostgreSQL
    if (this.isSupabaseConfigured && this.supabase) {
      try {
        const { data, error } = await this.supabase
          .from('customer_enquiries')
          .insert({
            reference_id: newEnquiry.reference_id,
            customer_name: newEnquiry.customer_name,
            business_name: newEnquiry.business_name,
            business_type: newEnquiry.business_type,
            phone: newEnquiry.phone,
            email: newEnquiry.email || null,
            city: newEnquiry.city,
            requested_service: newEnquiry.requested_service,
            project_description: newEnquiry.project_description,
            budget_range: newEnquiry.budget_range || null,
            preferred_contact_method: newEnquiry.preferred_contact_method,
            consent_at: newEnquiry.consent_at,
            status: 'new',
            internal_notes: '',
            ip_hash: ipHash || null,
          })
          .select()
          .single();

        if (error) {
          console.warn('[BIZORA DB] Supabase direct insert notice:', error.message);
          if (error.code === 'PGRST205') {
            this.tableExistsInSupabase = false;
            this.lastConnectionError = "Table 'customer_enquiries' needs to be created in Supabase SQL editor.";
          }
          // Record is safely in local storage, so return valid enquiry
          return newEnquiry;
        }

        this.tableExistsInSupabase = true;
        this.lastConnectionError = null;
        console.log('[BIZORA DB] Successfully saved enquiry to Supabase PostgreSQL! Ref:', newEnquiry.reference_id);
        return data as CustomerEnquiry;
      } catch (err: any) {
        console.warn('[BIZORA DB] Supabase network exception:', err.message);
        return newEnquiry;
      }
    }

    return newEnquiry;
  }

  public async checkRecentDuplicate(phone: string, service: string): Promise<boolean> {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();

    if (this.isSupabaseConfigured && this.supabase && this.tableExistsInSupabase) {
      try {
        const { data, error } = await this.supabase
          .from('customer_enquiries')
          .select('id')
          .eq('phone', phone)
          .eq('requested_service', service)
          .gte('created_at', fiveMinutesAgo)
          .limit(1);

        if (!error && data && data.length > 0) {
          return true;
        }
      } catch {
        // Fallback to local check below
      }
    }

    const existing = this.readLocal();
    return existing.some(
      (e) =>
        e.phone === phone &&
        e.requested_service === service &&
        new Date(e.created_at).getTime() >= Date.now() - 5 * 60 * 1000
    );
  }

  public async getEnquiries(params: {
    search?: string;
    status?: string;
    service?: string;
  }): Promise<CustomerEnquiry[]> {
    if (this.isSupabaseConfigured && this.supabase && this.tableExistsInSupabase) {
      try {
        let query = this.supabase
          .from('customer_enquiries')
          .select('*')
          .order('created_at', { ascending: false });

        if (params.status && params.status !== 'all') {
          query = query.eq('status', params.status);
        }
        if (params.service && params.service !== 'all') {
          query = query.eq('requested_service', params.service);
        }
        if (params.search) {
          const s = `%${params.search}%`;
          query = query.or(`customer_name.ilike.${s},business_name.ilike.${s},phone.ilike.${s},reference_id.ilike.${s},city.ilike.${s}`);
        }

        const { data, error } = await query;
        if (!error && data) {
          return data as CustomerEnquiry[];
        }
      } catch {
        // Fallback to local below
      }
    }

    let list = this.readLocal();

    if (params.status && params.status !== 'all') {
      list = list.filter((e) => e.status === params.status);
    }
    if (params.service && params.service !== 'all') {
      list = list.filter((e) => e.requested_service === params.service);
    }
    if (params.search) {
      const q = params.search.toLowerCase();
      list = list.filter(
        (e) =>
          e.customer_name.toLowerCase().includes(q) ||
          e.business_name.toLowerCase().includes(q) ||
          e.phone.toLowerCase().includes(q) ||
          e.reference_id.toLowerCase().includes(q) ||
          e.city.toLowerCase().includes(q)
      );
    }

    return list;
  }

  public async getEnquiryById(id: string): Promise<CustomerEnquiry | null> {
    if (this.isSupabaseConfigured && this.supabase && this.tableExistsInSupabase) {
      try {
        const { data, error } = await this.supabase
          .from('customer_enquiries')
          .select('*')
          .eq('id', id)
          .single();

        if (!error && data) return data as CustomerEnquiry;
      } catch {
        // Fallback to local
      }
    }

    const list = this.readLocal();
    return list.find((e) => e.id === id) || null;
  }

  public async updateEnquiry(
    id: string,
    updates: { status?: EnquiryStatus; internal_notes?: string }
  ): Promise<CustomerEnquiry | null> {
    const now = new Date().toISOString();

    // Update in local file
    const list = this.readLocal();
    const index = list.findIndex((e) => e.id === id);
    if (index !== -1) {
      if (updates.status !== undefined) list[index].status = updates.status;
      if (updates.internal_notes !== undefined) list[index].internal_notes = updates.internal_notes;
      list[index].updated_at = now;
      this.writeLocal(list);
    }

    // Update in Supabase if live
    if (this.isSupabaseConfigured && this.supabase && this.tableExistsInSupabase) {
      try {
        const updatePayload: Record<string, any> = { updated_at: now };
        if (updates.status !== undefined) updatePayload.status = updates.status;
        if (updates.internal_notes !== undefined) updatePayload.internal_notes = updates.internal_notes;

        const { data, error } = await this.supabase
          .from('customer_enquiries')
          .update(updatePayload)
          .eq('id', id)
          .select()
          .single();

        if (!error && data) return data as CustomerEnquiry;
      } catch {
        // Return local update
      }
    }

    return index !== -1 ? list[index] : null;
  }

  public async getStats(): Promise<EnquiryStats> {
    const all = await this.getEnquiries({});
    const stats: EnquiryStats = {
      total: all.length,
      new: 0,
      contacted: 0,
      qualified: 0,
      proposal_sent: 0,
      won: 0,
      lost: 0,
    };

    for (const item of all) {
      if (item.status in stats) {
        stats[item.status]++;
      }
    }

    return stats;
  }
}

export const dbService = new DatabaseService();
