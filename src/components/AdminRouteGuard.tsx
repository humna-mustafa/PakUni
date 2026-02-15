/**
 * AdminRouteGuard - Protects admin screens from unauthorized access
 * Checks user role before rendering admin content
 */

import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useAuth} from '../contexts/AuthContext';
import {useTheme} from '../contexts/ThemeContext';
import {Icon} from './icons';
import type {UserRole} from '../contexts/AuthContext';

const ADMIN_ROLES: UserRole[] = ['admin', 'super_admin', 'moderator', 'content_editor'];

interface AdminRouteGuardProps {
  children: React.ReactNode;
  /** Minimum roles allowed. Defaults to all admin roles. */
  allowedRoles?: UserRole[];
}

const AdminRouteGuard: React.FC<AdminRouteGuardProps> = ({
  children,
  allowedRoles = ADMIN_ROLES,
}) => {
  const {user} = useAuth();
  const {colors} = useTheme();
  const navigation = useNavigation();

  const hasAccess = user?.role && allowedRoles.includes(user.role);

  if (!hasAccess) {
    return (
      <View style={[styles.container, {backgroundColor: colors.background}]}>
        <View style={[styles.iconContainer, {backgroundColor: colors.errorLight}]}>
          <Icon name="lock-closed" family="Ionicons" size={48} color={colors.error} />
        </View>
        <Text style={[styles.title, {color: colors.text}]}>Access Denied</Text>
        <Text style={[styles.message, {color: colors.textSecondary}]}>
          You don't have permission to access this page. Admin privileges are required.
        </Text>
        <TouchableOpacity
          style={[styles.button, {backgroundColor: colors.primary}]}
          onPress={() => navigation.goBack()}
          accessibilityRole="button"
          accessibilityLabel="Go back">
          <Text style={styles.buttonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return <>{children}</>;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 12,
  },
  message: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  button: {
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default AdminRouteGuard;
