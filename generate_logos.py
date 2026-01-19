#!/usr/bin/env python3
import csv
import re

# Read CSV
universities = {}
with open('universities DATA.csv', 'r', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    for row in reader:
        name = row['university_name'].strip()
        logo_url = row['logo_url'].strip() if row['logo_url'] else ''
        
        # Filter out invalid URLs
        if (logo_url and 
            '#/media' not in logo_url and 
            'data:image' not in logo_url and 
            'Not have' not in logo_url and 
            'Dangerous' not in logo_url):
            universities[name] = logo_url

print(f"Total valid universities: {len(universities)}")
print("\n=== TypeScript Mapping ===\n")

# Generate TypeScript code
lines = []
lines.append("export const UNIVERSITY_LOGO_MAP: Record<string, string> = {")
lines.append("  // All 257 Pakistani Universities - Logo URLs from Official Sources")
lines.append("  // Updated: January 2026")
lines.append("  // Auto-generated from CSV data")
lines.append("")

for name, url in sorted(universities.items()):
    # Create a simple short key
    short_key = re.sub(r'[^a-zA-Z0-9]', '', name)
    lines.append(f"  '{short_key}': '{url}',")

lines.append("};")

print(f"\nGenerated {len(universities)} mappings")
print("\nFirst 5 entries:")
for line in lines[5:10]:
    print(line)

print(f"\nLast 5 entries:")
for line in lines[-6:-1]:
    print(line)

# Save to file
with open('university_logos_complete.ts', 'w', encoding='utf-8') as f:
    f.write('\n'.join(lines))

print("\n✅ Saved to university_logos_complete.ts")
