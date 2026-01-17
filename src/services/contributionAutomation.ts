/**
 * Contribution Automation Service
 * 
 * Manages the automated contribution approval workflow:
 * 1. User submits contribution → stored in Supabase
 * 2. Auto-approval rules evaluated (if enabled by admin)
 * 3. If auto-approved: apply to Turso, send thank you notification, update contributor stats
 * 4. If requires manual approval: notify admin
 * 
 * Hybrid Database Strategy:
 * - TURSO: Static data updates (universities, programs, fees, tests, deadlines)
 * - SUPABASE: Contributions, audit trail, user stats, notifications
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from './supabase';
import { hybridDataService } from './hybridData';
import { dataSubmissionsService, DataSubmission } from './dataSubmissions';
import { notificationsService } from './notifications';
import { adminService } from './admin';
import { logger } from '../utils/logger';

// ============================================================================
// TYPES
// ============================================================================

export interface ContributionStats {
  userId: string;
  totalContributions: number;
  approvedCount: number;
  autoApprovedCount: number;
  rejectedCount: number;
  pendingCount: number;
  approvalRate: number; // 0-100%
  userImpact: number; // How many people benefited from their edits
  trustLevel: number; // 0-5
  leaderboardRank: number | null;
  badges: ContributorBadge[];
  lastContributionDate: string | null;
  totalRecordsImproved: number;
}

export interface ContributorBadge {
  id: string;
  name: string; // 'power_contributor', 'data_hero', 'accuracy_expert', etc.
  label: string; // Display label
  description: string;
  icon: string;
  earnedAt: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'legendary';
}

export interface AutoApprovalEvent {
  submissionId: string;
  userId: string;
  submissionType: string;
  entityType: string;
  entityName: string;
  proposedValue: any;
  affectedRecordsCount: number;
  approvalReason: string;
  appliedAt: string;
}

// ============================================================================
// CONTRIBUTION AUTOMATION SERVICE
// ============================================================================

class ContributionAutomationService {
  private readonly STORAGE_KEY = '@pakuni_contribution_stats';
  private readonly GLOBAL_AUTO_APPROVAL_KEY = '@pakuni_global_auto_approval_enabled';
  private autoApprovalEnabled = true;

  async initialize() {
    try {
      const enabled = await this.isGlobalAutoApprovalEnabled();
      this.autoApprovalEnabled = enabled;
      logger.log('ContributionAutomation', 'Initialized with auto-approval:', enabled);
    } catch (error) {
      logger.error('ContributionAutomation', 'Failed to initialize:', error);
    }
  }

  /**
   * Admin sets global auto-approval on/off
   */
  async setGlobalAutoApprovalEnabled(enabled: boolean): Promise<void> {
    try {
      this.autoApprovalEnabled = enabled;
      await AsyncStorage.setItem(this.GLOBAL_AUTO_APPROVAL_KEY, JSON.stringify(enabled));

      // Also save to Supabase for persistence across devices
      await adminService.setSetting('auto_approval_enabled', enabled.toString());

      logger.log('ContributionAutomation', 'Global auto-approval set to:', enabled);
    } catch (error) {
      logger.error('ContributionAutomation', 'Failed to set global auto-approval:', error);
      throw error;
    }
  }

  async isGlobalAutoApprovalEnabled(): Promise<boolean> {
    try {
      // Try local storage first
      const stored = await AsyncStorage.getItem(this.GLOBAL_AUTO_APPROVAL_KEY);
      if (stored !== null) {
        return JSON.parse(stored);
      }

      // Fetch from Supabase
      const setting = await adminService.getSetting('auto_approval_enabled');
      const enabled = setting?.value === 'true';
      await AsyncStorage.setItem(this.GLOBAL_AUTO_APPROVAL_KEY, JSON.stringify(enabled));
      return enabled;
    } catch (error) {
      logger.error('ContributionAutomation', 'Failed to check auto-approval enabled:', error);
      return false; // Default to false for safety
    }
  }

  /**
   * Process a new contribution - evaluate for auto-approval
   */
  async processContribution(submission: DataSubmission): Promise<{
    autoApproved: boolean;
    reason: string;
    appliedAt?: string;
  }> {
    try {
      // Check if global auto-approval is enabled
      if (!this.autoApprovalEnabled) {
        return {
          autoApproved: false,
          reason: 'Global auto-approval is disabled by admin',
        };
      }

      // Get applicable auto-approval rules
      const rules = await dataSubmissionsService.getAutoApprovalRules();
      const enabledRules = rules.filter((r) => r.enabled);

      if (enabledRules.length === 0) {
        return {
          autoApproved: false,
          reason: 'No auto-approval rules configured',
        };
      }

      // Evaluate rules
      for (const rule of enabledRules) {
        if (this.ruleMatches(submission, rule)) {
          return {
            autoApproved: true,
            reason: rule.name,
          };
        }
      }

      return {
        autoApproved: false,
        reason: 'Does not match any auto-approval rules',
      };
    } catch (error) {
      logger.error('ContributionAutomation', 'Failed to process contribution:', error);
      return {
        autoApproved: false,
        reason: 'Error evaluating auto-approval rules',
      };
    }
  }

  /**
   * Check if a submission matches an auto-approval rule
   */
  private ruleMatches(submission: DataSubmission, rule: any): boolean {
    try {
      // Check submission type
      if (
        rule.submission_types &&
        rule.submission_types.length > 0 &&
        !rule.submission_types.includes(submission.type)
      ) {
        return false;
      }

      // Check trust level
      if (submission.user_trust_level < rule.min_trust_level) {
        return false;
      }

      // Check entity types
      if (rule.entity_types && rule.entity_types.length > 0 && !rule.entity_types.includes(submission.entity_type)) {
        return false;
      }

      // Check if source is required
      if (rule.require_source && !submission.source_proof) {
        return false;
      }

      // Check auth provider restrictions
      if (rule.allowed_auth_providers && rule.allowed_auth_providers.length > 0) {
        if (!rule.allowed_auth_providers.includes(submission.user_auth_provider)) {
          return false;
        }
      }

      // Check for Google auto-approve
      if (rule.auto_trust_google && submission.user_auth_provider === 'google') {
        return true;
      }

      // Check email verified requirement
      if (rule.auto_trust_email_verified && submission.user_auth_provider !== 'email') {
        return true;
      }

      // Check max value change for numeric values
      if (rule.max_value_change_percent !== null && typeof submission.proposed_value === 'number') {
        const currentNum = Number(submission.current_value) || 0;
        const proposedNum = Number(submission.proposed_value) || 0;

        if (currentNum !== 0) {
          const percentChange = Math.abs((proposedNum - currentNum) / currentNum) * 100;
          if (percentChange > rule.max_value_change_percent) {
            return false;
          }
        }
      }

      return true;
    } catch (error) {
      logger.error('ContributionAutomation', 'Error matching rule:', error);
      return false;
    }
  }

  /**
   * Apply an auto-approved contribution to database
   */
  async applyAutoApprovedContribution(submission: DataSubmission): Promise<void> {
    try {
      // Apply to database through data submissions service
      await dataSubmissionsService.applySubmissionToAllRelatedData(submission.id);

      // Send thank you notification
      await this.sendContributorThankYou(submission);

      // Update contributor stats
      await this.updateContributorStats(submission);

      // Record auto-approval event for analytics
      await this.recordAutoApprovalEvent(submission);

      logger.log('ContributionAutomation', 'Auto-approved contribution applied:', submission.id);
    } catch (error) {
      logger.error('ContributionAutomation', 'Failed to apply auto-approved contribution:', error);
      throw error;
    }
  }

  /**
   * Send thank you notification to contributor
   */
  private async sendContributorThankYou(submission: DataSubmission): Promise<void> {
    try {
      const message = this.generateThankYouMessage(submission);

      // Send in-app notification
      await notificationsService.sendNotification({
        userId: submission.user_id,
        title: '🎉 Thanks for Contributing!',
        body: message,
        type: 'contribution_approved',
        data: {
          submissionId: submission.id,
          showAnimation: 'confetti', // Trigger confetti animation
        },
      });

      // Also create a notification record in database
      const { error } = await supabase.from('notifications').insert({
        user_id: submission.user_id,
        title: '🎉 Thanks for Contributing!',
        message: message,
        type: 'contribution_approved',
        related_entity_id: submission.id,
        related_entity_type: 'submission',
        created_at: new Date().toISOString(),
      });

      if (error) {
        logger.error('ContributionAutomation', 'Failed to save notification:', error);
      }
    } catch (error) {
      logger.error('ContributionAutomation', 'Failed to send thank you:', error);
      // Don't throw - notification failure shouldn't block the process
    }
  }

  /**
   * Generate a personalized thank you message
   */
  private generateThankYouMessage(submission: DataSubmission): string {
    const messages: { [key: string]: string } = {
      merit_update: `Your merit cutoff update for ${submission.entity_name} has been approved and applied! Help students find the right match. 🎯`,
      date_correction: `Your deadline correction has been saved. Thousands of students will see the accurate dates. ⏰`,
      entry_test_update: `Your entry test information is now live for ${submission.entity_name}! 📝`,
      fee_update: `Your fee update helps students make better financial decisions. Thank you! 💰`,
      university_info: `Your improvement to ${submission.entity_name}'s profile has been published. 🏛️`,
      scholarship_info: `Your scholarship update helps students find funding opportunities. 💎`,
      program_info: `Your program details are now helping students explore ${submission.entity_name}. 📚`,
      other: `Your contribution makes PakUni better for everyone. Thank you! 👏`,
    };

    return messages[submission.type] || messages.other;
  }

  /**
   * Update contributor statistics
   */
  async updateContributorStats(submission: DataSubmission): Promise<void> {
    try {
      const stats = await this.getContributorStats(submission.user_id);

      stats.totalContributions += 1;
      stats.autoApprovedCount += 1;
      stats.approvedCount += 1;
      stats.lastContributionDate = new Date().toISOString();
      stats.approvalRate = Math.round((stats.approvedCount / stats.totalContributions) * 100);

      // Estimate impact based on related records
      const affectedRecords = await this.estimateImpactedRecords(submission);
      stats.userImpact += affectedRecords;
      stats.totalRecordsImproved += affectedRecords;

      // Check and award badges
      stats.badges = await this.evaluateAndAwardBadges(stats);

      // Update trust level based on successful contributions
      stats.trustLevel = Math.min(5, Math.floor(stats.approvedCount / 10));

      // Save locally and to database
      await AsyncStorage.setItem(
        `${this.STORAGE_KEY}_${submission.user_id}`,
        JSON.stringify(stats),
      );

      // Save to Supabase for leaderboard
      const { error } = await supabase
        .from('contributor_stats')
        .upsert(
          {
            user_id: submission.user_id,
            total_contributions: stats.totalContributions,
            approved_count: stats.approvedCount,
            auto_approved_count: stats.autoApprovedCount,
            approval_rate: stats.approvalRate,
            trust_level: stats.trustLevel,
            user_impact: stats.userImpact,
            last_contribution_date: stats.lastContributionDate,
            total_records_improved: stats.totalRecordsImproved,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'user_id' },
        );

      if (error) {
        logger.error('ContributionAutomation', 'Failed to save contributor stats:', error);
      }
    } catch (error) {
      logger.error('ContributionAutomation', 'Failed to update contributor stats:', error);
    }
  }

  /**
   * Get contributor statistics
   */
  async getContributorStats(userId: string): Promise<ContributionStats> {
    try {
      // Try local storage first
      const cached = await AsyncStorage.getItem(`${this.STORAGE_KEY}_${userId}`);
      if (cached) {
        const stats = JSON.parse(cached);
        if (stats && typeof stats === 'object') {
          return stats;
        }
      }

      // Fetch from Supabase
      const { data, error } = await supabase
        .from('contributor_stats')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        logger.error('ContributionAutomation', 'Failed to fetch stats:', error);
      }

      if (data) {
        const stats: ContributionStats = {
          userId,
          totalContributions: data.total_contributions || 0,
          approvedCount: data.approved_count || 0,
          autoApprovedCount: data.auto_approved_count || 0,
          rejectedCount: data.rejected_count || 0,
          pendingCount: data.pending_count || 0,
          approvalRate: data.approval_rate || 0,
          userImpact: data.user_impact || 0,
          trustLevel: data.trust_level || 0,
          leaderboardRank: data.leaderboard_rank,
          badges: data.badges || [],
          lastContributionDate: data.last_contribution_date,
          totalRecordsImproved: data.total_records_improved || 0,
        };
        return stats;
      }

      // Create new stats record
      return {
        userId,
        totalContributions: 0,
        approvedCount: 0,
        autoApprovedCount: 0,
        rejectedCount: 0,
        pendingCount: 0,
        approvalRate: 0,
        userImpact: 0,
        trustLevel: 0,
        leaderboardRank: null,
        badges: [],
        lastContributionDate: null,
        totalRecordsImproved: 0,
      };
    } catch (error) {
      logger.error('ContributionAutomation', 'Error getting contributor stats:', error);
      // Return empty stats on error
      return {
        userId,
        totalContributions: 0,
        approvedCount: 0,
        autoApprovedCount: 0,
        rejectedCount: 0,
        pendingCount: 0,
        approvalRate: 0,
        userImpact: 0,
        trustLevel: 0,
        leaderboardRank: null,
        badges: [],
        lastContributionDate: null,
        totalRecordsImproved: 0,
      };
    }
  }

  /**
   * Estimate how many records will be impacted by this contribution
   */
  private async estimateImpactedRecords(submission: DataSubmission): Promise<number> {
    try {
      let count = 1;

      // Get related data based on submission type
      if (submission.entity_type === 'university') {
        const uni = await hybridDataService.getUniversity(submission.entity_id);
        if (uni) {
          // Count programs, test centers, deadlines, etc.
          count = (uni.programs?.length || 0) + (uni.test_centers?.length || 0) + 1;
        }
      } else if (submission.entity_type === 'program') {
        // Program impacts merit cutoffs, deadlines
        count = 3;
      } else if (submission.entity_type === 'entry_test') {
        // Test impacts registrations
        count = 2;
      }

      return Math.max(1, count);
    } catch (error) {
      logger.error('ContributionAutomation', 'Error estimating impact:', error);
      return 1;
    }
  }

  /**
   * Evaluate and award badges to contributor
   */
  private async evaluateAndAwardBadges(stats: ContributionStats): Promise<ContributorBadge[]> {
    const badges: ContributorBadge[] = [...(stats.badges || [])];
    const now = new Date().toISOString();

    // Badge criteria
    const badgeCriteria = [
      {
        id: 'first_contribution',
        name: 'first_contribution',
        label: 'First Step',
        description: 'Made your first contribution',
        icon: '🚀',
        rarity: 'common' as const,
        check: () => stats.totalContributions >= 1,
      },
      {
        id: 'power_contributor',
        name: 'power_contributor',
        label: 'Power Contributor',
        description: 'Made 10+ approved contributions',
        icon: '⚡',
        rarity: 'uncommon' as const,
        check: () => stats.approvedCount >= 10,
      },
      {
        id: 'accuracy_expert',
        name: 'accuracy_expert',
        label: 'Accuracy Expert',
        description: '95%+ approval rate with 5+ contributions',
        icon: '🎯',
        rarity: 'rare' as const,
        check: () => stats.approvalRate >= 95 && stats.totalContributions >= 5,
      },
      {
        id: 'data_hero',
        name: 'data_hero',
        label: 'Data Hero',
        description: 'Impacted 50+ student records with edits',
        icon: '🦸',
        rarity: 'rare' as const,
        check: () => stats.userImpact >= 50,
      },
      {
        id: 'trusted_expert',
        name: 'trusted_expert',
        label: 'Trusted Expert',
        description: 'Reached trust level 4 or higher',
        icon: '🏅',
        rarity: 'rare' as const,
        check: () => stats.trustLevel >= 4,
      },
      {
        id: 'legendary_contributor',
        name: 'legendary_contributor',
        label: 'Legendary',
        description: '100+ approved contributions',
        icon: '👑',
        rarity: 'legendary' as const,
        check: () => stats.approvedCount >= 100,
      },
    ];

    // Check each badge
    for (const criteria of badgeCriteria) {
      if (criteria.check() && !badges.find((b) => b.id === criteria.id)) {
        badges.push({
          id: criteria.id,
          name: criteria.name,
          label: criteria.label,
          description: criteria.description,
          icon: criteria.icon,
          earnedAt: now,
          rarity: criteria.rarity,
        });
      }
    }

    return badges;
  }

  /**
   * Record auto-approval event for analytics
   */
  private async recordAutoApprovalEvent(submission: DataSubmission): Promise<void> {
    try {
      const { error } = await supabase.from('auto_approval_events').insert({
        submission_id: submission.id,
        user_id: submission.user_id,
        submission_type: submission.type,
        entity_type: submission.entity_type,
        entity_name: submission.entity_name,
        proposed_value: submission.proposed_value,
        applied_at: new Date().toISOString(),
      });

      if (error) {
        logger.error('ContributionAutomation', 'Failed to record event:', error);
      }
    } catch (error) {
      logger.error('ContributionAutomation', 'Error recording event:', error);
    }
  }

  /**
   * Get leaderboard of top contributors
   */
  async getContributorLeaderboard(limit: number = 10): Promise<ContributionStats[]> {
    try {
      const { data, error } = await supabase
        .from('contributor_stats')
        .select('*')
        .order('user_impact', { ascending: false })
        .limit(limit);

      if (error) {
        logger.error('ContributionAutomation', 'Failed to fetch leaderboard:', error);
        return [];
      }

      return (data || []).map((d, index) => ({
        userId: d.user_id,
        totalContributions: d.total_contributions || 0,
        approvedCount: d.approved_count || 0,
        autoApprovedCount: d.auto_approved_count || 0,
        rejectedCount: d.rejected_count || 0,
        pendingCount: d.pending_count || 0,
        approvalRate: d.approval_rate || 0,
        userImpact: d.user_impact || 0,
        trustLevel: d.trust_level || 0,
        leaderboardRank: index + 1,
        badges: d.badges || [],
        lastContributionDate: d.last_contribution_date,
        totalRecordsImproved: d.total_records_improved || 0,
      }));
    } catch (error) {
      logger.error('ContributionAutomation', 'Error getting leaderboard:', error);
      return [];
    }
  }
}

export const contributionAutomationService = new ContributionAutomationService();
