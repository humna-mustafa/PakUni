# Public Release Checklist - Secret Leak Prevention

**Before making this repository public**, follow this checklist to prevent credential leaks.

## ✅ Pre-Release Security Audit

### Step 1: Scan for Current Secrets
```bash
npm run scan:secrets
```

**Expected Result**: 0 CRITICAL or HIGH findings

If you find findings:
- [ ] Review each finding
- [ ] Remove hardcoded credentials
- [ ] Move to `.env` file
- [ ] Re-run scanner

### Step 2: Verify .gitignore Configuration
```bash
# Check that .env files are ignored
git status --ignored
```

**Expected**: `.env`, `.env.local`, etc. should be listed as ignored

### Step 3: Review Git History

⚠️ **CRITICAL**: Check for leaked credentials in commit history

```bash
# Look for Supabase URL (hardcoded in initial commit)
git log --all -S "therewjnnidxlddgkaca"

# Check for other patterns
git log --all -S "SUPABASE_URL" -- src/services/config.ts
```

**Current Status**:
- ❌ Supabase URL found in commit `63d653f` (initial commit)
  - This is acceptable if Supabase key is NOT exposed
  - Consider rotating credentials before publishing

### Step 4: Verify Credential Files

```bash
# Ensure .env is NOT committed
git ls-files | grep -E "\.env|\.key|\.pem|\.keystore"

# Should return: (empty)
```

### Step 5: Validate Configuration

- [ ] `src/services/config.ts` - No hardcoded secrets ✅
- [ ] `src/services/supabase.ts` - Uses environment variables only ✅
- [ ] `.env.example` - Contains template values only ✅
- [ ] No API keys in code comments
- [ ] No passwords in documentation examples

## 🔧 Prepare for Public Release

### Step 1: Clean Git History (If Needed)

If hardcoded credentials found in history, remove them:

```bash
# Option 1: Remove specific file from history (simple)
git filter-repo --path .env --invert-paths --force

# Option 2: Remove specific file patterns
git filter-repo --invert-paths --path-glob='*.key' --path-glob='*.pem' --force

# WARNING: Force push required after filter-repo
git push --force-with-lease
```

### Step 2: Create/Verify Files

- [ ] `.env.example` - Exists with public template
- [ ] `SECURITY.md` - Exists with credential guidelines ✅
- [ ] `PREVENT_SECRET_LEAKS.md` - Exists with protection guide ✅
- [ ] `.gitignore` - Updated with secret patterns ✅

### Step 3: Set Up Branch Protection

In GitHub/GitLab settings:

```
1. Go to Settings → Branches
2. Add branch protection rule:
   - Branch pattern: main
   - Require a pull request before merging: ✅
   - Require code reviews: 1 review
   - Require status checks: enable
   - Include administrators: ✅
3. Go to Settings → Security & analysis
4. Enable "Secret scanning": ✅
5. Enable "Push protection": ✅
```

### Step 4: Add Pre-commit Hook

Automatic secret detection before commits:

```bash
# Install pre-commit framework
pip install pre-commit

# Or use Husky for npm
npm install husky --save-dev
npx husky add .husky/pre-commit "npm run security:check"

# Make scripts executable
chmod +x scripts/*.js
chmod +x .husky/*
```

### Step 5: Update Documentation

Add to `README.md`:

```markdown
## Security

- This project uses `.env` files for credentials (not in git)
- See [SECURITY.md](SECURITY.md) for credential management guidelines
- See [PREVENT_SECRET_LEAKS.md](PREVENT_SECRET_LEAKS.md) for leak prevention measures
- Run `npm run scan:secrets` to detect credential leaks
```

## 📋 Final Checklist

### Credentials & Secrets
- [ ] No hardcoded API keys in source code
- [ ] No database passwords in config
- [ ] No JWT/OAuth tokens in code
- [ ] All sensitive config in `.env.example` template only
- [ ] `.env` file in `.gitignore`
- [ ] No credentials in git history

### Configuration
- [ ] `SUPABASE_URL` and `SUPABASE_ANON_KEY` use environment variables
- [ ] No hardcoded Supabase URLs except in `.env.example`
- [ ] Credential validation enabled in `supabase.ts` ✅
- [ ] Localhost/placeholder credentials blocked ✅
- [ ] Error messages don't expose credentials

### Documentation
- [ ] `SECURITY.md` present and up to date ✅
- [ ] `PREVENT_SECRET_LEAKS.md` present ✅
- [ ] `SECURITY.md` referenced in README
- [ ] `.env.example` has clear instructions

### Tools & Automation
- [ ] Secret scanner scripts present ✅
- [ ] npm scripts configured: `npm run scan:secrets` ✅
- [ ] Pre-commit hooks installed
- [ ] GitHub secret scanning enabled
- [ ] Branch protection rules set

### Team Communication
- [ ] Team aware of security guidelines
- [ ] Team trained on `npm run scan:secrets`
- [ ] Shared credentials rotation policy
- [ ] Incident response plan documented

## 🚀 Release Steps

```bash
# 1. Run security check
npm run scan:secrets

# 2. If any findings: fix them
npm run scan:secrets:history

# 3. Commit security changes
git add .
git commit -m "chore: security improvements for public release"

# 4. Tag release
git tag -a v1.2.0-security -m "Security update before public release"

# 5. Create release on GitHub with security notes
# Include:
# - Security improvements made
# - Credential handling guidelines
# - Links to SECURITY.md and PREVENT_SECRET_LEAKS.md
```

## 📞 Post-Release Monitoring

### GitHub Alerts

GitHub will automatically scan your public repository:
- Settings → Code Security & analysis
- Enable "Secret scanning" alerts
- Create branch rules for security findings

### Weekly Tasks

- [ ] Monitor GitHub secret scanning alerts
- [ ] Review and rotate credentials quarterly
- [ ] Check access logs for unauthorized activity
- [ ] Test credential rotation procedures

### Emergency Procedures

If a secret is exposed:

1. **Immediately**:
   ```bash
   # 1. Rotate/regenerate credential in Supabase
   # 2. Update .env with new credential
   git add .env
   git commit -m "security: rotate exposed credentials"
   git push
   ```

2. **Follow up**:
   - Remove from git history
   - Force push: `git push --force-with-lease`
   - Notify users of breach
   - Log incident

## Questions?

1. Read [SECURITY.md](SECURITY.md) for credential management
2. Read [PREVENT_SECRET_LEAKS.md](PREVENT_SECRET_LEAKS.md) for leak prevention
3. Run `npm run scan:secrets` to check current status
4. Review `scripts/scan-secrets.js` for detection patterns

---

**Status**: Ready for public release once all checkboxes are complete ✅

**Last Updated**: January 16, 2026

**Next Review**: Before merging to main/production branch
