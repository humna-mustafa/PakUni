/**
 * CSV Validation Script
 * Validates CSV before importing to catch errors early
 * 
 * Usage: npm run validate-data -- --file universities.csv
 */

import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse';

interface ValidationResult {
  valid: boolean;
  rowCount: number;
  errors: string[];
  warnings: string[];
}

class DataValidator {
  private VALID_PROVINCES = ['islamabad', 'punjab', 'sindh', 'kpk', 'balochistan'];
  private VALID_TYPES = ['public', 'private', 'semi_government'];
  private VALID_HEC_RANKINGS = ['W1', 'W2', 'W3', 'W4'];

  /**
   * Validate a single row
   */
  private validateRow(row: any, rowIndex: number): { errors: string[]; warnings: string[] } {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Required fields
    if (!row.name?.trim()) {
      errors.push(`Row ${rowIndex}: Missing 'name' (required)`);
    }
    if (!row.short_name?.trim()) {
      errors.push(`Row ${rowIndex}: Missing 'short_name' (required)`);
    }
    if (!row.type?.trim()) {
      errors.push(`Row ${rowIndex}: Missing 'type' (required)`);
    }
    if (!row.province?.trim()) {
      errors.push(`Row ${rowIndex}: Missing 'province' (required)`);
    }

    // Province validation
    if (row.province && !this.VALID_PROVINCES.includes(row.province.toLowerCase())) {
      errors.push(
        `Row ${rowIndex}: Invalid province "${row.province}". Valid: ${this.VALID_PROVINCES.join(', ')}`
      );
    }

    // Type validation
    if (row.type && !this.VALID_TYPES.includes(row.type.toLowerCase())) {
      errors.push(
        `Row ${rowIndex}: Invalid type "${row.type}". Valid: ${this.VALID_TYPES.join(', ')}`
      );
    }

    // Email validation
    if (row.email && !this.isValidEmail(row.email)) {
      errors.push(`Row ${rowIndex}: Invalid email format "${row.email}"`);
    }

    // URL validation
    if (row.website && !this.isValidUrl(row.website)) {
      errors.push(`Row ${rowIndex}: Invalid website URL "${row.website}". Must start with http:// or https://`);
    }

    if (row.admission_url && !this.isValidUrl(row.admission_url)) {
      errors.push(
        `Row ${rowIndex}: Invalid admission_url "${row.admission_url}". Must start with http:// or https://`
      );
    }

    // Phone validation
    if (row.phone) {
      if (!row.phone.startsWith('+92')) {
        errors.push(`Row ${rowIndex}: Phone "${row.phone}" must start with +92`);
      }
      if (row.phone.length < 10) {
        errors.push(`Row ${rowIndex}: Phone "${row.phone}" seems too short`);
      }
    }

    // Year validation
    if (row.established_year) {
      const year = parseInt(row.established_year);
      if (isNaN(year)) {
        errors.push(`Row ${rowIndex}: established_year "${row.established_year}" is not a number`);
      } else if (year < 1900 || year > new Date().getFullYear()) {
        errors.push(
          `Row ${rowIndex}: established_year ${year} must be between 1900-${new Date().getFullYear()}`
        );
      }
    }

    // HEC ranking validation
    if (row.ranking_hec && !this.VALID_HEC_RANKINGS.includes(row.ranking_hec.toUpperCase())) {
      errors.push(
        `Row ${rowIndex}: Invalid HEC ranking "${row.ranking_hec}". Valid: ${this.VALID_HEC_RANKINGS.join(', ')}`
      );
    }

    // National ranking validation
    if (row.ranking_national) {
      const rank = parseInt(row.ranking_national);
      if (isNaN(rank) || rank < 1) {
        errors.push(`Row ${rowIndex}: National ranking must be a positive number, got "${row.ranking_national}"`);
      }
    }

    // Boolean validation
    if (row.is_hec_recognized && !['true', 'false'].includes(row.is_hec_recognized.toLowerCase())) {
      errors.push(
        `Row ${rowIndex}: is_hec_recognized must be "true" or "false", got "${row.is_hec_recognized}"`
      );
    }

    // Warnings
    if (row.description && row.description.includes(',')) {
      warnings.push(
        `Row ${rowIndex}: Description contains commas. Consider using dashes (-) instead for better CSV compatibility`
      );
    }

    if (row.campuses && !row.campuses.includes('|')) {
      warnings.push(`Row ${rowIndex}: Campuses should be separated by pipes (|) if there are multiple`);
    }

    if (row.phone && !row.phone.includes('-')) {
      warnings.push(
        `Row ${rowIndex}: Phone format "${row.phone}" - consider using format like +92-51-1234567 for readability`
      );
    }

    return { errors, warnings };
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private isValidUrl(url: string): boolean {
    try {
      const urlObj = new URL(url);
      return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
    } catch {
      return false;
    }
  }

  /**
   * Validate CSV file
   */
  async validate(filePath: string): Promise<ValidationResult> {
    const result: ValidationResult = {
      valid: true,
      rowCount: 0,
      errors: [],
      warnings: [],
    };

    try {
      // Check file exists
      if (!fs.existsSync(filePath)) {
        result.valid = false;
        result.errors.push(`File not found: ${filePath}`);
        return result;
      }

      console.log(`🔍 Validating ${path.basename(filePath)}...\n`);

      // Parse CSV
      const rows: any[] = [];
      await new Promise((resolve, reject) => {
        fs.createReadStream(filePath)
          .pipe(parse({ columns: true }))
          .on('data', (row: any) => rows.push(row))
          .on('error', reject)
          .on('end', resolve);
      });

      result.rowCount = rows.length;
      console.log(`📄 Found ${rows.length} rows to validate\n`);

      // Validate each row
      for (let i = 0; i < rows.length; i++) {
        const { errors, warnings } = this.validateRow(rows[i], i + 2); // +2: header + 1-indexing

        if (errors.length > 0) {
          result.valid = false;
          result.errors.push(...errors);
        }

        if (warnings.length > 0) {
          result.warnings.push(...warnings);
        }
      }

      // Print results
      if (result.valid) {
        console.log(`✅ CSV is valid and ready to import!\n`);
      } else {
        console.log(`❌ CSV has ${result.errors.length} error(s):\n`);
        result.errors.forEach(err => console.log(`   ${err}`));
      }

      if (result.warnings.length > 0) {
        console.log(`\n⚠️ ${result.warnings.length} warning(s):\n`);
        result.warnings.forEach(warn => console.log(`   ${warn}`));
      }

      if (result.valid) {
        console.log(`\n📋 Summary:`);
        console.log(`   Total rows: ${result.rowCount}`);
        console.log(`   Errors: 0`);
        console.log(`   Warnings: ${result.warnings.length}`);
        console.log(`\n💡 To import, run: npm run import-data -- --file "${path.resolve(filePath)}"`);
      }

      return result;
    } catch (error: any) {
      result.valid = false;
      result.errors.push(`Validation error: ${error.message}`);
      console.error(`\n❌ Validation failed: ${error.message}`);
      return result;
    }
  }
}

// CLI
async function main() {
  const args = process.argv.slice(2);
  const fileIndex = args.indexOf('--file');

  if (fileIndex === -1) {
    console.error('Usage: npx ts-node validate.ts --file <path/to/universities.csv>');
    process.exit(1);
  }

  const filePath = args[fileIndex + 1];
  if (!filePath) {
    console.error('Please provide a file path after --file');
    process.exit(1);
  }

  try {
    const validator = new DataValidator();
    const result = await validator.validate(filePath);
    process.exit(result.valid ? 0 : 1);
  } catch (error) {
    console.error('Validation failed:', error);
    process.exit(1);
  }
}

main();
