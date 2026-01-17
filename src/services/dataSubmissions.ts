/**
 * Data Submissions & Approval Workflow Service
 * 
 * Allows users to submit data corrections/updates that go through admin approval
 * Features:
 * - User data submissions (merit, dates, entry tests, etc.)
 * - Admin approval/rejection workflow
 * - Auto-approval rules for trusted users
 * - Notification triggers for admins and users
 * - Audit trail for all changes
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from './supabase';
import { logger } from '../utils/logger';

// ============================================================================
// TYPES
// ============================================================================

export type SubmissionType = 
  | 'merit_update'      // Merit list updates (cutoffs, etc.)
  | 'date_correction'   // Admission deadline corrections
  | 'entry_test_update' // Entry test date/info updates
  | 'university_info'   // University info corrections
  | 'scholarship_info'  // Scholarship info corrections
  | 'program_info'      // Program details corrections
  | 'fee_update'        // Fee structure updates
  | 'other';            // Other corrections

export type SubmissionStatus = 
  | 'pending'           // Awaiting review
  | 'under_review'      // Admin is reviewing
  | 'approved'          // Approved and applied
  | 'rejected'          // Rejected with reason
  | 'auto_approved';    // Automatically approved

export type SubmissionPriority = 'low' | 'medium' | 'high' | 'urgent';

export type AuthProvider = 'google' | 'email' | 'guest' | 'apple' | 'facebook';

export interface DataSubmission {
  id: string;
  type: SubmissionType;
  status: SubmissionStatus;
  priority: SubmissionPriority;
  
  // Submitter info
  user_id: string;
  user_name: string | null;
  user_email: string | null;
  user_trust_level: number; // 0-5, higher = more trusted
  user_auth_provider: AuthProvider; // How user logged in (google, email, guest)
  
  // Entity being updated
  entity_type: string;      // 'university', 'entry_test', 'merit', 'deadline', etc.
  entity_id: string;        // ID of the entity
  entity_name: string;      // Display name for reference
  
  // Change details
  field_name: string;       // Which field is being updated
  current_value: any;       // Current value (for comparison)
  proposed_value: any;      // New proposed value
  change_reason: string;    // Why the change is needed
  source_proof: string | null; // URL or description of source/proof
  
  // Timestamps
  created_at: string;
  updated_at: string;
  reviewed_at: string | null;
  
  // Review info
  reviewed_by: string | null;
  reviewer_notes: string | null;
  rejection_reason: string | null;
  
  // Auto-approval
  auto_approved: boolean;
  auto_approval_rule: string | null;
}

export interface AutoApprovalRule {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  
  // Conditions
  submission_types: SubmissionType[];    // Which types to auto-approve
  min_trust_level: number;               // Minimum user trust level (0-5)
  entity_types: string[];                // Which entities (empty = all)
  max_value_change_percent: number | null; // Max % change for numeric values
  
  // Auth Provider Settings - Auto-trust verified accounts
  allowed_auth_providers: AuthProvider[]; // Which auth providers are allowed (empty = all)
  auto_trust_google: boolean;            // Auto-trust Google/Gmail verified users
  auto_trust_email_verified: boolean;    // Auto-trust email verified users
  block_guest_submissions: boolean;      // Block submissions from guest users
  
  // Settings
  require_source: boolean;               // Require proof/source
  notify_admin: boolean;                 // Still notify admin after auto-approve
  
  // Stats
  total_auto_approved: number;
  created_at: string;
  updated_at: string;
}

export interface NotificationTrigger {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  
  // Trigger type
  trigger_type: 'deadline_reminder' | 'merit_published' | 'entry_test_reminder' | 
                'scholarship_deadline' | 'new_announcement' | 'custom';
  
  // Target
  target_type: 'all_users' | 'specific_users' | 'by_interest' | 'by_university' | 'by_program';
  target_criteria: Record<string, any>;
  
  // Timing
  schedule_type: 'immediate' | 'scheduled' | 'recurring';
  schedule_time: string | null;          // For scheduled
  recurring_pattern: string | null;      // Cron pattern for recurring
  days_before: number | null;            // For deadline reminders
  
  // Content
  title_template: string;
  message_template: string;
  
  // Stats
  last_triggered: string | null;
  total_sent: number;
  
  created_at: string;
  updated_at: string;
}

export interface MeritRecord {
  id: string;
  university_id: string;
  university_name: string;
  program_id: string;
  program_name: string;
  year: number;
  round: number;
  merit_type: 'open' | 'self' | 'reserved' | 'sports' | 'disabled';
  closing_merit: number;
  aggregate_formula: string | null;
  total_seats: number | null;
  filled_seats: number | null;
  source: string | null;
  verified: boolean;
  updated_at: string;
}

export interface AdmissionDeadline {
  id: string;
  university_id: string;
  university_name: string;
  program_type: 'undergraduate' | 'graduate' | 'phd' | 'diploma';
  deadline_type: 'application' | 'fee_payment' | 'document_submission' | 'entry_test' | 'interview';
  deadline_date: string;
  description: string;
  is_extended: boolean;
  extension_date: string | null;
  source_url: string | null;
  verified: boolean;
  updated_at: string;
}

export interface EntryTestInfo {
  id: string;
  test_name: string;
  conducting_body: string;
  test_date: string;
  registration_deadline: string;
  result_date: string | null;
  test_centers: string[];
  eligibility: string;
  fee: number;
  website: string;
  syllabus_url: string | null;
  verified: boolean;
  updated_at: string;
}

// ============================================================================
// DATA SUBMISSIONS SERVICE
// ============================================================================

class DataSubmissionsService {
  private readonly SUBMISSIONS_KEY = '@data_submissions';
  private readonly AUTO_RULES_KEY = '@auto_approval_rules';
  private readonly TRIGGERS_KEY = '@notification_triggers';
  private readonly MERIT_KEY = '@merit_records';
  private readonly DEADLINES_KEY = '@admission_deadlines';
  private readonly ENTRY_TESTS_KEY = '@entry_tests_info';

  // =========================================================================
  // USER SUBMISSIONS
  // =========================================================================

  /**
   * Submit a data correction/update request
   */
  async submitDataCorrection(submission: Omit<DataSubmission, 'id' | 'status' | 'created_at' | 'updated_at' | 'reviewed_at' | 'reviewed_by' | 'reviewer_notes' | 'rejection_reason' | 'auto_approved' | 'auto_approval_rule'>): Promise<{ success: boolean; submissionId?: string; autoApproved?: boolean }> {
    try {
      const id = `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Check auto-approval rules
      const autoApproval = await this.checkAutoApprovalRules(submission);
      
      const newSubmission: DataSubmission = {
        ...submission,
        id,
        status: autoApproval.approved ? 'auto_approved' : 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        reviewed_at: autoApproval.approved ? new Date().toISOString() : null,
        reviewed_by: autoApproval.approved ? 'system' : null,
        reviewer_notes: autoApproval.approved ? 'Auto-approved by rule' : null,
        rejection_reason: null,
        auto_approved: autoApproval.approved,
        auto_approval_rule: autoApproval.ruleId,
      };

      // Save submission
      const submissions = await this.getSubmissions();
      submissions.unshift(newSubmission);
      await AsyncStorage.setItem(this.SUBMISSIONS_KEY, JSON.stringify(submissions.slice(0, 500)));

      // If auto-approved, apply the change
      if (autoApproval.approved) {
        await this.applySubmissionChange(newSubmission);
      }

      // Also save to Supabase if available
      try {
        await supabase.from('data_submissions').insert({
          id,
          type: submission.type,
          status: newSubmission.status,
          priority: submission.priority,
          user_id: submission.user_id,
          entity_type: submission.entity_type,
          entity_id: submission.entity_id,
          entity_name: submission.entity_name,
          field_name: submission.field_name,
          current_value: submission.current_value,
          proposed_value: submission.proposed_value,
          change_reason: submission.change_reason,
          source_proof: submission.source_proof,
          auto_approved: newSubmission.auto_approved,
        });
      } catch (e) {
        // Supabase save failed, but local save succeeded
        logger.warn('Failed to save submission to Supabase', e, 'DataSubmissions');
      }

      return { success: true, submissionId: id, autoApproved: autoApproval.approved };
    } catch (error) {
      logger.error('Failed to submit data correction', error, 'DataSubmissions');
      return { success: false };
    }
  }

  /**
   * Get all submissions with optional filters
   */
  async getSubmissions(filters?: {
    status?: SubmissionStatus;
    type?: SubmissionType;
    user_id?: string;
    entity_type?: string;
    priority?: SubmissionPriority;
  }): Promise<DataSubmission[]> {
    try {
      const data = await AsyncStorage.getItem(this.SUBMISSIONS_KEY);
      let submissions: DataSubmission[] = data ? JSON.parse(data) : [];

      if (filters) {
        if (filters.status) submissions = submissions.filter(s => s.status === filters.status);
        if (filters.type) submissions = submissions.filter(s => s.type === filters.type);
        if (filters.user_id) submissions = submissions.filter(s => s.user_id === filters.user_id);
        if (filters.entity_type) submissions = submissions.filter(s => s.entity_type === filters.entity_type);
        if (filters.priority) submissions = submissions.filter(s => s.priority === filters.priority);
      }

      return submissions;
    } catch {
      return [];
    }
  }

  /**
   * Get pending submissions count
   */
  async getPendingCount(): Promise<{ total: number; byType: Record<string, number>; byPriority: Record<string, number> }> {
    const submissions = await this.getSubmissions({ status: 'pending' });
    const byType: Record<string, number> = {};
    const byPriority: Record<string, number> = {};

    submissions.forEach(s => {
      byType[s.type] = (byType[s.type] || 0) + 1;
      byPriority[s.priority] = (byPriority[s.priority] || 0) + 1;
    });

    return { total: submissions.length, byType, byPriority };
  }

  /**
   * Review and approve/reject a submission
   */
  async reviewSubmission(
    submissionId: string,
    action: 'approve' | 'reject',
    reviewerId: string,
    notes?: string,
    rejectionReason?: string
  ): Promise<boolean> {
    try {
      const submissions = await this.getSubmissions();
      const index = submissions.findIndex(s => s.id === submissionId);
      
      if (index === -1) return false;

      const submission = submissions[index];
      submission.status = action === 'approve' ? 'approved' : 'rejected';
      submission.reviewed_at = new Date().toISOString();
      submission.reviewed_by = reviewerId;
      submission.reviewer_notes = notes || null;
      submission.rejection_reason = action === 'reject' ? rejectionReason || null : null;
      submission.updated_at = new Date().toISOString();

      // If approved, apply the change
      if (action === 'approve') {
        await this.applySubmissionChange(submission);
        
        // Increase user trust level
        await this.updateUserTrustLevel(submission.user_id, 1);
      }

      submissions[index] = submission;
      await AsyncStorage.setItem(this.SUBMISSIONS_KEY, JSON.stringify(submissions));

      // Update Supabase
      try {
        await supabase.from('data_submissions')
          .update({
            status: submission.status,
            reviewed_at: submission.reviewed_at,
            reviewed_by: submission.reviewed_by,
            reviewer_notes: submission.reviewer_notes,
            rejection_reason: submission.rejection_reason,
          })
          .eq('id', submissionId);
      } catch (e) {
        logger.warn('Failed to update submission in Supabase', e, 'DataSubmissions');
      }

      return true;
    } catch (error) {
      logger.error('Failed to review submission', error, 'DataSubmissions');
      return false;
    }
  }

  /**
   * Apply approved submission change to actual data
   */
  private async applySubmissionChange(submission: DataSubmission): Promise<void> {
    // This would update the actual data based on entity_type
    // For now, log the change
    logger.info(`Applied change: ${submission.entity_type}/${submission.entity_id} - ${submission.field_name}: ${submission.current_value} -> ${submission.proposed_value}`, 'DataSubmissions');
    
    // In a real implementation, this would update the relevant data store
    // For example, if entity_type is 'merit', update merit records
    // If entity_type is 'entry_test', update entry test dates, etc.
  }

  /**
   * Apply approved submission change to all related data without admin setup
   * Auto-updates cutoff lists, recommendations, notifications, etc.
   */
  async applySubmissionToAllRelatedData(submission: DataSubmission): Promise<{ success: boolean; affectedCount: number }> {
    try {
      let affectedCount = 0;

      // Apply based on entity type and field being updated
      if (submission.entity_type === 'merit') {
        // Update merit lists and recalculate cutoffs
        const merits = await this.getMeritRecords();
        const updated = merits.map(m => {
          if (m.university_id === submission.entity_id && 
              m.year === new Date().getFullYear()) {
            if (submission.field_name === 'closing_merit') {
              m.closing_merit = submission.proposed_value as number;
              affectedCount++;
            }
          }
          return m;
        });
        await AsyncStorage.setItem(this.MERIT_KEY, JSON.stringify(updated));

        // Trigger recommendation recalculation
        try {
          await supabase.from('merit_updates').insert({
            submission_id: submission.id,
            university_id: submission.entity_id,
            closing_merit: submission.proposed_value,
            updated_at: new Date().toISOString(),
          });
        } catch (e) {
          logger.warn('Failed to sync merit update to Supabase', e, 'DataSubmissions');
        }
      }

      if (submission.entity_type === 'deadline' || submission.type === 'date_correction') {
        // Update deadline and schedule notifications
        const deadlines = await this.getAdmissionDeadlines();
        const updated = deadlines.map(d => {
          if (d.university_id === submission.entity_id) {
            if (submission.field_name === 'deadline_date') {
              d.deadline_date = submission.proposed_value as string;
              affectedCount++;
            }
          }
          return d;
        });
        await AsyncStorage.setItem(this.DEADLINES_KEY, JSON.stringify(updated));

        // Schedule deadline reminders (auto triggers)
        if (affectedCount > 0) {
          const reminderTrigger: NotificationTrigger = {
            id: `trigger_${submission.id}`,
            name: `Auto-reminder for updated deadline`,
            description: `Auto-generated reminder for updated deadline`,
            enabled: true,
            trigger_type: 'deadline_reminder',
            target_type: 'by_university',
            target_criteria: { university_id: submission.entity_id },
            schedule_type: 'scheduled',
            schedule_time: null,
            recurring_pattern: null,
            days_before: 7,
            title_template: 'Deadline Updated',
            message_template: `Deadline has been updated to ${submission.proposed_value}`,
            last_triggered: null,
            total_sent: 0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
          await this.upsertNotificationTrigger(reminderTrigger);
        }
      }

      if (submission.entity_type === 'entry_test' || submission.type === 'entry_test_update') {
        // Update entry test info
        const tests = await this.getEntryTestInfo();
        const updated = tests.map(t => {
          if (t.id === submission.entity_id) {
            if (submission.field_name === 'test_date') {
              t.test_date = submission.proposed_value as string;
              affectedCount++;
            }
            if (submission.field_name === 'registration_deadline') {
              t.registration_deadline = submission.proposed_value as string;
              affectedCount++;
            }
          }
          return t;
        });
        await AsyncStorage.setItem(this.ENTRY_TESTS_KEY, JSON.stringify(updated));
      }

      if (submission.type === 'fee_update') {
        // Invalidate calculator cache to force refresh
        try {
          await supabase.from('cache_invalidations').insert({
            key: `calculator_fees_${submission.entity_id}`,
            invalidated_at: new Date().toISOString(),
          });
        } catch (e) {
          logger.warn('Failed to invalidate calculator cache', e, 'DataSubmissions');
        }
        affectedCount = 1;
      }

      // Log the successful application
      logger.info(`Successfully applied submission ${submission.id} to ${affectedCount} related record(s)`, 'DataSubmissions');

      return { success: true, affectedCount };
    } catch (error) {
      logger.error('Failed to apply submission to related data', error, 'DataSubmissions');
      return { success: false, affectedCount: 0 };
    }
  }

  /**
   * Get statistics including approval metrics
   */
  async getStatistics(): Promise<{
    submissions: {
      total: number;
      pending: number;
      approved: number;
      rejected: number;
      autoApproved: number;
      avgApprovalTime?: number;
    };
  }> {
    const submissions = await this.getSubmissions();
    const approvedSubs = submissions.filter(s => s.status === 'approved');
    
    let avgApprovalTime = 0;
    if (approvedSubs.length > 0) {
      const times = approvedSubs
        .map(s => new Date(s.reviewed_at!).getTime() - new Date(s.created_at).getTime())
        .filter(t => t > 0);
      if (times.length > 0) {
        avgApprovalTime = Math.floor(times.reduce((a, b) => a + b, 0) / times.length / 1000 / 60); // in minutes
      }
    }

    return {
      submissions: {
        total: submissions.length,
        pending: submissions.filter(s => s.status === 'pending').length,
        approved: submissions.filter(s => s.status === 'approved').length,
        rejected: submissions.filter(s => s.status === 'rejected').length,
        autoApproved: submissions.filter(s => s.status === 'auto_approved').length,
        avgApprovalTime,
      },
    };
  }

  /**
   * Update user trust level
   */
  private async updateUserTrustLevel(userId: string, change: number): Promise<void> {
    try {
      // Update in Supabase
      const { data: profile } = await supabase
        .from('profiles')
        .select('trust_level')
        .eq('id', userId)
        .single();

      const currentLevel = profile?.trust_level || 0;
      const newLevel = Math.max(0, Math.min(5, currentLevel + change));

      await supabase
        .from('profiles')
        .update({ trust_level: newLevel })
        .eq('id', userId);
    } catch (e) {
      logger.warn('Failed to update user trust level', e, 'DataSubmissions');
    }
  }

  // =========================================================================
  // AUTO-APPROVAL RULES
  // =========================================================================

  /**
   * Check if submission qualifies for auto-approval
   */
  private async checkAutoApprovalRules(submission: Omit<DataSubmission, 'id' | 'status' | 'created_at' | 'updated_at' | 'reviewed_at' | 'reviewed_by' | 'reviewer_notes' | 'rejection_reason' | 'auto_approved' | 'auto_approval_rule'>): Promise<{ approved: boolean; ruleId: string | null }> {
    const rules = await this.getAutoApprovalRules();
    
    for (const rule of rules) {
      if (!rule.enabled) continue;
      
      // Check submission type
      if (rule.submission_types.length > 0 && !rule.submission_types.includes(submission.type)) {
        continue;
      }
      
      // Check trust level
      if (submission.user_trust_level < rule.min_trust_level) {
        continue;
      }
      
      // Check entity type
      if (rule.entity_types.length > 0 && !rule.entity_types.includes(submission.entity_type)) {
        continue;
      }
      
      // Check source requirement
      if (rule.require_source && !submission.source_proof) {
        continue;
      }
      
      // Check auth provider restrictions
      if (rule.allowed_auth_providers && rule.allowed_auth_providers.length > 0) {
        if (!submission.auth_provider || !rule.allowed_auth_providers.includes(submission.auth_provider)) {
          continue;
        }
      }
      
      // Fast-track Google users if enabled
      if (rule.auto_approve_google_users && submission.auth_provider === 'google') {
        // Google users get auto-approved (skip other checks)
        rule.total_auto_approved++;
        await this.saveAutoApprovalRules(rules);
        return { approved: true, ruleId: rule.id };
      }
      
      // Check email verification requirement
      if (rule.require_email_verified && submission.auth_provider === 'email') {
        // For email users, we'd check if email is verified
        // This would come from user profile - for now, allow if trust level is high enough
        if (submission.user_trust_level < 3) {
          continue;
        }
      }
      
      // Reject guest users if require_email_verified is true
      if (rule.require_email_verified && submission.auth_provider === 'guest') {
        continue;
      }
      
      // Check value change percentage (for numeric values)
      if (rule.max_value_change_percent !== null && 
          typeof submission.current_value === 'number' && 
          typeof submission.proposed_value === 'number') {
        const changePercent = Math.abs((submission.proposed_value - submission.current_value) / submission.current_value * 100);
        if (changePercent > rule.max_value_change_percent) {
          continue;
        }
      }
      
      // All conditions met - auto-approve
      // Update rule stats
      rule.total_auto_approved++;
      await this.saveAutoApprovalRules(rules);
      
      return { approved: true, ruleId: rule.id };
    }
    
    return { approved: false, ruleId: null };
  }

  /**
   * Get auto-approval rules
   */
  async getAutoApprovalRules(): Promise<AutoApprovalRule[]> {
    try {
      const data = await AsyncStorage.getItem(this.AUTO_RULES_KEY);
      return data ? JSON.parse(data) : this.getDefaultAutoApprovalRules();
    } catch {
      return this.getDefaultAutoApprovalRules();
    }
  }

  /**
   * Save auto-approval rules
   */
  async saveAutoApprovalRules(rules: AutoApprovalRule[]): Promise<boolean> {
    try {
      await AsyncStorage.setItem(this.AUTO_RULES_KEY, JSON.stringify(rules));
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Add or update an auto-approval rule
   */
  async upsertAutoApprovalRule(rule: Partial<AutoApprovalRule> & { id?: string }): Promise<string> {
    const rules = await this.getAutoApprovalRules();
    const id = rule.id || `rule_${Date.now()}`;
    const index = rules.findIndex(r => r.id === id);

    const fullRule: AutoApprovalRule = {
      id,
      name: rule.name || 'New Rule',
      description: rule.description || '',
      enabled: rule.enabled ?? true,
      submission_types: rule.submission_types || [],
      min_trust_level: rule.min_trust_level ?? 3,
      entity_types: rule.entity_types || [],
      max_value_change_percent: rule.max_value_change_percent ?? null,
      require_source: rule.require_source ?? false,
      notify_admin: rule.notify_admin ?? true,
      allowed_auth_providers: rule.allowed_auth_providers || [],
      auto_approve_google_users: rule.auto_approve_google_users ?? false,
      require_email_verified: rule.require_email_verified ?? false,
      total_auto_approved: rule.total_auto_approved ?? 0,
      created_at: rule.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (index >= 0) {
      rules[index] = fullRule;
    } else {
      rules.push(fullRule);
    }

    await this.saveAutoApprovalRules(rules);
    return id;
  }

  /**
   * Delete an auto-approval rule
   */
  async deleteAutoApprovalRule(ruleId: string): Promise<boolean> {
    const rules = await this.getAutoApprovalRules();
    const filtered = rules.filter(r => r.id !== ruleId);
    return this.saveAutoApprovalRules(filtered);
  }

  private getDefaultAutoApprovalRules(): AutoApprovalRule[] {
    return [
      {
        id: 'rule_trusted_date_updates',
        name: 'Trusted Users - Date Updates',
        description: 'Auto-approve date corrections from trusted users with source',
        enabled: false,
        submission_types: ['date_correction', 'entry_test_update'],
        min_trust_level: 4,
        entity_types: [],
        max_value_change_percent: null,
        require_source: true,
        notify_admin: true,
        allowed_auth_providers: ['google', 'email'],
        auto_approve_google_users: false,
        require_email_verified: true,
        total_auto_approved: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 'rule_small_merit_changes',
        name: 'Small Merit Adjustments',
        description: 'Auto-approve minor merit corrections (<5% change) with source',
        enabled: false,
        submission_types: ['merit_update'],
        min_trust_level: 3,
        entity_types: ['merit'],
        max_value_change_percent: 5,
        require_source: true,
        notify_admin: true,
        allowed_auth_providers: ['google', 'email'],
        auto_approve_google_users: false,
        require_email_verified: true,
        total_auto_approved: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 'rule_google_users_fast_track',
        name: 'Google Users Fast Track',
        description: 'Auto-approve all submissions from Google-authenticated users',
        enabled: false,
        submission_types: [],
        min_trust_level: 1,
        entity_types: [],
        max_value_change_percent: null,
        require_source: false,
        notify_admin: true,
        allowed_auth_providers: ['google'],
        auto_approve_google_users: true,
        require_email_verified: false,
        total_auto_approved: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ];
  }

  // =========================================================================
  // NOTIFICATION TRIGGERS
  // =========================================================================

  /**
   * Get notification triggers
   */
  async getNotificationTriggers(): Promise<NotificationTrigger[]> {
    try {
      const data = await AsyncStorage.getItem(this.TRIGGERS_KEY);
      return data ? JSON.parse(data) : this.getDefaultNotificationTriggers();
    } catch {
      return this.getDefaultNotificationTriggers();
    }
  }

  /**
   * Save notification triggers
   */
  async saveNotificationTriggers(triggers: NotificationTrigger[]): Promise<boolean> {
    try {
      await AsyncStorage.setItem(this.TRIGGERS_KEY, JSON.stringify(triggers));
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Add or update a notification trigger
   */
  async upsertNotificationTrigger(trigger: Partial<NotificationTrigger> & { id?: string }): Promise<string> {
    const triggers = await this.getNotificationTriggers();
    const id = trigger.id || `trigger_${Date.now()}`;
    const index = triggers.findIndex(t => t.id === id);

    const fullTrigger: NotificationTrigger = {
      id,
      name: trigger.name || 'New Trigger',
      description: trigger.description || '',
      enabled: trigger.enabled ?? true,
      trigger_type: trigger.trigger_type || 'custom',
      target_type: trigger.target_type || 'all_users',
      target_criteria: trigger.target_criteria || {},
      schedule_type: trigger.schedule_type || 'immediate',
      schedule_time: trigger.schedule_time || null,
      recurring_pattern: trigger.recurring_pattern || null,
      days_before: trigger.days_before || null,
      title_template: trigger.title_template || 'Notification',
      message_template: trigger.message_template || '',
      last_triggered: trigger.last_triggered || null,
      total_sent: trigger.total_sent || 0,
      created_at: trigger.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (index >= 0) {
      triggers[index] = fullTrigger;
    } else {
      triggers.push(fullTrigger);
    }

    await this.saveNotificationTriggers(triggers);
    return id;
  }

  /**
   * Delete a notification trigger
   */
  async deleteNotificationTrigger(triggerId: string): Promise<boolean> {
    const triggers = await this.getNotificationTriggers();
    const filtered = triggers.filter(t => t.id !== triggerId);
    return this.saveNotificationTriggers(filtered);
  }

  /**
   * Execute a notification trigger manually
   */
  async executeTrigger(triggerId: string): Promise<{ success: boolean; sentCount: number }> {
    const triggers = await this.getNotificationTriggers();
    const trigger = triggers.find(t => t.id === triggerId);
    
    if (!trigger) return { success: false, sentCount: 0 };

    try {
      // Create announcement based on trigger
      const { error } = await supabase.from('announcements').insert({
        title: trigger.title_template,
        message: trigger.message_template,
        type: trigger.trigger_type === 'deadline_reminder' ? 'warning' : 'info',
        target: trigger.target_type === 'all_users' ? 'all' : 'specific_users',
        target_criteria: trigger.target_criteria,
        is_active: true,
        priority: 5,
        start_date: new Date().toISOString(),
      });

      if (error) throw error;

      // Update trigger stats
      trigger.last_triggered = new Date().toISOString();
      trigger.total_sent++;
      await this.saveNotificationTriggers(triggers);

      return { success: true, sentCount: 1 };
    } catch (error) {
      logger.error('Failed to execute trigger', error, 'DataSubmissions');
      return { success: false, sentCount: 0 };
    }
  }

  private getDefaultNotificationTriggers(): NotificationTrigger[] {
    return [
      {
        id: 'trigger_deadline_7days',
        name: 'Deadline Reminder (7 days)',
        description: 'Remind users 7 days before application deadlines',
        enabled: true,
        trigger_type: 'deadline_reminder',
        target_type: 'by_interest',
        target_criteria: { interested_universities: true },
        schedule_type: 'recurring',
        schedule_time: null,
        recurring_pattern: '0 9 * * *', // Daily at 9 AM
        days_before: 7,
        title_template: '⏰ Deadline Approaching!',
        message_template: 'Application deadline for {university} is in 7 days. Don\'t miss it!',
        last_triggered: null,
        total_sent: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 'trigger_entry_test',
        name: 'Entry Test Reminder',
        description: 'Remind users about upcoming entry tests',
        enabled: true,
        trigger_type: 'entry_test_reminder',
        target_type: 'all_users',
        target_criteria: {},
        schedule_type: 'recurring',
        schedule_time: null,
        recurring_pattern: '0 8 * * 1', // Every Monday at 8 AM
        days_before: 14,
        title_template: '📝 Entry Test Coming Up!',
        message_template: '{test_name} registration deadline is approaching. Register now!',
        last_triggered: null,
        total_sent: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 'trigger_merit_published',
        name: 'Merit List Published',
        description: 'Notify when new merit lists are available',
        enabled: true,
        trigger_type: 'merit_published',
        target_type: 'by_university',
        target_criteria: {},
        schedule_type: 'immediate',
        schedule_time: null,
        recurring_pattern: null,
        days_before: null,
        title_template: '🎓 Merit List Published!',
        message_template: '{university} has published merit list for {program}. Check your status!',
        last_triggered: null,
        total_sent: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ];
  }

  // =========================================================================
  // MERIT RECORDS MANAGEMENT
  // =========================================================================

  /**
   * Get merit records
   */
  async getMeritRecords(filters?: {
    university_id?: string;
    program_id?: string;
    year?: number;
  }): Promise<MeritRecord[]> {
    try {
      const data = await AsyncStorage.getItem(this.MERIT_KEY);
      let records: MeritRecord[] = data ? JSON.parse(data) : [];

      if (filters) {
        if (filters.university_id) records = records.filter(r => r.university_id === filters.university_id);
        if (filters.program_id) records = records.filter(r => r.program_id === filters.program_id);
        if (filters.year) records = records.filter(r => r.year === filters.year);
      }

      return records.sort((a, b) => b.year - a.year);
    } catch {
      return [];
    }
  }

  /**
   * Add or update a merit record
   */
  async upsertMeritRecord(record: Partial<MeritRecord> & { id?: string }): Promise<string> {
    try {
      const records = await this.getMeritRecords();
      const id = record.id || `merit_${Date.now()}`;
      const index = records.findIndex(r => r.id === id);

      const fullRecord: MeritRecord = {
        id,
        university_id: record.university_id || '',
        university_name: record.university_name || '',
        program_id: record.program_id || '',
        program_name: record.program_name || '',
        year: record.year || new Date().getFullYear(),
        round: record.round || 1,
        merit_type: record.merit_type || 'open',
        closing_merit: record.closing_merit || 0,
        aggregate_formula: record.aggregate_formula || null,
        total_seats: record.total_seats || null,
        filled_seats: record.filled_seats || null,
        source: record.source || null,
        verified: record.verified ?? false,
        updated_at: new Date().toISOString(),
      };

      if (index >= 0) {
        records[index] = fullRecord;
      } else {
        records.push(fullRecord);
      }

      await AsyncStorage.setItem(this.MERIT_KEY, JSON.stringify(records));
      return id;
    } catch {
      return '';
    }
  }

  /**
   * Delete a merit record
   */
  async deleteMeritRecord(recordId: string): Promise<boolean> {
    try {
      const records = await this.getMeritRecords();
      const filtered = records.filter(r => r.id !== recordId);
      await AsyncStorage.setItem(this.MERIT_KEY, JSON.stringify(filtered));
      return true;
    } catch {
      return false;
    }
  }

  // =========================================================================
  // ADMISSION DEADLINES MANAGEMENT
  // =========================================================================

  /**
   * Get admission deadlines
   */
  async getAdmissionDeadlines(filters?: {
    university_id?: string;
    deadline_type?: string;
    upcoming_only?: boolean;
  }): Promise<AdmissionDeadline[]> {
    try {
      const data = await AsyncStorage.getItem(this.DEADLINES_KEY);
      let deadlines: AdmissionDeadline[] = data ? JSON.parse(data) : [];

      if (filters) {
        if (filters.university_id) deadlines = deadlines.filter(d => d.university_id === filters.university_id);
        if (filters.deadline_type) deadlines = deadlines.filter(d => d.deadline_type === filters.deadline_type);
        if (filters.upcoming_only) {
          const now = new Date().toISOString();
          deadlines = deadlines.filter(d => d.deadline_date > now || (d.extension_date && d.extension_date > now));
        }
      }

      return deadlines.sort((a, b) => new Date(a.deadline_date).getTime() - new Date(b.deadline_date).getTime());
    } catch {
      return [];
    }
  }

  /**
   * Add or update an admission deadline
   */
  async upsertAdmissionDeadline(deadline: Partial<AdmissionDeadline> & { id?: string }): Promise<string> {
    try {
      const deadlines = await this.getAdmissionDeadlines();
      const id = deadline.id || `deadline_${Date.now()}`;
      const index = deadlines.findIndex(d => d.id === id);

      const fullDeadline: AdmissionDeadline = {
        id,
        university_id: deadline.university_id || '',
        university_name: deadline.university_name || '',
        program_type: deadline.program_type || 'undergraduate',
        deadline_type: deadline.deadline_type || 'application',
        deadline_date: deadline.deadline_date || new Date().toISOString(),
        description: deadline.description || '',
        is_extended: deadline.is_extended ?? false,
        extension_date: deadline.extension_date || null,
        source_url: deadline.source_url || null,
        verified: deadline.verified ?? false,
        updated_at: new Date().toISOString(),
      };

      if (index >= 0) {
        deadlines[index] = fullDeadline;
      } else {
        deadlines.push(fullDeadline);
      }

      await AsyncStorage.setItem(this.DEADLINES_KEY, JSON.stringify(deadlines));
      return id;
    } catch {
      return '';
    }
  }

  /**
   * Delete an admission deadline
   */
  async deleteAdmissionDeadline(deadlineId: string): Promise<boolean> {
    try {
      const deadlines = await this.getAdmissionDeadlines();
      const filtered = deadlines.filter(d => d.id !== deadlineId);
      await AsyncStorage.setItem(this.DEADLINES_KEY, JSON.stringify(filtered));
      return true;
    } catch {
      return false;
    }
  }

  // =========================================================================
  // ENTRY TEST INFO MANAGEMENT
  // =========================================================================

  /**
   * Get entry test info
   */
  async getEntryTestInfo(filters?: {
    conducting_body?: string;
    upcoming_only?: boolean;
  }): Promise<EntryTestInfo[]> {
    try {
      const data = await AsyncStorage.getItem(this.ENTRY_TESTS_KEY);
      let tests: EntryTestInfo[] = data ? JSON.parse(data) : [];

      if (filters) {
        if (filters.conducting_body) tests = tests.filter(t => t.conducting_body === filters.conducting_body);
        if (filters.upcoming_only) {
          const now = new Date().toISOString();
          tests = tests.filter(t => t.test_date > now);
        }
      }

      return tests.sort((a, b) => new Date(a.test_date).getTime() - new Date(b.test_date).getTime());
    } catch {
      return [];
    }
  }

  /**
   * Add or update entry test info
   */
  async upsertEntryTestInfo(test: Partial<EntryTestInfo> & { id?: string }): Promise<string> {
    try {
      const tests = await this.getEntryTestInfo();
      const id = test.id || `test_${Date.now()}`;
      const index = tests.findIndex(t => t.id === id);

      const fullTest: EntryTestInfo = {
        id,
        test_name: test.test_name || '',
        conducting_body: test.conducting_body || '',
        test_date: test.test_date || new Date().toISOString(),
        registration_deadline: test.registration_deadline || new Date().toISOString(),
        result_date: test.result_date || null,
        test_centers: test.test_centers || [],
        eligibility: test.eligibility || '',
        fee: test.fee || 0,
        website: test.website || '',
        syllabus_url: test.syllabus_url || null,
        verified: test.verified ?? false,
        updated_at: new Date().toISOString(),
      };

      if (index >= 0) {
        tests[index] = fullTest;
      } else {
        tests.push(fullTest);
      }

      await AsyncStorage.setItem(this.ENTRY_TESTS_KEY, JSON.stringify(tests));
      return id;
    } catch {
      return '';
    }
  }

  /**
   * Delete entry test info
   */
  async deleteEntryTestInfo(testId: string): Promise<boolean> {
    try {
      const tests = await this.getEntryTestInfo();
      const filtered = tests.filter(t => t.id !== testId);
      await AsyncStorage.setItem(this.ENTRY_TESTS_KEY, JSON.stringify(filtered));
      return true;
    } catch {
      return false;
    }
  }

  // =========================================================================
  // STATISTICS
  // =========================================================================

  /**
   * Get comprehensive statistics
   */
  async getStatistics(): Promise<{
    submissions: { total: number; pending: number; approved: number; rejected: number; autoApproved: number };
    merit: { total: number; verified: number; thisYear: number };
    deadlines: { total: number; upcoming: number; expired: number };
    entryTests: { total: number; upcoming: number };
    triggers: { total: number; enabled: number; totalSent: number };
    autoRules: { total: number; enabled: number; totalAutoApproved: number };
  }> {
    const submissions = await this.getSubmissions();
    const merit = await this.getMeritRecords();
    const deadlines = await this.getAdmissionDeadlines();
    const tests = await this.getEntryTestInfo();
    const triggers = await this.getNotificationTriggers();
    const autoRules = await this.getAutoApprovalRules();
    
    const now = new Date();
    const thisYear = now.getFullYear();

    return {
      submissions: {
        total: submissions.length,
        pending: submissions.filter(s => s.status === 'pending').length,
        approved: submissions.filter(s => s.status === 'approved').length,
        rejected: submissions.filter(s => s.status === 'rejected').length,
        autoApproved: submissions.filter(s => s.status === 'auto_approved').length,
      },
      merit: {
        total: merit.length,
        verified: merit.filter(m => m.verified).length,
        thisYear: merit.filter(m => m.year === thisYear).length,
      },
      deadlines: {
        total: deadlines.length,
        upcoming: deadlines.filter(d => new Date(d.deadline_date) > now).length,
        expired: deadlines.filter(d => new Date(d.deadline_date) <= now).length,
      },
      entryTests: {
        total: tests.length,
        upcoming: tests.filter(t => new Date(t.test_date) > now).length,
      },
      triggers: {
        total: triggers.length,
        enabled: triggers.filter(t => t.enabled).length,
        totalSent: triggers.reduce((sum, t) => sum + t.total_sent, 0),
      },
      autoRules: {
        total: autoRules.length,
        enabled: autoRules.filter(r => r.enabled).length,
        totalAutoApproved: autoRules.reduce((sum, r) => sum + r.total_auto_approved, 0),
      },
    };
  }
}

// Export singleton instance
export const dataSubmissionsService = new DataSubmissionsService();
export default dataSubmissionsService;
