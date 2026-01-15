/**
 * University Data Export Script
 * Exports database universities to CSV format for editing/backup
 * 
 * Usage: npm run export-data -- --output universities.csv
 */

import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY || '';

class DataExporter {
  private supabase;

  constructor() {
    if (!SUPABASE_URL || !SUPABASE_KEY) {
      throw new Error('Missing SUPABASE_URL or SUPABASE_ANON_KEY environment variables');
    }
    this.supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
  }

  /**
   * Escape CSV values
   */
  private escapeCsvValue(value: any): string {
    if (value === null || value === undefined) return '';

    let str = String(value);

    // Join array with pipe separator
    if (Array.isArray(value)) {
      str = value.join('|');
    }

    // Escape quotes and wrap in quotes if contains special chars
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      str = '"' + str.replace(/"/g, '""') + '"';
    }

    return str;
  }

  /**
   * Export universities to CSV
   */
  async export(outputPath: string): Promise<void> {
    try {
      // Fetch all universities
      const { data: universities, error } = await this.supabase
        .from('universities')
        .select('*')
        .order('province')
        .order('name');

      if (error) throw error;

      if (!universities || universities.length === 0) {
        console.log('⚠️ No universities found in database');
        return;
      }

      console.log(`📥 Fetched ${universities.length} universities from database`);

      // Create CSV header
      const headers = [
        'name',
        'short_name',
        'type',
        'province',
        'city',
        'address',
        'website',
        'email',
        'phone',
        'established_year',
        'ranking_hec',
        'ranking_national',
        'is_hec_recognized',
        'description',
        'admission_url',
        'campuses',
      ];

      // Convert rows
      const rows = universities.map(uni => [
        this.escapeCsvValue(uni.name),
        this.escapeCsvValue(uni.short_name),
        this.escapeCsvValue(uni.type),
        this.escapeCsvValue(uni.province),
        this.escapeCsvValue(uni.city),
        this.escapeCsvValue(uni.address),
        this.escapeCsvValue(uni.website),
        this.escapeCsvValue(uni.email),
        this.escapeCsvValue(uni.phone),
        this.escapeCsvValue(uni.established_year),
        this.escapeCsvValue(uni.ranking_hec),
        this.escapeCsvValue(uni.ranking_national),
        this.escapeCsvValue(uni.is_hec_recognized),
        this.escapeCsvValue(uni.description),
        this.escapeCsvValue(uni.admission_url),
        this.escapeCsvValue(uni.campuses),
      ]);

      // Write CSV
      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.join(',')),
      ].join('\n');

      // Create directory if needed
      const dir = path.dirname(outputPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      fs.writeFileSync(outputPath, csvContent, 'utf-8');

      console.log(`\n✅ Export Complete!`);
      console.log(`   File: ${outputPath}`);
      console.log(`   Universities: ${universities.length}`);
      console.log(`\n💡 You can now edit this file and re-import with: npm run import-data -- --file "${outputPath}"`);

    } catch (error: any) {
      console.error(`❌ Export failed: ${error.message}`);
      throw error;
    }
  }
}

// CLI
async function main() {
  const args = process.argv.slice(2);
  const outputIndex = args.indexOf('--output');

  if (outputIndex === -1) {
    console.error('Usage: npx ts-node export.ts --output <path/to/output.csv>');
    process.exit(1);
  }

  const outputPath = args[outputIndex + 1];
  if (!outputPath) {
    console.error('Please provide an output path after --output');
    process.exit(1);
  }

  try {
    const exporter = new DataExporter();
    await exporter.export(outputPath);
  } catch (error) {
    console.error('Export failed:', error);
    process.exit(1);
  }
}

main();
