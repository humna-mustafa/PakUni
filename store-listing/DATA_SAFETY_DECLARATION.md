# PakUni Data Safety Declaration
# For Google Play Console Data Safety Form

## Overview
This document contains the information needed to complete Google Play's Data Safety form.

---

## Data Collection Summary

### 1. Personal Information
| Data Type | Collected | Shared | Required | Purpose |
|-----------|-----------|--------|----------|---------|
| Name | ✅ Yes | ❌ No | Optional | Account personalization |
| Email | ✅ Yes | ❌ No | Optional | Account & authentication |
| Education Level | ✅ Yes | ❌ No | Optional | Personalized recommendations |
| City/Province | ✅ Yes | ❌ No | Optional | Regional university suggestions |

### 2. App Activity
| Data Type | Collected | Shared | Required | Purpose |
|-----------|-----------|--------|----------|---------|
| App interactions | ✅ Yes | ❌ No | Auto | Analytics & improvement |
| In-app search history | ✅ Yes | ❌ No | Auto | Better search results |
| Saved/favorite items | ✅ Yes | ❌ No | Auto | User preferences |

### 3. Device Information
| Data Type | Collected | Shared | Required | Purpose |
|-----------|-----------|--------|----------|---------|
| Device type | ✅ Yes | ❌ No | Auto | Crash reporting |
| OS version | ✅ Yes | ❌ No | Auto | Compatibility |
| App crashes/logs | ✅ Yes | ❌ No | Auto | Bug fixing |

### 4. Data NOT Collected
- ❌ Location (precise or approximate)
- ❌ Financial information
- ❌ Health information
- ❌ Messages or communications
- ❌ Photos or videos
- ❌ Audio files
- ❌ Files and documents
- ❌ Calendar events
- ❌ Contacts
- ❌ Phone number
- ❌ SMS/call log

---

## Data Handling Practices

### Security
✅ Data is encrypted in transit (HTTPS/TLS)
✅ Data stored on secure cloud servers (Supabase)
✅ Local data stored securely on device

### User Control
✅ Users can request their data be deleted
✅ Users can export their data
✅ Users can opt-out of analytics

### Data Retention
- Account data: Retained until account deletion
- Analytics data: Aggregated, anonymized after 90 days
- Local cache: Cleared when app is uninstalled

---

## Third-Party SDKs

### Firebase Analytics (Google)
- Purpose: App performance monitoring
- Data: Anonymous usage statistics
- Privacy Policy: https://firebase.google.com/support/privacy

### Supabase
- Purpose: User authentication and data storage
- Data: Account information (if created)
- Privacy Policy: https://supabase.com/privacy

### Google Sign-In
- Purpose: Authentication
- Data: Google account email and name (with consent)
- Privacy Policy: https://policies.google.com/privacy

---

## Play Console Form Answers

### Does your app collect or share any of the required user data types?
**Answer:** Yes

### Is all of the user data collected by your app encrypted in transit?
**Answer:** Yes

### Do you provide a way for users to request that their data be deleted?
**Answer:** Yes (Contact support or delete account in Settings)

### Data Types to Select in Console:

**Personal Info:**
- [x] Name (optional, not shared)
- [x] Email address (optional, not shared)

**App Activity:**
- [x] App interactions (collected, not shared)
- [x] In-app search history (collected, not shared)

**App Info and Performance:**
- [x] Crash logs (collected, not shared)
- [x] Diagnostics (collected, not shared)

**Device or other IDs:**
- [x] Device or other IDs (collected, not shared)

---

## Compliance Notes

1. **COPPA (Children's Online Privacy):** 
   - App is designed for 13+ audience
   - No targeted advertising
   - Parental consent recommended for users under 13

2. **GDPR (if applicable to EU users):**
   - Clear privacy policy
   - Data deletion available
   - Consent for optional data collection

3. **Pakistan Data Protection:**
   - Compliant with local regulations
   - Data stored on secure servers
   - User consent obtained for all data collection
