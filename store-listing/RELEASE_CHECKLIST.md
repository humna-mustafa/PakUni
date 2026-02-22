# 🚀 PakUni v1.3.0 — Play Store Release Checklist (ASO Optimized)

## ✅ Build Configuration — ALL OPTIMIZED
- [x] R8/ProGuard **ENABLED** for release builds (20-40% smaller APK)
- [x] AAB bundle splits: ABI + density + language
- [x] PNG crunching enabled for release
- [x] Production keystore (`pakuni-release.keystore`)
- [x] Release signing configured
- [x] Version code: **10**
- [x] Version name: **1.3.0**
- [x] Target SDK: **35** (Android 15)
- [x] Min SDK: **24** (Android 7.0)
- [x] Hermes engine enabled
- [x] New Architecture enabled
- [x] arm64-v8a + x86_64 architectures

## ✅ Play Store Ranking Optimizations
- [x] Google Play In-App Review API (`play:review:2.0.2`)
- [x] Google Play In-App Updates API (`play:app-update:2.1.0`)
- [x] Firebase App Indexing (`firebase-appindexing:20.0.0`)
- [x] Content deep links (university, scholarship, merit, career, test)
- [x] Google Actions XML (`actions.xml`) for search integration
- [x] `useInAppReview` hook for smart review prompts
- [x] ProGuard rules for all Play Core libraries
- [x] Market intent queries for Play Store

## ✅ AndroidManifest Compliance
- [x] `android:allowBackup="true"` with backup rules
- [x] `android:dataExtractionRules` for Android 12+
- [x] `android:networkSecurityConfig` for secure connections
- [x] `android:supportsRtl="true"` (Urdu support)
- [x] `android:largeHeap="true"` (prevents OOM)
- [x] `tools:targetApi="35"` (matches targetSdk)
- [x] Content deep link intent filters with `autoVerify="true"`
- [x] Custom scheme deep links (pakuni://)
- [x] `<queries>` for Android 11+ (HTTPS, mailto, market)

## ✅ Privacy & Legal
- [x] Privacy Policy screen in app
- [x] Terms of Service screen in app
- [x] Privacy Policy HTML (`store-listing/privacy-policy.html`)
- [x] Data Safety declaration prepared
- [x] COPPA compliance (13+ audience, no ads)

## ✅ Store Listing (ASO-Optimized)
- [x] App name: 30 chars, keyword-optimized
- [x] Short description: 78/80 chars, 6 keywords
- [x] Full description: 3,850/4,000 chars, 50+ keywords
- [x] Urdu (ur-PK) localization prepared
- [x] Release notes: Fresh v1.3.0
- [x] Tags: 5 high-impact keywords
- [x] Target countries: Pakistan + Gulf + UK/US/Canada
- [x] A/B testing variants planned
- [x] Screenshot strategy (8 screens with captions)
- [x] Feature graphic design spec

---

## ⏳ BEFORE SUBMISSION — DO THESE NOW

### Build
```bash
cd android
./gradlew bundleRelease
```
AAB: `android/app/build/outputs/bundle/release/app-release.aab`

### Assets to Create
- [ ] **Feature graphic** (1024x500 PNG) — follow design spec in PLAY_STORE_LISTING.md
- [ ] **8 screenshots** (1080x1920) — order per screenshot strategy
- [ ] **Host privacy policy** at https://pakuni.app/privacy-policy
- [ ] **Digital Asset Links** at https://pakuni.app/.well-known/assetlinks.json

### Play Console Setup
1. [ ] Create app → "PakUni - Pakistan Universities"
2. [ ] Category: Education
3. [ ] Upload AAB
4. [ ] Paste short description (from PLAY_STORE_LISTING.md)
5. [ ] Paste full description (from PLAY_STORE_LISTING.md)
6. [ ] Upload feature graphic + screenshots
7. [ ] Complete content rating questionnaire
8. [ ] Complete Data Safety form (from DATA_SAFETY_DECLARATION.md)
9. [ ] Set Privacy Policy URL
10. [ ] Add Urdu (ur-PK) translation
11. [ ] Create custom store listing variant for A/B test
12. [ ] Enable pre-launch report
13. [ ] Select target countries (Pakistan + diaspora countries)
14. [ ] Submit for review

---

## Quick Reference

| Item | Value |
|------|-------|
| Package Name | com.pakuni |
| Version Code | 10 |
| Version Name | 1.3.0 |
| Target SDK | 35 |
| Min SDK | 24 |
| Key Alias | pakuni-key |
| Keystore | pakuni-release.keystore |
| ProGuard | ENABLED |
| R8 | ENABLED |
| Bundle Splits | ABI + Density + Language |
| In-App Review | useInAppReview hook |
| Deep Links | pakuni.app/university, /scholarship, /merit, /career, /test |
| Play Store URL | https://play.google.com/store/apps/details?id=com.pakuni |

---

## Post-Launch Monitoring

### Week 1
- [ ] Check pre-launch report for crashes
- [ ] Monitor Android Vitals dashboard
- [ ] Respond to all reviews within 24 hours
- [ ] Verify deep links appear in Google Search Console
- [ ] Check install numbers daily

### Month 1
- [ ] Run A/B test on short description
- [ ] Run A/B test on screenshots
- [ ] Analyze keyword ranking positions
- [ ] Release minor update (v1.3.1) for freshness signal
- [ ] Share in student communities for download velocity
