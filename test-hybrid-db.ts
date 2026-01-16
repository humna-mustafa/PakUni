/**
 * Test Hybrid Database Integration
 * Verify Turso + Supabase data fetching works correctly
 */

import * as turso from './src/services/turso';
import {hybridDataService} from './src/services/hybridData';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({path: path.resolve(__dirname, '.env')});

async function testTursoConnection() {
  console.log('\n✅ Test 1: Turso Connection');
  console.log('═══════════════════════════════════');
  
  if (!turso.isTursoAvailable()) {
    console.log('❌ Turso not available (missing credentials)');
    return false;
  }
  
  console.log('✓ Turso credentials found');
  return true;
}

async function testUniversitiesFetch() {
  console.log('\n✅ Test 2: Fetch Universities');
  console.log('═══════════════════════════════════');
  
  try {
    const universities = await hybridDataService.getUniversities();
    console.log(`✓ Fetched ${universities.length} universities`);
    
    // Show first 3
    console.log('\nSample universities:');
    universities.slice(0, 3).forEach((u: any) => {
      console.log(`  - ${u.short_name}: ${u.name} (${u.city})`);
    });
    
    return universities.length >= 132; // Should have all 132
  } catch (error) {
    console.error('❌ Error fetching universities:', error);
    return false;
  }
}

async function testEntryTestsFetch() {
  console.log('\n✅ Test 3: Fetch Entry Tests');
  console.log('═══════════════════════════════════');
  
  try {
    const tests = await hybridDataService.getEntryTests();
    console.log(`✓ Fetched ${tests.length} entry tests`);
    
    console.log('\nSample tests:');
    tests.slice(0, 3).forEach((t: any) => {
      console.log(`  - ${t.name}: ${t.full_name}`);
    });
    
    return tests.length >= 16;
  } catch (error) {
    console.error('❌ Error fetching entry tests:', error);
    return false;
  }
}

async function testScholarshipsFetch() {
  console.log('\n✅ Test 4: Fetch Scholarships');
  console.log('═══════════════════════════════════');
  
  try {
    const scholarships = await hybridDataService.getScholarships();
    console.log(`✓ Fetched ${scholarships.length} scholarships`);
    
    console.log('\nSample scholarships:');
    scholarships.slice(0, 3).forEach((s: any) => {
      console.log(`  - ${s.name} (${s.coverage_percentage}% coverage)`);
    });
    
    return scholarships.length >= 41;
  } catch (error) {
    console.error('❌ Error fetching scholarships:', error);
    return false;
  }
}

async function testUniversitySearch() {
  console.log('\n✅ Test 5: Search Universities');
  console.log('═══════════════════════════════════');
  
  try {
    const results = await hybridDataService.searchUniversities('NUST', {
      province: 'islamabad'
    });
    
    console.log(`✓ Search for "NUST" returned ${results.length} result(s)`);
    
    results.forEach((u: any) => {
      console.log(`  - ${u.short_name}: ${u.name}`);
    });
    
    return results.length >= 1;
  } catch (error) {
    console.error('❌ Error searching universities:', error);
    return false;
  }
}

async function testSyncStatus() {
  console.log('\n✅ Test 6: Sync Status');
  console.log('═══════════════════════════════════');
  
  try {
    const status = await hybridDataService.getSyncStatus();
    console.log(`✓ Data source: ${status.dataSource}`);
    console.log(`✓ Turso connected: ${status.tursoConnected}`);
    console.log(`✓ Last Turso sync: ${status.lastTursoSync || 'never'}`);
    
    return true;
  } catch (error) {
    console.error('❌ Error getting sync status:', error);
    return false;
  }
}

async function runAllTests() {
  console.log('\n╔══════════════════════════════════════════════════════════════╗');
  console.log('║     PakUni Hybrid Database Integration Test Suite            ║');
  console.log('╚══════════════════════════════════════════════════════════════╝');
  
  const results = [];
  
  results.push(await testTursoConnection());
  results.push(await testUniversitiesFetch());
  results.push(await testEntryTestsFetch());
  results.push(await testScholarshipsFetch());
  results.push(await testUniversitySearch());
  results.push(await testSyncStatus());
  
  console.log('\n\n╔══════════════════════════════════════════════════════════════╗');
  console.log('║                     Test Summary                              ║');
  console.log('╚══════════════════════════════════════════════════════════════╝');
  
  const passed = results.filter(r => r).length;
  const total = results.length;
  
  console.log(`\nTests Passed: ${passed}/${total}`);
  
  if (passed === total) {
    console.log('\n✅ All tests passed! Hybrid database is working correctly.');
  } else {
    console.log(`\n⚠️  ${total - passed} test(s) failed. Check errors above.`);
  }
  
  console.log('\n═══════════════════════════════════════════════════════════════\n');
}

// Run tests
runAllTests().catch(console.error);
