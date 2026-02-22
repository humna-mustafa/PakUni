/**
 * Data Correction Service
 *
 * Provides context-aware, field-level data correction functionality.
 * Users can report/fix wrong data on any entity (university, scholarship,
 * career, entry test, etc.) and admins approve with one tap.
 *
 * Flow:
 * 1. User opens DataCorrectionScreen from any detail screen
 * 2. Service fetches current entity data (from Turso/bundled)
 * 3. User edits specific fields + provides reason
 * 4. Correction is stored in Supabase via dataSubmissionsService
 * 5. Admin reviews field-level before/after diff and approves/rejects
 * 6. On approval, admin applies via turso:shell or AdminTursoDataManagement
 *
 * NOTE: Direct Turso writes are not available from React Native.
 * Approved corrections are tracked in Supabase and admin applies them
 * via the Turso admin dashboard or CLI.
 */

import { hybridDataService } from './hybridData';
import { dataSubmissionsService, SubmissionType } from './dataSubmissions';
import { logger } from '../utils/logger';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from './supabase';

// ============================================================================
// ENTITY TYPES
// ============================================================================

export type CorrectionEntityType =
  | 'university'
  | 'scholarship'
  | 'entry_test'
  | 'career'
  | 'deadline'
  | 'program'
  | 'merit_archive';

// ============================================================================
// FIELD DEFINITIONS
// Each entity type has a list of editable fields with metadata
// ============================================================================

export type FieldType =
  | 'text'
  | 'number'
  | 'url'
  | 'email'
  | 'phone'
  | 'date'
  | 'textarea'
  | 'select';

export interface FieldDefinition {
  key: string;             // DB field key
  label: string;           // Human-readable label
  type: FieldType;
  required?: boolean;
  options?: string[];      // For 'select' type
  placeholder?: string;
  hint?: string;           // Helper text for users
  maxLength?: number;
}

// --- University Fields ---
export const UNIVERSITY_FIELDS: FieldDefinition[] = [
  { key: 'name', label: 'University Name', type: 'text', required: true },
  { key: 'short_name', label: 'Short Name / Abbreviation', type: 'text' },
  { key: 'city', label: 'City', type: 'text' },
  { key: 'province', label: 'Province', type: 'select', options: ['Punjab', 'Sindh', 'KPK', 'Balochistan', 'Islamabad (ICT)', 'Gilgit-Baltistan', 'AJK'] },
  { key: 'type', label: 'University Type', type: 'select', options: ['public', 'private', 'semi_government'] },
  { key: 'website', label: 'Website URL', type: 'url', placeholder: 'https://...' },
  { key: 'email', label: 'Official Email', type: 'email' },
  { key: 'phone', label: 'Phone Number', type: 'phone' },
  { key: 'established_year', label: 'Established Year', type: 'number' },
  { key: 'ranking_hec', label: 'HEC Ranking / Category', type: 'text', hint: 'e.g. W1, W2, X, Y, Z' },
  { key: 'ranking_national', label: 'National Ranking', type: 'number' },
  { key: 'admission_url', label: 'Admissions URL', type: 'url' },
  { key: 'address', label: 'Address', type: 'textarea' },
  { key: 'tuition_fee', label: 'Tuition Fee (PKR/semester)', type: 'number', hint: 'Average tuition per semester' },
  { key: 'hostel_fee', label: 'Hostel Fee (PKR/semester)', type: 'number' },
  { key: 'admission_fee', label: 'Admission Fee (PKR)', type: 'number' },
  { key: 'description', label: 'Description', type: 'textarea', maxLength: 500 },
];

// --- Scholarship Fields ---
export const SCHOLARSHIP_FIELDS: FieldDefinition[] = [
  { key: 'name', label: 'Scholarship Name', type: 'text', required: true },
  { key: 'provider', label: 'Provider / Organization', type: 'text', required: true },
  { key: 'type', label: 'Scholarship Type', type: 'text', hint: 'e.g. Merit-based, Need-based, Government' },
  { key: 'coverage_percentage', label: 'Coverage %', type: 'number', hint: 'Percentage of tuition covered' },
  { key: 'monthly_stipend', label: 'Monthly Stipend (PKR)', type: 'number' },
  { key: 'deadline', label: 'Application Deadline', type: 'date' },
  { key: 'website', label: 'Website URL', type: 'url' },
  { key: 'description', label: 'Description', type: 'textarea', maxLength: 500 },
];

// --- Entry Test Fields ---
export const ENTRY_TEST_FIELDS: FieldDefinition[] = [
  { key: 'name', label: 'Test Name', type: 'text', required: true },
  { key: 'full_name', label: 'Full Name', type: 'text' },
  { key: 'conducting_body', label: 'Conducting Body', type: 'text' },
  { key: 'registration_start', label: 'Registration Start Date', type: 'date' },
  { key: 'registration_deadline', label: 'Registration Deadline', type: 'date', required: true },
  { key: 'test_date', label: 'Test Date', type: 'date', required: true },
  { key: 'result_date', label: 'Result Date', type: 'date' },
  { key: 'fee', label: 'Registration Fee (PKR)', type: 'number' },
  { key: 'website', label: 'Website URL', type: 'url' },
  { key: 'description', label: 'Description', type: 'textarea', maxLength: 500 },
];

// --- Career Fields ---
export const CAREER_FIELDS_DEF: FieldDefinition[] = [
  { key: 'name', label: 'Career Title', type: 'text', required: true },
  { key: 'field', label: 'Career Field / Category', type: 'text' },
  { key: 'description', label: 'Description', type: 'textarea', maxLength: 600 },
  { key: 'salary_range_min', label: 'Min Salary (PKR/month)', type: 'number' },
  { key: 'salary_range_max', label: 'Max Salary (PKR/month)', type: 'number' },
  { key: 'demand_level', label: 'Demand Level', type: 'select', options: ['High', 'Medium', 'Low'] },
  { key: 'growth_potential', label: 'Growth Potential', type: 'select', options: ['High', 'Medium', 'Low'] },
];

// --- Deadline Fields ---
// NOTE: Keys use camelCase to match actual AdmissionDeadline data structure
export const DEADLINE_FIELDS: FieldDefinition[] = [
  { key: 'title', label: 'Deadline Title', type: 'text', required: true },
  { key: 'universityName', label: 'University Name', type: 'text' },
  { key: 'description', label: 'Description', type: 'textarea' },
  { key: 'applicationStartDate', label: 'Application Start Date', type: 'date' },
  { key: 'applicationDeadline', label: 'Application Deadline', type: 'date', required: true },
  { key: 'entryTestDate', label: 'Entry Test Date', type: 'date' },
  { key: 'resultDate', label: 'Result Date', type: 'date' },
  { key: 'classStartDate', label: 'Class Start Date', type: 'date' },
  { key: 'fee', label: 'Fee (PKR)', type: 'number' },
  { key: 'link', label: 'More Info URL', type: 'url' },
  { key: 'status', label: 'Status', type: 'select', options: ['upcoming', 'open', 'closing-soon', 'closed'] },
];

// Map entity type to its fields
export const ENTITY_FIELDS_MAP: Record<CorrectionEntityType, FieldDefinition[]> = {
  university: UNIVERSITY_FIELDS,
  scholarship: SCHOLARSHIP_FIELDS,
  entry_test: ENTRY_TEST_FIELDS,
  career: CAREER_FIELDS_DEF,
  deadline: DEADLINE_FIELDS,
  program: [
    { key: 'name', label: 'Program Name', type: 'text', required: true },
    { key: 'field', label: 'Field / Discipline', type: 'text' },
    { key: 'duration_years', label: 'Duration (Years)', type: 'number' },
    { key: 'degree_type', label: 'Degree Type', type: 'text', hint: 'e.g. BS, MS, PhD, MBBS' },
    { key: 'description', label: 'Description', type: 'textarea', maxLength: 400 },
  ],
  merit_archive: [
    { key: 'universityName', label: 'University Name', type: 'text' },
    { key: 'programName', label: 'Program Name', type: 'text' },
    { key: 'year', label: 'Year', type: 'number', required: true },
    { key: 'openingMerit', label: 'Opening Merit %', type: 'number' },
    { key: 'closingMerit', label: 'Closing Merit %', type: 'number', required: true },
    { key: 'totalSeats', label: 'Total Seats', type: 'number' },
    { key: 'campus', label: 'Campus', type: 'text' },
    { key: 'category', label: 'Category', type: 'text', hint: 'e.g. Open Merit, Self-Finance' },
  ],
};

// Map CorrectionEntityType to SubmissionType
export const ENTITY_TO_SUBMISSION_TYPE: Record<CorrectionEntityType, SubmissionType> = {
  university: 'university_info',
  scholarship: 'scholarship_info',
  entry_test: 'entry_test_update',
  career: 'university_info', // reuse, treat as 'other' effectively
  deadline: 'date_correction',
  program: 'program_info',
  merit_archive: 'merit_update',
};

// ============================================================================
// ENTITY DATA TYPES (simplified, combined from Turso + bundled data)
// ============================================================================

export interface EntityCurrentData {
  id: string;
  entityType: CorrectionEntityType;
  displayName: string;
  fields: Record<string, any>; // field_key → current value
  source: 'turso' | 'bundled';
  fetchedAt: string;
}

// ============================================================================
// FIELD CORRECTION
// ============================================================================

export interface FieldCorrection {
  fieldKey: string;
  fieldLabel: string;
  currentValue: any;
  proposedValue: any;
}

export interface StructuredCorrectionPayload {
  entityType: CorrectionEntityType;
  entityId: string;
  entityDisplayName: string;
  corrections: FieldCorrection[];   // all changed fields
  overallReason: string;            // general reason for the correction
  sourceProof?: string;             // reference/source URL
  reporterNote?: string;            // optional note from user
}

// ============================================================================
// CORRECTION RECORD (stored in Supabase)
// ============================================================================

export interface DataCorrectionRecord {
  id: string;
  entity_type: CorrectionEntityType;
  entity_id: string;
  entity_display_name: string;
  corrections_json: string;          // JSON of FieldCorrection[]
  overall_reason: string;
  source_proof: string | null;
  reporter_note: string | null;
  user_id: string;
  user_name: string | null;
  user_email: string | null;
  status: 'pending' | 'under_review' | 'approved' | 'rejected' | 'applied';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  admin_notes: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  applied_at: string | null;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// SERVICE CLASS
// ============================================================================

class DataCorrectionService {
  private readonly CACHE_KEY_PREFIX = '@pakuni_correction_';
  private readonly TABLE_NAME = 'data_corrections';

  // --------------------------------------------------------------------------
  // Fetch current entity data
  // --------------------------------------------------------------------------

  async fetchEntityData(
    entityType: CorrectionEntityType,
    entityId: string,
  ): Promise<EntityCurrentData | null> {
    try {
      let data: Record<string, any> | null = null;
      let displayName = entityId;

      switch (entityType) {
        case 'university': {
          const unis = await hybridDataService.getUniversities();
          const idStr = String(entityId).toLowerCase();
          const uni = unis.find(u =>
            String(u.id) === String(entityId) ||
            u.short_name?.toLowerCase() === idStr ||
            u.name?.toLowerCase() === idStr
          );
          if (uni) {
            data = { ...(uni as any) };
            displayName = (uni as any).name || entityId;
          }
          break;
        }
        case 'scholarship': {
          const schs = await hybridDataService.getScholarships();
          const sch = schs.find(s =>
            String((s as any).id) === String(entityId) ||
            (s as any).name?.toLowerCase() === String(entityId).toLowerCase()
          );
          if (sch) {
            data = { ...(sch as any) };
            displayName = (sch as any).name || entityId;
          }
          break;
        }
        case 'entry_test': {
          const tests = await hybridDataService.getEntryTests();
          const test = tests.find(t =>
            String((t as any).id) === String(entityId) ||
            (t as any).name?.toLowerCase() === String(entityId).toLowerCase()
          );
          if (test) {
            data = { ...(test as any) };
            displayName = (test as any).name || entityId;
          }
          break;
        }
        case 'career': {
          const careers = await hybridDataService.getCareers();
          const career = careers.find(c => (c as any).id === entityId);
          if (career) {
            data = { ...(career as any) };
            displayName = (career as any).name || entityId;
          }
          break;
        }
        case 'deadline': {
          const deadlines = await hybridDataService.getDeadlines();
          const dl = deadlines.find(d =>
            String((d as any).id) === String(entityId) ||
            (d as any).title?.toLowerCase() === String(entityId).toLowerCase()
          );
          if (dl) {
            data = { ...(dl as any) };
            displayName = (dl as any).title || entityId;
          }
          break;
        }
        case 'merit_archive': {
          const records = await hybridDataService.getMeritArchive();
          const record = records.find(r =>
            String((r as any).id) === String(entityId) ||
            (r as any).universityId === entityId
          );
          if (record) {
            data = { ...(record as any) };
            displayName = `${(record as any).universityName || ''} - ${(record as any).programName || ''}`.trim() || entityId;
          }
          break;
        }
        case 'program': {
          const programs = await hybridDataService.getPrograms();
          const prog = programs.find(p =>
            String((p as any).id) === String(entityId) ||
            (p as any).name?.toLowerCase() === String(entityId).toLowerCase()
          );
          if (prog) {
            data = { ...(prog as any) };
            displayName = (prog as any).name || entityId;
          }
          break;
        }
        default:
          logger.warn(`fetchEntityData: unsupported type ${entityType}`, null, 'DataCorrection');
          break;
      }

      if (!data) {
        return null;
      }

      return {
        id: entityId,
        entityType,
        displayName,
        fields: data,
        source: 'turso',
        fetchedAt: new Date().toISOString(),
      };
    } catch (error) {
      logger.error('fetchEntityData failed', error, 'DataCorrection');
      return null;
    }
  }

  // --------------------------------------------------------------------------
  // Get field definitions for entity type
  // --------------------------------------------------------------------------

  getFieldDefinitions(entityType: CorrectionEntityType): FieldDefinition[] {
    return ENTITY_FIELDS_MAP[entityType] || [];
  }

  // --------------------------------------------------------------------------
  // Compute diff between current and proposed values
  // --------------------------------------------------------------------------

  computeChanges(
    currentData: Record<string, any>,
    proposed: Record<string, any>,
    fieldDefs: FieldDefinition[],
  ): FieldCorrection[] {
    const changes: FieldCorrection[] = [];
    for (const field of fieldDefs) {
      const cur = currentData[field.key];
      const prop = proposed[field.key];
      // Only include fields where user actually changed something
      if (prop !== undefined && String(prop).trim() !== '' && String(prop) !== String(cur ?? '')) {
        changes.push({
          fieldKey: field.key,
          fieldLabel: field.label,
          currentValue: cur ?? null,
          proposedValue: prop,
        });
      }
    }
    return changes;
  }

  // --------------------------------------------------------------------------
  // Submit structured correction
  // --------------------------------------------------------------------------

  async submitCorrection(
    payload: StructuredCorrectionPayload,
    user: { id: string; name: string | null; email: string | null },
    priority: 'low' | 'medium' | 'high' | 'urgent' = 'medium',
  ): Promise<{ success: boolean; correctionId?: string; error?: string }> {
    try {
      if (payload.corrections.length === 0) {
        return { success: false, error: 'No changes detected. Please modify at least one field.' };
      }

      if (!payload.overallReason.trim()) {
        return { success: false, error: 'Please provide a reason for this correction.' };
      }

      // Build a human-readable summary for the generic submission
      const summary = payload.corrections
        .map(c => `${c.fieldLabel}: "${c.currentValue}" → "${c.proposedValue}"`)
        .join('\n');

      // Store as structured JSON in Supabase data_corrections table
      try {
        const { data: insertedRow, error: dbError } = await supabase
          .from(this.TABLE_NAME)
          .insert({
            entity_type: payload.entityType,
            entity_id: payload.entityId,
            entity_display_name: payload.entityDisplayName,
            corrections_json: JSON.stringify(payload.corrections),
            overall_reason: payload.overallReason,
            source_proof: payload.sourceProof || null,
            reporter_note: payload.reporterNote || null,
            user_id: user.id,
            user_name: user.name,
            user_email: user.email,
            status: 'pending',
            priority,
          })
          .select('id')
          .single();

        if (dbError) {
          // Table may not exist yet — fall back to generic dataSubmissions
          logger.warn('data_corrections table insert failed, using dataSubmissions fallback', dbError, 'DataCorrection');
          throw dbError;
        }

        logger.info(`Correction submitted: ${insertedRow?.id}`, null, 'DataCorrection');
        await this._cacheSubmission(payload, insertedRow?.id);
        return { success: true, correctionId: insertedRow?.id };
      } catch (_tableError) {
        // Fallback: use generic dataSubmissionsService
        const result = await dataSubmissionsService.submitDataCorrection({
          type: ENTITY_TO_SUBMISSION_TYPE[payload.entityType],
          entity_type: payload.entityType,
          entity_id: payload.entityId,
          entity_name: payload.entityDisplayName,
          field_name: payload.corrections.map(c => c.fieldKey).join(', '),
          current_value: JSON.stringify(
            Object.fromEntries(payload.corrections.map(c => [c.fieldKey, c.currentValue])),
          ),
          proposed_value: JSON.stringify(
            Object.fromEntries(payload.corrections.map(c => [c.fieldKey, c.proposedValue])),
          ),
          change_reason: `${payload.overallReason}\n\nField changes:\n${summary}`,
          source_proof: payload.sourceProof || null,
          priority,
          user_id: user.id,
          user_name: user.name,
          user_email: user.email,
          user_trust_level: 1,
          user_auth_provider: 'email' as const,
        });

        await this._cacheSubmission(payload, result?.submissionId);
        return { success: true, correctionId: result?.submissionId };
      }
    } catch (error: any) {
      logger.error('submitCorrection failed', error, 'DataCorrection');
      return { success: false, error: error?.message || 'Failed to submit correction' };
    }
  }

  // --------------------------------------------------------------------------
  // Fetch corrections for admin review (from data_corrections table)
  // --------------------------------------------------------------------------

  async fetchPendingCorrections(
    entityType?: CorrectionEntityType,
    status: string = 'pending',
    limit: number = 50,
  ): Promise<DataCorrectionRecord[]> {
    try {
      let query = supabase
        .from(this.TABLE_NAME)
        .select('*')
        .eq('status', status)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (entityType) {
        query = query.eq('entity_type', entityType);
      }

      const { data, error } = await query;
      if (error) throw error;

      return (data || []) as DataCorrectionRecord[];
    } catch (error) {
      logger.error('fetchPendingCorrections failed', error, 'DataCorrection');
      return [];
    }
  }

  async fetchCorrectionStats(): Promise<{
    pending: number;
    under_review: number;
    approved: number;
    rejected: number;
    applied: number;
    total: number;
    byEntityType: Record<string, number>;
  }> {
    try {
      const { data, error } = await supabase
        .from(this.TABLE_NAME)
        .select('status, entity_type');

      if (error) throw error;

      const rows = data || [];
      const stats = {
        pending: 0, under_review: 0, approved: 0, rejected: 0, applied: 0,
        total: rows.length,
        byEntityType: {} as Record<string, number>,
      };

      for (const row of rows) {
        if (row.status in stats) {
          (stats as any)[row.status]++;
        }
        stats.byEntityType[row.entity_type] = (stats.byEntityType[row.entity_type] || 0) + 1;
      }

      return stats;
    } catch (_e) {
      return { pending: 0, under_review: 0, approved: 0, rejected: 0, applied: 0, total: 0, byEntityType: {} };
    }
  }

  // --------------------------------------------------------------------------
  // Admin: approve a correction
  // --------------------------------------------------------------------------

  async approveCorrection(
    correctionId: string,
    adminId: string,
    adminNotes?: string,
  ): Promise<{ success: boolean; correction?: DataCorrectionRecord; error?: string }> {
    try {
      const { data, error } = await supabase
        .from(this.TABLE_NAME)
        .update({
          status: 'approved',
          reviewed_by: adminId,
          reviewed_at: new Date().toISOString(),
          admin_notes: adminNotes || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', correctionId)
        .select('*')
        .single();

      if (error) throw error;

      logger.info(`Correction approved: ${correctionId}`, null, 'DataCorrection');
      return { success: true, correction: data as DataCorrectionRecord };
    } catch (error: any) {
      logger.error('approveCorrection failed', error, 'DataCorrection');
      return { success: false, error: error?.message };
    }
  }

  // --------------------------------------------------------------------------
  // Admin: reject a correction
  // --------------------------------------------------------------------------

  async rejectCorrection(
    correctionId: string,
    adminId: string,
    reason: string,
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from(this.TABLE_NAME)
        .update({
          status: 'rejected',
          reviewed_by: adminId,
          reviewed_at: new Date().toISOString(),
          admin_notes: reason,
          updated_at: new Date().toISOString(),
        })
        .eq('id', correctionId);

      if (error) throw error;

      return { success: true };
    } catch (error: any) {
      logger.error('rejectCorrection failed', error, 'DataCorrection');
      return { success: false, error: error?.message };
    }
  }

  // --------------------------------------------------------------------------
  // Admin: mark as applied (after admin manually applies to Turso)
  // --------------------------------------------------------------------------

  async markAsApplied(
    correctionId: string,
    adminId: string,
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from(this.TABLE_NAME)
        .update({
          status: 'applied',
          applied_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', correctionId);

      if (error) throw error;
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error?.message };
    }
  }

  // --------------------------------------------------------------------------
  // Fetch user's own correction history
  // --------------------------------------------------------------------------

  async fetchUserCorrectionHistory(
    userId: string,
    limit: number = 30,
  ): Promise<DataCorrectionRecord[]> {
    try {
      const { data, error } = await supabase
        .from(this.TABLE_NAME)
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return (data || []) as DataCorrectionRecord[];
    } catch (_e) {
      return [];
    }
  }

  // --------------------------------------------------------------------------
  // Generate SQL for admin to apply manually (returned on approval screen)
  // --------------------------------------------------------------------------

  generateApplySQL(correction: DataCorrectionRecord): string {
    try {
      const changes: FieldCorrection[] = JSON.parse(correction.corrections_json);
      const tableMap: Record<CorrectionEntityType, string> = {
        university: 'universities',
        scholarship: 'scholarships',
        entry_test: 'entry_tests',
        career: 'careers',
        deadline: 'deadlines',
        program: 'programs',
        merit_archive: 'merit_archive',
      };
      const table = tableMap[correction.entity_type] || correction.entity_type;

      const setClauses = changes
        .map(c => `  ${c.fieldKey} = '${String(c.proposedValue).replace(/'/g, "''")}'`)
        .join(',\n');

      return (
        `-- Apply correction ID: ${correction.id}\n` +
        `-- Entity: ${correction.entity_display_name} (${correction.entity_id})\n` +
        `-- Reason: ${correction.overall_reason}\n` +
        `UPDATE ${table}\nSET\n${setClauses},\n  updated_at = '${new Date().toISOString()}'\n` +
        `WHERE id = '${correction.entity_id}';`
      );
    } catch (_e) {
      return '-- Could not generate SQL for this correction';
    }
  }

  // --------------------------------------------------------------------------
  // Private helpers
  // --------------------------------------------------------------------------

  private async _cacheSubmission(payload: StructuredCorrectionPayload, id?: string) {
    try {
      const key = `${this.CACHE_KEY_PREFIX}${payload.entityType}_${payload.entityId}`;
      const existing = await AsyncStorage.getItem(key);
      const list: any[] = existing ? JSON.parse(existing) : [];
      list.unshift({ id, payload, submittedAt: new Date().toISOString() });
      if (list.length > 10) { list.splice(10); }
      await AsyncStorage.setItem(key, JSON.stringify(list));
    } catch (_e) { /* ignore */ }
  }
}

export const dataCorrectionService = new DataCorrectionService();
