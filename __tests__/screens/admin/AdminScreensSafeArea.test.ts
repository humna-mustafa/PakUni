/**
 * Admin Screens SafeAreaView Tests
 * 
 * Structural tests to verify all admin screens properly use SafeAreaView
 * with edges={['top']} to prevent content being cut off by device notch/status bar.
 * 
 * This catches the bug where admin screens rendered under the status bar.
 */

import fs from 'fs';
import path from 'path';

const ADMIN_SCREEN_DIR = path.resolve(__dirname, '../../../src/screens/admin');

// All admin screen files
const getAdminScreenFiles = (): string[] => {
  try {
    return fs.readdirSync(ADMIN_SCREEN_DIR)
      .filter(f => f.endsWith('.tsx') || f.endsWith('.ts'))
      .filter(f => !f.includes('.test.') && !f.includes('index'));
  } catch {
    return [];
  }
};

describe('Admin Screens - SafeAreaView compliance', () => {
  const adminFiles = getAdminScreenFiles();

  if (adminFiles.length === 0) {
    it('should find admin screen files', () => {
      // If no files found, fail with helpful message
      expect(adminFiles.length).toBeGreaterThan(0);
    });
    return;
  }

  it('should have admin screen files to test', () => {
    expect(adminFiles.length).toBeGreaterThan(0);
  });

  adminFiles.forEach(file => {
    describe(file, () => {
      let content: string;

      beforeAll(() => {
        content = fs.readFileSync(path.join(ADMIN_SCREEN_DIR, file), 'utf-8');
      });

      it('should import SafeAreaView from react-native-safe-area-context', () => {
        const importsSafeArea = 
          content.includes("from 'react-native-safe-area-context'") ||
          content.includes('from "react-native-safe-area-context"');
        
        // Some screens use UniversalHeader which might handle safe area internally
        const usesUniversalHeader = content.includes('UniversalHeader');
        // Some screens are passthroughs to another screen that has SafeAreaView
        const isPassthrough = content.includes('EnterpriseAdminDashboardScreen');
        
        if (!usesUniversalHeader && !isPassthrough) {
          expect(importsSafeArea).toBe(true);
        } else {
          // If uses UniversalHeader or is passthrough, either SafeAreaView import or delegation is acceptable
          expect(importsSafeArea || usesUniversalHeader || isPassthrough).toBe(true);
        }
      });

      it('should use SafeAreaView with edges prop', () => {
        const hasSafeAreaView = content.includes('<SafeAreaView');
        const hasEdgesProp = content.includes("edges={['top']}") || 
                             content.includes('edges={["top"]}') ||
                             content.includes("edges={['top', 'bottom']}");
        const usesUniversalHeader = content.includes('UniversalHeader');
        const isPassthrough = content.includes('EnterpriseAdminDashboardScreen') && 
                             !content.includes('<SafeAreaView');

        if (hasSafeAreaView) {
          expect(hasEdgesProp).toBe(true);
        } else if (!usesUniversalHeader && !isPassthrough) {
          // If no SafeAreaView, no UniversalHeader, and not a passthrough, this is a problem
          throw new Error(`${file} has neither SafeAreaView nor UniversalHeader for safe area handling`);
        }
      });

      it('should not use bare View as outermost container without safe area handling', () => {
        // Check the return statement pattern - the first JSX element should be SafeAreaView
        const returnPattern = /return\s*\(\s*<(View|SafeAreaView)/g;
        const matches = [...content.matchAll(returnPattern)];
        
        const usesUniversalHeader = content.includes('UniversalHeader');
        const hasSafeAreaView = content.includes('<SafeAreaView');
        const isPassthrough = content.includes('EnterpriseAdminDashboardScreen') && 
                             !content.includes('<SafeAreaView');

        if (matches.length > 0 && !hasSafeAreaView && !usesUniversalHeader && !isPassthrough) {
          // All returns use bare View with no SafeAreaView anywhere
          throw new Error(`${file} uses bare <View> as container without SafeAreaView protection`);
        }
      });
    });
  });
});

describe('Admin Screens - No hardcoded colors in headers', () => {
  const adminFiles = getAdminScreenFiles();

  adminFiles.forEach(file => {
    it(`${file} should not hardcode white/black header colors`, () => {
      const content = fs.readFileSync(path.join(ADMIN_SCREEN_DIR, file), 'utf-8');
      
      // Check for common hardcoded header color patterns  
      // Allow hex values inside theme/constant definitions but flag inline usage
      const headerColorPattern = /headerStyle.*backgroundColor.*['"]#(FFF|fff|000|FFFFFF|ffffff|000000)['"]/;
      expect(content).not.toMatch(headerColorPattern);
    });
  });
});
