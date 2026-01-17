# ⚡ Contribution Automation - Quick Reference

## 🎯 What It Does

**Automates contribution approval → applies changes → notifies users → tracks impact**

```
User Submits → Auto-Evaluate → Apply Changes → Thank You → Update Stats
```

---

## 📦 New Services & Components

| Item | File | Purpose |
|------|------|---------|
| **Service** | `contributionAutomation.ts` | Core automation logic |
| **Component** | `ContributionSuccessAnimation.tsx` | Thank you animations |
| **Component** | `AutoApprovalSettings.tsx` | Admin toggle & stats |
| **Utility** | `feeRange.ts` | Fee range display |

---

## 🚀 Quick Start

### Step 1: Initialize
```typescript
// In App.tsx
import { contributionAutomationService } from './services/contributionAutomation';

useEffect(() => {
  contributionAutomationService.initialize();
}, []);
```

### Step 2: Add to Admin Dashboard
```typescript
<AutoApprovalSettings
  onNavigateToRules={() => navigation.navigate('AdminAutoApprovalRules')}
  onNavigateToAnalytics={() => navigation.navigate('AdminApprovalAnalytics')}
/>
```

### Step 3: Show Success Animation
```typescript
<ContributionSuccessAnimation
  visible={showSuccess}
  type="auto_approved"
  title="🎉 Thanks for Contributing!"
  message="Your update helps students."
  impact="Helping 50+ students"
  badges={['⚡', '🎯']}
  onClose={() => setShowSuccess(false)}
/>
```

### Step 4: Display Fee Ranges
```typescript
import { getFeeRange } from '../utils/feeRange';

const range = getFeeRange(150000); // "150k - 156k"
<Text>Annual Fee: {range.range}</Text>
```

---

## ⚙️ Admin Controls

### Global Toggle
```typescript
// Enable/disable all auto-approval
await contributionAutomationService.setGlobalAutoApprovalEnabled(true);

// Check status
const enabled = await contributionAutomationService.isGlobalAutoApprovalEnabled();
```

### Manage Rules
Navigate to: `AdminAutoApprovalRulesScreen`
- Create/edit rules
- Set conditions (trust level, source, type)
- Toggle rules on/off
- View stats

---

## 📊 Contributor Experience

### What Contributors See
1. ✅ Submit contribution
2. 🎉 See success animation (if auto-approved)
3. 💌 Get thank you notification
4. 🏅 Earn badges
5. 📈 Track impact on profile

### What Admins See
1. 📊 Dashboard widget showing auto-approval status
2. 📋 List of active rules
3. 📈 Statistics (today's count, approval rate)
4. ⚙️ Rules management interface
5. 📋 Submission review panel (with before/after comparison)

---

## 🏆 Contributor Badges

| Badge | Icon | Requirement |
|-------|------|-------------|
| First Step | 🚀 | 1+ contributions |
| Power Contributor | ⚡ | 10+ approved |
| Accuracy Expert | 🎯 | 95%+ rate, 5+ submissions |
| Data Hero | 🦸 | Impacted 50+ students |
| Trusted Expert | 🏅 | Trust level ≥ 4 |
| Legendary | 👑 | 100+ approved |

---

## 💰 Fee Ranges

### How It Works
- **Exact Display** - Fees < 50k (shows: 45,000)
- **Range Display** - Fees ≥ 50k (shows: 145k - 156k)
- **Range %** - Default ±5% variance
- **Currency** - PKR by default

### Usage
```typescript
import { getFeeRange, formatCurrency, compareFees } from '../utils/feeRange';

getFeeRange(150000) 
// → { min: 142500, max: 157500, range: "142k - 157k" }

formatCurrency(150000) 
// → "150k"

compareFees(150000, 200000) 
// → { difference: -50000, percentDifference: -25, comparisonText: "25% cheaper" }
```

---

## 🔐 Auto-Approval Rules

### Rule Conditions
- ✓ User trust level ≥ X (0-5)
- ✓ Source/proof provided (if required)
- ✓ Submission type allowed
- ✓ Value change % within limit
- ✓ Auth provider allowed (Google, Email, Guest)

### Example Rule
```
Name: "Trusted Users - Date Updates"
Enabled: true
Trust Level: ≥ 3
Types: date_correction, deadline_update
Require Source: true
Max Change %: 5%
Google Auto-Trust: true
```

---

## 📱 Database Tables

### Turso (Static Data)
- Universities
- Programs
- Entry Tests
- Merit Lists
- Fees

### Supabase
- `data_submissions` - Contribution audit trail
- `contributor_stats` - User impact tracking
- `auto_approval_events` - Approval history
- `profiles.trust_level` - User trust score

---

## 🧪 Quick Tests

### Test Auto-Approval
1. Create rule with low trust (0-2)
2. Submit contribution with matching type
3. Verify: Status = `auto_approved`
4. Verify: Animation shows
5. Verify: Stats updated

### Test Admin Toggle
1. Go to Admin Dashboard
2. Find "Auto-Approval System" widget
3. Toggle OFF - verify: contributions require manual review
4. Toggle ON - verify: contributions auto-approve per rules

### Test Fee Ranges
1. View university with fee 150k
2. Should show: "150k - 156k" (not exact 150,000)
3. View program with fee 30k
4. Should show: "30,000" (exact value)

---

## 🎨 Customization

### Change Fee Range %
```typescript
const range = getFeeRange(150000, { rangePercent: 10 }); // ±10%
// → "135k - 165k"
```

### Change Exact Threshold
```typescript
const range = getFeeRange(150000, { exactThreshold: 100000 }); // Show exact up to 100k
```

### Custom Thank You Message
Edit `generateThankYouMessage()` in `contributionAutomation.ts`

### Custom Badges
Edit badge criteria in `evaluateAndAwardBadges()`

---

## 📞 Common Issues

| Issue | Solution |
|-------|----------|
| Auto-approval not working | Check: Is global toggle ON? Do rules match? |
| Animation not showing | Check: Service initialized? Success component mounted? |
| Badges not awarded | Check: Contribution approved? Stats saved? |
| Fee ranges showing wrong | Check: Using getFeeRange()? Valid number? |
| Notifications not sending | Check: Supabase tables created? Service initialized? |

---

## 🚀 Next Steps

1. [ ] Initialize service in App.tsx
2. [ ] Add settings to Admin Dashboard
3. [ ] Show animations in submission workflow
4. [ ] Display fee ranges in detail screens
5. [ ] Test complete flow
6. [ ] Gather admin feedback
7. [ ] Monitor real contributions
8. [ ] Adjust rules based on data

---

## 💡 Pro Tips

✨ **More auto-approval** = Less manual work for you  
⚡ **Higher trust threshold** = Fewer false positives  
🎯 **Monitor stats** = Know what's working  
📊 **Show contributors** = Motivate more contributions  

---

**Ready to go live!** 🎉
