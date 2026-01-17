#!/bin/bash
# PakUni Deployment Readiness Checklist
# Run this before each release to ensure 100% readiness

set -e

echo "🚀 PakUni Production Deployment Readiness Check"
echo "=================================================="
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Counters
PASSED=0
FAILED=0
WARNING=0

# Helper functions
check_pass() {
  echo -e "${GREEN}✓${NC} $1"
  ((PASSED++))
}

check_fail() {
  echo -e "${RED}✗${NC} $1"
  ((FAILED++))
}

check_warn() {
  echo -e "${YELLOW}!${NC} $1"
  ((WARNING++))
}

# ============================================================================
# 1. ENVIRONMENT CHECK
# ============================================================================

echo "1️⃣  Environment Setup"
echo "-------------------"

# Check Node version
NODE_VERSION=$(node -v)
if [[ $NODE_VERSION == v20* ]] || [[ $NODE_VERSION == v21* ]] || [[ $NODE_VERSION == v22* ]]; then
  check_pass "Node.js version: $NODE_VERSION"
else
  check_fail "Node.js version should be >= 20.0.0 (found: $NODE_VERSION)"
fi

# Check npm version
NPM_VERSION=$(npm -v)
check_pass "npm version: $NPM_VERSION"

# Check if .env exists
if [ -f ".env" ]; then
  check_pass ".env file exists"
  
  # Check required environment variables
  source .env
  
  if [ ! -z "$SUPABASE_URL" ]; then
    check_pass "SUPABASE_URL configured"
  else
    check_fail "SUPABASE_URL not set in .env"
  fi
  
  if [ ! -z "$SUPABASE_ANON_KEY" ]; then
    check_pass "SUPABASE_ANON_KEY configured"
  else
    check_fail "SUPABASE_ANON_KEY not set in .env"
  fi
  
  if [ ! -z "$TURSO_DATABASE_URL" ]; then
    check_pass "TURSO_DATABASE_URL configured"
  else
    check_warn "TURSO_DATABASE_URL not set (will use bundled fallback)"
  fi
  
  if [ ! -z "$TURSO_AUTH_TOKEN" ]; then
    check_pass "TURSO_AUTH_TOKEN configured"
  else
    check_warn "TURSO_AUTH_TOKEN not set (will use bundled fallback)"
  fi
else
  check_fail ".env file not found - create from .env.example"
fi

echo ""

# ============================================================================
# 2. CODE QUALITY CHECK
# ============================================================================

echo "2️⃣  Code Quality"
echo "----------------"

# Check TypeScript compilation
if npx tsc --noEmit > /dev/null 2>&1; then
  check_pass "TypeScript compilation successful"
else
  check_fail "TypeScript compilation failed - run: npx tsc --noEmit"
fi

# Check ESLint
if npm run lint > /dev/null 2>&1; then
  check_pass "ESLint check passed"
else
  check_warn "ESLint found issues - run: npm run lint"
fi

# Check for secrets
if npm run scan:secrets > /dev/null 2>&1; then
  check_pass "No secrets detected in code"
else
  check_fail "Secrets found in code - run: npm run scan:secrets"
fi

echo ""

# ============================================================================
# 3. DEPENDENCIES CHECK
# ============================================================================

echo "3️⃣  Dependencies"
echo "----------------"

# Check node_modules
if [ -d "node_modules" ]; then
  check_pass "node_modules directory exists"
  
  # Check critical packages
  for package in react react-native @react-navigation/native supabase-js; do
    if [ -d "node_modules/$package" ]; then
      check_pass "$package installed"
    else
      check_fail "$package not found - run: npm install"
    fi
  done
else
  check_fail "node_modules not found - run: npm install"
fi

echo ""

# ============================================================================
# 4. BUILD CHECK
# ============================================================================

echo "4️⃣  Build Artifacts"
echo "-------------------"

# Check Android SDK
if [ -d "$ANDROID_SDK_ROOT" ] || [ -d "$ANDROID_HOME" ]; then
  check_pass "Android SDK found"
else
  check_fail "Android SDK not found - set ANDROID_HOME or ANDROID_SDK_ROOT"
fi

# Check Gradle wrapper
if [ -f "android/gradlew" ]; then
  check_pass "Gradle wrapper found"
else
  check_fail "Gradle wrapper not found"
fi

echo ""

# ============================================================================
# 5. ASSETS CHECK
# ============================================================================

echo "5️⃣  Assets & Resources"
echo "---------------------"

# Check splash screen
if [ -f "src/assets/splash.png" ]; then
  check_pass "Splash screen image found"
else
  check_warn "Splash screen image not found at src/assets/splash.png"
fi

# Check app icon
if [ -d "android/app/src/main/res/mipmap-hdpi" ]; then
  check_pass "App icons found"
else
  check_warn "App icons may be missing"
fi

# Check fonts
if [ -d "android/app/src/main/assets/fonts" ]; then
  FONT_COUNT=$(find android/app/src/main/assets/fonts -type f | wc -l)
  if [ $FONT_COUNT -gt 0 ]; then
    check_pass "Fonts directory exists ($FONT_COUNT fonts)"
  else
    check_warn "Fonts directory empty"
  fi
else
  check_warn "Fonts directory not found"
fi

echo ""

# ============================================================================
# 6. CONFIGURATION CHECK
# ============================================================================

echo "6️⃣  Configuration Files"
echo "----------------------"

# Check app.json
if [ -f "app.json" ]; then
  check_pass "app.json exists"
else
  check_fail "app.json not found"
fi

# Check AndroidManifest.xml
if [ -f "android/app/src/main/AndroidManifest.xml" ]; then
  check_pass "AndroidManifest.xml exists"
  
  # Check for required permissions
  MANIFEST_CONTENT=$(cat android/app/src/main/AndroidManifest.xml)
  if echo "$MANIFEST_CONTENT" | grep -q "INTERNET"; then
    check_pass "INTERNET permission declared"
  else
    check_fail "INTERNET permission not found"
  fi
else
  check_fail "AndroidManifest.xml not found"
fi

# Check build.gradle
if [ -f "android/build.gradle" ] && [ -f "android/app/build.gradle" ]; then
  check_pass "Gradle files found"
else
  check_fail "Gradle files not found"
fi

echo ""

# ============================================================================
# 7. DATABASE CHECK
# ============================================================================

echo "7️⃣  Database Configuration"
echo "------------------------"

# Check Turso schema
if [ -f "turso/SCHEMA_V3.ts" ]; then
  check_pass "Turso schema file found"
else
  check_warn "Turso schema file not found at turso/SCHEMA_V3.ts"
fi

# Check Supabase RLS
if [ -f "supabase/RLS_POLICIES.sql" ]; then
  check_pass "Supabase RLS policies found"
else
  check_warn "Supabase RLS policies not found at supabase/RLS_POLICIES.sql"
fi

echo ""

# ============================================================================
# 8. DOCUMENTATION CHECK
# ============================================================================

echo "8️⃣  Documentation"
echo "-----------------"

# Check required documentation
DOCS=(
  "README.md"
  "PRODUCTION_COMPLETION_REPORT.md"
  "docs/APK_BUILD_COMPLETE_GUIDE.ts"
  "__tests__/TEST_COVERAGE.md"
  ".github/copilot-instructions.md"
)

for doc in "${DOCS[@]}"; do
  if [ -f "$doc" ]; then
    check_pass "Found: $doc"
  else
    check_warn "Missing: $doc"
  fi
done

echo ""

# ============================================================================
# 9. SIGNING CHECK
# ============================================================================

echo "9️⃣  Code Signing"
echo "---------------"

# Check keystore
if [ -f "android/app/pakuni.keystore" ]; then
  check_pass "Keystore file found"
  
  # Check environment variables
  if [ ! -z "$KEYSTORE_PASSWORD" ]; then
    check_pass "KEYSTORE_PASSWORD set"
  else
    check_fail "KEYSTORE_PASSWORD not set in environment"
  fi
  
  if [ ! -z "$KEY_ALIAS" ]; then
    check_pass "KEY_ALIAS set"
  else
    check_fail "KEY_ALIAS not set in environment"
  fi
  
  if [ ! -z "$KEY_PASSWORD" ]; then
    check_pass "KEY_PASSWORD set"
  else
    check_fail "KEY_PASSWORD not set in environment"
  fi
else
  check_warn "Keystore file not found - generate with: keytool -genkey -v -keystore android/app/pakuni.keystore -keyalg RSA -keysize 2048 -validity 10000 -alias pakuni"
fi

echo ""

# ============================================================================
# 10. FINAL CHECKS
# ============================================================================

echo "🔟 Final Checks"
echo "---------------"

# Check version number
if grep -q '"version"' package.json; then
  VERSION=$(grep '"version"' package.json | head -1 | sed 's/.*"version": "\(.*\)".*/\1/')
  check_pass "Version: $VERSION"
else
  check_warn "Could not determine version"
fi

# Check last commit
LAST_COMMIT=$(git log -1 --pretty=format:"%h - %s" 2>/dev/null || echo "No git repo")
check_pass "Last commit: $LAST_COMMIT"

echo ""
echo "=================================================="
echo ""
echo -e "Results:"
echo -e "  ${GREEN}Passed: $PASSED${NC}"
echo -e "  ${RED}Failed: $FAILED${NC}"
echo -e "  ${YELLOW}Warnings: $WARNING${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
  echo -e "${GREEN}✓ Ready for deployment!${NC}"
  exit 0
else
  echo -e "${RED}✗ Fix $FAILED issues before deployment${NC}"
  exit 1
fi
