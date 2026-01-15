# 📊 PakUni Data Import System

## Overview
This system allows you to manage and update university data via **CSV/Excel files** instead of manual code changes or admin portal entry. Perfect for batch updates, new additions, and data maintenance.

---

## 📋 How It Works

### Step 1: Prepare Your Data
1. **Open** `UNIVERSITIES_TEMPLATE.csv` in Excel or Google Sheets
2. **Fill in the data** for universities you want to add/update
3. **Save as CSV** (File → Save As → CSV UTF-8)

### Step 2: Import the Data
Run the import script:
```bash
cd e:\pakuni\PakUni
npm run import-data -- --file path/to/your/universities.csv
```

### Step 3: Verify & Deploy
- Data is automatically validated
- Changes are logged in `data-import/logs/`
- Supabase database is updated
- App reflects changes on next reload

---

## 📝 CSV Column Reference

| Column | Type | Required | Example | Notes |
|--------|------|----------|---------|-------|
| **name** | String | ✅ | Quaid-i-Azam University | Full official name |
| **short_name** | String | ✅ | QAU | 2-4 character abbreviation |
| **type** | public\|private\|semi_government | ✅ | public | Institution type |
| **province** | String | ✅ | islamabad | Lowercase: islamabad, punjab, sindh, kpk, balochistan |
| **city** | String | ✅ | Islamabad | Proper case city name |
| **address** | String | ✅ | H-12 Sector, Islamabad | Full address (use pipes \| for multiple lines if needed) |
| **website** | URL | ✅ | https://qau.edu.pk | Must start with http/https |
| **email** | Email | ✅ | info@qau.edu.pk | Primary contact email |
| **phone** | String | ✅ | +92-51-9064-0000 | Include country code |
| **established_year** | Number | ✅ | 1967 | 4-digit year |
| **ranking_hec** | String | ✅ | W4 | HEC ranking category (W1-W4) |
| **ranking_national** | Number | ❌ | 1 | National ranking (can be blank) |
| **is_hec_recognized** | true\|false | ✅ | true | HEC recognition status |
| **description** | String | ✅ | Premier research university... | 1-2 sentence summary (avoid commas; use dashes instead) |
| **admission_url** | URL | ✅ | https://qau.edu.pk/admissions/ | Admissions page link |
| **campuses** | String | ✅ | Main Campus\|Branch Campus | **Use pipes (\|) to separate multiple campuses** |

---

## ⚠️ Important Notes

### CSV Formatting
- **Delimiter**: Comma (,)
- **Text Encoding**: UTF-8
- **Descriptions**: Use dashes (-) instead of commas to avoid CSV parsing issues
- **Multiple values** (e.g., campuses): Use pipe character **\|** as separator
- **Empty fields**: Leave blank (except required fields)

### Data Validation Rules
```
✓ Phone: Must start with +92
✓ Website/URLs: Must be valid HTTPS (http:// or https://)
✓ Email: Valid email format
✓ Year: Between 1900-2100
✓ Province: lowercase (islamabad, punjab, sindh, kpk, balochistan)
✓ Type: Only public, private, or semi_government
✓ HEC Ranking: W1, W2, W3, or W4
```

---

## 🔄 Update Scenarios

### Scenario 1: Add New Universities
1. Add rows to the CSV with new university data
2. Run the import script
3. New universities appear in the app

### Scenario 2: Update Existing University
1. Find the university row (by short_name)
2. Update relevant columns
3. Run import script
4. Changes are merged with existing data

### Scenario 3: Bulk Update (e.g., new rankings)
1. Export current data: `npm run export-data`
2. Update columns in Excel
3. Run import script
4. Done!

### Scenario 4: Add New Campuses
In the **campuses** column, add the campus name separated by **|**:
```
Old: Main Campus
New: Main Campus|Lahore Branch|Karachi Branch
```

---

## 🤖 Using GitHub Copilot for Data Preparation

### For Web Scraping & Data Extraction:
Tell Copilot:
> "I need to extract university data from [website]. Create a Python script to scrape:
> - University name
> - Established year
> - City/Province
> 
> Output to CSV format matching: name, short_name, type, province, city, ..."

### For Data Cleaning:
> "I have a CSV with university data. Clean it by:
> - Standardize province names to lowercase
> - Validate email formats
> - Convert phone numbers to +92 format
> - Output cleaned CSV"

---

## 📜 Available Commands

```bash
# Import universities from CSV
npm run import-data -- --file universities.csv

# Export current universities to CSV (for backup/editing)
npm run export-data -- --output backup.csv

# Validate CSV before importing
npm run validate-data -- --file universities.csv

# View import logs
npm run view-import-logs

# Rollback last import
npm run rollback-import -- --version 1
```

---

## 📂 File Structure

```
data-import/
├── UNIVERSITIES_TEMPLATE.csv    ← Start here! Your CSV template
├── DATA_IMPORT_GUIDE.md         ← This file
├── scripts/
│   ├── import.ts                ← Import script
│   ├── export.ts                ← Export script
│   ├── validate.ts              ← Validation script
│   └── utils.ts                 ← Helper functions
├── logs/
│   ├── 2025-01-15-import.json   ← Import logs
│   └── history.json             ← Full history
└── backups/
    └── universities-2025-01-15.csv ← Auto backup before import
```

---

## ✅ Checklist Before Import

- [ ] CSV file is UTF-8 encoded
- [ ] All required fields are filled
- [ ] Province names are lowercase
- [ ] URLs start with https://
- [ ] Phone numbers include +92
- [ ] Campuses are separated by **|**
- [ ] Description doesn't contain commas (use dashes)
- [ ] No extra spaces before/after values
- [ ] File saved as CSV (not .xlsx)

---

## 🆘 Troubleshooting

### "Invalid province name"
→ Province must be: **islamabad**, **punjab**, **sindh**, **kpk**, or **balochistan** (lowercase)

### "Invalid email format"
→ Use full email: john@university.edu.pk (not just @university)

### "Invalid phone format"
→ Must start with **+92**, e.g., +92-51-1234567

### "CSV parsing error"
→ You probably have a **comma in description**. Replace commas with dashes: - 
   Example: "Excellence in research - innovation - and education"

### "Campuses not showing"
→ Make sure campuses are separated by **|** (pipe), not commas or slashes

---

## 📞 Next Steps

1. **Fill the template** with your university data
2. **Run the import** script
3. **Verify** data appears in app
4. **Set up recurring imports** if data changes often

For questions or new features, ask GitHub Copilot to enhance the import system!

---

**Last Updated**: January 15, 2026
**Version**: 1.0
