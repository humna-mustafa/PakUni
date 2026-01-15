# 🚀 Quick Start - Data Import in 5 Minutes

## For Impatient Users 😄

### Step 1: Get Your Data
Create a CSV file with university data or get it from Copilot

### Step 2: Validate (REQUIRED)
```bash
npm run validate-data -- --file your-data.csv
```

### Step 3: Import
```bash
npm run import-data -- --file your-data.csv
```

### Step 4: Done! ✅
Data is now in your app.

---

## CSV Format (Copy This Template)

```csv
name,short_name,type,province,city,address,website,email,phone,established_year,ranking_hec,ranking_national,is_hec_recognized,description,admission_url,campuses
Quaid-i-Azam University,QAU,public,islamabad,Islamabad,Quaid-i-Azam University - Islamabad 45320,https://qau.edu.pk,info@qau.edu.pk,+92-51-9064-0000,1967,W4,1,true,Premier research university,https://qau.edu.pk/admissions/,Main Campus
```

---

## Key Rules

| Rule | Example |
|------|---------|
| **Province**: lowercase | islamabad (not Islamabad) |
| **Phone**: +92 prefix | +92-51-1234567 |
| **URL**: https:// | https://qau.edu.pk |
| **Multiple campuses**: pipe separator | Campus1\|Campus2\|Campus3 |
| **Descriptions**: use dashes | Excellence - quality - innovation |

---

## Common Commands

```bash
# Validate data before import
npm run validate-data -- --file data.csv

# Import verified data
npm run import-data -- --file data.csv

# Export current data (for backup/editing)
npm run export-data -- --output backup.csv

# View import history
npm run view-import-logs
```

---

## Troubleshooting

| Error | Fix |
|-------|-----|
| "Invalid province" | Use: islamabad, punjab, sindh, kpk, balochistan (lowercase) |
| "Phone error" | Add +92 prefix: +92-51-1234567 |
| "CSV parsing error" | Replace commas in descriptions with dashes |
| "Invalid URL" | Use https://example.com |

---

## With Copilot

**Tell Copilot:**
> "Create a Python script to scrape university data and output as CSV with columns: name, short_name, type, province, city, address, website, email, phone, established_year, ranking_hec, ranking_national, is_hec_recognized, description, admission_url, campuses"

Copilot generates the script → Run it → Import result ✅

---

## File Locations

- **Template**: `data-import/UNIVERSITIES_TEMPLATE.csv`
- **Full Guide**: `data-import/DATA_IMPORT_GUIDE.md`
- **Copilot Help**: `data-import/GITHUB_COPILOT_GUIDE.md`
- **Scripts**: `data-import/scripts/`
- **Import Logs**: `data-import/logs/`

---

**That's it! You're ready to manage data like a pro.** 🎉

For details → Read [DATA_IMPORT_GUIDE.md](./DATA_IMPORT_GUIDE.md)
