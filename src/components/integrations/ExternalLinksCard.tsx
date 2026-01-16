/**
 * External Links Card
 * Quick access to university portals, HEC links, and external integrations
 */

import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {Icon} from '../icons';
import {TYPOGRAPHY, RADIUS, SPACING} from '../../constants/design';
import {
  UNIVERSITY_PORTALS,
  HEC_LINKS,
  UNIVERSITY_LOCATIONS,
  openUniversityPortal,
  openHECLink,
  openInGoogleMaps,
  getDirections,
  contactUniversity,
  addToGoogleCalendar,
  createEntryTestEvent,
  MapLocation,
} from '../../services/externalIntegrations';

// ============================================================================
// TYPES
// ============================================================================

interface ExternalLinksCardProps {
  universityId?: string;
  showHECLinks?: boolean;
  showMaps?: boolean;
  compact?: boolean;
}

// ============================================================================
// QUICK LINK BUTTON
// ============================================================================

interface QuickLinkButtonProps {
  icon: string;
  label: string;
  color: string;
  onPress: () => void;
}

const QuickLinkButton: React.FC<QuickLinkButtonProps> = ({
  icon,
  label,
  color,
  onPress,
}) => (
  <TouchableOpacity
    style={quickLinkStyles.container}
    onPress={onPress}
    activeOpacity={0.7}>
    <View style={[quickLinkStyles.iconContainer, {backgroundColor: color + '15'}]}>
      <Icon name={icon} size={20} color={color} />
    </View>
    <Text style={quickLinkStyles.label} numberOfLines={2}>
      {label}
    </Text>
  </TouchableOpacity>
);

const quickLinkStyles = StyleSheet.create({
  container: {
    alignItems: 'center',
    width: 72,
    marginRight: SPACING.md,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  label: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: '#64748B',
    textAlign: 'center',
    fontWeight: '500',
  },
});

// ============================================================================
// PORTAL CARD
// ============================================================================

interface PortalCardProps {
  university: typeof UNIVERSITY_PORTALS[0];
}

const PortalCard: React.FC<PortalCardProps> = ({university}) => {
  const [expanded, setExpanded] = useState(false);

  const portalLinks = [
    {type: 'website' as const, icon: 'globe-outline', label: 'Website'},
    {type: 'admissions' as const, icon: 'school-outline', label: 'Admissions'},
    {type: 'student' as const, icon: 'person-outline', label: 'Student Portal'},
    {type: 'fee' as const, icon: 'cash-outline', label: 'Fee Portal'},
    {type: 'results' as const, icon: 'document-text-outline', label: 'Results'},
  ];

  return (
    <View style={portalCardStyles.container}>
      <TouchableOpacity
        style={portalCardStyles.header}
        onPress={() => setExpanded(!expanded)}
        activeOpacity={0.7}>
        <View>
          <Text style={portalCardStyles.name}>{university.shortName}</Text>
          <Text style={portalCardStyles.fullName} numberOfLines={1}>
            {university.name}
          </Text>
        </View>
        <Icon
          name={expanded ? 'chevron-up' : 'chevron-down'}
          size={20}
          color="#94A3B8"
        />
      </TouchableOpacity>

      {expanded && (
        <View style={portalCardStyles.content}>
          {/* Portal Links */}
          <View style={portalCardStyles.linksGrid}>
            {portalLinks.map(link => (
              <TouchableOpacity
                key={link.type}
                style={portalCardStyles.linkButton}
                onPress={() => openUniversityPortal(university.id, link.type)}
                activeOpacity={0.7}>
                <Icon name={link.icon} size={18} color="#6366F1" />
                <Text style={portalCardStyles.linkLabel}>{link.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Contact Options */}
          <View style={portalCardStyles.contactRow}>
            {university.contactEmail && (
              <TouchableOpacity
                style={portalCardStyles.contactButton}
                onPress={() => contactUniversity(university.id, 'email')}
                activeOpacity={0.7}>
                <Icon name="mail-outline" size={16} color="#10B981" />
                <Text style={portalCardStyles.contactText}>Email</Text>
              </TouchableOpacity>
            )}
            {university.contactPhone && (
              <TouchableOpacity
                style={portalCardStyles.contactButton}
                onPress={() => contactUniversity(university.id, 'phone')}
                activeOpacity={0.7}>
                <Icon name="call-outline" size={16} color="#F59E0B" />
                <Text style={portalCardStyles.contactText}>Call</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}
    </View>
  );
};

const portalCardStyles = StyleSheet.create({
  container: {
    backgroundColor: '#FFF',
    borderRadius: RADIUS.lg,
    marginBottom: SPACING.sm,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
  },
  name: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: '700',
    color: '#1E293B',
  },
  fullName: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: '#94A3B8',
    marginTop: 2,
  },
  content: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  linksGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: SPACING.sm,
  },
  linkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.md,
    marginRight: SPACING.xs,
    marginBottom: SPACING.xs,
  },
  linkLabel: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: '#6366F1',
    fontWeight: '600',
    marginLeft: 4,
  },
  contactRow: {
    flexDirection: 'row',
    marginTop: SPACING.sm,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: SPACING.lg,
  },
  contactText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: '#64748B',
    fontWeight: '500',
    marginLeft: 4,
  },
});

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const ExternalLinksCard: React.FC<ExternalLinksCardProps> = ({
  universityId,
  showHECLinks = true,
  showMaps = true,
  compact = false,
}) => {
  const [showAllPortals, setShowAllPortals] = useState(false);
  const [showHECModal, setShowHECModal] = useState(false);

  const selectedUniversity = universityId
    ? UNIVERSITY_PORTALS.find(u => u.id === universityId)
    : null;

  const universityLocation = universityId
    ? UNIVERSITY_LOCATIONS[universityId]
    : null;

  // Quick links for specific university
  const renderUniversityQuickLinks = () => {
    if (!selectedUniversity) return null;

    return (
      <View style={styles.quickLinksSection}>
        <Text style={styles.sectionTitle}>
          🔗 {selectedUniversity.shortName} Quick Links
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.quickLinksScroll}>
          <QuickLinkButton
            icon="globe-outline"
            label="Website"
            color="#6366F1"
            onPress={() => openUniversityPortal(selectedUniversity.id, 'website')}
          />
          <QuickLinkButton
            icon="school-outline"
            label="Admissions"
            color="#10B981"
            onPress={() => openUniversityPortal(selectedUniversity.id, 'admissions')}
          />
          {selectedUniversity.studentPortal && (
            <QuickLinkButton
              icon="person-outline"
              label="Student Portal"
              color="#F59E0B"
              onPress={() => openUniversityPortal(selectedUniversity.id, 'student')}
            />
          )}
          {showMaps && universityLocation && (
            <>
              <QuickLinkButton
                icon="map-outline"
                label="View Map"
                color="#EC4899"
                onPress={() => openInGoogleMaps(universityLocation)}
              />
              <QuickLinkButton
                icon="navigate-outline"
                label="Directions"
                color="#0891B2"
                onPress={() => getDirections(universityLocation)}
              />
            </>
          )}
          {selectedUniversity.contactEmail && (
            <QuickLinkButton
              icon="mail-outline"
              label="Email"
              color="#8B5CF6"
              onPress={() => contactUniversity(selectedUniversity.id, 'email')}
            />
          )}
          {selectedUniversity.contactPhone && (
            <QuickLinkButton
              icon="call-outline"
              label="Call"
              color="#EF4444"
              onPress={() => contactUniversity(selectedUniversity.id, 'phone')}
            />
          )}
        </ScrollView>
      </View>
    );
  };

  // Compact version
  if (compact) {
    return (
      <View style={styles.compactContainer}>
        {selectedUniversity && (
          <View style={styles.compactRow}>
            <TouchableOpacity
              style={styles.compactButton}
              onPress={() => openUniversityPortal(selectedUniversity.id, 'website')}
              activeOpacity={0.7}>
              <Icon name="globe-outline" size={18} color="#6366F1" />
              <Text style={styles.compactButtonText}>Website</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.compactButton}
              onPress={() => openUniversityPortal(selectedUniversity.id, 'admissions')}
              activeOpacity={0.7}>
              <Icon name="school-outline" size={18} color="#10B981" />
              <Text style={styles.compactButtonText}>Apply</Text>
            </TouchableOpacity>
            {universityLocation && (
              <TouchableOpacity
                style={styles.compactButton}
                onPress={() => openInGoogleMaps(universityLocation)}
                activeOpacity={0.7}>
                <Icon name="map-outline" size={18} color="#EC4899" />
                <Text style={styles.compactButtonText}>Map</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <LinearGradient
          colors={['#6366F1', '#8B5CF6']}
          style={styles.headerIcon}>
          <Icon name="link-outline" size={24} color="#FFF" />
        </LinearGradient>
        <View style={styles.headerText}>
          <Text style={styles.headerTitle}>Quick Links</Text>
          <Text style={styles.headerSubtitle}>
            University portals & resources
          </Text>
        </View>
      </View>

      {/* University-specific quick links */}
      {renderUniversityQuickLinks()}

      {/* HEC Links */}
      {showHECLinks && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>🎓 HEC Resources</Text>
            <TouchableOpacity onPress={() => setShowHECModal(true)}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.quickLinksScroll}>
            {HEC_LINKS.slice(0, 4).map(link => (
              <QuickLinkButton
                key={link.id}
                icon={link.icon}
                label={link.title}
                color="#059669"
                onPress={() => openHECLink(link.id)}
              />
            ))}
          </ScrollView>
        </View>
      )}

      {/* All University Portals */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>🏛️ University Portals</Text>
          <TouchableOpacity onPress={() => setShowAllPortals(true)}>
            <Text style={styles.seeAllText}>View All</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.portalPreview}>
          {UNIVERSITY_PORTALS.slice(0, 3).map(uni => (
            <TouchableOpacity
              key={uni.id}
              style={styles.portalPreviewItem}
              onPress={() => openUniversityPortal(uni.id, 'website')}
              activeOpacity={0.7}>
              <Text style={styles.portalPreviewName}>{uni.shortName}</Text>
              <Icon name="open-outline" size={14} color="#94A3B8" />
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* All Portals Modal */}
      <Modal
        visible={showAllPortals}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowAllPortals(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>University Portals</Text>
            <TouchableOpacity onPress={() => setShowAllPortals(false)}>
              <Icon name="close" size={24} color="#64748B" />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalScroll}>
            {UNIVERSITY_PORTALS.map(uni => (
              <PortalCard key={uni.id} university={uni} />
            ))}
            <View style={{height: SPACING.xl}} />
          </ScrollView>
        </View>
      </Modal>

      {/* HEC Links Modal */}
      <Modal
        visible={showHECModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowHECModal(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>HEC Resources</Text>
            <TouchableOpacity onPress={() => setShowHECModal(false)}>
              <Icon name="close" size={24} color="#64748B" />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalScroll}>
            {HEC_LINKS.map(link => (
              <TouchableOpacity
                key={link.id}
                style={styles.hecLinkCard}
                onPress={() => openHECLink(link.id)}
                activeOpacity={0.7}>
                <View style={styles.hecLinkIcon}>
                  <Icon name={link.icon} size={24} color="#059669" />
                </View>
                <View style={styles.hecLinkContent}>
                  <Text style={styles.hecLinkTitle}>{link.title}</Text>
                  <Text style={styles.hecLinkDesc}>{link.description}</Text>
                </View>
                <Icon name="open-outline" size={18} color="#94A3B8" />
              </TouchableOpacity>
            ))}
            <View style={{height: SPACING.xl}} />
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
};

// ============================================================================
// ADD TO CALENDAR BUTTON
// ============================================================================

interface AddToCalendarButtonProps {
  testName: string;
  testDate: Date;
  venue?: string;
}

export const AddToCalendarButton: React.FC<AddToCalendarButtonProps> = ({
  testName,
  testDate,
  venue,
}) => {
  const handlePress = () => {
    const event = createEntryTestEvent(testName, testDate, venue);
    addToGoogleCalendar(event);
  };

  return (
    <TouchableOpacity
      style={calendarButtonStyles.container}
      onPress={handlePress}
      activeOpacity={0.7}>
      <LinearGradient
        colors={['#10B981', '#059669']}
        style={calendarButtonStyles.gradient}>
        <Icon name="calendar-outline" size={18} color="#FFF" />
        <Text style={calendarButtonStyles.text}>Add to Calendar</Text>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const calendarButtonStyles = StyleSheet.create({
  container: {
    borderRadius: RADIUS.md,
    overflow: 'hidden',
  },
  gradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
  },
  text: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: '600',
    color: '#FFF',
    marginLeft: 6,
  },
});

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFF',
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    marginVertical: SPACING.md,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  compactContainer: {
    marginVertical: SPACING.sm,
  },
  compactRow: {
    flexDirection: 'row',
  },
  compactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.md,
    marginRight: SPACING.sm,
  },
  compactButtonText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: '#475569',
    fontWeight: '600',
    marginLeft: 6,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  headerIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerText: {
    marginLeft: SPACING.md,
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: '700',
    color: '#1E293B',
  },
  headerSubtitle: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: '#64748B',
    marginTop: 2,
  },
  section: {
    marginTop: SPACING.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: '600',
    color: '#1E293B',
  },
  seeAllText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: '#6366F1',
    fontWeight: '600',
  },
  quickLinksSection: {
    marginBottom: SPACING.md,
  },
  quickLinksScroll: {
    paddingVertical: SPACING.sm,
  },
  portalPreview: {},
  portalPreviewItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.xs,
  },
  portalPreviewName: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: '600',
    color: '#475569',
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.lg,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  modalTitle: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: '800',
    color: '#1E293B',
  },
  modalScroll: {
    flex: 1,
    padding: SPACING.lg,
  },
  hecLinkCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  hecLinkIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#D1FAE5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  hecLinkContent: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  hecLinkTitle: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: '600',
    color: '#1E293B',
  },
  hecLinkDesc: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: '#64748B',
    marginTop: 2,
  },
});

export default ExternalLinksCard;
