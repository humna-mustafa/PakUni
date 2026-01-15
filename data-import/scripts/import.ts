/**
 * University Data Import Script
 * Converts CSV file to Supabase database format
 * 
 * Usage: npm run import-data -- --file universities.csv
 */

import fs from 'fs';
import path from 'path';
import csv from 'csv-parse';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY || '';

interface UniversityCsvRow {
  name: string;
  short_name: string;
  type: 'public' | 'private' | 'semi_government';
  province: string;
  city: string;
  address: string;
  website: string;
  email: string;
  phone: string;
  established_year: string;
  ranking_hec: string;
  ranking_national: string;
  is_hec_recognized: string;
  description: string;
  admission_url: string;
  campuses: string;
}

interface ImportLog {
  timestamp: string;
  filename: string;
  success: boolean;
  added: number;
  updated: number;
  errors: string[];
  details: any[];
}

// Validation rules
const VALID_PROVINCES = ['islamabad', 'punjab', 'sindh', 'kpk', 'balochistan'];
const VALID_TYPES = ['public', 'private', 'semi_government'];
const VALID_HEC_RANKINGS = ['W1', 'W2', 'W3', 'W4'];

class DataImporter {
  private supabase;
  private logs: ImportLog[] = [];

  constructor() {
    if (!SUPABASE_URL || !SUPABASE_KEY) {
      throw new Error('Missing SUPABASE_URL or SUPABASE_ANON_KEY environment variables');
    }
    this.supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
  }

  /**
   * Validate a single row
   */
  private validateRow(row: UniversityCsvRow, rowIndex: number): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Required fields
    if (!row.name?.trim()) errors.push(`Row ${rowIndex}: Missing name`);
    if (!row.short_name?.trim()) errors.push(`Row ${rowIndex}: Missing short_name`);
    if (!row.province?.trim()) errors.push(`Row ${rowIndex}: Missing province`);

    // Province validation
    if (row.province && !VALID_PROVINCES.includes(row.province.toLowerCase())) {
      errors.push(`Row ${rowIndex}: Invalid province "${row.province}". Must be one of: ${VALID_PROVINCES.join(', ')}`);
    }

    // Type validation
    if (row.type && !VALID_TYPES.includes(row.type)) {
      errors.push(`Row ${rowIndex}: Invalid type "${row.type}". Must be one of: ${VALID_TYPES.join(', ')}`);
    }

    // Email validation
    if (row.email && !this.isValidEmail(row.email)) {
      errors.push(`Row ${rowIndex}: Invalid email format "${row.email}"`);
    }

    // URL validation
    if (row.website && !this.isValidUrl(row.website)) {
      errors.push(`Row ${rowIndex}: Invalid website URL "${row.website}"`);
    }

    if (row.admission_url && !this.isValidUrl(row.admission_url)) {
      errors.push(`Row ${rowIndex}: Invalid admission_url "${row.admission_url}"`);
    }

    // Phone validation
    if (row.phone && !row.phone.startsWith('+92')) {
      errors.push(`Row ${rowIndex}: Phone must start with +92, got "${row.phone}"`);
    }

    // Year validation
    if (row.established_year) {
      const year = parseInt(row.established_year);
      if (isNaN(year) || year < 1900 || year > new Date().getFullYear()) {
        errors.push(`Row ${rowIndex}: Invalid year "${row.established_year}". Must be between 1900-${new Date().getFullYear()}`);
      }
    }

    // HEC ranking validation
    if (row.ranking_hec && !VALID_HEC_RANKINGS.includes(row.ranking_hec.toUpperCase())) {
      errors.push(`Row ${rowIndex}: Invalid HEC ranking "${row.ranking_hec}". Must be one of: ${VALID_HEC_RANKINGS.join(', ')}`);
    }

    // National ranking validation
    if (row.ranking_national) {
      const rank = parseInt(row.ranking_national);
      if (isNaN(rank) || rank < 1) {
        errors.push(`Row ${rowIndex}: Invalid national ranking "${row.ranking_national}". Must be a positive number`);
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
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
   * Parse campuses from pipe-separated string
   */
  private parseCampuses(campusesStr: string): string[] {
    if (!campusesStr || !campusesStr.trim()) return [];
    return campusesStr
      .split('|')
      .map(c => c.trim())
      .filter(c => c.length > 0);
  }

  /**
   * Convert CSV row to database format
   */
  private rowToDatabase(row: UniversityCsvRow) {
    return {
      name: row.name.trim(),
      short_name: row.short_name.trim().toUpperCase(),
      type: row.type.toLowerCase(),
      province: row.province.toLowerCase(),
      city: row.city.trim(),
      address: row.address.trim(),
      website: row.website.trim(),
      email: row.email.trim(),
      phone: row.phone.trim(),
      established_year: parseInt(row.established_year),
      ranking_hec: row.ranking_hec.toUpperCase(),
      ranking_national: row.ranking_national ? parseInt(row.ranking_national) : null,
      is_hec_recognized: row.is_hec_recognized.toLowerCase() === 'true',
      description: row.description.trim(),
      admission_url: row.admission_url.trim(),
      campuses: this.parseCampuses(row.campuses),
      logo_url: '', // Will be populated separately
      updated_at: new Date().toISOString(),
    };
  }

  /**
   * Main import function
   */
  async import(filePath: string): Promise<ImportLog> {
    const filename = path.basename(filePath);
    const log: ImportLog = {
      timestamp: new Date().toISOString(),
      filename,
      success: false,
      added: 0,
      updated: 0,
      errors: [],
      details: [],
    };

    try {
      // Read and backup
      if (!fs.existsSync(filePath)) {
        throw new Error(`File not found: ${filePath}`);
      }

      const backupDir = path.join(__dirname, '../backups');
      if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir, { recursive: true });

      const backupPath = path.join(
        backupDir,
        `universities-${new Date().toISOString().split('T')[0]}.csv`
      );

      // Parse CSV
      const rows: UniversityCsvRow[] = [];
      await new Promise((resolve, reject) => {
        fs.createReadStream(filePath)
          .pipe(csv.parse({ columns: true }))
          .on('data', (row) => rows.push(row))
          .on('error', reject)
          .on('end', resolve);
      });

      console.log(`📄 Parsed ${rows.length} rows from CSV`);

      // Validate all rows
      const validRows: UniversityCsvRow[] = [];
      for (let i = 0; i < rows.length; i++) {
        const { valid, errors } = this.validateRow(rows[i], i + 2); // +2 because header is row 1
        if (!valid) {
          log.errors.push(...errors);
        } else {
          validRows.push(rows[i]);
        }
      }

      if (log.errors.length > 0) {
        console.log(`⚠️ Found ${log.errors.length} validation errors:`);
        log.errors.forEach(err => console.log(`   ${err}`));
      }

      // Import to Supabase
      for (const row of validRows) {
        const data = this.rowToDatabase(row);

        try {
          // Check if exists (by short_name)
          const { data: existing } = await this.supabase
            .from('universities')
            .select('id')
            .eq('short_name', data.short_name)
            .single();

          if (existing) {
            // Update
            const { error } = await this.supabase
              .from('universities')
              .update(data)
              .eq('short_name', data.short_name);

            if (error) throw error;
            log.updated++;
            log.details.push({ action: 'updated', name: row.name, short_name: row.short_name });
          } else {
            // Insert
            const { error } = await this.supabase
              .from('universities')
              .insert([data]);

            if (error) throw error;
            log.added++;
            log.details.push({ action: 'added', name: row.name, short_name: row.short_name });
          }
        } catch (err: any) {
          log.errors.push(`Failed to import "${row.name}": ${err.message}`);
          log.details.push({ action: 'failed', name: row.name, error: err.message });
        }
      }

      log.success = true;

      console.log(`\n✅ Import Complete!`);
      console.log(`   Added: ${log.added}`);
      console.log(`   Updated: ${log.updated}`);
      console.log(`   Errors: ${log.errors.length}`);

      // Save log
      this.saveLogs(log);

      return log;
    } catch (error: any) {
      log.errors.push(error.message);
      console.error(`❌ Import failed: ${error.message}`);
      this.saveLogs(log);
      throw error;
    }
  }

  /**
   * Save import logs
   */
  private saveLogs(log: ImportLog) {
    const logsDir = path.join(__dirname, '../logs');
    if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir, { recursive: true });

    const date = new Date().toISOString().split('T')[0];
    const logFile = path.join(logsDir, `${date}-import.json`);

    // Append to today's log
    let logs = [];
    if (fs.existsSync(logFile)) {
      logs = JSON.parse(fs.readFileSync(logFile, 'utf-8'));
    }
    logs.push(log);

    fs.writeFileSync(logFile, JSON.stringify(logs, null, 2));

    // Update history
    const historyFile = path.join(logsDir, 'history.json');
    let history = [];
    if (fs.existsSync(historyFile)) {
      history = JSON.parse(fs.readFileSync(historyFile, 'utf-8'));
    }
    history.push(log);
    fs.writeFileSync(historyFile, JSON.stringify(history, null, 2));
  }
}

// CLI
async function main() {
  const args = process.argv.slice(2);
  const fileIndex = args.indexOf('--file');

  if (fileIndex === -1) {
    console.error('Usage: npx ts-node import.ts --file <path/to/universities.csv>');
    process.exit(1);
  }

  const filePath = args[fileIndex + 1];
  if (!filePath) {
    console.error('Please provide a file path after --file');
    process.exit(1);
  }

  try {
    const importer = new DataImporter();
    await importer.import(filePath);
  } catch (error) {
    console.error('Import failed:', error);
    process.exit(1);
  }
}

main();
