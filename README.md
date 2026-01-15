<p align="center">
  <img src="./docs/screenshots/pakuni-logo.png" alt="PakUni Logo" width="120" height="120" style="border-radius: 24px;"/>
</p>

<h1 align="center">🎓 PakUni - Pakistan University Guide</h1>

<p align="center">
  <strong>Your Ultimate Companion for Pakistan's Higher Education Journey</strong>
</p>

<p align="center">
  <a href="#features">Features</a> •
  <a href="#screenshots">Screenshots</a> •
  <a href="#installation">Installation</a> •
  <a href="#tech-stack">Tech Stack</a> •
  <a href="#architecture">Architecture</a> •
  <a href="#contributing">Contributing</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React_Native-0.83.1-61DAFB?style=for-the-badge&logo=react&logoColor=white" alt="React Native"/>
  <img src="https://img.shields.io/badge/TypeScript-5.8-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript"/>
  <img src="https://img.shields.io/badge/Supabase-Backend-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white" alt="Supabase"/>
  <img src="https://img.shields.io/badge/Platform-Android%20%7C%20iOS-green?style=for-the-badge" alt="Platform"/>
</p>

---

## 📖 About PakUni

**PakUni** is a comprehensive mobile application designed to help Pakistani students navigate their higher education journey. From finding the right university to calculating merit scores, exploring scholarships, and career guidance — PakUni is the one-stop solution for all educational needs.

### 🎯 Mission

To democratize access to higher education information in Pakistan and help every student make informed decisions about their academic future.

### 👥 Target Audience

- 🎒 Matric/FSc students planning for university
- 📚 Parents researching universities for their children
- 🎓 Students preparing for entry tests (ECAT, MDCAT, NET, NAT)
- 💼 Career changers exploring educational opportunities

---

## ✨ Features

### 🏫 University Explorer
- **250+ Universities** - Comprehensive database of HEC-recognized institutions
- **Advanced Filters** - Filter by city, province, sector (public/private), ranking, fee range
- **Detailed Profiles** - Programs, facilities, contact info, admission details
- **Real Logos** - Official university logos for easy recognition
- **Map Integration** - Find universities near you

### 🧮 Merit Calculator
- **Universal Calculator** - Supports all major university formulas
- **Multiple Formulas** - NUST, UET, PU, FAST, COMSATS, GIKI, and more
- **What-If Analysis** - See how different scores affect your aggregate
- **Shareable Results** - Generate beautiful cards to share on social media
- **Historical Data** - Past 5 years merit lists for comparison

### 💰 Scholarship Center
- **Scholarship Database** - HEC, PEEF, university-specific scholarships
- **Eligibility Checker** - Find scholarships you qualify for
- **Deadline Alerts** - Never miss an application deadline
- **Application Guides** - Step-by-step application help

### 📊 Career Guidance
- **Interest Quiz** - Discover your ideal career path
- **Career Roadmaps** - Step-by-step guides from school to profession
- **Salary Insights** - Average salaries by profession in Pakistan
- **Industry Trends** - Growing sectors and future-proof careers

### 🎯 Entry Test Preparation
- **Past Papers** - ECAT, MDCAT, NET, NAT, GAT archives
- **Practice Quizzes** - Chapter-wise MCQ practice
- **Mock Tests** - Full-length simulated tests
- **Performance Analytics** - Track your progress

### 👶 Kids Learning Zone
- **Career Explorer for Kids** - Age-appropriate career exploration
- **Fun Quizzes** - Interactive learning experiences
- **Subject Guides** - Help choose the right subjects

### 🛡️ Enterprise Features
- **Accessibility** - WCAG 2.1 AA compliant
- **Offline Mode** - Works without internet
- **Dark Mode** - Easy on the eyes
- **Multi-language** - English and Urdu support
- **Analytics** - Track your learning journey

---

## 📱 Screenshots

<p align="center">
  <i>✨ Beautiful, Modern UI with Premium Design ✨</i>
</p>

### 🏠 Home Screen & Navigation

| Light Mode | Dark Mode | Navigation |
|:----------:|:---------:|:----------:|
| ![Home Light](./docs/screenshots/home-light.png) | ![Home Dark](./docs/screenshots/home-dark.png) | ![Navigation](./docs/screenshots/navigation.png) |

### 🏫 University Explorer

| University List | University Details | Search & Filters |
|:---------------:|:------------------:|:----------------:|
| ![Universities](./docs/screenshots/universities-list.png) | ![Detail](./docs/screenshots/university-detail.png) | ![Filters](./docs/screenshots/university-filters.png) |

### 🧮 Merit Calculator

| Calculator Input | Result Display | Shareable Card |
|:----------------:|:--------------:|:--------------:|
| ![Calculator](./docs/screenshots/calculator.png) | ![Result](./docs/screenshots/calculator-result.png) | ![Share](./docs/screenshots/shareable-card.png) |

### 💰 Scholarships & Career

| Scholarships | Career Guidance | Career Roadmaps |
|:------------:|:---------------:|:---------------:|
| ![Scholarships](./docs/screenshots/scholarships.png) | ![Career](./docs/screenshots/career-guidance.png) | ![Roadmap](./docs/screenshots/career-roadmap.png) |

### 👤 Profile & Settings

| User Profile | Settings | Onboarding |
|:------------:|:--------:|:----------:|
| ![Profile](./docs/screenshots/profile.png) | ![Settings](./docs/screenshots/settings.png) | ![Onboarding](./docs/screenshots/onboarding.png) |

### 📱 More Screens

| Entry Tests | Compare Universities | Notifications |
|:-----------:|:--------------------:|:-------------:|
| ![Tests](./docs/screenshots/entry-tests.png) | ![Compare](./docs/screenshots/compare.png) | ![Notifications](./docs/screenshots/notifications.png) |

> 📸 **Adding Screenshots**: Place your app screenshots in `./docs/screenshots/` folder with the names shown above.

---

## 🚀 Installation

### Prerequisites

- **Node.js** v20 or higher
- **React Native CLI** - `npm install -g @react-native-community/cli`
- **Android Studio** with Android SDK (for Android development)
- **Xcode** 15+ (for iOS development, macOS only)
- **JDK 17** - Required for Android builds

### Quick Start

```bash
# Clone the repository
git clone https://github.com/yourusername/pakuni.git
cd pakuni

# Install dependencies
npm install

# For iOS (macOS only)
cd ios && pod install && cd ..

# Start Metro Bundler
npm start

# Run on Android
npm run android

# Run on iOS (macOS only)
npm run ios
```

### Environment Setup

1. Create a `.env` file in the root directory:

```env
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
```

2. For Android, setup port forwarding:

```bash
adb reverse tcp:8081 tcp:8081
```

### Build for Production

```bash
# Android Release APK
npm run android:release

# Android App Bundle (for Play Store)
npm run android:bundle

# iOS (Archive from Xcode)
npm run ios -- --configuration Release
```

---

## 🛠️ Tech Stack

### Frontend

| Technology | Purpose |
|------------|---------|
| **React Native 0.83** | Cross-platform mobile framework |
| **TypeScript 5.8** | Type-safe JavaScript |
| **React Navigation 7** | Navigation library |
| **React Native Gesture Handler** | Touch & gesture handling |
| **React Native Linear Gradient** | Beautiful gradients |

### Backend & Services

| Technology | Purpose |
|------------|---------|
| **Supabase** | Backend-as-a-Service (Auth, Database, Storage) |
| **AsyncStorage** | Local data persistence |
| **NetInfo** | Network connectivity monitoring |

### UI & Design

| Technology | Purpose |
|------------|---------|
| **React Native Vector Icons** | Icon library |
| **React Native Linear Gradient** | Gradient backgrounds |
| **Custom Components** | Premium UI components |

### Development & Testing

| Technology | Purpose |
|------------|---------|
| **Jest** | Unit testing framework |
| **React Testing Library** | Component testing |
| **ESLint** | Code linting |
| **Prettier** | Code formatting |

---

## 📁 Project Architecture

```
PakUni/
├── 📂 src/
│   ├── 📂 assets/              # Images, fonts, and static assets
│   │   ├── fonts/
│   │   └── images/
│   │
│   ├── 📂 components/          # Reusable UI components
│   │   ├── calculators/        # Calculator components
│   │   ├── career/             # Career-related components
│   │   ├── elite/              # Premium UI components
│   │   ├── filters/            # Filter components
│   │   ├── games/              # Gamification components
│   │   ├── graphics/           # Visual graphics
│   │   ├── graphs/             # Charts and graphs
│   │   ├── guides/             # Guide components
│   │   ├── icons/              # Custom icons
│   │   ├── integrations/       # Third-party integrations
│   │   ├── ultra/              # Ultra-premium components
│   │   ├── widgets/            # Widget components
│   │   └── index.ts            # Component exports
│   │
│   ├── 📂 config/              # App configuration
│   │
│   ├── 📂 constants/           # App constants and themes
│   │
│   ├── 📂 contexts/            # React Context providers
│   │   ├── ThemeContext.tsx
│   │   └── AuthContext.tsx
│   │
│   ├── 📂 data/                # Static data and mock data
│   │   └── universities.ts     # 250+ universities data
│   │
│   ├── 📂 hooks/               # Custom React hooks
│   │   ├── useDebounce.ts
│   │   ├── usePerformance.ts
│   │   └── useAccessibility.ts
│   │
│   ├── 📂 navigation/          # Navigation configuration
│   │   ├── AppNavigator.tsx
│   │   └── navigationUtils.ts
│   │
│   ├── 📂 screens/             # Screen components
│   │   ├── admin/              # Admin panel screens
│   │   ├── AuthScreen.tsx
│   │   ├── PremiumHomeScreen.tsx
│   │   ├── PremiumUniversitiesScreen.tsx
│   │   ├── PremiumCalculatorScreen.tsx
│   │   ├── PremiumScholarshipsScreen.tsx
│   │   ├── PremiumProfileScreen.tsx
│   │   └── ... (35+ screens)
│   │
│   ├── 📂 services/            # API and external services
│   │   ├── analytics.ts
│   │   ├── config.ts
│   │   ├── i18n.ts
│   │   └── network.ts
│   │
│   ├── 📂 styles/              # Global styles
│   │
│   └── 📂 utils/               # Utility functions
│       ├── accessibility.ts
│       ├── formValidation.ts
│       ├── loadingStates.ts
│       ├── security.ts
│       └── validation.ts
│
├── 📂 android/                 # Android native code
├── 📂 ios/                     # iOS native code
├── 📂 __tests__/               # Test files
├── 📂 scripts/                 # Build and utility scripts
├── 📂 supabase/                # Supabase configuration
├── 📂 docs/                    # Documentation & screenshots
│   └── screenshots/            # App screenshots
├── 📄 App.tsx                  # Main app entry point
├── 📄 package.json             # Dependencies
├── 📄 tsconfig.json            # TypeScript config
└── 📄 README.md                # This file
```

---

## 🔐 Authentication & User Roles

PakUni supports multiple user roles with different permissions:

| Role | Description | Access Level |
|------|-------------|--------------|
| **User** | Regular app user | Browse, save favorites, use calculator |
| **Moderator** | Content moderator | Review reports, manage feedback |
| **Content Editor** | Content manager | Edit universities, scholarships |
| **Admin** | Administrator | User management, analytics |
| **Super Admin** | Full access | All features including settings |

### Demo Accounts (Development Only)

| Role | Email | Password |
|------|-------|----------|
| Super Admin | `superadmin@pakuni.app` | `SuperAdmin@2026!` |
| Admin | `admin@pakuni.app` | `Admin@2026!` |
| User | `student@pakuni.app` | `Student@2026!` |

> ⚠️ **Note**: These are demo credentials for development only.

---

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests with coverage
npm test -- --coverage

# Run specific test file
npm test -- --testPathPattern="universities.test.ts"

# Run tests in watch mode
npm test -- --watch
```

### Test Structure

```
__tests__/
├── App.test.tsx
├── contexts/
│   └── ThemeContext.test.tsx
├── data/
│   └── universities.test.ts
├── hooks/
│   └── useDebounce.test.ts
└── utils/
    ├── logger.test.ts
    └── validation.test.ts
```

---

## 📊 Performance Optimization

PakUni is optimized for performance:

| Metric | Target | Status |
|--------|--------|--------|
| ⚡ Cold Start | < 2 seconds | ✅ |
| 📦 APK Size | < 30MB | ✅ |
| 🔋 Battery | Minimal drain | ✅ |
| 🎯 Animations | 60fps | ✅ |
| 💾 Offline | Full support | ✅ |
| 🖼️ Images | Lazy loading | ✅ |

---

## 🌍 Internationalization

PakUni supports multiple languages:

| Language | Status | RTL Support |
|----------|--------|-------------|
| 🇬🇧 English | ✅ Complete | N/A |
| 🇵🇰 Urdu | ✅ Complete | ✅ |
| Roman Urdu | 🔜 Coming | N/A |

```tsx
// Usage example
const t = useTranslation();
<Text>{t.home.welcome}</Text>
```

---

## ♿ Accessibility

PakUni follows WCAG 2.1 AA guidelines:

- ✅ Screen reader support
- ✅ High contrast mode
- ✅ Adjustable font sizes
- ✅ Reduced motion support
- ✅ Semantic labeling
- ✅ Keyboard navigation

---

## 🤝 Contributing

We welcome contributions! Please follow these guidelines:

### Development Workflow

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Code Style

- Follow the ESLint configuration
- Use TypeScript for all new code
- Write tests for new features
- Update documentation as needed

---

## 📚 Documentation

| Document | Description |
|----------|-------------|
| [QUICK_START.md](QUICK_START.md) | Quick setup guide (5 minutes) |
| [TROUBLESHOOTING.md](TROUBLESHOOTING.md) | Common issues and solutions |
| [ENTERPRISE_FEATURES.md](ENTERPRISE_FEATURES.md) | Enterprise-grade features |
| [FEATURE_ROADMAP.md](FEATURE_ROADMAP.md) | Complete feature roadmap (250+ features) |
| [ANDROID_STUDIO_SETUP.md](ANDROID_STUDIO_SETUP.md) | Android development setup |
| [DEMO_USERS_CREDENTIALS.md](DEMO_USERS_CREDENTIALS.md) | Demo account credentials |
| [CLEAN_DESIGN_GUIDE.md](CLEAN_DESIGN_GUIDE.md) | UI/UX design guidelines |

---

## 📈 Roadmap

### ✅ Completed (v1.0)
- [x] University database with 250+ institutions
- [x] Merit calculator with all major formulas (NUST, UET, FAST, etc.)
- [x] Scholarship center with deadline alerts
- [x] Career guidance with roadmaps
- [x] Kids learning zone
- [x] Dark mode & custom theming
- [x] Offline support
- [x] Admin panel with full CRUD operations
- [x] Authentication with Supabase
- [x] Accessibility features (WCAG 2.1 AA)
- [x] Multi-language support (English/Urdu)
- [x] Compare universities feature
- [x] Entry test past papers

### 🚧 In Progress (v1.1)
- [ ] Entry test mock tests with timer
- [ ] Community forums & discussions
- [ ] AI-powered university recommendations
- [ ] Push notifications
- [ ] Result prediction game

### 🔜 Planned (v2.0)
- [ ] AR campus tours
- [ ] Voice assistant integration
- [ ] Parent portal
- [ ] Web application
- [ ] Chatbot support
- [ ] Blockchain certificates
- [ ] Metaverse campus tours

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 📞 Support & Contact

- 📧 **Email**: support@pakuni.app
- 🐛 **Bug Reports**: [GitHub Issues](https://github.com/yourusername/pakuni/issues)
- 💬 **Discussions**: [GitHub Discussions](https://github.com/yourusername/pakuni/discussions)

---

## 🙏 Acknowledgments

- **HEC Pakistan** - University data and rankings
- **React Native Community** - Amazing open-source ecosystem
- **Supabase** - Backend infrastructure
- **All Contributors** - Thank you for your contributions!

---

<p align="center">
  <img src="./docs/screenshots/app-banner.png" alt="PakUni Banner" width="600"/>
</p>

<p align="center">
  Made with ❤️ in Pakistan 🇵🇰
</p>

<p align="center">
  <sub>© 2024-2026 PakUni. All rights reserved.</sub>
</p>
