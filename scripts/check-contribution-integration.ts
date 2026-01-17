/**
 * Integration Helper Script
 * Setup and verification for Contribution Automation System
 * Run this to verify all components are correctly installed
 */

import * as fs from 'fs';
import * as path from 'path';

const PROJECT_ROOT = process.cwd();

interface IntegrationCheckResult {
  name: string;
  status: 'pass' | 'fail' | 'warning';
  message: string;
  details?: string[];
}

const results: IntegrationCheckResult[] = [];

// ============================================================================
// CHECKS
// ============================================================================

function checkFileExists(
  filePath: string,
  description: string,
): void {
  const fullPath = path.join(PROJECT_ROOT, filePath);
  if (fs.existsSync(fullPath)) {
    results.push({
      name: description,
      status: 'pass',
      message: `✓ ${filePath} exists`,
    });
  } else {
    results.push({
      name: description,
      status: 'fail',
      message: `✗ ${filePath} NOT FOUND`,
      details: [`Create file at: ${fullPath}`],
    });
  }
}

function checkFileContains(
  filePath: string,
  searchText: string,
  description: string,
): void {
  const fullPath = path.join(PROJECT_ROOT, filePath);
  try {
    const content = fs.readFileSync(fullPath, 'utf-8');
    if (content.includes(searchText)) {
      results.push({
        name: description,
        status: 'pass',
        message: `✓ Found in ${path.basename(filePath)}`,
      });
    } else {
      results.push({
        name: description,
        status: 'fail',
        message: `✗ "${searchText}" NOT found in ${filePath}`,
        details: ['Add the required code to this file'],
      });
    }
  } catch (error) {
    results.push({
      name: description,
      status: 'fail',
      message: `✗ Error reading ${filePath}`,
      details: [(error as Error).message],
    });
  }
}

// ============================================================================
// RUN CHECKS
// ============================================================================

console.log('\n🔍 Checking Contribution Automation System Integration...\n');

// 1. Core Files
console.log('📁 Core Implementation Files');
checkFileExists(
  'src/services/contributionAutomation.ts',
  'Auto-approval service',
);
checkFileExists(
  'src/components/ContributionSuccessAnimation.tsx',
  'Success animation component',
);
checkFileExists(
  'src/components/AutoApprovalSettings.tsx',
  'Admin settings widget',
);
checkFileExists(
  'src/utils/feeRange.ts',
  'Fee range utility',
);

// 2. Index Files
console.log('\n📋 Export Files');
checkFileContains(
  'src/services/index.ts',
  'contributionAutomationService',
  'Service export in index',
);
checkFileContains(
  'src/components/index.ts',
  'ContributionSuccessAnimation',
  'Component export in index',
);
checkFileContains(
  'src/utils/index.ts',
  'getFeeRange',
  'Utility export in index',
);

// 3. App Integration
console.log('\n🚀 App Initialization');
checkFileContains(
  'App.tsx',
  'contributionAutomationService',
  'Service imported in App.tsx',
);
checkFileContains(
  'App.tsx',
  'contributionAutomationService.initialize()',
  'Service initialized in App.tsx',
);

// 4. Database
console.log('\n🗄️ Database Setup');
checkFileExists(
  'supabase/migrations/20260117_add_contribution_system.sql',
  'Database migration',
);

// 5. Documentation
console.log('\n📚 Documentation');
checkFileExists(
  'CONTRIBUTION_AUTOMATION_GUIDE.md',
  'Technical guide',
);
checkFileExists(
  'CONTRIBUTION_AUTOMATION_QUICK_REF.md',
  'Quick reference',
);
checkFileExists(
  'CONTRIBUTION_AUTOMATION_DIAGRAMS.md',
  'Diagrams & flowcharts',
);
checkFileExists(
  'CONTRIBUTION_INTEGRATION_CHECKLIST.md',
  'Integration checklist',
);

// ============================================================================
// REPORT RESULTS
// ============================================================================

console.log('\n' + '='.repeat(70));
console.log('INTEGRATION CHECK RESULTS');
console.log('='.repeat(70) + '\n');

let passCount = 0;
let failCount = 0;
let warningCount = 0;

results.forEach((result) => {
  const icon = {
    pass: '✅',
    fail: '❌',
    warning: '⚠️',
  }[result.status];

  console.log(`${icon} ${result.name}`);
  console.log(`   ${result.message}`);

  if (result.details) {
    result.details.forEach((detail) => {
      console.log(`   → ${detail}`);
    });
  }
  console.log();

  if (result.status === 'pass') passCount++;
  else if (result.status === 'fail') failCount++;
  else if (result.status === 'warning') warningCount++;
});

console.log('='.repeat(70));
console.log(`Summary: ${passCount} passed, ${failCount} failed, ${warningCount} warnings`);
console.log('='.repeat(70) + '\n');

if (failCount > 0) {
  console.log('❌ Integration check FAILED. Please fix the issues above.\n');
  process.exit(1);
} else if (warningCount > 0) {
  console.log(
    '⚠️ Integration check completed with warnings. Review them above.\n',
  );
  process.exit(0);
} else {
  console.log('✅ All checks passed! System is ready for testing.\n');
  console.log('Next Steps:');
  console.log('1. Run the database migrations: npm run supabase migration push');
  console.log('2. Start the app: npm start');
  console.log('3. Test on device: npm run android or npm run ios');
  console.log('4. Follow the CONTRIBUTION_INTEGRATION_CHECKLIST.md for detailed steps\n');
  process.exit(0);
}
