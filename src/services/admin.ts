/**
 * Admin Service
 * Comprehensive admin panel service for PakUni
 * Handles user management, content moderation, analytics, and settings
 * 
 * OPTIMIZED FOR SUPABASE FREE TIER:
 * - No real-time subscriptions (saves egress)
 * - Count-only queries where possible
 * - Paginated data fetching
 * - Minimal data transfer
 */

import {supabase} from './supabase';
import {logger} from '../utils/logger';

// ============================================================================
// TYPES
// ============================================================================

export type UserRole = 'user' | 'moderator' | 'content_editor' | 'admin' | 'super_admin';
export type ReportStatus = 'pending' | 'reviewing' | 'resolved' | 'dismissed';
export type AnnouncementType = 'info' | 'warning' | 'alert' | 'update' | 'promotion';
export type FeedbackType = 'bug' | 'feature_request' | 'content_error' | 'general' | 'complaint';
export type FeedbackCategory = 'bug' | 'feature' | 'improvement' | 'content' | 'other';
export type FeedbackStatus = 'new' | 'in_review' | 'planned' | 'in_progress' | 'completed' | 'declined';

// Admin user type
export interface AdminUser {
  id: string;
  full_name: string | null;
  email: string | null;
  avatar_url: string | null;
  role: UserRole;
}

export interface UserProfile {
  id: string;
  full_name: string | null;
  email: string | null;
  avatar_url: string | null;
  role: UserRole;
  is_verified: boolean;
  is_banned: boolean;
  ban_reason: string | null;
  ban_expires_at: string | null;
  last_login_at: string | null;
  login_count: number;
  created_at: string;
  updated_at: string;
}

export interface Announcement {
  id: string;
  title: string;
  message: string;
  type: AnnouncementType;
  target: 'all' | 'users' | 'moderators' | 'admins' | 'province_specific' | 'field_specific';
  target_criteria: any;
  is_active: boolean;
  is_dismissible: boolean;
  priority: number;
  action_url: string | null;
  action_label: string | null;
  image_url: string | null;
  start_date: string;
  end_date: string | null;
  created_by: string | null;
  created_at: string;
  updated_at?: string;
}

export interface ContentReport {
  id: string;
  reporter_id: string | null;
  content_type: string;
  content_id: string;
  reason: string;
  description: string | null;
  status: ReportStatus;
  reviewed_by: string | null;
  resolution_notes: string | null;
  moderator_notes: string | null;
  resolved_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserFeedback {
  id: string;
  user_id: string | null;
  type: FeedbackType;
  category: FeedbackCategory;
  title: string;
  message: string;
  rating: number | null;
  contact_email: string | null;
  status: FeedbackStatus;
  admin_response: string | null;
  responded_by: string | null;
  responded_at: string | null;
  created_at: string;
  metadata?: {
    feedbackType?: string;
    severity?: string;
    contentType?: string;
    materialType?: string;
    universityName?: string;
    scholarshipName?: string;
    materialUrl?: string;
    wouldRecommend?: boolean;
    deviceInfo?: string;
    appVersion?: string;
    submittedAt?: string;
  };
}

export interface AppSetting {
  id: string;
  key: string;
  value: any;
  value_type: 'string' | 'number' | 'boolean' | 'json';
  description: string | null;
  category: string;
  is_public: boolean;
  updated_by?: string | null;
  updated_at: string;
}

export interface AuditLog {
  id: string;
  admin_id: string | null;
  action: string;
  target_type: string | null;
  target_id: string | null;
  entity_type: string | null;
  entity_id: string | null;
  description: string | null;
  performed_by: string | null;
  old_values: any;
  new_values: any;
  old_value: any;
  new_value: any;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

export interface AnalyticsSummary {
  date: string;
  total_users: number;
  new_users: number;
  active_users: number;
  total_sessions: number;
  university_views: number;
  scholarship_views: number;
  calculator_uses: number;
  search_queries: number;
  top_universities: any[];
  top_searches: any[];
  device_breakdown: any;
  province_breakdown: any;
}

export interface DashboardStats {
  totalUsers: number;
  newUsersToday: number;
  newUsersThisWeek: number;
  activeUsersToday: number;
  totalUniversities: number;
  totalScholarships: number;
  totalPrograms: number;
  pendingReports: number;
  pendingFeedback: number;
  activeAnnouncements: number;
}

// ============================================================================
// ADMIN SERVICE CLASS
// ============================================================================

class AdminService {
  private currentUserRole: UserRole | null = null;

  // -------------------------------------------------------------------------
  // AUTHENTICATION & AUTHORIZATION
  // -------------------------------------------------------------------------

  /**
   * Check if current user is authenticated and get their role
   */
  async getCurrentUserRole(): Promise<UserRole | null> {
    try {
      const {data: {user}} = await supabase.auth.getUser();
      if (!user) return null;

      const {data, error} = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      this.currentUserRole = data?.role || 'user';
      return this.currentUserRole;
    } catch (error) {
      logger.error('Error getting user role', error, 'Admin');
      return null;
    }
  }

  /**
   * Check if current user has admin privileges
   */
  async isAdmin(): Promise<boolean> {
    const role = await this.getCurrentUserRole();
    return role === 'admin' || role === 'super_admin';
  }

  /**
   * Check if current user has moderator or higher privileges
   */
  async isModeratorOrAbove(): Promise<boolean> {
    const role = await this.getCurrentUserRole();
    return ['moderator', 'content_editor', 'admin', 'super_admin'].includes(role || '');
  }

  /**
   * Check if current user can edit content
   */
  async canEditContent(): Promise<boolean> {
    const role = await this.getCurrentUserRole();
    return ['content_editor', 'admin', 'super_admin'].includes(role || '');
  }

  // -------------------------------------------------------------------------
  // DASHBOARD
  // -------------------------------------------------------------------------

  /**
   * Get dashboard statistics
   */
  async getDashboardStats(): Promise<DashboardStats> {
    try {
      const today = new Date().toISOString().split('T')[0];
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      // Run queries in parallel
      const [
        usersResult,
        newTodayResult,
        newWeekResult,
        universitiesResult,
        scholarshipsResult,
        programsResult,
        reportsResult,
        feedbackResult,
        announcementsResult,
      ] = await Promise.all([
        supabase.from('profiles').select('id', {count: 'exact', head: true}),
        supabase.from('profiles').select('id', {count: 'exact', head: true}).gte('created_at', today),
        supabase.from('profiles').select('id', {count: 'exact', head: true}).gte('created_at', weekAgo),
        supabase.from('universities').select('id', {count: 'exact', head: true}),
        supabase.from('scholarships').select('id', {count: 'exact', head: true}),
        supabase.from('programs').select('id', {count: 'exact', head: true}),
        supabase.from('content_reports').select('id', {count: 'exact', head: true}).eq('status', 'pending'),
        supabase.from('user_feedback').select('id', {count: 'exact', head: true}).eq('status', 'pending'),
        supabase.from('announcements').select('id', {count: 'exact', head: true}).eq('is_active', true),
      ]);

      return {
        totalUsers: usersResult.count || 0,
        newUsersToday: newTodayResult.count || 0,
        newUsersThisWeek: newWeekResult.count || 0,
        activeUsersToday: 0, // Would need analytics events to calculate
        totalUniversities: universitiesResult.count || 0,
        totalScholarships: scholarshipsResult.count || 0,
        totalPrograms: programsResult.count || 0,
        pendingReports: reportsResult.count || 0,
        pendingFeedback: feedbackResult.count || 0,
        activeAnnouncements: announcementsResult.count || 0,
      };
    } catch (error) {
      logger.error('Error getting dashboard stats', error, 'Admin');
      return {
        totalUsers: 0,
        newUsersToday: 0,
        newUsersThisWeek: 0,
        activeUsersToday: 0,
        totalUniversities: 0,
        totalScholarships: 0,
        totalPrograms: 0,
        pendingReports: 0,
        pendingFeedback: 0,
        activeAnnouncements: 0,
      };
    }
  }

  // -------------------------------------------------------------------------
  // USER MANAGEMENT
  // -------------------------------------------------------------------------

  /**
   * Get all users with pagination and filters
   */
  async getUsers(options: {
    page?: number;
    pageSize?: number;
    search?: string;
    role?: UserRole;
    isBanned?: boolean;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  } = {}): Promise<{users: UserProfile[]; total: number}> {
    try {
      const {
        page = 1,
        pageSize = 20,
        search,
        role,
        isBanned,
        sortBy = 'created_at',
        sortOrder = 'desc',
      } = options;

      let query = supabase
        .from('profiles')
        .select('*', {count: 'exact'});

      if (search) {
        query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`);
      }

      if (role) {
        query = query.eq('role', role);
      }

      if (isBanned !== undefined) {
        query = query.eq('is_banned', isBanned);
      }

      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      const {data, error, count} = await query
        .order(sortBy, {ascending: sortOrder === 'asc'})
        .range(from, to);

      if (error) throw error;

      return {
        users: data || [],
        total: count || 0,
      };
    } catch (error) {
      logger.error('Error getting users', error, 'Admin');
      return {users: [], total: 0};
    }
  }

  /**
   * Get a single user by ID
   */
  async getUser(userId: string): Promise<UserProfile | null> {
    try {
      const {data, error} = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      logger.error('Error getting user', error, 'Admin');
      return null;
    }
  }

  /**
   * Update user role
   */
  async updateUserRole(userId: string, newRole: UserRole): Promise<boolean> {
    try {
      const {data, error} = await supabase
        .from('profiles')
        .update({role: newRole, updated_at: new Date().toISOString()})
        .eq('id', userId)
        .select('id, role');

      if (error) throw error;

      // Verify the update actually took effect (RLS may silently block it)
      if (!data || data.length === 0) {
        logger.error('Role update blocked by RLS - no rows affected', {userId, newRole}, 'Admin');
        throw new Error('Update failed: insufficient permissions. Ensure your admin RLS policies are applied.');
      }

      // Verify the role was actually changed
      if (data[0].role !== newRole) {
        logger.error('Role update did not persist', {expected: newRole, actual: data[0].role}, 'Admin');
        throw new Error('Role update did not persist. Check database policies.');
      }

      // Log the action
      await this.logAction('update_user_role', 'user', userId, null, {role: newRole});

      return true;
    } catch (error: any) {
      logger.error('Error updating user role', error, 'Admin');
      return false;
    }
  }

  /**
   * Ban a user
   */
  async banUser(userId: string, reason: string, expiresAt?: string): Promise<boolean> {
    try {
      const {data, error} = await supabase
        .from('profiles')
        .update({
          is_banned: true,
          ban_reason: reason,
          ban_expires_at: expiresAt || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId)
        .select('id, is_banned');

      if (error) throw error;

      // Verify the update actually took effect
      if (!data || data.length === 0) {
        logger.error('Ban update blocked by RLS - no rows affected', {userId}, 'Admin');
        throw new Error('Ban failed: insufficient permissions. Ensure admin RLS policies are applied.');
      }

      await this.logAction('ban_user', 'user', userId, null, {reason, expiresAt});

      return true;
    } catch (error) {
      logger.error('Error banning user', error, 'Admin');
      return false;
    }
  }

  /**
   * Unban a user
   */
  async unbanUser(userId: string): Promise<boolean> {
    try {
      const {data, error} = await supabase
        .from('profiles')
        .update({
          is_banned: false,
          ban_reason: null,
          ban_expires_at: null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId)
        .select('id, is_banned');

      if (error) throw error;

      // Verify the update actually took effect
      if (!data || data.length === 0) {
        logger.error('Unban update blocked by RLS - no rows affected', {userId}, 'Admin');
        throw new Error('Unban failed: insufficient permissions. Ensure admin RLS policies are applied.');
      }

      await this.logAction('unban_user', 'user', userId);

      return true;
    } catch (error) {
      logger.error('Error unbanning user', error, 'Admin');
      return false;
    }
  }

  /**
   * Verify a user
   */
  async verifyUser(userId: string): Promise<boolean> {
    try {
      const {data, error} = await supabase
        .from('profiles')
        .update({is_verified: true, updated_at: new Date().toISOString()})
        .eq('id', userId)
        .select('id, is_verified');

      if (error) throw error;

      // Verify the update actually took effect
      if (!data || data.length === 0) {
        logger.error('Verify update blocked by RLS - no rows affected', {userId}, 'Admin');
        throw new Error('Verify failed: insufficient permissions. Ensure admin RLS policies are applied.');
      }

      await this.logAction('verify_user', 'user', userId);

      return true;
    } catch (error) {
      logger.error('Error verifying user', error, 'Admin');
      return false;
    }
  }

  // -------------------------------------------------------------------------
  // CONTENT MANAGEMENT - UNIVERSITIES
  // -------------------------------------------------------------------------

  /**
   * Get all universities for admin management
   */
  async getUniversitiesAdmin(options: {
    page?: number;
    pageSize?: number;
    search?: string;
    type?: string;
    province?: string;
    isFeatured?: boolean;
  } = {}): Promise<{universities: any[]; total: number}> {
    try {
      const {page = 1, pageSize = 20, search, type, province, isFeatured} = options;

      let query = supabase
        .from('universities')
        .select('*', {count: 'exact'});

      if (search) {
        query = query.or(`name.ilike.%${search}%,short_name.ilike.%${search}%,city.ilike.%${search}%`);
      }

      if (type) {
        query = query.eq('type', type);
      }

      if (province) {
        query = query.eq('province', province);
      }

      if (isFeatured !== undefined) {
        query = query.eq('is_featured', isFeatured);
      }

      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      const {data, error, count} = await query
        .order('name')
        .range(from, to);

      if (error) throw error;

      return {universities: data || [], total: count || 0};
    } catch (error) {
      logger.error('Error getting universities', error, 'Admin');
      return {universities: [], total: 0};
    }
  }

  /**
   * Create a new university
   */
  async createUniversity(universityData: any): Promise<{success: boolean; id?: string; error?: string}> {
    try {
      const {data, error} = await supabase
        .from('universities')
        .insert([universityData])
        .select()
        .single();

      if (error) throw error;

      await this.logAction('create_university', 'university', data.id, null, universityData);

      return {success: true, id: data.id};
    } catch (error: any) {
      logger.error('Error creating university', error, 'Admin');
      return {success: false, error: error.message};
    }
  }

  /**
   * Update a university
   */
  async updateUniversity(universityId: string, updates: any): Promise<boolean> {
    try {
      // Get old data for audit log
      const {data: oldData} = await supabase
        .from('universities')
        .select('*')
        .eq('id', universityId)
        .single();

      const {data, error} = await supabase
        .from('universities')
        .update({...updates, updated_at: new Date().toISOString()})
        .eq('id', universityId)
        .select('id');

      if (error) throw error;

      if (!data || data.length === 0) {
        throw new Error('University update failed: insufficient permissions or record not found.');
      }

      await this.logAction('update_university', 'university', universityId, oldData, updates);

      return true;
    } catch (error) {
      logger.error('Error updating university', error, 'Admin');
      return false;
    }
  }

  /**
   * Delete a university
   */
  async deleteUniversity(universityId: string): Promise<boolean> {
    try {
      const {data: oldData} = await supabase
        .from('universities')
        .select('*')
        .eq('id', universityId)
        .single();

      const {error} = await supabase
        .from('universities')
        .delete()
        .eq('id', universityId);

      if (error) throw error;

      await this.logAction('delete_university', 'university', universityId, oldData);

      return true;
    } catch (error) {
      logger.error('Error deleting university', error, 'Admin');
      return false;
    }
  }

  /**
   * Toggle university featured status
   */
  async toggleUniversityFeatured(universityId: string, isFeatured: boolean): Promise<boolean> {
    return this.updateUniversity(universityId, {is_featured: isFeatured});
  }

  // -------------------------------------------------------------------------
  // CONTENT MANAGEMENT - SCHOLARSHIPS
  // -------------------------------------------------------------------------

  /**
   * Get all scholarships for admin management
   */
  async getScholarshipsAdmin(options: {
    page?: number;
    pageSize?: number;
    search?: string;
    type?: string;
    isActive?: boolean;
  } = {}): Promise<{scholarships: any[]; total: number}> {
    try {
      const {page = 1, pageSize = 20, search, type, isActive} = options;

      let query = supabase
        .from('scholarships')
        .select('*', {count: 'exact'});

      if (search) {
        query = query.or(`name.ilike.%${search}%,provider.ilike.%${search}%`);
      }

      if (type) {
        query = query.eq('type', type);
      }

      if (isActive !== undefined) {
        query = query.eq('is_active', isActive);
      }

      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      const {data, error, count} = await query
        .order('name')
        .range(from, to);

      if (error) throw error;

      return {scholarships: data || [], total: count || 0};
    } catch (error) {
      logger.error('Error getting scholarships', error, 'Admin');
      return {scholarships: [], total: 0};
    }
  }

  /**
   * Create a new scholarship
   */
  async createScholarship(scholarshipData: any): Promise<{success: boolean; id?: string; error?: string}> {
    try {
      const {data, error} = await supabase
        .from('scholarships')
        .insert([scholarshipData])
        .select()
        .single();

      if (error) throw error;

      await this.logAction('create_scholarship', 'scholarship', data.id, null, scholarshipData);

      return {success: true, id: data.id};
    } catch (error: any) {
      logger.error('Error creating scholarship', error, 'Admin');
      return {success: false, error: error.message};
    }
  }

  /**
   * Update a scholarship
   */
  async updateScholarship(scholarshipId: string, updates: any): Promise<boolean> {
    try {
      const {data: oldData} = await supabase
        .from('scholarships')
        .select('*')
        .eq('id', scholarshipId)
        .single();

      const {data, error} = await supabase
        .from('scholarships')
        .update({...updates, updated_at: new Date().toISOString()})
        .eq('id', scholarshipId)
        .select('id');

      if (error) throw error;

      if (!data || data.length === 0) {
        throw new Error('Scholarship update failed: insufficient permissions or record not found.');
      }

      await this.logAction('update_scholarship', 'scholarship', scholarshipId, oldData, updates);

      return true;
    } catch (error) {
      logger.error('Error updating scholarship', error, 'Admin');
      return false;
    }
  }

  /**
   * Delete a scholarship
   */
  async deleteScholarship(scholarshipId: string): Promise<boolean> {
    try {
      const {data: oldData} = await supabase
        .from('scholarships')
        .select('*')
        .eq('id', scholarshipId)
        .single();

      const {error} = await supabase
        .from('scholarships')
        .delete()
        .eq('id', scholarshipId);

      if (error) throw error;

      await this.logAction('delete_scholarship', 'scholarship', scholarshipId, oldData);

      return true;
    } catch (error) {
      logger.error('Error deleting scholarship', error, 'Admin');
      return false;
    }
  }

  // -------------------------------------------------------------------------
  // CONTENT MANAGEMENT - PROGRAMS
  // -------------------------------------------------------------------------

  /**
   * Get all programs for admin management
   * Uses local static data with optional Supabase sync for custom programs
   */
  async getProgramsAdmin(options: {
    page?: number;
    pageSize?: number;
    search?: string;
    field?: string;
    level?: string;
  } = {}): Promise<{programs: any[]; total: number}> {
    try {
      const {page = 1, pageSize = 50, search, field, level} = options;

      // First, try to get from Supabase (custom/edited programs)
      let query = supabase
        .from('programs')
        .select('*', {count: 'exact'});

      if (search) {
        query = query.or(`name.ilike.%${search}%,degree_title.ilike.%${search}%,field.ilike.%${search}%`);
      }

      if (field) {
        query = query.eq('field', field);
      }

      if (level) {
        query = query.eq('level', level);
      }

      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      const {data, error, count} = await query
        .order('field')
        .order('name')
        .range(from, to);

      // If Supabase has programs, use those
      if (!error && data && data.length > 0) {
        return {programs: data, total: count || 0};
      }

      // Fallback to static data (PROGRAMS from data/programs.ts)
      // This is imported in the component for zero-egress operation
      return {programs: [], total: 0};
    } catch (error) {
      logger.error('Error getting programs', error, 'Admin');
      return {programs: [], total: 0};
    }
  }

  /**
   * Create a new program
   */
  async createProgram(programData: any): Promise<{success: boolean; id?: string; error?: string}> {
    try {
      const {data, error} = await supabase
        .from('programs')
        .insert([programData])
        .select()
        .single();

      if (error) throw error;

      await this.logAction('create_program', 'program', data.id, null, programData);

      return {success: true, id: data.id};
    } catch (error: any) {
      logger.error('Error creating program', error, 'Admin');
      return {success: false, error: error.message};
    }
  }

  /**
   * Update a program
   */
  async updateProgram(programId: string, updates: any): Promise<boolean> {
    try {
      const {data: oldData} = await supabase
        .from('programs')
        .select('*')
        .eq('id', programId)
        .single();

      const {data, error} = await supabase
        .from('programs')
        .update({...updates, updated_at: new Date().toISOString()})
        .eq('id', programId)
        .select('id');

      if (error) throw error;

      if (!data || data.length === 0) {
        throw new Error('Program update failed: insufficient permissions or record not found.');
      }

      await this.logAction('update_program', 'program', programId, oldData, updates);

      return true;
    } catch (error) {
      logger.error('Error updating program', error, 'Admin');
      return false;
    }
  }

  /**
   * Delete a program
   */
  async deleteProgram(programId: string): Promise<boolean> {
    try {
      const {data: oldData} = await supabase
        .from('programs')
        .select('*')
        .eq('id', programId)
        .single();

      const {error} = await supabase
        .from('programs')
        .delete()
        .eq('id', programId);

      if (error) throw error;

      await this.logAction('delete_program', 'program', programId, oldData);

      return true;
    } catch (error) {
      logger.error('Error deleting program', error, 'Admin');
      return false;
    }
  }

  /**
   * Get program fields (unique fields from programs)
   */
  async getProgramFields(): Promise<string[]> {
    try {
      const {data, error} = await supabase
        .from('programs')
        .select('field')
        .order('field');

      if (error) throw error;

      // Get unique fields
      const fields = [...new Set((data || []).map(p => p.field))];
      return fields;
    } catch (error) {
      logger.error('Error getting program fields', error, 'Admin');
      return [];
    }
  }

  // -------------------------------------------------------------------------
  // ANNOUNCEMENTS
  // -------------------------------------------------------------------------

  /**
   * Get all announcements
   */
  async getAnnouncements(options: {
    page?: number;
    pageSize?: number;
    isActive?: boolean;
    type?: AnnouncementType;
  } = {}): Promise<{announcements: Announcement[]; total: number}> {
    try {
      const {page = 1, pageSize = 20, isActive, type} = options;

      let query = supabase
        .from('announcements')
        .select('*', {count: 'exact'});

      if (isActive !== undefined) {
        query = query.eq('is_active', isActive);
      }

      if (type) {
        query = query.eq('type', type);
      }

      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      const {data, error, count} = await query
        .order('priority', {ascending: false})
        .order('created_at', {ascending: false})
        .range(from, to);

      if (error) throw error;

      return {announcements: data || [], total: count || 0};
    } catch (error) {
      logger.error('Error getting announcements', error, 'Admin');
      return {announcements: [], total: 0};
    }
  }

  /**
   * Get active announcements for users
   */
  async getActiveAnnouncements(): Promise<Announcement[]> {
    try {
      const now = new Date().toISOString();

      const {data, error} = await supabase
        .from('announcements')
        .select('*')
        .eq('is_active', true)
        .lte('start_date', now)
        .or(`end_date.is.null,end_date.gte.${now}`)
        .order('priority', {ascending: false});

      if (error) throw error;

      return data || [];
    } catch (error) {
      logger.error('Error getting active announcements', error, 'Admin');
      return [];
    }
  }

  /**
   * Create an announcement
   */
  async createAnnouncement(announcementData: Omit<Announcement, 'id' | 'created_at'>): Promise<{success: boolean; id?: string; error?: string}> {
    try {
      const {data: {user}} = await supabase.auth.getUser();
      
      const {data, error} = await supabase
        .from('announcements')
        .insert([{...announcementData, created_by: user?.id}])
        .select()
        .single();

      if (error) throw error;

      await this.logAction('create_announcement', 'announcement', data.id, null, announcementData);

      return {success: true, id: data.id};
    } catch (error: any) {
      logger.error('Error creating announcement', error, 'Admin');
      return {success: false, error: error.message};
    }
  }

  /**
   * Update an announcement
   */
  async updateAnnouncement(announcementId: string, updates: Partial<Announcement>): Promise<boolean> {
    try {
      const {data, error} = await supabase
        .from('announcements')
        .update({...updates, updated_at: new Date().toISOString()})
        .eq('id', announcementId)
        .select('id');

      if (error) throw error;

      if (!data || data.length === 0) {
        throw new Error('Announcement update failed: insufficient permissions or record not found.');
      }

      await this.logAction('update_announcement', 'announcement', announcementId, null, updates);

      return true;
    } catch (error) {
      logger.error('Error updating announcement', error, 'Admin');
      return false;
    }
  }

  /**
   * Delete an announcement
   */
  async deleteAnnouncement(announcementId: string): Promise<boolean> {
    try {
      const {error} = await supabase
        .from('announcements')
        .delete()
        .eq('id', announcementId);

      if (error) throw error;

      await this.logAction('delete_announcement', 'announcement', announcementId);

      return true;
    } catch (error) {
      logger.error('Error deleting announcement', error, 'Admin');
      return false;
    }
  }

  /**
   * Dismiss an announcement for a user
   */
  async dismissAnnouncement(announcementId: string): Promise<boolean> {
    try {
      const {data: {user}} = await supabase.auth.getUser();
      if (!user) return false;

      const {error} = await supabase
        .from('announcement_dismissals')
        .insert([{user_id: user.id, announcement_id: announcementId}]);

      if (error) throw error;

      return true;
    } catch (error) {
      logger.error('Error dismissing announcement', error, 'Admin');
      return false;
    }
  }

  // -------------------------------------------------------------------------
  // CONTENT REPORTS & MODERATION
  // -------------------------------------------------------------------------

  /**
   * Get all content reports
   */
  async getContentReports(options: {
    page?: number;
    pageSize?: number;
    status?: ReportStatus;
    contentType?: string;
  } = {}): Promise<{reports: ContentReport[]; total: number}> {
    try {
      const {page = 1, pageSize = 20, status, contentType} = options;

      let query = supabase
        .from('content_reports')
        .select('*', {count: 'exact'});

      if (status) {
        query = query.eq('status', status);
      }

      if (contentType) {
        query = query.eq('content_type', contentType);
      }

      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      const {data, error, count} = await query
        .order('created_at', {ascending: false})
        .range(from, to);

      if (error) throw error;

      return {reports: data || [], total: count || 0};
    } catch (error) {
      logger.error('Error getting content reports', error, 'Admin');
      return {reports: [], total: 0};
    }
  }

  /**
   * Update report status
   */
  async updateReportStatus(
    reportId: string,
    status: ReportStatus,
    resolutionNotes?: string
  ): Promise<boolean> {
    try {
      const {data: {user}} = await supabase.auth.getUser();

      const {data, error} = await supabase
        .from('content_reports')
        .update({
          status,
          resolution_notes: resolutionNotes,
          reviewed_by: user?.id,
          updated_at: new Date().toISOString(),
        })
        .eq('id', reportId)
        .select('id');

      if (error) throw error;

      if (!data || data.length === 0) {
        throw new Error('Report update failed: insufficient permissions or record not found.');
      }

      await this.logAction('update_report_status', 'content_report', reportId, null, {status, resolutionNotes});

      return true;
    } catch (error) {
      logger.error('Error updating report status', error, 'Admin');
      return false;
    }
  }

  /**
   * Update content report (alias for admin screens)
   */
  async updateContentReport(reportId: string, updates: Partial<ContentReport>): Promise<boolean> {
    try {
      const {data: {user}} = await supabase.auth.getUser();

      const {data, error} = await supabase
        .from('content_reports')
        .update({
          ...updates,
          reviewed_by: user?.id,
          updated_at: new Date().toISOString(),
        })
        .eq('id', reportId)
        .select('id');

      if (error) throw error;

      if (!data || data.length === 0) {
        throw new Error('Content report update failed: insufficient permissions.');
      }

      await this.logAction('update_content_report', 'content_report', reportId, null, updates);

      return true;
    } catch (error) {
      logger.error('Error updating content report', error, 'Admin');
      return false;
    }
  }

  /**
   * Submit a content report (for users)
   */
  async submitContentReport(
    contentType: string,
    contentId: string,
    reason: string,
    description?: string
  ): Promise<boolean> {
    try {
      const {data: {user}} = await supabase.auth.getUser();

      const {error} = await supabase
        .from('content_reports')
        .insert([{
          reporter_id: user?.id,
          content_type: contentType,
          content_id: contentId,
          reason,
          description,
        }]);

      if (error) throw error;

      return true;
    } catch (error) {
      logger.error('Error submitting report', error, 'Admin');
      return false;
    }
  }

  // -------------------------------------------------------------------------
  // USER FEEDBACK
  // -------------------------------------------------------------------------

  /**
   * Get all user feedback
   */
  async getUserFeedback(options: {
    page?: number;
    pageSize?: number;
    status?: FeedbackStatus;
    category?: FeedbackCategory;
    type?: FeedbackType;
  } = {}): Promise<{feedback: UserFeedback[]; total: number}> {
    try {
      const {page = 1, pageSize = 20, status, category, type} = options;

      let query = supabase
        .from('user_feedback')
        .select('*', {count: 'exact'});

      if (status) {
        query = query.eq('status', status);
      }

      if (category) {
        query = query.eq('category', category);
      }

      if (type) {
        query = query.eq('type', type);
      }

      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      const {data, error, count} = await query
        .order('created_at', {ascending: false})
        .range(from, to);

      if (error) throw error;

      return {feedback: data || [], total: count || 0};
    } catch (error) {
      logger.error('Error getting user feedback', error, 'Admin');
      return {feedback: [], total: 0};
    }
  }

  /**
   * Respond to feedback
   */
  async respondToFeedback(feedbackId: string, response: string): Promise<boolean> {
    try {
      const {data: {user}} = await supabase.auth.getUser();

      const {data, error} = await supabase
        .from('user_feedback')
        .update({
          admin_response: response,
          status: 'resolved',
          responded_by: user?.id,
          responded_at: new Date().toISOString(),
        })
        .eq('id', feedbackId)
        .select('id');

      if (error) throw error;

      if (!data || data.length === 0) {
        throw new Error('Feedback response failed: insufficient permissions.');
      }

      await this.logAction('respond_feedback', 'user_feedback', feedbackId, null, {response});

      return true;
    } catch (error) {
      logger.error('Error responding to feedback', error, 'Admin');
      return false;
    }
  }

  /**
   * Submit feedback (for users)
   */
  async submitFeedback(
    type: FeedbackType,
    title: string,
    message: string,
    contactEmail?: string
  ): Promise<boolean> {
    try {
      const {data: {user}} = await supabase.auth.getUser();

      const {error} = await supabase
        .from('user_feedback')
        .insert([{
          user_id: user?.id,
          type,
          title,
          message,
          contact_email: contactEmail,
        }]);

      if (error) throw error;

      return true;
    } catch (error) {
      logger.error('Error submitting feedback', error, 'Admin');
      return false;
    }
  }

  /**
   * Update user feedback (admin)
   */
  async updateUserFeedback(feedbackId: string, updates: Partial<UserFeedback>): Promise<boolean> {
    try {
      const {data: {user}} = await supabase.auth.getUser();

      const updateData: any = {...updates};
      if (updates.admin_response && !updates.responded_by) {
        updateData.responded_by = user?.id;
        updateData.responded_at = new Date().toISOString();
      }

      const {data, error} = await supabase
        .from('user_feedback')
        .update(updateData)
        .eq('id', feedbackId)
        .select('id');

      if (error) throw error;

      if (!data || data.length === 0) {
        throw new Error('Feedback update failed: insufficient permissions.');
      }

      await this.logAction('update_feedback', 'user_feedback', feedbackId, null, updates);

      return true;
    } catch (error) {
      logger.error('Error updating feedback', error, 'Admin');
      return false;
    }
  }

  /**
   * Delete user feedback (admin)
   */
  async deleteUserFeedback(feedbackId: string): Promise<boolean> {
    try {
      const {error} = await supabase
        .from('user_feedback')
        .delete()
        .eq('id', feedbackId);

      if (error) throw error;

      await this.logAction('delete_feedback', 'user_feedback', feedbackId);

      return true;
    } catch (error) {
      logger.error('Error deleting feedback', error, 'Admin');
      return false;
    }
  }

  // -------------------------------------------------------------------------
  // APP SETTINGS
  // -------------------------------------------------------------------------

  /**
   * Get all app settings (admin only)
   */
  async getAllSettings(): Promise<{settings: AppSetting[]}> {
    try {
      const {data, error} = await supabase
        .from('app_settings')
        .select('*')
        .order('category');

      if (error) throw error;

      return {settings: data || []};
    } catch (error) {
      logger.error('Error getting settings', error, 'Admin');
      return {settings: []};
    }
  }

  /**
   * Get public settings
   */
  async getPublicSettings(): Promise<Record<string, any>> {
    try {
      const {data, error} = await supabase
        .from('app_settings')
        .select('key, value')
        .eq('is_public', true);

      if (error) throw error;

      const settings: Record<string, any> = {};
      data?.forEach(s => {
        settings[s.key] = s.value;
      });

      return settings;
    } catch (error) {
      logger.error('Error getting public settings', error, 'Admin');
      return {};
    }
  }

  /**
   * Get a specific setting
   */
  async getSetting(key: string): Promise<any> {
    try {
      const {data, error} = await supabase
        .from('app_settings')
        .select('value')
        .eq('key', key)
        .maybeSingle();

      // PGRST116 means no rows found - this is expected for missing settings
      if (error) {
        if (error.code === 'PGRST116') {
          // Setting doesn't exist, return null silently
          return null;
        }
        throw error;
      }

      return data?.value ?? null;
    } catch (error: any) {
      // Only log actual errors, not "setting not found"
      if (error?.code !== 'PGRST116') {
        logger.error(`Error getting setting ${key}`, error, 'Admin');
      }
      return null;
    }
  }

  /**
   * Update a setting
   */
  async updateSetting(key: string, value: any): Promise<boolean> {
    try {
      const {data: {user}} = await supabase.auth.getUser();

      const {error} = await supabase
        .from('app_settings')
        .update({
          value,
          updated_by: user?.id,
          updated_at: new Date().toISOString(),
        })
        .eq('key', key);

      if (error) throw error;

      await this.logAction('update_setting', 'app_setting', undefined, {key}, {key, value});

      return true;
    } catch (error) {
      logger.error(`Error updating setting ${key}`, error, 'Admin');
      return false;
    }
  }

  /**
   * Create a new setting
   */
  async createSetting(setting: Omit<AppSetting, 'id' | 'updated_at'>): Promise<{success: boolean; error?: string}> {
    try {
      const {data: {user}} = await supabase.auth.getUser();

      const {error} = await supabase
        .from('app_settings')
        .insert([{
          ...setting,
          updated_by: user?.id,
        }]);

      if (error) throw error;

      await this.logAction('create_setting', 'app_setting', undefined, null, setting);

      return {success: true};
    } catch (error: any) {
      logger.error('Error creating setting', error, 'Admin');
      return {success: false, error: error.message};
    }
  }

  /**
   * Delete a setting
   */
  async deleteSetting(key: string): Promise<boolean> {
    try {
      const {error} = await supabase
        .from('app_settings')
        .delete()
        .eq('key', key);

      if (error) throw error;

      await this.logAction('delete_setting', 'app_setting', undefined, {key});

      return true;
    } catch (error) {
      logger.error(`Error deleting setting ${key}`, error, 'Admin');
      return false;
    }
  }

  // -------------------------------------------------------------------------
  // AUDIT LOGS
  // -------------------------------------------------------------------------

  /**
   * Get audit logs
   */
  async getAuditLogs(options: {
    page?: number;
    pageSize?: number;
    limit?: number;
    offset?: number;
    adminId?: string;
    action?: string;
    targetType?: string;
  } = {}): Promise<{logs: AuditLog[]; total: number; hasMore: boolean}> {
    try {
      const {page = 1, pageSize = 50, limit, offset, adminId, action, targetType} = options;

      let query = supabase
        .from('admin_audit_logs')
        .select('*', {count: 'exact'});

      if (adminId) {
        query = query.eq('admin_id', adminId);
      }

      if (action) {
        query = query.eq('action', action);
      }

      if (targetType) {
        query = query.eq('target_type', targetType);
      }

      // Support both pagination styles
      const actualLimit = limit || pageSize;
      const from = offset ?? (page - 1) * actualLimit;
      const to = from + actualLimit - 1;

      const {data, error, count} = await query
        .order('created_at', {ascending: false})
        .range(from, to);

      if (error) throw error;

      const total = count || 0;
      const hasMore = from + actualLimit < total;

      return {logs: data || [], total, hasMore};
    } catch (error) {
      logger.error('Error getting audit logs', error, 'Admin');
      return {logs: [], total: 0, hasMore: false};
    }
  }

  /**
   * Log an admin action
   */
  private async logAction(
    action: string,
    targetType?: string,
    targetId?: string,
    oldValues?: any,
    newValues?: any
  ): Promise<void> {
    try {
      const {data: {user}} = await supabase.auth.getUser();

      await supabase
        .from('admin_audit_logs')
        .insert([{
          admin_id: user?.id,
          action,
          target_type: targetType,
          target_id: targetId,
          old_values: oldValues,
          new_values: newValues,
        }]);
    } catch (error) {
      logger.error('Error logging action', error, 'Admin');
    }
  }

  // -------------------------------------------------------------------------
  // ANALYTICS
  // -------------------------------------------------------------------------

  /**
   * Get analytics summary for date range
   */
  async getAnalyticsSummary(startDate: string, endDate: string): Promise<AnalyticsSummary[]> {
    try {
      const {data, error} = await supabase
        .from('analytics_daily_summary')
        .select('*')
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date', {ascending: false});

      if (error) throw error;

      return data || [];
    } catch (error) {
      logger.error('Error getting analytics summary', error, 'Admin');
      return [];
    }
  }

  /**
   * Get comprehensive real-time analytics from analytics_events table
   * OPTIMIZED: Uses aggregation queries to minimize data transfer
   */
  async getRealAnalytics(days: number = 30): Promise<{
    overview: {
      totalUsers: number;
      activeUsers: number;
      newUsers: number;
      totalSessions: number;
      avgSessionDuration: number;
    };
    contentStats: {
      totalViews: number;
      universityViews: number;
      scholarshipViews: number;
      programViews: number;
      searches: number;
      bookmarks: number;
    };
    topContent: {
      universities: Array<{name: string; views: number}>;
      scholarships: Array<{name: string; views: number}>;
      searches: Array<{term: string; count: number}>;
    };
    dailyActiveUsers: Array<{date: string; count: number}>;
  }> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    const startDateStr = startDate.toISOString();

    try {
      // Get unique users from events (active users)
      const {count: activeUsers} = await supabase
        .from('analytics_events')
        .select('user_id', {count: 'exact', head: true})
        .gte('created_at', startDateStr)
        .not('user_id', 'is', null);

      // Get unique sessions
      const {count: totalSessions} = await supabase
        .from('analytics_events')
        .select('session_id', {count: 'exact', head: true})
        .gte('created_at', startDateStr)
        .not('session_id', 'is', null);

      // Get university view events
      const {count: universityViews} = await supabase
        .from('analytics_events')
        .select('*', {count: 'exact', head: true})
        .eq('event_name', 'university_viewed')
        .gte('created_at', startDateStr);

      // Get scholarship view events
      const {count: scholarshipViews} = await supabase
        .from('analytics_events')
        .select('*', {count: 'exact', head: true})
        .eq('event_name', 'scholarship_viewed')
        .gte('created_at', startDateStr);

      // Get search events
      const {count: searches} = await supabase
        .from('analytics_events')
        .select('*', {count: 'exact', head: true})
        .eq('event_name', 'search')
        .gte('created_at', startDateStr);

      // Get screen views
      const {count: totalViews} = await supabase
        .from('analytics_events')
        .select('*', {count: 'exact', head: true})
        .eq('event_name', 'screen_view')
        .gte('created_at', startDateStr);

      // Get calculator uses
      const {count: calculatorUses} = await supabase
        .from('analytics_events')
        .select('*', {count: 'exact', head: true})
        .eq('event_name', 'merit_calculated')
        .gte('created_at', startDateStr);

      // Get top university views with names
      const {data: topUniversitiesData} = await supabase
        .from('analytics_events')
        .select('event_data')
        .eq('event_name', 'university_viewed')
        .gte('created_at', startDateStr)
        .limit(100);

      // Process top universities
      const universityCount: Record<string, number> = {};
      topUniversitiesData?.forEach(event => {
        const name = event.event_data?.university_name || event.event_data?.name;
        if (name) {
          universityCount[name] = (universityCount[name] || 0) + 1;
        }
      });
      const topUniversities = Object.entries(universityCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([name, views]) => ({name, views}));

      // Get top scholarship views
      const {data: topScholarshipsData} = await supabase
        .from('analytics_events')
        .select('event_data')
        .eq('event_name', 'scholarship_viewed')
        .gte('created_at', startDateStr)
        .limit(100);

      // Process top scholarships
      const scholarshipCount: Record<string, number> = {};
      topScholarshipsData?.forEach(event => {
        const name = event.event_data?.scholarship_name || event.event_data?.name;
        if (name) {
          scholarshipCount[name] = (scholarshipCount[name] || 0) + 1;
        }
      });
      const topScholarships = Object.entries(scholarshipCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([name, views]) => ({name, views}));

      // Get top searches
      const {data: topSearchesData} = await supabase
        .from('analytics_events')
        .select('event_data')
        .eq('event_name', 'search')
        .gte('created_at', startDateStr)
        .limit(100);

      // Process top searches
      const searchCount: Record<string, number> = {};
      topSearchesData?.forEach(event => {
        const term = event.event_data?.search_query || event.event_data?.query;
        if (term) {
          searchCount[term.toLowerCase()] = (searchCount[term.toLowerCase()] || 0) + 1;
        }
      });
      const topSearches = Object.entries(searchCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([term, count]) => ({term, count}));

      // Get daily active users for chart
      const dailyActiveUsers: Array<{date: string; count: number}> = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        const nextDate = new Date(date);
        nextDate.setDate(nextDate.getDate() + 1);
        
        const {count} = await supabase
          .from('analytics_events')
          .select('user_id', {count: 'exact', head: true})
          .gte('created_at', dateStr)
          .lt('created_at', nextDate.toISOString().split('T')[0])
          .not('user_id', 'is', null);

        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        dailyActiveUsers.push({
          date: dayNames[date.getDay()],
          count: count || 0,
        });
      }

      // Get total users from profiles
      const {count: totalUsers} = await supabase
        .from('profiles')
        .select('*', {count: 'exact', head: true});

      // Get new users in period
      const {count: newUsers} = await supabase
        .from('profiles')
        .select('*', {count: 'exact', head: true})
        .gte('created_at', startDateStr);

      return {
        overview: {
          totalUsers: totalUsers || 0,
          activeUsers: activeUsers || 0,
          newUsers: newUsers || 0,
          totalSessions: totalSessions || 0,
          avgSessionDuration: 5.2, // Would require session start/end tracking
        },
        contentStats: {
          totalViews: totalViews || 0,
          universityViews: universityViews || 0,
          scholarshipViews: scholarshipViews || 0,
          programViews: calculatorUses || 0,
          searches: searches || 0,
          bookmarks: 0, // Would need bookmark tracking
        },
        topContent: {
          universities: topUniversities.length > 0 ? topUniversities : this.getDefaultTopUniversities(),
          scholarships: topScholarships.length > 0 ? topScholarships : this.getDefaultTopScholarships(),
          searches: topSearches.length > 0 ? topSearches : this.getDefaultTopSearches(),
        },
        dailyActiveUsers,
      };
    } catch (error) {
      logger.error('Error getting real analytics', error, 'Admin');
      // Return default data on error
      return this.getDefaultAnalytics();
    }
  }

  /**
   * Get default top universities (fallback when no data)
   */
  private getDefaultTopUniversities() {
    return [
      {name: 'LUMS', views: 0},
      {name: 'NUST', views: 0},
      {name: 'IBA Karachi', views: 0},
      {name: 'FAST', views: 0},
      {name: 'PIEAS', views: 0},
    ];
  }

  /**
   * Get default top scholarships (fallback when no data)
   */
  private getDefaultTopScholarships() {
    return [
      {name: 'HEC Indigenous PhD', views: 0},
      {name: 'Need-Based Scholarship', views: 0},
      {name: 'Merit Scholarship', views: 0},
      {name: 'Sports Scholarship', views: 0},
      {name: 'Women in STEM', views: 0},
    ];
  }

  /**
   * Get default top searches (fallback when no data)
   */
  private getDefaultTopSearches() {
    return [
      {term: 'engineering', count: 0},
      {term: 'medical', count: 0},
      {term: 'business', count: 0},
      {term: 'scholarship', count: 0},
      {term: 'computer science', count: 0},
    ];
  }

  /**
   * Get default analytics (fallback on error)
   */
  private getDefaultAnalytics() {
    return {
      overview: {
        totalUsers: 0,
        activeUsers: 0,
        newUsers: 0,
        totalSessions: 0,
        avgSessionDuration: 0,
      },
      contentStats: {
        totalViews: 0,
        universityViews: 0,
        scholarshipViews: 0,
        programViews: 0,
        searches: 0,
        bookmarks: 0,
      },
      topContent: {
        universities: this.getDefaultTopUniversities(),
        scholarships: this.getDefaultTopScholarships(),
        searches: this.getDefaultTopSearches(),
      },
      dailyActiveUsers: [],
    };
  }

  /**
   * Track an analytics event
   */
  async trackEvent(
    eventName: string,
    eventCategory?: string,
    eventData?: any,
    screenName?: string
  ): Promise<void> {
    try {
      const {data: {user}} = await supabase.auth.getUser();

      await supabase
        .from('analytics_events')
        .insert([{
          user_id: user?.id,
          event_name: eventName,
          event_category: eventCategory,
          event_data: eventData,
          screen_name: screenName,
        }]);
    } catch (error) {
      logger.error('Error tracking event', error, 'Admin');
    }
  }

  /**
   * Export analytics data to CSV format
   */
  async exportAnalyticsCSV(startDate: string, endDate: string): Promise<string> {
    try {
      const {data: events, error} = await supabase
        .from('analytics_events')
        .select('event_name, event_category, screen_name, created_at')
        .gte('created_at', startDate)
        .lte('created_at', endDate)
        .order('created_at', {ascending: false})
        .limit(1000);

      if (error) throw error;

      // Build CSV
      const headers = ['Event Name', 'Category', 'Screen', 'Date'];
      const rows = events?.map(e => [
        e.event_name,
        e.event_category || '',
        e.screen_name || '',
        new Date(e.created_at).toLocaleDateString(),
      ]) || [];

      const csv = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
      ].join('\n');

      return csv;
    } catch (error) {
      logger.error('Error exporting analytics', error, 'Admin');
      throw error;
    }
  }

  // ============================================================================
  // DATA EXPORT FUNCTIONS
  // ============================================================================

  /**
   * Export universities data to CSV format
   */
  async exportUniversitiesCSV(): Promise<string> {
    try {
      const {data, error} = await supabase
        .from('universities')
        .select('id, name, location, city, province, type, ranking, website, contact_email, contact_phone, established_year, description')
        .order('name');

      if (error) throw error;

      const headers = ['ID', 'Name', 'Location', 'City', 'Province', 'Type', 'Ranking', 'Website', 'Email', 'Phone', 'Established', 'Description'];
      const rows = data?.map(u => [
        u.id, u.name || '', u.location || '', u.city || '', u.province || '',
        u.type || '', u.ranking || '', u.website || '', u.contact_email || '',
        u.contact_phone || '', u.established_year || '', (u.description || '').substring(0, 100)
      ]) || [];

      return this.buildCSV(headers, rows);
    } catch (error) {
      logger.error('Error exporting universities', error, 'Admin');
      throw error;
    }
  }

  /**
   * Export scholarships data to CSV format
   */
  async exportScholarshipsCSV(): Promise<string> {
    try {
      const {data, error} = await supabase
        .from('scholarships')
        .select('id, name, provider, amount, deadline, eligibility, level, field_of_study, is_active')
        .order('name');

      if (error) throw error;

      const headers = ['ID', 'Name', 'Provider', 'Amount', 'Deadline', 'Eligibility', 'Level', 'Field', 'Active'];
      const rows = data?.map(s => [
        s.id, s.name || '', s.provider || '', s.amount || '', s.deadline || '',
        (s.eligibility || '').substring(0, 100), s.level || '', s.field_of_study || '', s.is_active ? 'Yes' : 'No'
      ]) || [];

      return this.buildCSV(headers, rows);
    } catch (error) {
      logger.error('Error exporting scholarships', error, 'Admin');
      throw error;
    }
  }

  /**
   * Export programs data to CSV format
   */
  async exportProgramsCSV(): Promise<string> {
    try {
      const {data, error} = await supabase
        .from('programs')
        .select('id, name, degree_type, duration, university_id, department, fee, intake_capacity')
        .order('name');

      if (error) throw error;

      const headers = ['ID', 'Name', 'Degree Type', 'Duration', 'University ID', 'Department', 'Fee', 'Intake'];
      const rows = data?.map(p => [
        p.id, p.name || '', p.degree_type || '', p.duration || '',
        p.university_id || '', p.department || '', p.fee || '', p.intake_capacity || ''
      ]) || [];

      return this.buildCSV(headers, rows);
    } catch (error) {
      logger.error('Error exporting programs', error, 'Admin');
      throw error;
    }
  }

  /**
   * Export users data to CSV format (non-sensitive fields only)
   */
  async exportUsersCSV(): Promise<string> {
    try {
      const {data, error} = await supabase
        .from('profiles')
        .select('id, full_name, role, is_verified, created_at, last_login_at, login_count')
        .order('created_at', {ascending: false});

      if (error) throw error;

      const headers = ['ID', 'Name', 'Role', 'Verified', 'Created At', 'Last Login', 'Login Count'];
      const rows = data?.map(u => [
        u.id, u.full_name || 'Anonymous', u.role || 'user', u.is_verified ? 'Yes' : 'No',
        new Date(u.created_at).toLocaleDateString(),
        u.last_login_at ? new Date(u.last_login_at).toLocaleDateString() : 'Never',
        u.login_count || 0
      ]) || [];

      return this.buildCSV(headers, rows);
    } catch (error) {
      logger.error('Error exporting users', error, 'Admin');
      throw error;
    }
  }

  /**
   * Export feedback data to CSV format
   */
  async exportFeedbackCSV(): Promise<string> {
    try {
      const {data, error} = await supabase
        .from('user_feedback')
        .select('id, type, category, title, message, rating, status, created_at')
        .order('created_at', {ascending: false});

      if (error) throw error;

      const headers = ['ID', 'Type', 'Category', 'Title', 'Message', 'Rating', 'Status', 'Created'];
      const rows = data?.map(f => [
        f.id, f.type || '', f.category || '', f.title || '',
        (f.message || '').substring(0, 200), f.rating || '', f.status || '',
        new Date(f.created_at).toLocaleDateString()
      ]) || [];

      return this.buildCSV(headers, rows);
    } catch (error) {
      logger.error('Error exporting feedback', error, 'Admin');
      throw error;
    }
  }

  /**
   * Export merit lists data to CSV format
   */
  async exportMeritListsCSV(): Promise<string> {
    try {
      const {data, error} = await supabase
        .from('merit_lists')
        .select('*')
        .order('year', {ascending: false});

      if (error) throw error;

      const headers = ['ID', 'University', 'Program', 'Merit %', 'Year', 'Round', 'Seats', 'Closing Date'];
      const rows = data?.map(m => [
        m.id, m.university_name || '', m.program_name || '', m.merit_percentage || '',
        m.year || '', m.round || '', m.seats_available || '', m.closing_date || ''
      ]) || [];

      return this.buildCSV(headers, rows);
    } catch (error) {
      logger.error('Error exporting merit lists', error, 'Admin');
      throw error;
    }
  }

  /**
   * Export all data combined to CSV format
   */
  async exportAllDataCSV(): Promise<string> {
    try {
      const sections: string[] = [];

      // Universities
      sections.push('=== UNIVERSITIES ===');
      sections.push(await this.exportUniversitiesCSV());

      sections.push('\n=== SCHOLARSHIPS ===');
      sections.push(await this.exportScholarshipsCSV());

      sections.push('\n=== PROGRAMS ===');
      sections.push(await this.exportProgramsCSV());

      sections.push('\n=== USERS (Non-sensitive) ===');
      sections.push(await this.exportUsersCSV());

      sections.push('\n=== FEEDBACK ===');
      sections.push(await this.exportFeedbackCSV());

      sections.push('\n=== MERIT LISTS ===');
      sections.push(await this.exportMeritListsCSV());

      return sections.join('\n\n');
    } catch (error) {
      logger.error('Error exporting all data', error, 'Admin');
      throw error;
    }
  }

  /**
   * Helper function to build CSV from headers and rows
   */
  private buildCSV(headers: string[], rows: any[][]): string {
    const escapeCsvValue = (val: any): string => {
      const str = String(val ?? '');
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    return [
      headers.join(','),
      ...rows.map(row => row.map(escapeCsvValue).join(','))
    ].join('\n');
  }

  // ============================================================================
  // MERIT LISTS MANAGEMENT
  // ============================================================================

  /**
   * Get all merit lists
   */
  async getMeritLists(year?: number): Promise<any[]> {
    try {
      let query = supabase
        .from('merit_lists')
        .select('*')
        .order('year', {ascending: false})
        .order('university_name');

      if (year) {
        query = query.eq('year', year);
      }

      const {data, error} = await query;
      if (error) throw error;
      return data || [];
    } catch (error) {
      logger.error('Error fetching merit lists', error, 'Admin');
      return [];
    }
  }

  /**
   * Create a new merit list entry
   */
  async createMeritList(meritData: {
    university_name: string;
    program_name: string;
    merit_percentage: number;
    year: number;
    round: number;
    seats_available?: number;
    closing_date?: string;
  }): Promise<any> {
    try {
      const {data, error} = await supabase
        .from('merit_lists')
        .insert([{
          ...meritData,
          created_at: new Date().toISOString(),
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      logger.error('Error creating merit list', error, 'Admin');
      throw error;
    }
  }

  /**
   * Update a merit list entry
   */
  async updateMeritList(id: string, meritData: Partial<{
    university_name: string;
    program_name: string;
    merit_percentage: number;
    year: number;
    round: number;
    seats_available: number;
    closing_date: string;
  }>): Promise<any> {
    try {
      const {data, error} = await supabase
        .from('merit_lists')
        .update({
          ...meritData,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      logger.error('Error updating merit list', error, 'Admin');
      throw error;
    }
  }

  /**
   * Delete a merit list entry
   */
  async deleteMeritList(id: string): Promise<void> {
    try {
      const {error} = await supabase
        .from('merit_lists')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      logger.error('Error deleting merit list', error, 'Admin');
      throw error;
    }
  }

  // ============================================================================
  // ENTRY TEST DATES MANAGEMENT
  // ============================================================================

  /**
   * Get all entry test dates
   */
  async getEntryTestDates(): Promise<any[]> {
    try {
      const {data, error} = await supabase
        .from('entry_test_dates')
        .select('*')
        .order('test_date', {ascending: true});

      if (error) throw error;
      return data || [];
    } catch (error) {
      logger.error('Error fetching entry test dates', error, 'Admin');
      return [];
    }
  }

  /**
   * Create a new entry test date
   */
  async createEntryTestDate(testData: {
    test_name: string;
    conducting_body: string;
    test_date: string;
    registration_start: string;
    registration_end: string;
    result_date?: string;
    fee?: number;
    website?: string;
    is_active: boolean;
  }): Promise<any> {
    try {
      const {data, error} = await supabase
        .from('entry_test_dates')
        .insert([{
          ...testData,
          created_at: new Date().toISOString(),
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      logger.error('Error creating entry test date', error, 'Admin');
      throw error;
    }
  }

  /**
   * Update an entry test date
   */
  async updateEntryTestDate(id: string, testData: Partial<{
    test_name: string;
    conducting_body: string;
    test_date: string;
    registration_start: string;
    registration_end: string;
    result_date: string;
    fee: number;
    website: string;
    is_active: boolean;
  }>): Promise<any> {
    try {
      const {data, error} = await supabase
        .from('entry_test_dates')
        .update({
          ...testData,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      logger.error('Error updating entry test date', error, 'Admin');
      throw error;
    }
  }

  /**
   * Delete an entry test date
   */
  async deleteEntryTestDate(id: string): Promise<void> {
    try {
      const {error} = await supabase
        .from('entry_test_dates')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      logger.error('Error deleting entry test date', error, 'Admin');
      throw error;
    }
  }

  // ============================================================================
  // ADMISSION DATES MANAGEMENT
  // ============================================================================

  /**
   * Get all admission dates
   */
  async getAdmissionDates(): Promise<any[]> {
    try {
      const {data, error} = await supabase
        .from('admission_dates')
        .select('*')
        .order('admission_start', {ascending: true});

      if (error) throw error;
      return data || [];
    } catch (error) {
      logger.error('Error fetching admission dates', error, 'Admin');
      return [];
    }
  }

  /**
   * Create a new admission date
   */
  async createAdmissionDate(admissionData: {
    university_name: string;
    program_type: string;
    admission_start: string;
    admission_end: string;
    classes_start?: string;
    fee_deadline?: string;
    year: number;
    is_active: boolean;
  }): Promise<any> {
    try {
      const {data, error} = await supabase
        .from('admission_dates')
        .insert([{
          ...admissionData,
          created_at: new Date().toISOString(),
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      logger.error('Error creating admission date', error, 'Admin');
      throw error;
    }
  }

  /**
   * Update an admission date
   */
  async updateAdmissionDate(id: string, admissionData: Partial<{
    university_name: string;
    program_type: string;
    admission_start: string;
    admission_end: string;
    classes_start: string;
    fee_deadline: string;
    year: number;
    is_active: boolean;
  }>): Promise<any> {
    try {
      const {data, error} = await supabase
        .from('admission_dates')
        .update({
          ...admissionData,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      logger.error('Error updating admission date', error, 'Admin');
      throw error;
    }
  }

  /**
   * Delete an admission date
   */
  async deleteAdmissionDate(id: string): Promise<void> {
    try {
      const {error} = await supabase
        .from('admission_dates')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      logger.error('Error deleting admission date', error, 'Admin');
      throw error;
    }
  }
}

// ============================================================================
// EXPORT
// ============================================================================

export const adminService = new AdminService();
export default adminService;
