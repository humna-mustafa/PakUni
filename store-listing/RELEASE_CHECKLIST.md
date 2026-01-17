# 🚀 Google Play Store Release Checklist

## Pre-Release Checklist

### ✅ App Configuration
- [x] Production keystore generated (`pakuni-release.keystore`)
- [x] Release signing configured in `build.gradle`
- [x] ProGuard enabled with proper rules
- [x] Version code: 4
- [x] Version name: 1.2.1
- [x] Target SDK: 36 (Android 15)
- [x] Min SDK: 24 (Android 7.0)

### ✅ Android Manifest Compliance
- [x] `android:allowBackup="true"` with backup rules
- [x] `android:dataExtractionRules` for Android 12+
- [x] `android:networkSecurityConfig` for secure connections
- [x] Proper permission declarations (only INTERNET required)
- [x] Intent filters for deep linking
- [x] `<queries>` for Android 11+ package visibility

### ✅ Privacy & Legal
- [x] Privacy Policy screen in app
- [x] Terms of Service screen in app
- [x] Privacy Policy HTML for hosting (`store-listing/privacy-policy.html`)
- [x] Data Safety declaration prepared
- [x] COPPA compliance (13+ audience, no ads)

### ✅ Store Listing Assets
- [x] App icon (512x512) - configured in mipmap folders
- [x] Store listing description prepared
- [x] Short description (80 chars) prepared
- [ ] Feature graphic (1024x500) - **CREATE BEFORE SUBMISSION**
- [ ] Screenshots (1080x1920) - **TAKE 8 SCREENSHOTS**
- [ ] Privacy Policy hosted URL - **HOST ON WEBSITE**

---

## Build Release APK/AAB

### Option 1: Build APK (for testing)
```bash
cd android
./gradlew assembleRelease
```
APK location: `android/app/build/outputs/apk/release/app-release.apk`

### Option 2: Build AAB (required for Play Store)
```bash
cd android
./gradlew bundleRelease
```
AAB location: `android/app/build/outputs/bundle/release/app-release.aab`

---

## Google Play Console Steps

### 1. Create Developer Account
- Go to: https://play.google.com/console
- Pay one-time $25 registration fee
- Complete identity verification

### 2. Create New App
1. Click "Create app"
2. App name: **PakUni - Pakistan Universities Guide**
3. Default language: **English (United States)**
4. App type: **App**
5. Category: **Education**
6. Free or paid: **Free**

### 3. Store Listing
1. **App details**
   - Short description (from PLAY_STORE_LISTING.md)
   - Full description (from PLAY_STORE_LISTING.md)
   
2. **Graphics**
   - App icon: 512x512 PNG
   - Feature graphic: 1024x500 PNG/JPEG
   - Phone screenshots: At least 2 (recommended 8)
   
3. **Categorization**
   - Category: Education
   - Tags: pakistan universities, merit calculator, scholarships

### 4. Content Rating
Answer the questionnaire:
- Violence: None
- Sexual content: None
- Profanity: None
- Ads: None
- User interaction: Users can share externally
- Target age: 13+

**Expected Rating:** Everyone (PEGI 3)

### 5. Data Safety
Use `DATA_SAFETY_DECLARATION.md` to complete the form:
- Data types collected
- Data sharing practices
- Security practices
- Data deletion available: Yes

### 6. App Content
1. Privacy Policy URL (required)
2. Target audience: 13+
3. News app: No
4. Contains ads: No

### 7. Pricing & Distribution
- Price: Free
- Countries: All (or Pakistan only initially)
- Contains ads: No

### 8. Upload AAB
1. Go to Production > Create new release
2. Upload `app-release.aab`
3. Add release notes
4. Review and submit

---

## Post-Submission

### Timeline
- Initial review: 1-3 days (new apps may take up to 7 days)
- Policy violations: Fix and resubmit

### Common Rejection Reasons to Avoid
1. ❌ Missing Privacy Policy URL
2. ❌ Incorrect data safety declaration
3. ❌ App crashes on launch
4. ❌ Broken features/links
5. ❌ Inappropriate content rating
6. ❌ Copyright violations (university logos used properly ✅)

### After Approval
1. Monitor crash reports in Play Console
2. Respond to user reviews
3. Plan next version updates
4. Monitor Android Vitals for performance

---

## Keystore Backup (CRITICAL!)

⚠️ **BACKUP YOUR KEYSTORE!** If lost, you cannot update the app.

1. Copy `android/app/pakuni-release.keystore` to secure location
2. Store credentials securely:
   - Store password: `PakUni2026Secure`
   - Key alias: `pakuni-key`
   - Key password: `PakUni2026Secure`

**NEVER commit keystore or passwords to git!**

---

## Quick Reference

| Item | Value |
|------|-------|
| Package Name | com.pakuni |
| Version Code | 4 |
| Version Name | 1.2.1 |
| Target SDK | 36 |
| Min SDK | 24 |
| Key Alias | pakuni-key |
| Keystore | pakuni-release.keystore |

---

## Resources

- [Google Play Console](https://play.google.com/console)
- [Play Store Policy](https://play.google.com/about/developer-content-policy/)
- [Data Safety Guide](https://support.google.com/googleplay/android-developer/answer/10787469)
- [Content Rating Guide](https://support.google.com/googleplay/android-developer/answer/9859655)
