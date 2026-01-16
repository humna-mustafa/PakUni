# Preventing Secret Leaks - Repository Protection Guide

**Last Updated**: January 16, 2026

## Overview

This guide explains how to prevent secrets from leaking when the repository becomes public. The PakUni project includes automated protections and tools to detect accidental credential exposure.

## Critical Issue: Historical Leak

⚠️ **WARNING**: The Supabase URL (`therewjnnidxlddgkaca.supabase.co`) is in git history from the initial commit.

**Action Required**: 
- If making repo public, you MUST:
  1. Rotate/regenerate your Supabase keys
  2. Consider using BFG Repo-Cleaner or git-filter-repo to remove from history (if critical)
  3. Set up branch protection rules

## Automated Protections

### 1. Pre-commit Secret Scanner

**File**: `scripts/prevent-secrets-commit.js`

Automatically runs before commits to detect secrets:

```bash
# Manual run
node scripts/prevent-secrets-commit.js
```

**Detects**:
- AWS credentials
- API keys and tokens
- Database passwords
- Private keys (RSA, PEM, etc.)
- Supabase credentials
- Firebase keys
- Hardcoded URLs with credentials

**What happens**:
- ✅ Low severity: Warns but allows commit
- 🛑 Critical severity: Blocks commit

### 2. Secret Scanning Tool

**File**: `scripts/scan-secrets.js`

Comprehensive secret scanner for the entire repository:

```bash
# Scan all files
node scripts/scan-secrets.js

# Scan only staged files
node scripts/scan-secrets.js --staged

# Scan specific file
node scripts/scan-secrets.js --file src/services/config.ts

# Scan git history
node scripts/scan-secrets.js --history
```

**Output**: Ranked findings with severity scores (30-100)

## Environment File Protection

### .gitignore Configuration

**Ignored files** (cannot be committed):
```
.env                      # Development env
.env.local                # Local overrides
.env.*.local              # Environment-specific
.env.production.local
.env.development.local
```

**Ignored file patterns**:
```
*.key                     # Private keys
*.pem                     # PEM certificates
*.keystore                # Java keystores
.aws/credentials          # AWS creds
firebase-config.json      # Firebase config
supabase/.env.local       # Supabase env
```

### Setup Instructions

1. **Create `.env.example`** with template:
```dotenv
# Public example - NO REAL CREDENTIALS
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key_here
```

2. **Create `.env` locally** with real credentials:
```dotenv
SUPABASE_URL=https://real-project.supabase.co
SUPABASE_ANON_KEY=real_key_xxxxx
```

3. **Never commit `.env`**:
```bash
# This should show .env is ignored
git status

# If accidentally added:
git rm --cached .env
git commit -m "Remove .env from git"
```

## Publishing Repository Safely

### Pre-Publication Checklist

- [ ] Run secret scanner: `node scripts/scan-secrets.js`
- [ ] No findings for CRITICAL/HIGH severity
- [ ] `.env` files are in `.gitignore`
- [ ] No hardcoded credentials in source code
- [ ] `.env.example` contains template only
- [ ] Git history cleaned if necessary

### Git History Cleanup (If Needed)

If secrets were committed, remove them from history:

```bash
# Option 1: Using git-filter-repo (recommended)
pip install git-filter-repo
git filter-repo --path .env --invert-paths --force

# Option 2: Using BFG Repo-Cleaner
bfg --delete-files .env

# Option 3: Using git filter-branch
git filter-branch --tree-filter 'rm -f .env' HEAD
```

**⚠️ WARNING**: These operations rewrite history. All contributors must re-clone!

## After Publishing

### Monitor for Leaks

1. **Enable GitHub secret scanning** (free with public repos):
   - Settings → Security & analysis
   - Enable "Secret scanning"
   - Set up notifications

2. **Use third-party tools**:
   - GitGuardian (monitors public repos)
   - Snyk (scans for secrets)
   - TruffleHog (source code scanning)

3. **Rotate compromised credentials**:
   ```bash
   # If a secret is exposed:
   # 1. Immediately rotate/regenerate in Supabase
   # 2. Update .env with new credentials
   # 3. Remove from git history
   # 4. Commit fix
   # 5. Force push (if already public)
   ```

### Repository Protection

Add to repository settings:

1. **Branch Protection**:
   - Require status checks before merge
   - Require code reviews
   - Dismiss stale reviews

2. **Access Control**:
   - Limit who can push
   - Require SSH keys (no passwords)
   - Enable 2FA for all contributors

## Secret Rotation Schedule

Rotate credentials regularly:

- **API Keys**: Every 90 days
- **Database passwords**: Every 60 days
- **Supabase keys**: Every 6 months
- **After suspected exposure**: Immediately

## What NOT to Do

❌ **Never**:
- Commit credentials in any form
- Hardcode API keys/tokens in code
- Use localhost URLs in production config
- Push `.env` files
- Log sensitive data
- Include secrets in comments
- Use weak passwords
- Skip credential validation

## What TO Do

✅ **Always**:
- Use `.env` files (not in git)
- Validate credentials at runtime
- Rotate credentials regularly
- Use production credentials only
- Enable secret scanning
- Run scanners before publishing
- Review git history before public release
- Educate team on security practices

## Troubleshooting

### "Secret scanner blocked my commit"

1. Remove the secret from the file
2. Use `.env` for the credential
3. Stage the file again
4. Commit

### "Found secret in history after publishing"

1. Immediately rotate that credential
2. Use git-filter-repo to remove from history
3. Force push: `git push --force-with-lease`
4. Update everyone: they must re-clone
5. Notify users if data was exposed

### "Pre-commit hook not running"

```bash
# Ensure hook is installed
chmod +x .git/hooks/pre-commit

# Or use Husky for automatic setup
npm install husky
npx husky add .husky/pre-commit "node scripts/prevent-secrets-commit.js"
```

## Team Communication

**Before making repo public**, communicate with team:

1. Review SECURITY.md
2. Review this document
3. Run secret scanner
4. Clean git history if needed
5. Set up monitoring
6. Enable protections

## References

- [GitHub Secret Scanning](https://docs.github.com/en/code-security/secret-scanning)
- [OWASP Secrets Management](https://owasp.org/www-community/credentials_in_code)
- [Supabase Security](https://supabase.com/docs/guides/auth)
- [12 Factor App - Config](https://12factor.net/config)
- [git-filter-repo](https://github.com/newren/git-filter-repo)

## Questions?

1. Review `scripts/scan-secrets.js` source code
2. Check `scripts/prevent-secrets-commit.js` for patterns
3. Refer to SECURITY.md for credential handling
4. Contact security team before publishing

---

**Remember**: Once a secret is committed to a public repo, consider it compromised. Rotate immediately.
