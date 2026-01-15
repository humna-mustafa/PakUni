# 🤖 Using GitHub Copilot for Data Preparation & Management

This guide shows you how to leverage **GitHub Copilot** to automate data extraction, cleaning, and preparation for PakUni's database.

---

## 🎯 Common Copilot Prompts

### 1️⃣ Web Scraping - Extract University Data

**Prompt:**
```
Create a Python script that:
1. Scrapes university names, cities, and websites from [URL]
2. Extracts established year from institution websites
3. Outputs data as CSV matching this format:
   name, short_name, type, province, city, address, website, email, phone, 
   established_year, ranking_hec, ranking_national, is_hec_recognized, 
   description, admission_url, campuses

Requirements:
- Use BeautifulSoup or Selenium
- Handle network errors gracefully
- Create short_name as uppercase abbreviation
- Output UTF-8 CSV file
- Include progress printing

Example first row:
Quaid-i-Azam University,QAU,public,islamabad,Islamabad,Quaid-i-Azam University - 
Islamabad 45320,https://qau.edu.pk,info@qau.edu.pk,+92-51-9064-0000,1967,W4,1,true,
Premier research university,https://qau.edu.pk/admissions/,Main Campus Islamabad
```

**Copilot will generate:**
- Web scraping script
- CSV output formatter
- Error handling
- Save directly to CSV file

**What to do:**
1. Copy the generated script
2. Save as `scrape-universities.py`
3. Install dependencies: `pip install beautifulsoup4 requests`
4. Run: `python scrape-universities.py`
5. Import result: `npm run import-data -- --file output.csv`

---

### 2️⃣ Data Cleaning - Fix Format Issues

**Prompt:**
```
I have a CSV file with university data that needs cleaning.
Create a Python script that:

1. Reads the CSV file
2. Fixes these issues:
   - Province names should be lowercase (Islamabad → islamabad)
   - Phone numbers must start with +92 (remove any country prefixes)
   - Validate and fix email formats
   - Remove extra spaces from all fields
   - Ensure "is_hec_recognized" is true/false (no yes/no)
   - Split multiple campuses by pipes (|) instead of commas
   - Ensure URLs start with https://

3. Validates the cleaned data:
   - All required fields are not empty
   - Email format is valid
   - URLs are valid
   - Phone numbers are valid
   - Year is between 1900-2100

4. Outputs a clean CSV file with same column order

Column order:
name, short_name, type, province, city, address, website, email, phone,
established_year, ranking_hec, ranking_national, is_hec_recognized,
description, admission_url, campuses

Input: dirty-universities.csv
Output: clean-universities.csv
```

**What Copilot provides:**
- CSV reading and parsing
- Data transformation functions
- Validation rules
- Error reporting
- Clean output CSV

---

### 3️⃣ PDF Data Extraction

**Prompt:**
```
Create a Python script that extracts data from PDF files (like university 
prospectuses or HEC lists):

1. Read all PDFs from a folder
2. Extract text and tables
3. Identify university information:
   - University name
   - Established year
   - Location/province
   - Website
   - Contact email
   - Phone number

4. Match extracted data to my universities list to fill missing fields
5. Output as CSV in this format:
   name, short_name, type, province, city, address, website, email, phone,
   established_year, ranking_hec, ranking_national, is_hec_recognized,
   description, admission_url, campuses

6. Create a report of:
   - Universities found
   - Data confidence levels
   - Missing fields
   - Extracted values

Use libraries: pdfplumber, pandas, csv
```

---

### 4️⃣ API Data Fetch - Get Real-Time Data

**Prompt:**
```
Create a Python script that:

1. Fetches university data from public APIs/websites:
   - HEC official data: https://hec.gov.pk
   - University websites for current info
   - LinkedIn for establishment dates

2. Combines data from multiple sources with deduplication

3. Generates CSV with columns:
   name, short_name, type, province, city, address, website, email, phone,
   established_year, ranking_hec, ranking_national, is_hec_recognized,
   description, admission_url, campuses

4. Handles:
   - Network timeouts
   - Missing data fields (leave blank)
   - Duplicate universities
   - Data conflicts (use most recent source)

5. Creates a source log showing:
   - Which API provided each field
   - Confidence/reliability score
   - Update timestamp

Output: universities-from-api.csv
```

---

### 5️⃣ Bulk Update - Update Existing Data

**Prompt:**
```
I'm updating university rankings in my database. Create a script that:

1. Takes an Excel file with columns: short_name, ranking_national, ranking_hec
2. Reads current universities CSV
3. Merges updates:
   - Find matching university by short_name
   - Update ranking fields
   - Keep all other fields unchanged
   - Add note about update timestamp

4. Validates:
   - short_name exists in current database
   - ranking values are valid (W1-W4 for HEC, number for national)
   - No duplicate short_names

5. Outputs updated CSV with same structure
6. Creates report:
   - Universities updated
   - Universities not found
   - Validation errors

Input: rankings-update.xlsx
Current DB: universities.csv
Output: universities-updated.csv
```

---

### 6️⃣ De-Duplication - Remove Duplicates

**Prompt:**
```
I have a CSV with potential duplicate universities.
Create a script that:

1. Reads the CSV
2. Identifies duplicates using:
   - Exact name match
   - Similar names (using fuzzy matching - difflib)
   - Same short_name
   - Same website

3. For each duplicate group:
   - Show all versions
   - Highlight differences
   - Keep the most complete record
   - Suggest which to keep

4. Handles edge cases:
   - Same university with different names (NUST vs National University...)
   - Branch campuses vs main campus
   - Old vs new names

5. Outputs:
   - Deduplicated CSV (one version per university)
   - Report of merged records
   - List of decisions for user review

Input: potentially-duplicate-universities.csv
Output: clean-universities.csv + merge-report.txt
```

---

### 7️⃣ Data Enrichment - Fill Missing Fields

**Prompt:**
```
I have a CSV with incomplete university data.
Create a script that enriches the data by:

1. For each university with missing fields:
   - Search online for missing phone, email, website
   - Extract establishment year from official sources
   - Find official description/mission statement
   - Identify all campuses
   - Determine province from address

2. Use intelligent lookups:
   - Search by university name on Google
   - Check official HEC database
   - Parse university websites
   - Use Wikipedia as fallback

3. Generate confidence scores:
   - High (found on official website)
   - Medium (found on multiple sources)
   - Low (inferred or estimated)

4. Output:
   - Enriched CSV with all fields filled where possible
   - Confidence report per university and field
   - List of fields that still need manual review

Input: incomplete-universities.csv
Output: enriched-universities.csv + confidence-report.txt
```

---

## 🔄 Workflow Examples

### Example 1: New University Addition

```
1. Ask Copilot: "Find all new universities in Pakistan founded after 2020"
   ↓
2. Get CSV with new institutions
   ↓
3. Validate: npm run validate-data -- --file new-unis.csv
   ↓
4. Import: npm run import-data -- --file new-unis.csv
   ↓
5. ✅ App updated automatically
```

### Example 2: Annual Ranking Update

```
1. HEC publishes new rankings
   ↓
2. Tell Copilot: "Extract ranking table from HEC PDF and create CSV"
   ↓
3. Get rankings-2025.csv
   ↓
4. Validate: npm run validate-data -- --file rankings-2025.csv
   ↓
5. Import: npm run import-data -- --file rankings-2025.csv
   ↓
6. ✅ Rankings updated automatically
```

### Example 3: Bulk Campus Addition

```
1. Have list of new campuses for universities
   ↓
2. Export current data: npm run export-data -- --output current.csv
   ↓
3. Open in Excel, add new campuses to "campuses" column with | separator
   ↓
4. Tell Copilot: "Validate this CSV for format errors"
   ↓
5. Validate: npm run validate-data -- --file updated.csv
   ↓
6. Import: npm run import-data -- --file updated.csv
   ↓
7. ✅ Campuses added
```

---

## 🎨 Tips for Better Results

### When Using Copilot:

**✅ DO:**
- Be specific about output format (mention column names)
- Include example data
- Specify error handling requirements
- Ask for validation/quality checks
- Request progress/logging output
- Mention file formats (CSV, Excel, JSON)

**❌ DON'T:**
- Give vague instructions ("extract university data")
- Skip details about format requirements
- Assume Copilot knows your data structure
- Forget to test generated code on sample data
- Mix multiple unrelated tasks in one prompt

### Example Good Prompt:
```
Create a Python script that:
1. Reads [source data]
2. Transforms using [specific rules]
3. Validates [specific checks]
4. Outputs CSV with columns: name, short_name, type, ...
Requirements: [specific needs]
Example output: [sample row]
```

---

## 📊 Data Sources for Pakistan Universities

Copilot can help you extract from:

| Source | Type | Best For |
|--------|------|----------|
| **HEC.gov.pk** | Official | Rankings, recognition status |
| **University websites** | Official | Contact info, campuses, programs |
| **LinkedIn** | Semi-official | Establishment dates, size |
| **Wikipedia** | Reference | Historical info, overview |
| **Google Maps** | Verified | Address, phone, location |
| **SECP Database** | Official | Registration info, type |
| **News articles** | Current | Recent changes, new campuses |

---

## 🚀 Advanced: Semi-Automatic Updates

### Set Up Periodic Updates:

**Prompt to Copilot:**
```
Create a scheduled Python script (using APScheduler) that:

1. Runs weekly/monthly (configurable)
2. Scrapes HEC rankings
3. Checks university websites for updates
4. Compares with current database
5. If changes found:
   - Logs the changes
   - Creates CSV with updates
   - Runs validation
   - Logs ready for import

6. Sends notification with:
   - What changed
   - How many updates
   - Command to import

This allows semi-automatic updates with manual approval before importing.
```

---

## ✅ Quality Checklist

Before importing data prepared with Copilot:

- [ ] Validate with: `npm run validate-data -- --file your.csv`
- [ ] Spot-check 5-10 rows for accuracy
- [ ] Verify URLs are correct
- [ ] Check phone numbers have +92
- [ ] Ensure provinces are lowercase
- [ ] Confirm campuses separated by |
- [ ] Review any warnings from validation
- [ ] Check import logs after import: `npm run view-import-logs`

---

## 📞 Quick Reference

```bash
# Validate before importing (ALWAYS DO THIS)
npm run validate-data -- --file data.csv

# Import verified data
npm run import-data -- --file data.csv

# Export for editing
npm run export-data -- --output backup.csv

# View import history
npm run view-import-logs
```

---

**Remember:** Use Copilot to automate tedious data prep work, but always validate the output before importing! 🎯

---

**Last Updated**: January 15, 2026
