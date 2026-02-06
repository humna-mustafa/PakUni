/**
 * Remove duplicate universities from universities.ts
 * Keeps the entry with more data (longer description, more complete fields)
 */
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'src', 'data', 'universities.ts');
const content = fs.readFileSync(filePath, 'utf8');

// Extract the array content between the first [ and last ]
const arrayStart = content.indexOf('export const UNIVERSITIES: UniversityData[] = [');
const headerPart = content.substring(0, arrayStart + 'export const UNIVERSITIES: UniversityData[] = ['.length);

// Parse individual university objects using regex
const universityBlocks = [];
let depth = 0;
let currentBlock = '';
let inArray = false;

for (let i = arrayStart; i < content.length; i++) {
  const char = content[i];
  
  if (char === '[' && !inArray) {
    inArray = true;
    continue;
  }
  
  if (!inArray) continue;
  
  if (char === '{') {
    if (depth === 0) currentBlock = '';
    depth++;
  }
  
  if (depth > 0) currentBlock += char;
  
  if (char === '}') {
    depth--;
    if (depth === 0 && currentBlock.trim()) {
      universityBlocks.push(currentBlock.trim());
    }
  }
}

console.log(`Found ${universityBlocks.length} university entries`);

// Extract short_name from each block
function getField(block, field) {
  const regex = new RegExp(`${field}:\\s*["']([^"']+)["']`);
  const match = block.match(regex);
  return match ? match[1] : '';
}

function getNumField(block, field) {
  const regex = new RegExp(`${field}:\\s*(\\d+)`);
  const match = block.match(regex);
  return match ? parseInt(match[1]) : 0;
}

// Group by short_name
const groups = {};
universityBlocks.forEach((block, index) => {
  const shortName = getField(block, 'short_name');
  const name = getField(block, 'name');
  if (!groups[shortName]) groups[shortName] = [];
  groups[shortName].push({ block, index, name, shortName });
});

// For duplicates, keep the one with more data
const kept = [];
const removed = [];

Object.entries(groups).forEach(([shortName, entries]) => {
  if (entries.length === 1) {
    kept.push(entries[0]);
  } else {
    // Score each entry by completeness
    const scored = entries.map(e => {
      let score = 0;
      if (getField(e.block, 'logo_url').length > 10) score += 10;
      if (getField(e.block, 'website').length > 5) score += 5;
      if (getField(e.block, 'email').length > 3) score += 3;
      if (getField(e.block, 'phone').length > 3) score += 3;
      if (getField(e.block, 'address').length > 5) score += 3;
      if (getNumField(e.block, 'established_year') > 1800) score += 5;
      if (getField(e.block, 'description').length > 50) score += 5;
      score += e.block.length; // Longer = more data
      return { ...e, score };
    });
    
    scored.sort((a, b) => b.score - a.score);
    kept.push(scored[0]);
    removed.push(...scored.slice(1).map(e => `${e.shortName}: ${e.name}`));
  }
});

console.log(`\nKept: ${kept.length} unique universities`);
console.log(`Removed ${removed.length} duplicates:`);
removed.forEach(r => console.log(`  - ${r}`));

// Sort by ID (preserve original order)
kept.sort((a, b) => a.index - b.index);

// Rebuild the file - reassign sequential IDs
const interfacePart = content.substring(0, content.indexOf('export const UNIVERSITIES'));

let output = interfacePart;
output += 'export const UNIVERSITIES: UniversityData[] = [\n';

kept.forEach((entry, idx) => {
  // Replace the id field with sequential ID
  let block = entry.block;
  block = block.replace(/id:\s*\d+/, `id: ${idx + 1}`);
  output += `  ${block},\n`;
});

output += '];\n';

fs.writeFileSync(filePath, output, 'utf8');
console.log(`\nWritten ${kept.length} universities to ${filePath}`);
