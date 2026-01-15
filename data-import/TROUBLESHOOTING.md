# 🆘 Troubleshooting Guide

## Common Issues & Solutions

---

## ❌ Validation Errors

### "Invalid province name"

**Error Message:**
```
Row 2: Invalid province "Islamabad". Valid: islamabad, punjab, sindh, kpk, balochistan
```

**Problem:** Province names must be **lowercase**

**Solution:**
| Wrong | Correct |
|-------|---------|
| Islamabad | islamabad |
| Punjab | punjab |
| Sindh | sindh |
| KPK | kpk |
| Balochistan | balochistan |

**Fix in Excel:**
1. Select province column
2. Replace all: `Islamabad` → `islamabad`
3. Save and re-validate

---

### "Phone must start with +92"

**Error Message:**
```
Row 5: Phone "051-1234567" must start with +92
```

**Problem:** Phone numbers need country code

**Solution:**
| Wrong | Correct |
|-------|---------|
| 051-1234567 | +92-51-1234567 |
| 0300-123456 | +92-300-123456 |
| 1234567 | +92-51-1234567 |
| 92-51-123 | +92-51-123 |

**Pattern:** `+92-[area/mobile]-[number]`

**Fix in Excel:**
```
="+92-" & MID(A2, 2, LEN(A2))
```

---

### "Invalid email format"

**Error Message:**
```
Row 8: Invalid email format "qau.edu.pk"
```

**Problem:** Email is missing `@` or is incomplete

**Solution:**
| Wrong | Correct |
|-------|---------|
| qau.edu.pk | info@qau.edu.pk |
| @qau.edu.pk | info@qau.edu.pk |
| info qau.edu.pk | info@qau.edu.pk |

**Pattern:** `name@domain.com.pk`

---

### "Invalid website URL"

**Error Message:**
```
Row 3: Invalid website URL "qau.edu.pk". Must start with http:// or https://
```

**Problem:** URL missing protocol

**Solution:**
| Wrong | Correct |
|-------|---------|
| qau.edu.pk | https://qau.edu.pk |
| www.qau.edu.pk | https://qau.edu.pk |
| http://qau.edu.pk | https://qau.edu.pk |

**Fix in Excel:**
```
=IF(LEFT(A2,4)="http", A2, "https://" & A2)
```

---

### "Invalid year"

**Error Message:**
```
Row 10: established_year 2030 must be between 1900-2026
```

**Problem:** Year is in future or invalid

**Solution:**
- Year must be in the past
- Check the actual founding year
- Fix in CSV and re-validate

---

### "Invalid HEC ranking"

**Error Message:**
```
Row 7: Invalid HEC ranking "World 1". Valid: W1, W2, W3, W4
```

**Problem:** HEC ranking format wrong

**Solution:**
| Wrong | Correct |
|-------|---------|
| World 1 | W1 |
| W-1 | W1 |
| 1 | W1 |
| W1A | W1 |

**Valid values:** `W1`, `W2`, `W3`, `W4` (uppercase, no spaces)

---

### "CSV parsing error"

**Error Message:**
```
Error parsing CSV: Unexpected token
```

**Problem:** Likely contains special characters or mismatched quotes

**Solutions:**

1. **Commas in description:**
   ```
   ❌ Wrong: "Excellence, quality, innovation"
   ✅ Correct: "Excellence - quality - innovation"
   ```

2. **Missing quotes around special text:**
   ```
   ❌ Wrong: "Street No. 5, near main gate"
   ✅ Correct: "Street No. 5 - near main gate"
   ```

3. **Save format:**
   - File → Save As → CSV UTF-8 (.csv)
   - NOT Excel (.xlsx)
   - NOT Tab-separated
   - NOT Unicode

---

## ❌ Import Errors

### "File not found"

**Error Message:**
```
Error: File not found: path/to/universities.csv
```

**Solution:**
1. Check file path is correct
2. File must exist
3. Use absolute path if having issues:
   ```bash
   npm run import-data -- --file "C:\Users\...\universities.csv"
   ```

---

### "Database connection failed"

**Error Message:**
```
Error: Missing SUPABASE_URL or SUPABASE_ANON_KEY
```

**Solution:**
1. Check `.env` file has:
   ```
   SUPABASE_URL=your_url
   SUPABASE_ANON_KEY=your_key
   ```
2. Restart terminal after adding env vars
3. Verify Supabase is accessible

---

### "Duplicate short_name"

**Error Message:**
```
Row 5: Failed to import "University Name": Duplicate short_name "QAU"
```

**Problem:** Short name already exists in database

**Solutions:**

1. **Updating existing university:**
   - This is normal
   - System will update the existing record
   - All fields will be updated

2. **Actually new university:**
   - Check short_name is unique
   - Maybe it's an alternate name?
   - Use different abbreviation

3. **Check current data:**
   ```bash
   npm run export-data -- --output current.csv
   ```
   Then search for the short_name

---

## ⚠️ Warnings (Not Errors)

### "Description contains commas"

**Warning:**
```
Row 3: Description contains commas. Use dashes instead for CSV compatibility
```

**What it means:** CSV might parse incorrectly with commas in description

**Solution:** Replace commas with dashes:
```
❌ "Excellence, quality, innovation"
✅ "Excellence - quality - innovation"
```

**Not critical if working, but recommended**

---

### "Phone format unusual"

**Warning:**
```
Row 7: Phone format "+92511234567" - consider format like +92-51-1234567
```

**What it means:** Phone works but is hard to read

**Solution (optional):** Add hyphens for readability:
```
+92511234567  →  +92-51-1234567
+923001234567  →  +92-300-1234567
```

---

### "Missing national ranking"

**Warning:**
```
Row 4: National ranking is empty for "QAU"
```

**What it means:** Optional field is blank

**Solution:** 
- Leave blank if not known
- Or add ranking if available
- System will still import fine

---

## 🔍 Debugging Steps

### Step 1: Validate First
```bash
npm run validate-data -- --file your-data.csv
```

Fix all **errors** before importing. **Warnings** are optional.

---

### Step 2: Check the Logs

After import, check:
```bash
npm run view-import-logs
```

Look for:
- How many added/updated
- Any errors during import
- Which universities had issues

---

### Step 3: Verify in App

After successful import:
1. Reload the app
2. Search for a university you imported
3. Check if data displays correctly
4. Verify rankings, campuses, contact info

---

### Step 4: Check Database

Export to verify:
```bash
npm run export-data -- --output verify.csv
```

Open and check if your data is there.

---

## 🔄 Rollback Steps

If import went wrong:

### Option 1: Use Backup
```bash
# System auto-creates backup before each import
# Located in: data-import/backups/

# Export from backup and re-import
npm run import-data -- --file data-import/backups/universities-2025-01-15.csv
```

### Option 2: Manual Fix
1. Find the issue in your CSV
2. Fix it
3. Validate again
4. Re-import

System will **update existing records**, so re-importing with fixes works fine.

---

## 📋 Pre-Import Checklist

Always check before importing:

- [ ] CSV file is UTF-8 encoded
- [ ] All required fields filled
- [ ] Provinces are lowercase
- [ ] Phone starts with +92
- [ ] URLs start with https://
- [ ] Campuses use pipe separator (|)
- [ ] No commas in descriptions
- [ ] File saved as .csv (not .xlsx)
- [ ] Validation passes: `npm run validate-data`
- [ ] Test data spot-checked (5-10 rows)

---

## 🆘 Still Having Issues?

### Check These Files:
- [DATA_IMPORT_GUIDE.md](./DATA_IMPORT_GUIDE.md) - Complete reference
- [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) - Fast lookup
- [WORKFLOW_DIAGRAM.md](./WORKFLOW_DIAGRAM.md) - Visual guide
- [GITHUB_COPILOT_GUIDE.md](./GITHUB_COPILOT_GUIDE.md) - Copilot help

### Ask GitHub Copilot:
> "I'm getting this error when importing university data: [paste error]. How do I fix it?"

Copilot can:
- Explain the error
- Suggest fixes
- Generate corrected CSV
- Create fixing scripts

---

## 📊 Example: Fix Common Issues

**Scenario:** CSV has mixed province case, missing +92 on phones

**Your CSV:**
```csv
name,short_name,type,province,city,address,website,email,phone,established_year,ranking_hec,ranking_national,is_hec_recognized,description,admission_url,campuses
Quaid-i-Azam University,QAU,public,Islamabad,Islamabad,QAU Campus,https://qau.edu.pk,info@qau.edu.pk,051-9064-0000,1967,W4,1,true,Top university,https://qau.edu.pk/admissions/,Main Campus
```

**Issues:**
1. Province: "Islamabad" (should be "islamabad")
2. Phone: "051-9064-0000" (should be "+92-51-9064-0000")

**Fix Steps:**
1. Open in Excel
2. Phone column: Find & Replace
   - Find: `051`
   - Replace with: `+92-51`
3. Province column: Find & Replace
   - Find: `Islamabad`
   - Replace with: `islamabad`
4. Save as CSV
5. Validate: `npm run validate-data -- --file universities.csv`
6. Import: `npm run import-data -- --file universities.csv`

---

**Last Updated**: January 15, 2026
**Version**: 1.0
