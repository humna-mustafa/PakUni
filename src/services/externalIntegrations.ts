/**
 * External Integrations Service
 * Google Calendar sync, Maps, HEC Portal, University Portal links
 */

import {Linking, Platform, Alert} from 'react-native';
import {logger} from '../utils/logger';

// ============================================================================
// TYPES
// ============================================================================

export interface CalendarEvent {
  title: string;
  description?: string;
  startDate: Date;
  endDate?: Date;
  location?: string;
  reminder?: number; // minutes before
}

export interface MapLocation {
  name: string;
  address: string;
  latitude: number;
  longitude: number;
}

export interface UniversityPortal {
  id: string;
  name: string;
  shortName: string;
  website: string;
  admissionsPortal?: string;
  studentPortal?: string;
  feePortal?: string;
  resultsPortal?: string;
  contactEmail?: string;
  contactPhone?: string;
}

export interface HECLink {
  id: string;
  title: string;
  description: string;
  url: string;
  icon: string;
}

// ============================================================================
// UNIVERSITY PORTALS DATABASE
// ============================================================================

export const UNIVERSITY_PORTALS: UniversityPortal[] = [
  {
    id: 'nust',
    name: 'National University of Sciences & Technology',
    shortName: 'NUST',
    website: 'https://nust.edu.pk',
    admissionsPortal: 'https://ugadmissions.nust.edu.pk',
    studentPortal: 'https://qalam.nust.edu.pk',
    feePortal: 'https://nust.edu.pk/fee-structure',
    resultsPortal: 'https://ugadmissions.nust.edu.pk/NetResult',
    contactEmail: 'admissions@nust.edu.pk',
    contactPhone: '051-90854666',
  },
  {
    id: 'fast',
    name: 'FAST National University',
    shortName: 'FAST-NUCES',
    website: 'https://nu.edu.pk',
    admissionsPortal: 'https://nu.edu.pk/Admissions',
    studentPortal: 'https://cmsroamer.nu.edu.pk',
    feePortal: 'https://nu.edu.pk/Campus/FeeStructure',
    contactEmail: 'admissions@nu.edu.pk',
    contactPhone: '051-111-128-128',
  },
  {
    id: 'giki',
    name: 'Ghulam Ishaq Khan Institute',
    shortName: 'GIKI',
    website: 'https://giki.edu.pk',
    admissionsPortal: 'https://giki.edu.pk/admissions',
    studentPortal: 'https://portal.giki.edu.pk',
    contactEmail: 'admissions@giki.edu.pk',
    contactPhone: '0938-271858',
  },
  {
    id: 'lums',
    name: 'Lahore University of Management Sciences',
    shortName: 'LUMS',
    website: 'https://lums.edu.pk',
    admissionsPortal: 'https://admission.lums.edu.pk',
    studentPortal: 'https://zambeel.lums.edu.pk',
    feePortal: 'https://lums.edu.pk/fee-payment',
    contactEmail: 'admissions@lums.edu.pk',
    contactPhone: '042-35608000',
  },
  {
    id: 'comsats',
    name: 'COMSATS University Islamabad',
    shortName: 'COMSATS',
    website: 'https://www.comsats.edu.pk',
    admissionsPortal: 'https://admissions.comsats.edu.pk',
    studentPortal: 'https://crs.comsats.edu.pk',
    contactEmail: 'admissions@comsats.edu.pk',
    contactPhone: '051-9247000',
  },
  {
    id: 'pieas',
    name: 'Pakistan Institute of Engineering & Applied Sciences',
    shortName: 'PIEAS',
    website: 'https://pieas.edu.pk',
    admissionsPortal: 'https://pieas.edu.pk/admissions',
    contactEmail: 'admissions@pieas.edu.pk',
    contactPhone: '051-2207381',
  },
  {
    id: 'uet-lahore',
    name: 'University of Engineering & Technology Lahore',
    shortName: 'UET Lahore',
    website: 'https://uet.edu.pk',
    admissionsPortal: 'https://admission.uet.edu.pk',
    studentPortal: 'https://cmsv2.uet.edu.pk',
    contactEmail: 'admission@uet.edu.pk',
    contactPhone: '042-99029250',
  },
  {
    id: 'iba',
    name: 'Institute of Business Administration',
    shortName: 'IBA Karachi',
    website: 'https://iba.edu.pk',
    admissionsPortal: 'https://iba.edu.pk/admissions',
    studentPortal: 'https://erp.iba.edu.pk',
    contactEmail: 'admissions@iba.edu.pk',
    contactPhone: '021-38104700',
  },
];

// ============================================================================
// HEC LINKS DATABASE
// ============================================================================

export const HEC_LINKS: HECLink[] = [
  {
    id: 'hec-main',
    title: 'HEC Official Website',
    description: 'Higher Education Commission of Pakistan',
    url: 'https://www.hec.gov.pk',
    icon: 'globe-outline',
  },
  {
    id: 'hec-universities',
    title: 'Recognized Universities',
    description: 'List of HEC recognized degree awarding institutions',
    url: 'https://www.hec.gov.pk/english/universities/Pages/recognised.aspx',
    icon: 'school-outline',
  },
  {
    id: 'hec-ranking',
    title: 'University Rankings',
    description: 'HEC University Rankings & Category',
    url: 'https://www.hec.gov.pk/english/universities/Pages/University-Ranking.aspx',
    icon: 'trophy-outline',
  },
  {
    id: 'hec-verification',
    title: 'Degree Verification',
    description: 'Verify degree authenticity online',
    url: 'https://eportal.hec.gov.pk/HEDRS/',
    icon: 'shield-checkmark-outline',
  },
  {
    id: 'hec-scholarships',
    title: 'HEC Scholarships',
    description: 'Indigenous and foreign scholarship programs',
    url: 'https://www.hec.gov.pk/english/scholarshipsgrants/Pages/default.aspx',
    icon: 'ribbon-outline',
  },
  {
    id: 'hec-equivalence',
    title: 'Equivalence Certificate',
    description: 'Apply for foreign degree equivalence',
    url: 'https://eportal.hec.gov.pk/ADP',
    icon: 'document-outline',
  },
  {
    id: 'hec-eportal',
    title: 'HEC e-Portal',
    description: 'Online services and applications',
    url: 'https://eportal.hec.gov.pk',
    icon: 'desktop-outline',
  },
];

// ============================================================================
// UNIVERSITY LOCATIONS
// ============================================================================

export const UNIVERSITY_LOCATIONS: Record<string, MapLocation> = {
  nust: {
    name: 'NUST Main Campus',
    address: 'H-12, Islamabad, Pakistan',
    latitude: 33.6426,
    longitude: 72.9906,
  },
  fast_isb: {
    name: 'FAST-NUCES Islamabad',
    address: 'A.K. Brohi Road, H-11/4, Islamabad',
    latitude: 33.6691,
    longitude: 72.9985,
  },
  fast_lhr: {
    name: 'FAST-NUCES Lahore',
    address: 'Block B, Faisal Town, Lahore',
    latitude: 31.4766,
    longitude: 74.2994,
  },
  fast_khi: {
    name: 'FAST-NUCES Karachi',
    address: 'ST-4, Sector 17-D, Shah Latif Town, Karachi',
    latitude: 24.8827,
    longitude: 67.1892,
  },
  giki: {
    name: 'GIKI Campus',
    address: 'Topi, Swabi District, KPK',
    latitude: 34.0769,
    longitude: 72.6228,
  },
  lums: {
    name: 'LUMS Campus',
    address: 'DHA, Lahore Cantt., Lahore',
    latitude: 31.4099,
    longitude: 74.2039,
  },
  comsats_isb: {
    name: 'COMSATS Islamabad',
    address: 'Park Road, Tarlai Kalan, Islamabad',
    latitude: 33.6007,
    longitude: 73.0679,
  },
  uet_lahore: {
    name: 'UET Lahore',
    address: 'Grand Trunk Road, Lahore',
    latitude: 31.5786,
    longitude: 74.3577,
  },
  iba_karachi: {
    name: 'IBA Main Campus',
    address: 'University Road, Karachi',
    latitude: 24.9408,
    longitude: 67.1164,
  },
};

// ============================================================================
// CALENDAR INTEGRATION
// ============================================================================

/**
 * Create Google Calendar event URL
 */
export const createGoogleCalendarUrl = (event: CalendarEvent): string => {
  const formatDate = (date: Date): string => {
    return date.toISOString().replace(/-|:|\.\d{3}/g, '');
  };

  const startDate = formatDate(event.startDate);
  const endDate = event.endDate
    ? formatDate(event.endDate)
    : formatDate(new Date(event.startDate.getTime() + 60 * 60 * 1000)); // 1 hour default

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title,
    dates: `${startDate}/${endDate}`,
    details: event.description || '',
    location: event.location || '',
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
};

/**
 * Open Google Calendar with event
 */
export const addToGoogleCalendar = async (event: CalendarEvent): Promise<boolean> => {
  try {
    const url = createGoogleCalendarUrl(event);
    const supported = await Linking.canOpenURL(url);
    
    if (supported) {
      await Linking.openURL(url);
      return true;
    } else {
      Alert.alert(
        'Cannot Open Calendar',
        'Google Calendar is not available on this device.'
      );
      return false;
    }
  } catch (error) {
    logger.error('Calendar integration error', error, 'ExternalIntegrations');
    Alert.alert('Error', 'Failed to open calendar');
    return false;
  }
};

/**
 * Create calendar event for entry test
 */
export const createEntryTestEvent = (
  testName: string,
  testDate: Date,
  venue?: string
): CalendarEvent => ({
  title: `📝 ${testName}`,
  description: `Entry test for university admission.\n\nRemember to bring:\n- CNIC/B-Form Original\n- Admit Card\n- Pencils & Erasers\n\nArrive 1 hour early!`,
  startDate: testDate,
  endDate: new Date(testDate.getTime() + 3 * 60 * 60 * 1000), // 3 hours
  location: venue,
  reminder: 24 * 60, // 1 day before
});

/**
 * Create calendar event for deadline
 */
export const createDeadlineEvent = (
  title: string,
  deadline: Date,
  description?: string
): CalendarEvent => ({
  title: `⏰ DEADLINE: ${title}`,
  description: description || `Don't miss this important deadline!`,
  startDate: deadline,
  reminder: 2 * 24 * 60, // 2 days before
});

// ============================================================================
// MAPS INTEGRATION
// ============================================================================

/**
 * Open location in Google Maps
 */
export const openInGoogleMaps = async (location: MapLocation): Promise<boolean> => {
  try {
    const scheme = Platform.select({
      ios: 'comgooglemaps://',
      android: 'geo:',
    });

    const url = Platform.select({
      ios: `comgooglemaps://?q=${location.latitude},${location.longitude}&center=${location.latitude},${location.longitude}`,
      android: `geo:${location.latitude},${location.longitude}?q=${location.latitude},${location.longitude}(${encodeURIComponent(location.name)})`,
    });

    const webUrl = `https://www.google.com/maps/search/?api=1&query=${location.latitude},${location.longitude}`;

    const supported = await Linking.canOpenURL(url!);

    if (supported) {
      await Linking.openURL(url!);
    } else {
      await Linking.openURL(webUrl);
    }
    return true;
  } catch (error) {
    logger.error('Maps integration error', error, 'ExternalIntegrations');
    Alert.alert('Error', 'Failed to open maps');
    return false;
  }
};

/**
 * Open location in Apple Maps (iOS only)
 */
export const openInAppleMaps = async (location: MapLocation): Promise<boolean> => {
  if (Platform.OS !== 'ios') {
    return openInGoogleMaps(location);
  }

  try {
    const url = `maps://?q=${encodeURIComponent(location.name)}&ll=${location.latitude},${location.longitude}`;
    const supported = await Linking.canOpenURL(url);

    if (supported) {
      await Linking.openURL(url);
      return true;
    } else {
      return openInGoogleMaps(location);
    }
  } catch (error) {
    logger.error('Apple Maps error', error, 'ExternalIntegrations');
    return openInGoogleMaps(location);
  }
};

/**
 * Get directions to location
 */
export const getDirections = async (location: MapLocation): Promise<boolean> => {
  try {
    const url = Platform.select({
      ios: `maps://?daddr=${location.latitude},${location.longitude}`,
      android: `google.navigation:q=${location.latitude},${location.longitude}`,
    });

    const webUrl = `https://www.google.com/maps/dir/?api=1&destination=${location.latitude},${location.longitude}`;

    const supported = await Linking.canOpenURL(url!);

    if (supported) {
      await Linking.openURL(url!);
    } else {
      await Linking.openURL(webUrl);
    }
    return true;
  } catch (error) {
    logger.error('Directions error', error, 'ExternalIntegrations');
    Alert.alert('Error', 'Failed to get directions');
    return false;
  }
};

// ============================================================================
// PORTAL INTEGRATION
// ============================================================================

/**
 * Open URL in browser
 */
export const openUrl = async (url: string): Promise<boolean> => {
  try {
    const supported = await Linking.canOpenURL(url);
    
    if (supported) {
      await Linking.openURL(url);
      return true;
    } else {
      Alert.alert('Error', 'Cannot open this link');
      return false;
    }
  } catch (error) {
    logger.error('URL open error', error, 'ExternalIntegrations');
    Alert.alert('Error', 'Failed to open link');
    return false;
  }
};

/**
 * Open university portal
 */
export const openUniversityPortal = async (
  universityId: string,
  portalType: 'website' | 'admissions' | 'student' | 'fee' | 'results' = 'website'
): Promise<boolean> => {
  const university = UNIVERSITY_PORTALS.find(u => u.id === universityId);
  
  if (!university) {
    Alert.alert('Error', 'University not found');
    return false;
  }

  let url: string | undefined;
  
  switch (portalType) {
    case 'admissions':
      url = university.admissionsPortal;
      break;
    case 'student':
      url = university.studentPortal;
      break;
    case 'fee':
      url = university.feePortal;
      break;
    case 'results':
      url = university.resultsPortal;
      break;
    default:
      url = university.website;
  }

  if (!url) {
    Alert.alert('Not Available', `${portalType} portal is not available for ${university.shortName}`);
    return false;
  }

  return openUrl(url);
};

/**
 * Open HEC link
 */
export const openHECLink = async (linkId: string): Promise<boolean> => {
  const link = HEC_LINKS.find(l => l.id === linkId);
  
  if (!link) {
    Alert.alert('Error', 'Link not found');
    return false;
  }

  return openUrl(link.url);
};

// ============================================================================
// CONTACT INTEGRATION
// ============================================================================

/**
 * Send email
 */
export const sendEmail = async (
  email: string,
  subject?: string,
  body?: string
): Promise<boolean> => {
  try {
    let url = `mailto:${email}`;
    const params: string[] = [];

    if (subject) {
      params.push(`subject=${encodeURIComponent(subject)}`);
    }
    if (body) {
      params.push(`body=${encodeURIComponent(body)}`);
    }

    if (params.length > 0) {
      url += `?${params.join('&')}`;
    }

    const supported = await Linking.canOpenURL(url);
    
    if (supported) {
      await Linking.openURL(url);
      return true;
    } else {
      Alert.alert('Error', 'Email is not available on this device');
      return false;
    }
  } catch (error) {
    logger.error('Email error', error, 'ExternalIntegrations');
    Alert.alert('Error', 'Failed to open email');
    return false;
  }
};

/**
 * Make phone call
 */
export const makePhoneCall = async (phoneNumber: string): Promise<boolean> => {
  try {
    const url = `tel:${phoneNumber.replace(/\s+/g, '')}`;
    const supported = await Linking.canOpenURL(url);
    
    if (supported) {
      await Linking.openURL(url);
      return true;
    } else {
      Alert.alert('Error', 'Phone calls are not available on this device');
      return false;
    }
  } catch (error) {
    logger.error('Phone call error', error, 'ExternalIntegrations');
    Alert.alert('Error', 'Failed to make phone call');
    return false;
  }
};

/**
 * Contact university
 */
export const contactUniversity = async (
  universityId: string,
  method: 'email' | 'phone'
): Promise<boolean> => {
  const university = UNIVERSITY_PORTALS.find(u => u.id === universityId);
  
  if (!university) {
    Alert.alert('Error', 'University not found');
    return false;
  }

  if (method === 'email' && university.contactEmail) {
    return sendEmail(
      university.contactEmail,
      `Inquiry about ${university.shortName} Admissions`
    );
  } else if (method === 'phone' && university.contactPhone) {
    return makePhoneCall(university.contactPhone);
  } else {
    Alert.alert('Not Available', `${method} contact is not available for ${university.shortName}`);
    return false;
  }
};

// ============================================================================
// SHARE INTEGRATION
// ============================================================================

/**
 * Share university info via WhatsApp
 */
export const shareViaWhatsApp = async (text: string): Promise<boolean> => {
  try {
    const url = `whatsapp://send?text=${encodeURIComponent(text)}`;
    const webUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;

    const supported = await Linking.canOpenURL(url);
    
    if (supported) {
      await Linking.openURL(url);
    } else {
      await Linking.openURL(webUrl);
    }
    return true;
  } catch (error) {
    logger.error('WhatsApp share error', error, 'ExternalIntegrations');
    Alert.alert('Error', 'Failed to share via WhatsApp');
    return false;
  }
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get university portal by ID
 */
export const getUniversityPortal = (universityId: string): UniversityPortal | undefined => {
  return UNIVERSITY_PORTALS.find(u => u.id === universityId);
};

/**
 * Get university location by ID
 */
export const getUniversityLocation = (locationId: string): MapLocation | undefined => {
  return UNIVERSITY_LOCATIONS[locationId];
};

/**
 * Get all HEC links
 */
export const getAllHECLinks = (): HECLink[] => {
  return HEC_LINKS;
};

/**
 * Search university portals
 */
export const searchUniversityPortals = (query: string): UniversityPortal[] => {
  const lowerQuery = query.toLowerCase();
  return UNIVERSITY_PORTALS.filter(
    u =>
      u.name.toLowerCase().includes(lowerQuery) ||
      u.shortName.toLowerCase().includes(lowerQuery)
  );
};

export default {
  // Calendar
  addToGoogleCalendar,
  createEntryTestEvent,
  createDeadlineEvent,
  // Maps
  openInGoogleMaps,
  openInAppleMaps,
  getDirections,
  // Portals
  openUrl,
  openUniversityPortal,
  openHECLink,
  // Contact
  sendEmail,
  makePhoneCall,
  contactUniversity,
  // Share
  shareViaWhatsApp,
  // Data
  UNIVERSITY_PORTALS,
  UNIVERSITY_LOCATIONS,
  HEC_LINKS,
  getUniversityPortal,
  getUniversityLocation,
  getAllHECLinks,
  searchUniversityPortals,
};
