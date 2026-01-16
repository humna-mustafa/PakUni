#!/usr/bin/env node

/**
 * Pre-commit Hook - Prevent Secrets from Being Committed
 * 
 * This script runs before commits to detect and prevent accidental
 * exposure of sensitive credentials like API keys, passwords, and tokens.
 * 
 * Installation:
 * 1. Place this file in .git/hooks/pre-commit
 * 2. Make it executable: chmod +x .git/hooks/pre-commit
 * 3. Or install via husky: npx husky add .husky/pre-commit
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Patterns that indicate potential secrets
const SECRET_PATTERNS = [
  {
    name: 'AWS Access Key',
    pattern: /AKIA[0-9A-Z]{16}/,
    severity: 'critical',
  },
  {
    name: 'AWS Secret Key',
    pattern: /aws_secret_access_key\s*=\s*.+/i,
    severity: 'critical',
  },
  {
    name: 'Private Key',
    pattern: /-----BEGIN RSA PRIVATE KEY-----/,
    severity: 'critical',
  },
  {
    name: 'Supabase Anon Key',
    pattern: /supabase_anon_key\s*=\s*eyJ[A-Za-z0-9_-]+/i,
    severity: 'critical',
  },
  {
    name: 'Database Password',
    pattern: /password\s*=\s*[^\s"']+/i,
    severity: 'critical',
  },
  {
    name: 'API Token/Key',
    pattern: /(api[_-]?key|token|secret)\s*[:=]\s*[^\s"']+/i,
    severity: 'high',
  },
  {
    name: 'JWT Token',
    pattern: /eyJ[A-Za-z0-9_-]+\.eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/,
    severity: 'high',
  },
  {
    name: 'OAuth Token',
    pattern: /(oauth|bearer|token)\s*[:=]\s*[a-zA-Z0-9_-]{20,}/i,
    severity: 'high',
  },
  {
    name: 'Hardcoded URL with Credentials',
    pattern: /https?:\/\/[^:]+:[^@]+@/,
    severity: 'critical',
  },
];

// File patterns to check
const SHOULD_CHECK = [
  '**/*.ts',
  '**/*.tsx',
  '**/*.js',
  '**/*.jsx',
  '**/*.json',
  '**/.env*',
  '**/config.*',
];

// File patterns to skip
const SHOULD_SKIP = [
  'node_modules/**',
  '.git/**',
  'dist/**',
  'build/**',
  'coverage/**',
  '.next/**',
  '.env.example',
  'SECURITY.md',
];

/**
 * Get staged files from git
 */
function getStagedFiles() {
  try {
    const output = execSync('git diff --cached --name-only', {
      encoding: 'utf8',
    });
    return output.trim().split('\n').filter(Boolean);
  } catch (error) {
    console.error('Failed to get staged files:', error.message);
    return [];
  }
}

/**
 * Check if file should be scanned
 */
function shouldCheckFile(filePath) {
  // Skip ignored files
  if (SHOULD_SKIP.some(pattern => {
    const regex = pattern
      .replace(/\*\*/g, '.*')
      .replace(/\*/g, '[^/]*');
    return new RegExp(`^${regex}$`).test(filePath);
  })) {
    return false;
  }

  // Only check allowed files
  return SHOULD_CHECK.some(pattern => {
    const regex = pattern
      .replace(/\*\*/g, '.*')
      .replace(/\*/g, '[^/]*');
    return new RegExp(`${regex}$`).test(filePath);
  });
}

/**
 * Scan file content for secrets
 */
function scanForSecrets(filePath) {
  try {
    // Get staged content
    let content;
    try {
      content = execSync(`git show :${filePath}`, {
        encoding: 'utf8',
      });
    } catch {
      // If file is not in git, read from filesystem
      content = fs.readFileSync(filePath, 'utf8');
    }

    const findings = [];
    const lines = content.split('\n');

    SECRET_PATTERNS.forEach(({ name, pattern, severity }) => {
      lines.forEach((line, index) => {
        // Skip comments and example files
        if (line.trim().startsWith('#') || line.includes('example')) {
          return;
        }

        if (pattern.test(line)) {
          findings.push({
            file: filePath,
            line: index + 1,
            type: name,
            severity,
            content: line.substring(0, 80), // First 80 chars
          });
        }
      });
    });

    return findings;
  } catch (error) {
    console.warn(`Warning: Could not scan ${filePath}: ${error.message}`);
    return [];
  }
}

/**
 * Main execution
 */
function main() {
  console.log('🔐 Scanning for secrets before commit...\n');

  const stagedFiles = getStagedFiles();
  if (stagedFiles.length === 0) {
    console.log('ℹ️  No files staged for commit');
    process.exit(0);
  }

  const filesToCheck = stagedFiles.filter(shouldCheckFile);
  
  if (filesToCheck.length === 0) {
    console.log('✅ No sensitive files to check');
    process.exit(0);
  }

  let totalFindings = 0;
  const findings = [];

  filesToCheck.forEach(filePath => {
    const secretFindings = scanForSecrets(filePath);
    findings.push(...secretFindings);
    totalFindings += secretFindings.length;
  });

  if (totalFindings === 0) {
    console.log(`✅ Scanned ${filesToCheck.length} file(s) - No secrets detected!\n`);
    process.exit(0);
  }

  // Report findings
  console.error('⚠️  SECURITY ALERT: Potential secrets detected!\n');
  
  const critical = findings.filter(f => f.severity === 'critical');
  const high = findings.filter(f => f.severity === 'high');

  if (critical.length > 0) {
    console.error('🛑 CRITICAL - Commit blocked:');
    critical.forEach(f => {
      console.error(`  ${f.file}:${f.line} - ${f.type}`);
      console.error(`     ${f.content}...`);
    });
    console.error();
  }

  if (high.length > 0) {
    console.error('⚠️  HIGH - Please review:');
    high.forEach(f => {
      console.error(`  ${f.file}:${f.line} - ${f.type}`);
    });
    console.error();
  }

  console.error('How to fix:');
  console.error('  1. Remove the secret from the file');
  console.error('  2. Use .env files for credentials (listed in .gitignore)');
  console.error('  3. Use environment variables or config files');
  console.error('  4. Stage again: git add <file>');
  console.error('\nIf this is a false positive, update SECRET_PATTERNS in this script.\n');

  if (critical.length > 0) {
    process.exit(1); // Block commit
  } else {
    process.exit(0); // Warn but allow
  }
}

main();
