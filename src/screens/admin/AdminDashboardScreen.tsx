/**
 * Admin Dashboard Screen
 * Main admin panel entry point - Now uses Enterprise Dashboard by default
 * Includes enterprise-level Turso integration, real-time stats, and system health
 */

import React from 'react';
import EnterpriseAdminDashboardScreen from './EnterpriseAdminDashboardScreen';

/**
 * AdminDashboardScreen now renders the EnterpriseAdminDashboardScreen
 * This provides production-level admin panel with:
 * - Real-time Turso database statistics
 * - System health monitoring
 * - Cache management
 * - Quick actions for all admin features
 * - Table status monitoring
 */
const AdminDashboardScreen: React.FC = () => {
  return <EnterpriseAdminDashboardScreen />;
};

export default AdminDashboardScreen;
