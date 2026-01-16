/**
 * Import Kaggle processed data to ENHANCE existing Turso database
 * 
 * Focus: Update existing tables, not create new unrelated ones
 */

import { createClient } from '@libsql/client';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config();

const client = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});

const PROCESSED_DIR = path.join(__dirname, '..', 'data-import', 'processed');

interface UniversityEnhancement {
  name: string;
  latitude?: number;
  longitude?: number;
  map_url?: string;
  contact_phone?: string;
  contact_email?: string;
  total_campuses?: number;
  campus_locations?: string[];
}

// Extract latitude/longitude from Google Maps embed URL
function extractCoordsFromMapUrl(url: string): { lat?: number; lng?: number } {
  if (!url) return {};
  
  // Pattern 1: embed URLs with !2d<lng>!3d<lat>
  const embedMatch = url.match(/!2d(-?\d+\.\d+)!3d(-?\d+\.\d+)/);
  if (embedMatch) {
    return {
      lng: parseFloat(embedMatch[1]),
      lat: parseFloat(embedMatch[2])
    };
  }
  
  // Pattern 2: place URLs with @<lat>,<lng>
  const placeMatch = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (placeMatch) {
    return {
      lat: parseFloat(placeMatch[1]),
      lng: parseFloat(placeMatch[2])
    };
  }
  
  return {};
}

interface JobMarketStats {
  field: string;
  total_jobs: number;
  top_cities: string[];
  top_skills: string[];
  common_titles: string[];
  demand_level: string;
}

interface CareerEnhancement {
  field: string;
  job_count: number;
  top_cities: string[];
  common_titles: string[];
  market_trend: string;
}

async function runSchema() {
  console.log('📋 Updating schema for enhancements...\n');
  
  const statements = [
    // University enhancements
    'ALTER TABLE universities ADD COLUMN latitude REAL',
    'ALTER TABLE universities ADD COLUMN longitude REAL',
    'ALTER TABLE universities ADD COLUMN map_url TEXT',
    'ALTER TABLE universities ADD COLUMN contact_phone TEXT',
    'ALTER TABLE universities ADD COLUMN contact_email TEXT',
    'ALTER TABLE universities ADD COLUMN total_campuses INTEGER',
    'ALTER TABLE universities ADD COLUMN campus_locations TEXT',
    
    // Career enhancements  
    'ALTER TABLE careers ADD COLUMN job_count INTEGER',
    'ALTER TABLE careers ADD COLUMN top_cities TEXT',
    'ALTER TABLE careers ADD COLUMN common_titles TEXT',
    'ALTER TABLE careers ADD COLUMN market_trend TEXT',
    
    // Job market stats table
    `CREATE TABLE IF NOT EXISTS job_market_stats (
      id TEXT PRIMARY KEY,
      field TEXT NOT NULL,
      total_jobs INTEGER,
      top_skills TEXT,
      top_cities TEXT,
      demand_level TEXT,
      common_titles TEXT,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    )`,
  ];
  
  for (const sql of statements) {
    try {
      await client.execute(sql);
    } catch (err: any) {
      // Ignore "already exists" or "duplicate column" errors
      if (!err.message?.includes('duplicate') && !err.message?.includes('already exists')) {
        // Only log unexpected errors
        if (!err.message?.includes('no such column')) {
          console.log(`   Note: ${err.message?.slice(0, 60)}`);
        }
      }
    }
  }
  
  console.log('✅ Schema updated\n');
}

async function enhanceUniversities() {
  const filePath = path.join(PROCESSED_DIR, 'university-enhancements.json');
  if (!fs.existsSync(filePath)) {
    console.log('⚠️  university-enhancements.json not found, skipping...');
    return 0;
  }
  
  console.log('🏫 Enhancing universities with Kaggle data...');
  
  const enhancements: UniversityEnhancement[] = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  let enhanced = 0;
  let coordsAdded = 0;
  
  // Get all universities for matching
  const univResult = await client.execute('SELECT id, name, short_name FROM universities');
  const universities = univResult.rows;
  
  // Create a map for faster lookup with normalized names
  const uniMap = new Map<string, typeof universities[0]>();
  for (const uni of universities) {
    const name = (uni.name as string).toLowerCase();
    const shortName = (uni.short_name as string || '').toLowerCase();
    
    // Add multiple variations for matching
    uniMap.set(name, uni);
    if (shortName) uniMap.set(shortName, uni);
    
    // Add key words
    const keywords = name.split(/[\s,]+/).filter((w: string) => w.length > 4);
    for (const kw of keywords) {
      if (!uniMap.has(kw)) uniMap.set(kw, uni);
    }
  }
  
  for (const enh of enhancements) {
    const enhName = enh.name.toLowerCase().trim();
    const enhWords = enhName.split(/[\s,]+/).filter(w => w.length > 4);
    
    // Find matching university with multiple strategies
    let matchedUniv = uniMap.get(enhName);
    
    if (!matchedUniv) {
      // Try partial match
      for (const [key, uni] of uniMap.entries()) {
        if (enhName.includes(key) || key.includes(enhName.split(',')[0].trim())) {
          matchedUniv = uni;
          break;
        }
      }
    }
    
    if (!matchedUniv) {
      // Try keyword match
      for (const word of enhWords) {
        if (uniMap.has(word)) {
          matchedUniv = uniMap.get(word);
          break;
        }
      }
    }
    
    if (!matchedUniv) continue;
    
    // Extract coordinates from map URL if not already present
    let lat = enh.latitude;
    let lng = enh.longitude;
    if ((!lat || !lng) && enh.map_url) {
      const coords = extractCoordsFromMapUrl(enh.map_url);
      lat = lat || coords.lat;
      lng = lng || coords.lng;
    }
    
    try {
      const updates: string[] = [];
      const args: any[] = [];
      
      if (lat != null && lat !== 0) {
        updates.push('latitude = ?');
        args.push(lat);
      }
      if (lng != null && lng !== 0) {
        updates.push('longitude = ?');
        args.push(lng);
      }
      if (enh.map_url) {
        updates.push('map_url = ?');
        args.push(enh.map_url);
      }
      if (enh.contact_phone) {
        updates.push('contact_phone = ?');
        args.push(enh.contact_phone);
      }
      if (enh.contact_email) {
        updates.push('contact_email = ?');
        args.push(enh.contact_email);
      }
      if (enh.total_campuses) {
        updates.push('total_campuses = ?');
        args.push(enh.total_campuses);
      }
      if (enh.campus_locations && enh.campus_locations.length > 0) {
        updates.push('campus_locations = ?');
        args.push(JSON.stringify(enh.campus_locations));
      }
      
      if (updates.length > 0) {
        args.push(matchedUniv.id);
        await client.execute({
          sql: `UPDATE universities SET ${updates.join(', ')} WHERE id = ?`,
          args,
        });
        enhanced++;
        if (lat && lng) coordsAdded++;
      }
    } catch (err: any) {
      console.log(`   ⚠️ Failed to enhance ${enh.name}: ${err.message?.slice(0, 50)}`);
    }
  }
  
  console.log(`   ✅ Enhanced ${enhanced}/${enhancements.length} universities`);
  console.log(`   📍 With coordinates: ${coordsAdded}`);
  return enhanced;
}

async function importJobMarketStats() {
  const filePath = path.join(PROCESSED_DIR, 'job-market-stats.json');
  if (!fs.existsSync(filePath)) {
    console.log('⚠️  job-market-stats.json not found, skipping...');
    return 0;
  }
  
  console.log('📊 Importing job market statistics...');
  
  const stats: JobMarketStats[] = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  let imported = 0;
  
  for (const stat of stats) {
    try {
      const id = `job-stats-${stat.field.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
      
      await client.execute({
        sql: `INSERT OR REPLACE INTO job_market_stats 
              (id, field, total_jobs, top_skills, top_cities, demand_level, common_titles, updated_at)
              VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
        args: [
          id,
          stat.field,
          stat.total_jobs,
          JSON.stringify(stat.top_skills),
          JSON.stringify(stat.top_cities),
          stat.demand_level,
          JSON.stringify(stat.common_titles),
        ],
      });
      imported++;
    } catch (err: any) {
      console.log(`   ⚠️ Failed to import ${stat.field}: ${err.message?.slice(0, 50)}`);
    }
  }
  
  console.log(`   ✅ Imported ${imported}/${stats.length} job market stats\n`);
  return imported;
}

async function enhanceCareers() {
  const filePath = path.join(PROCESSED_DIR, 'career-enhancements.json');
  if (!fs.existsSync(filePath)) {
    console.log('⚠️  career-enhancements.json not found, skipping...');
    return 0;
  }
  
  console.log('💼 Enhancing careers with job market data...');
  
  const enhancements: CareerEnhancement[] = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  let enhanced = 0;
  
  // Get all careers for matching
  const careersResult = await client.execute('SELECT id, name, field FROM careers');
  const careers = careersResult.rows;
  
  // Define mapping from job market fields to career IDs
  const fieldToCareerMapping: Record<string, string[]> = {
    'Software Engineering': ['software-engineering'],
    'Data Science & AI': ['data-science-ai'],
    'Medical & Healthcare': ['medicine', 'dentistry', 'psychology'],
    'Business & Management': ['business-finance', 'chartered-accountant'],
    'Finance & Banking': ['business-finance', 'chartered-accountant'],
    'Marketing & Digital': ['journalism', 'graphic-design'],
    'Sales & Business Development': ['business-finance'],
    'IT Infrastructure': ['software-engineering'],
    'Education & Training': ['teaching'],
    'Design & Creative': ['graphic-design'],
    'HR & Administration': ['civil-services'],
    'Engineering (Other)': ['electrical-engineering', 'civil-engineering'],
    'Customer Service': [],
    'Legal': ['law'],
    'Logistics & Supply Chain': ['business-finance'],
    'Quality Assurance': ['software-engineering'],
  };
  
  for (const enh of enhancements) {
    const matchingCareerIds = fieldToCareerMapping[enh.field] || [];
    
    // Also try fuzzy match
    if (matchingCareerIds.length === 0) {
      const enhField = enh.field.toLowerCase();
      for (const career of careers) {
        const careerField = (career.field as string || '').toLowerCase();
        const careerName = (career.name as string).toLowerCase();
        const careerId = (career.id as string).toLowerCase();
        
        if (careerField.includes(enhField.split(' ')[0]) || 
            careerName.includes(enhField.split(' ')[0]) ||
            enhField.includes(careerId.replace(/-/g, ' '))) {
          matchingCareerIds.push(career.id as string);
        }
      }
    }
    
    for (const careerId of matchingCareerIds) {
      try {
        await client.execute({
          sql: `UPDATE careers SET 
                job_count = ?, 
                top_cities = ?, 
                common_titles = ?, 
                market_trend = ?
                WHERE id = ?`,
          args: [
            enh.job_count,
            JSON.stringify(enh.top_cities),
            JSON.stringify(enh.common_titles),
            enh.market_trend,
            careerId,
          ],
        });
        enhanced++;
      } catch (err: any) {
        console.log(`   ⚠️ Failed to enhance career: ${err.message?.slice(0, 50)}`);
      }
    }
  }
  
  console.log(`   ✅ Enhanced ${enhanced} career entries\n`);
  return enhanced;
}

async function main() {
  console.log('\n╔═══════════════════════════════════════════════════════════════╗');
  console.log('║     PakUni - Import Kaggle Enhancements to Turso              ║');
  console.log('╚═══════════════════════════════════════════════════════════════╝\n');
  
  // Check for processed data
  if (!fs.existsSync(PROCESSED_DIR)) {
    console.log('❌ Processed data directory not found!');
    console.log('\nPlease run the processing script first:');
    console.log('   npm run kaggle:process');
    return;
  }
  
  // Run schema updates
  await runSchema();
  
  // Import enhancements
  const uniCount = await enhanceUniversities();
  const statsCount = await importJobMarketStats();
  const careerCount = await enhanceCareers();
  
  // Summary
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('📊 Import Summary:');
  console.log(`   🏫 Universities enhanced: ${uniCount}`);
  console.log(`   📈 Job market stats imported: ${statsCount}`);
  console.log(`   💼 Career entries enhanced: ${careerCount}`);
  console.log('═══════════════════════════════════════════════════════════════\n');
  
  console.log('✅ Kaggle data import complete!');
  console.log('\n🎉 Your existing features are now enhanced with:');
  console.log('   - University geolocation & contact info');
  console.log('   - Real job market demand data');
  console.log('   - Career field statistics');
}

main().catch(console.error);
