# 🎓 PakUni Data Import System

A **professional CSV/Excel-based data management system** for managing university information in PakUni without touching code or using admin portals.

## ⚡ Quick Start

### 1. Prepare Your Data
```
📋 Open: UNIVERSITIES_TEMPLATE.csv in Excel/Google Sheets
✏️ Add/Edit university data
💾 Save as CSV (UTF-8 format)
```

### 2. Validate
```bash
npm run validate-data -- --file your-universities.csv
```

### 3. Import
```bash
npm run import-data -- --file your-universities.csv
```

Done! 🎉 Your data is now in the app.

---

## 📊 Use Cases

### ✅ Initial Data Setup
- Create comprehensive university database
- Add all institutions you want to feature

### ✅ Regular Updates
- Update university rankings
- Add new campuses
- Change contact information

### ✅ Bulk Operations
- Export current data (via `npm run export-data`)
- Edit in Excel
- Re-import with updates

### ✅ With GitHub Copilot
- "Scrape university data from websites"
- "Clean and format university CSV"
- "Extract data from PDFs and convert to CSV"

---

## 📚 Documentation

- **[DATA_IMPORT_GUIDE.md](./DATA_IMPORT_GUIDE.md)** - Complete guide with examples and troubleshooting
- **[UNIVERSITIES_TEMPLATE.csv](./UNIVERSITIES_TEMPLATE.csv)** - Template to copy and fill

---

## 🛠️ Available Commands

| Command | Purpose |
|---------|---------|
| `npm run import-data -- --file data.csv` | Import universities from CSV |
| `npm run export-data -- --output data.csv` | Export current universities to CSV |
| `npm run validate-data -- --file data.csv` | Validate CSV before importing |
| `npm run view-import-logs` | View all import history |

---

## 📋 CSV Format

**Key Rules:**
- Delimiter: **Comma (,)**
- Encoding: **UTF-8**
- Multiple campuses: Use **pipe (\|)** separator
- Descriptions: Use **dashes (-)** instead of commas
- URLs: Must start with **https://**
- Phone: Must start with **+92**

**Example Row:**
```csv
Quaid-i-Azam University,QAU,public,islamabad,Islamabad,H-12 Sector,https://qau.edu.pk,info@qau.edu.pk,+92-51-9064-0000,1967,W4,1,true,Premier research university - excellence in sciences,https://qau.edu.pk/admissions/,Main Campus|Branch Campus
```

---

## 🤖 With GitHub Copilot

### Data Scraping
Ask Copilot:
> "Create a Python script to scrape university names, cities, and websites from [source]. Output as CSV matching this format: name, short_name, type, province, city, ..."

### Data Cleaning
> "Clean this CSV: standardize province names to lowercase, validate emails, convert phone to +92 format, remove duplicates"

### PDF Extraction
> "Extract university data from this PDF and convert to CSV format"

---

## 📁 Folder Structure

```
data-import/
├── README.md                  ← This file
├── DATA_IMPORT_GUIDE.md       ← Detailed documentation
├── UNIVERSITIES_TEMPLATE.csv  ← Copy this and fill it
├── scripts/
│   ├── import.ts              ← Import script
│   ├── export.ts              ← Export script
│   ├── validate.ts            ← Validation script
│   └── utils.ts               ← Helpers
├── logs/
│   ├── 2025-01-15-import.json ← Today's imports
│   └── history.json           ← All historical imports
└── backups/
    └── universities-*.csv     ← Auto-backups before import
```

---

## ✅ Data Validation

The system automatically validates:

| Field | Rules |
|-------|-------|
| name | Required, not empty |
| short_name | Required, 2-4 chars |
| type | Required: public, private, or semi_government |
| province | Required: islamabad, punjab, sindh, kpk, balochistan (lowercase) |
| email | Valid email format |
| website | Valid HTTPS URL |
| phone | Starts with +92 |
| established_year | 1900-2100 |
| ranking_hec | W1, W2, W3, or W4 |
| campuses | Pipe (\|) separated |

---

## 🔄 Workflow Example

### Scenario: Update All University Rankings

```bash
# 1. Export current data
npm run export-data -- --output rankings-update.csv

# 2. Open in Excel and update ranking columns
#    ranking_hec and ranking_national

# 3. Validate changes
npm run validate-data -- --file rankings-update.csv

# 4. Import updated data
npm run import-data -- --file rankings-update.csv

# Result: All rankings updated in database ✅
```

---

## 🆘 Troubleshooting

### "Invalid province name"
→ Province must be lowercase: **islamabad**, **punjab**, **sindh**, **kpk**, or **balochistan**

### "Phone must start with +92"
→ Correct format: `+92-51-1234567` (with country code)

### "CSV parsing error"
→ Description contains a comma. Use dashes instead: `"Excellence - quality - innovation"`

### "Invalid URL"
→ Must start with `https://` or `http://`

---

## 📞 Support

- Check [DATA_IMPORT_GUIDE.md](./DATA_IMPORT_GUIDE.md) for detailed help
- Review import logs in `logs/` folder
- Ask GitHub Copilot for help with data preparation or scripts

---

**Version**: 1.0  
**Last Updated**: January 15, 2026  
**Status**: Ready to Use ✅
