#!/usr/bin/env node

/**
 * Secret Scan Tool - Detect exposed secrets in repository
 * 
 * Usage:
 *   node scripts/scan-secrets.js                    # Scan all files
 *   node scripts/scan-secrets.js --staged           # Scan only staged files
 *   node scripts/scan-secrets.js --history          # Scan git history
 *   node scripts/scan-secrets.js --file <path>      # Scan specific file
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Comprehensive secret patterns
const SECRET_PATTERNS = [
  // AWS
  { name: 'AWS Access Key ID', pattern: /AKIA[0-9A-Z]{16}/, score: 100 },
  { name: 'AWS Secret Key', pattern: /aws_secret_access_key\s*[:=]\s*[^\s"']+/i, score: 100 },
  
  // Supabase
  { name: 'Supabase URL', pattern: /https:\/\/[a-zA-Z0-9]+\.supabase\.co/, score: 50 },
  { name: 'Supabase Anon Key', pattern: /supabase.*anon.*key\s*[:=]\s*eyJ[A-Za-z0-9_-]+/i, score: 100 },
  { name: 'Supabase Service Key', pattern: /supabase.*service.*key\s*[:=]\s*eyJ[A-Za-z0-9_-]+/i, score: 100 },
  
  // Firebase
  { name: 'Firebase API Key', pattern: /firebase.*key\s*[:=]\s*AI[A-Za-z0-9_-]{33}/i, score: 90 },
  { name: 'Firebase Database URL', pattern: /https:\/\/[a-zA-Z0-9-]+\.firebaseio\.com/, score: 60 },
  
  // Private Keys
  { name: 'RSA Private Key', pattern: /-----BEGIN RSA PRIVATE KEY-----/, score: 100 },
  { name: 'Private Key', pattern: /-----BEGIN PRIVATE KEY-----/, score: 100 },
  { name: 'PGP Private Key', pattern: /-----BEGIN PGP PRIVATE KEY BLOCK-----/, score: 100 },
  
  // Certificates
  { name: 'SSL Certificate', pattern: /-----BEGIN CERTIFICATE-----/, score: 40 },
  { name: 'Public Key', pattern: /-----BEGIN PUBLIC KEY-----/, score: 30 },
  
  // API Keys & Tokens
  { name: 'Generic API Key', pattern: /(api[_-]?key|apikey)\s*[:=]\s*[a-zA-Z0-9_-]{20,}/i, score: 80 },
  { name: 'Bearer Token', pattern: /bearer\s+[a-zA-Z0-9_\-\.]+\.[a-zA-Z0-9_\-\.]+\.[a-zA-Z0-9_\-\.]+/i, score: 90 },
  { name: 'JWT Token', pattern: /eyJ[A-Za-z0-9_-]+\.eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/, score: 90 },
  { name: 'OAuth Token', pattern: /(oauth|access[_-]?token)\s*[:=]\s*[a-zA-Z0-9_-]{40,}/i, score: 85 },
  { name: 'Refresh Token', pattern: /(refresh[_-]?token)\s*[:=]\s*[a-zA-Z0-9_-]{40,}/i, score: 85 },
  
  // Database Credentials
  { name: 'Database Password', pattern: /(?:password|passwd|pwd)\s*[:=]\s*[^\s"']+/i, score: 95 },
  { name: 'Database Connection String', pattern: /(?:database|mongodb).*[:=].*\?auth/i, score: 80 },
  { name: 'SQL Connection String', pattern: /Server=.*;Password=[^;]+/i, score: 90 },
  
  // URLs with Credentials
  { name: 'URL with Credentials', pattern: /https?:\/\/[^:]+:[^@]+@[^\s"']/i, score: 100 },
  { name: 'Git URL with Token', pattern: /https:\/\/(.*@)?github\.com.*:[a-zA-Z0-9_-]{20,}/i, score: 100 },
  
  // Cloud Provider Credentials
  { name: 'GCP Service Account', pattern: /\"type\":\s*\"service_account\"/, score: 90 },
  { name: 'Azure Connection String', pattern: /DefaultEndpointsProtocol=https;.*AccountKey=/i, score: 90 },
  
  // Stripe Keys
  { name: 'Stripe Live Key', pattern: /sk_live_[a-zA-Z0-9]{20,}/, score: 100 },
  { name: 'Stripe Test Key', pattern: /sk_test_[a-zA-Z0-9]{20,}/, score: 100 },
  
  // Slack Tokens
  { name: 'Slack Token', pattern: /xox[baprs]-[a-zA-Z0-9]{10,}/, score: 100 },
  
  // GitHub Tokens
  { name: 'GitHub Token', pattern: /ghp_[a-zA-Z0-9]{36}/, score: 100 },
  { name: 'GitHub PAT', pattern: /github_pat_[a-zA-Z0-9]{22}/, score: 100 },
];

// Files to skip
const SKIP_PATTERNS = [
  'node_modules/',
  '.git/',
  'dist/',
  'build/',
  '.next/',
  'coverage/',
  '.env.example',
  'SECURITY.md',
  'prevent-secrets-commit.js',
];

/**
 * Check if file should be scanned
 */
function shouldScanFile(filePath) {
  return !SKIP_PATTERNS.some(pattern => filePath.includes(pattern));
}

/**
 * Get files to scan
 */
function getFilesToScan(args) {
  if (args.includes('--staged')) {
    try {
      const output = execSync('git diff --cached --name-only', { encoding: 'utf8' });
      return output.trim().split('\n').filter(f => f && shouldScanFile(f));
    } catch {
      console.error('Failed to get staged files');
      return [];
    }
  }

  if (args.includes('--history')) {
    try {
      const output = execSync('git log --pretty=format:%H --diff-filter=AM', { encoding: 'utf8' });
      const commits = output.trim().split('\n');
      return { type: 'history', commits };
    } catch {
      console.error('Failed to get git history');
      return [];
    }
  }

  const fileIndex = args.indexOf('--file');
  if (fileIndex !== -1 && args[fileIndex + 1]) {
    return [args[fileIndex + 1]];
  }

  // Scan all files in directory
  return walkDir('.');
}

/**
 * Recursively walk directory
 */
function walkDir(dir) {
  let files = [];
  try {
    const entries = fs.readdirSync(dir);
    entries.forEach(entry => {
      const fullPath = path.join(dir, entry);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        if (!shouldScanFile(fullPath)) return;
        files = files.concat(walkDir(fullPath));
      } else {
        if (shouldScanFile(fullPath)) {
          files.push(fullPath);
        }
      }
    });
  } catch (error) {
    // Skip inaccessible directories
  }
  return files;
}

/**
 * Scan file for secrets
 */
function scanFile(filePath) {
  try {
    if (!fs.existsSync(filePath)) return [];
    
    const content = fs.readFileSync(filePath, 'utf8');
    const findings = [];
    const lines = content.split('\n');

    lines.forEach((line, lineNum) => {
      // Skip comments and examples
      if (line.trim().startsWith('#') || line.includes('example')) return;

      SECRET_PATTERNS.forEach(({ name, pattern, score }) => {
        if (pattern.test(line)) {
          findings.push({
            file: filePath,
            line: lineNum + 1,
            type: name,
            score,
            preview: line.substring(0, 100),
          });
        }
      });
    });

    return findings;
  } catch {
    return [];
  }
}

/**
 * Format and display results
 */
function displayResults(allFindings) {
  if (allFindings.length === 0) {
    console.log('✅ No secrets detected!');
    return;
  }

  // Sort by score (highest first)
  allFindings.sort((a, b) => b.score - a.score);

  console.error(`\n⚠️  Found ${allFindings.length} potential secret(s):\n`);

  const critical = allFindings.filter(f => f.score >= 90);
  const high = allFindings.filter(f => f.score >= 70 && f.score < 90);
  const medium = allFindings.filter(f => f.score < 70);

  if (critical.length > 0) {
    console.error('🛑 CRITICAL:');
    critical.forEach(f => {
      console.error(`  ${f.file}:${f.line}`);
      console.error(`     Type: ${f.type} (Score: ${f.score})`);
      console.error(`     ${f.preview}...`);
    });
    console.error();
  }

  if (high.length > 0) {
    console.error('⚠️  HIGH:');
    high.forEach(f => {
      console.error(`  ${f.file}:${f.line}`);
      console.error(`     Type: ${f.type} (Score: ${f.score})`);
    });
    console.error();
  }

  if (medium.length > 0) {
    console.error('ℹ️  MEDIUM/LOW: (may be false positives)');
    console.error(`  ${medium.length} findings - review manually`);
    console.error();
  }
}

/**
 * Main
 */
function main() {
  const args = process.argv.slice(2);
  
  console.log('🔐 Secret Scanner - Detecting exposed credentials...\n');

  const filesToScan = getFilesToScan(args);
  
  if (!Array.isArray(filesToScan) || filesToScan.length === 0) {
    console.log('No files to scan');
    process.exit(0);
  }

  console.log(`Scanning ${filesToScan.length} file(s)...\n`);

  const allFindings = [];
  filesToScan.forEach(file => {
    const findings = scanFile(file);
    allFindings.push(...findings);
  });

  displayResults(allFindings);
  process.exit(allFindings.length > 0 ? 1 : 0);
}

main();
