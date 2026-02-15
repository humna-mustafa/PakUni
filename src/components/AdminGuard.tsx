/**
 * AdminGuard Component
 * Protects admin screens by checking user role before rendering
 * Redirects unauthorized users back to MainTabs
 */

import React, {ComponentType, useEffect} from 'react';
import {View, Text, StyleSheet, ActivityIndicator} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useAuth} from '../contexts/AuthContext';
import {useTheme} from '../contexts/ThemeContext';

// Admin roles that have access to admin screens
const ADMIN_ROLES = ['admin', 'super_admin', 'moderator', 'content_editor'] as const;
type AdminRole = typeof ADMIN_ROLES[number];

interface AdminGuardProps {
  /** Minimum role required (defaults to any admin role) */
  requiredRole?: AdminRole | AdminRole[];
  /** Component to render if authorized */
  children: React.ReactNode;
}

/**
 * Check if user has required admin role
 */
const hasAdminAccess = (
  userRole: string | undefined,
  requiredRole?: AdminRole | AdminRole[]
): boolean => {
  if (!userRole) return false;
  
  // If specific role(s) required
  if (requiredRole) {
    const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    return roles.includes(userRole as AdminRole);
  }
  
  // Default: any admin role
  return ADMIN_ROLES.includes(userRole as AdminRole);
};

/**
 * AdminGuard - wraps admin screens with role-based access control
 */
export const AdminGuard: React.FC<AdminGuardProps> = ({
  requiredRole,
  children,
}) => {
  const {user, isAuthenticated, isLoading} = useAuth();
  const {colors} = useTheme();
  const navigation = useNavigation();

  useEffect(() => {
    // Wait for auth to load
    if (isLoading) return;

    // Redirect if not authenticated or not admin
    if (!isAuthenticated || !hasAdminAccess(user?.role, requiredRole)) {
      // Navigate back to main tabs
      navigation.reset({
        index: 0,
        routes: [{name: 'MainTabs' as never}],
      });
    }
  }, [isAuthenticated, user?.role, isLoading, navigation, requiredRole]);

  // Show loading while checking auth
  if (isLoading) {
    return (
      <View style={[styles.container, {backgroundColor: colors.background}]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.text, {color: colors.textSecondary}]}>
          Verifying access...
        </Text>
      </View>
    );
  }

  // Don't render content if not authorized
  if (!isAuthenticated || !hasAdminAccess(user?.role, requiredRole)) {
    return (
      <View style={[styles.container, {backgroundColor: colors.background}]}>
        <Text style={[styles.icon]}>🔒</Text>
        <Text style={[styles.title, {color: colors.text}]}>Access Denied</Text>
        <Text style={[styles.text, {color: colors.textSecondary}]}>
          You don't have permission to access this area.
        </Text>
      </View>
    );
  }

  // User is authorized
  return <>{children}</>;
};

/**
 * Higher-order component to wrap admin screens with guard
 */
export function withAdminGuard<P extends object>(
  WrappedComponent: ComponentType<P>,
  requiredRole?: AdminRole | AdminRole[]
): ComponentType<P> {
  const AdminProtectedComponent = (props: P): React.JSX.Element => {
    return (
      <AdminGuard requiredRole={requiredRole}>
        <WrappedComponent {...props} />
      </AdminGuard>
    );
  };

  AdminProtectedComponent.displayName = `AdminGuard(${
    WrappedComponent.displayName || WrappedComponent.name || 'Component'
  })`;

  return AdminProtectedComponent;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  icon: {
    fontSize: 48,
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  text: {
    fontSize: 14,
    textAlign: 'center',
  },
});

export default AdminGuard;
