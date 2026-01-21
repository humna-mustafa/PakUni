/**
 * Debug logo URL conversion
 */

import * as fs from 'fs';
import * as path from 'path';
import { parse } from 'csv-parse/sync';

// Test the conversion function
function cleanLogoUrl(url: string | null | undefined): string | null {
  if (!url || url.trim() === '') return null;
  
  let cleaned = url.trim();
  
  console.log('  [DEBUG] Input URL:', cleaned.substring(0, 100) + '...');
  console.log('  [DEBUG] Contains wiki:', cleaned.includes('wikipedia.org/wiki/'));
  console.log('  [DEBUG] Contains media:', cleaned.includes('#/media/File:'));
  
  // Handle Wikipedia page URLs
  if (cleaned.includes('wikipedia.org/wiki/') && cleaned.includes('#/media/File:')) {
    const match = cleaned.match(/#\/media\/File:(.+)$/);
    console.log('  [DEBUG] Match result:', match ? match[1] : 'NO MATCH');
    if (match) {
      let filename = decodeURIComponent(match[1]).replace(/ /g, '_');
      console.log('  [DEBUG] Filename:', filename);
      
      if (filename.toLowerCase().endsWith('.svg')) {
        cleaned = `https://upload.wikimedia.org/wikipedia/commons/thumb/${getWikimediaPath(filename)}/200px-${filename}.png`;
      } else {
        cleaned = `https://upload.wikimedia.org/wikipedia/en/thumb/${getWikimediaPath(filename)}/200px-${filename}`;
      }
      console.log('  [DEBUG] Converted URL:', cleaned);
    }
  }
  
  return cleaned;
}

function getWikimediaPath(filename: string): string {
  const cleanFilename = filename.replace(/ /g, '_');
  const firstChar = cleanFilename[0].toLowerCase();
  const secondChar = (cleanFilename[0] + cleanFilename[1]).toLowerCase();
  return `${firstChar}/${secondChar}/${cleanFilename}`;
}

async function debug() {
  const csvPath = path.resolve(__dirname, '../universities DATA.csv');
  const fileContent = fs.readFileSync(csvPath, 'utf-8');
  
  const records = parse(fileContent, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
    relax_column_count: true,
  });

  console.log('Testing first 3 records with logo URLs:\n');
  
  let count = 0;
  for (const record of records) {
    if (record.logo_url && count < 3) {
      console.log(`\n${record.university_name}:`);
      console.log('  Original:', record.logo_url);
      const converted = cleanLogoUrl(record.logo_url);
      console.log('  Converted:', converted);
      count++;
    }
  }
}

debug();
