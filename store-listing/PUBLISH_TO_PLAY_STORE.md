# PakUni - Complete Google Play Store Publishing Guide

## Pre-Publishing Checklist

### Build Outputs (Ready)
| File | Location | Size | Purpose |
|------|----------|------|---------|
| **app-release.aab** | `android/app/build/outputs/bundle/release/` | ~30 MB | **Upload to Play Store** |
| **app-release.apk** | `android/app/build/outputs/apk/release/` | ~41 MB | Direct install/testing |

> **Important**: Google Play requires the `.aab` (Android App Bundle) format, NOT the `.apk`.

---

## Step-by-Step Publishing Guide

### Step 1: Sign in to Google Play Console
1. Go to [https://play.google.com/console](https://play.google.com/console)
2. Sign in with your Google account (the one you purchased the $25 developer account with)

### Step 2: Create a New App
1. Click **"Create app"** button (top right)
2. Fill in:
   - **App name**: `PakUni - Pakistan Universities`
   - **Default language**: English (United States)
   - **App or game**: App
   - **Free or paid**: Free
3. Check all declaration boxes and click **"Create app"**

### Step 3: Store Listing (Main Store Info)
Go to **Grow > Store presence > Main store listing**

#### App Details
| Field | Value |
|-------|-------|
| **App name** | PakUni - Pakistan Universities |
| **Short description** | Pakistan University Guide 2026 - Merit Calculator, ECAT MDCAT & Scholarships |
| **Full description** | Copy from `store-listing/PLAY_STORE_LISTING.md` (see "FULL DESCRIPTION" section) |

#### Graphics (see "Required Graphics" section below)
Upload all required graphics as specified.

### Step 4: App Content (Policy Compliance)
Go to **Policy and programs > App content** and complete ALL sections:

1. **Privacy policy**: 
   - Host your privacy policy at a URL (e.g., GitHub Pages or your website)
   - Content: See `SECURITY.md` or create one stating:
     - Data collected: email, name (for account creation)
     - No data sold to third parties
     - Data stored on Supabase (secured)
     - Users can delete their account and data
   
2. **Ads**: Select "No, my app does not contain ads"

3. **App access**: 
   - Select "All or some functionality is restricted"
   - Add instructions: "App can be used in Guest mode without login. For full features, create an account with any email."

4. **Content rating**: 
   - Fill out the IARC questionnaire
   - Expected rating: **Everyone** / **PEGI 3**
   - No violence, no sexual content, no gambling

5. **Target audience**: 
   - Age group: 13+ (students)
   - NOT designed for children under 13

6. **News app**: Select "No"

7. **COVID-19 contact tracing / health apps**: Select "No"

8. **Data safety**:
   - Data collected: Email, Name (optional - for account)
   - Data shared: None
   - Data encrypted in transit: Yes
   - Users can request deletion: Yes

9. **Government apps**: Select "No"

### Step 5: App Releases
Go to **Release > Production**

1. Click **"Create new release"**
2. **App signing**: Let Google manage your signing key (recommended)
3. **Upload**: Drag and drop `app-release.aab` from:
   ```
   E:\pakuni\android\app\build\outputs\bundle\release\app-release.aab
   ```
4. **Release name**: `1.3.0 (10)` 
5. **Release notes**:
   ```
   What's New in PakUni v1.3.0:
   
   🎓 200+ HEC-recognized universities database
   📊 Accurate merit calculator with university-specific formulas
   💰 Comprehensive scholarships database
   📅 Entry test tracker (ECAT, MDCAT, NET, GAT)
   🎯 Career guidance with salary insights
   🌙 Dark mode support
   🔔 Smart notifications for deadlines
   ⭐ In-app favorites and bookmarks
   🔧 Performance optimizations and bug fixes
   ```
6. Click **"Review release"** then **"Start rollout to Production"**

### Step 6: Pricing & Distribution
Go to **Monetize > App pricing**
- Set as **Free**
- Select countries: Start with **Pakistan** (primary), then add:
  - United Kingdom, United States, Canada, UAE, Saudi Arabia, Qatar, Bahrain, Kuwait, Oman, Australia

### Step 7: App Category & Contact Details
Go to **Grow > Store presence > Store settings**
- **Category**: Education
- **Email**: Your support email
- **Website**: Your website URL (optional)
- **Phone**: Your contact number (optional)

---

## Required Graphics & Assets

### 1. App Icon (Already in project)
- **Size**: 512 x 512 px
- **Format**: PNG (32-bit, no alpha)
- **Location**: Should be in `android/app/src/main/res/mipmap-xxxhdpi/ic_launcher.png`
- If you need to upload separately to Play Console, export at 512x512

### 2. Feature Graphic (REQUIRED - Must Create)
- **Size**: 1024 x 500 px
- **Format**: PNG or JPEG
- **Design Spec**:

```
┌──────────────────────────────────────────────────────────┐
│                    1024 x 500 px                          │
│                                                           │
│  ┌─────────┐                                              │
│  │  PakUni  │   Pakistan's #1 University                  │
│  │  Logo    │   Admission Guide 2026                      │
│  │  (white) │                                              │
│  └─────────┘   📊 Merit Calculator                        │
│                💰 Scholarships                             │
│                🎓 200+ Universities                        │
│                                                           │
│  Background: Gradient #00D4AA → #00A388 (PakUni green)    │
│  Text: White, bold sans-serif                              │
│  Include 1-2 phone mockup screenshots                      │
└──────────────────────────────────────────────────────────┘
```

**How to create**:
- Use **Canva** (free): Search "Google Play Feature Graphic" template
- Or **Figma**: Create 1024x500 artboard
- Background: Use PakUni brand colors (`#00D4AA` to `#00A388` gradient)
- Include app logo (white), tagline, and 1-2 key features
- Add phone mockup showing the app (optional but recommended)

### 3. Screenshots (REQUIRED - Min 2, Max 8)
- **Phone**: 16:9 ratio minimum, recommended 1080 x 1920 px (or 1242 x 2208)
- **Tablet (optional)**: 7-inch and 10-inch versions

**Must-have screenshots (in this order)**:

| # | Screen | Caption |
|---|--------|---------|
| 1 | Home/Dashboard | "Explore 200+ Pakistani Universities" |
| 2 | Merit Calculator | "Calculate Your Admission Merit Instantly" |
| 3 | University Detail | "Complete University Info & Programs" |
| 4 | Scholarships | "Find Scholarships Worth Millions" |
| 5 | Entry Tests | "Never Miss an Entry Test Deadline" |
| 6 | Career Guidance | "Plan Your Future Career Path" |
| 7 | Dark Mode | "Beautiful Dark Mode" |
| 8 | Recommendations | "AI-Powered University Recommendations" |

**How to capture screenshots**:
1. Run the app on your Android device or emulator
2. Navigate to each screen
3. Take screenshot (Power + Volume Down)
4. For framed screenshots, use:
   - **App Mockup** (appmockup.com) - free
   - **Screener** (screener.io) - adds device frame
   - **Canva** - phone frame templates

**Screenshot Frame Template**:
```
┌─────────────────────────┐
│     Caption Text         │  ← Bold, 2-3 words
│     (White on gradient)  │
│                          │
│   ┌──────────────────┐   │
│   │                  │   │
│   │   Phone Screen   │   │
│   │   Screenshot     │   │
│   │                  │   │
│   │                  │   │
│   └──────────────────┘   │
│                          │
│  BG: Brand color gradient │
└─────────────────────────┘
Size: 1080 x 1920 px
```

### 4. Video (Optional but HIGHLY Recommended)
- **YouTube link**: Upload a 30-60 second demo video
- Show key features: merit calculator, university search, scholarships
- Add captions in Urdu/English

---

## Privacy Policy (REQUIRED)

You MUST have a publicly accessible privacy policy URL. Quick options:

### Option A: GitHub Pages (Free)
1. Create a new GitHub repo or use existing one
2. Create `privacy-policy.html` with content below
3. Enable GitHub Pages in repo settings
4. URL will be: `https://yourusername.github.io/pakuni/privacy-policy.html`

### Option B: Google Sites (Free)
1. Go to sites.google.com
2. Create a new site with privacy policy content

### Privacy Policy Content Template:
```
PakUni Privacy Policy
Last Updated: February 2026

PakUni ("we", "our", "us") operates the PakUni mobile application.

INFORMATION WE COLLECT:
- Email address (for account creation, optional)
- Name (for personalization, optional)  
- Academic information you voluntarily enter (marks, preferences)
- App usage analytics (anonymous)

HOW WE USE YOUR INFORMATION:
- Provide personalized university recommendations
- Save your favorites and calculations
- Send relevant deadline notifications (opt-in)

DATA STORAGE:
- User data stored securely on Supabase (encrypted)
- University data served from Turso databases
- All data transmitted via HTTPS

DATA SHARING:
- We do NOT sell your data to third parties
- We do NOT share personal data with advertisers

YOUR RIGHTS:
- Access your data through the app's Profile section
- Delete your account and all data by contacting us
- Opt-out of notifications at any time

CONTACT:
- Email: [your-email@domain.com]

CHILDREN'S PRIVACY:
- Our app is not intended for children under 13
- We do not knowingly collect data from children under 13
```

---

## After Publishing - First Week Actions

1. **Monitor Reviews**: Check Play Console daily for user reviews/crashes
2. **Reply to Reviews**: Respond to all reviews within 24 hours
3. **Share the App**: 
   - Share on Pakistani student Facebook groups
   - Post on Twitter/X with #PakUni #ECAT2026 #MDCAT2026
   - Share in WhatsApp groups for students
4. **Request Reviews**: The app has in-app review (useInAppReview hook) - it will prompt after merit calculations
5. **Monitor Crashes**: Check Android Vitals in Play Console for any ANRs or crashes
6. **Update Listing**: After first 100 installs, optimize keywords based on Search Console data

---

## Important Notes

- **Review Time**: First submission takes 3-7 days for Google review
- **Rejection Common Reasons**:
  - Missing privacy policy URL (most common)
  - Screenshots showing non-Google content
  - Missing content rating
  - Insufficient app content declarations
- **If Rejected**: Read the rejection email carefully, fix the issue, and resubmit
- **Updates**: Future updates follow the same AAB upload process but go through faster (~1-2 days)

---

## Build Commands Reference

```bash
# Build release APK (for testing/sideloading)
cd android && ./gradlew assembleRelease

# Build release AAB (for Play Store upload)
cd android && ./gradlew bundleRelease

# Clean build (if issues)
cd android && ./gradlew clean && ./gradlew bundleRelease
```

**Output locations**:
- APK: `android/app/build/outputs/apk/release/app-release.apk`
- AAB: `android/app/build/outputs/bundle/release/app-release.aab`
