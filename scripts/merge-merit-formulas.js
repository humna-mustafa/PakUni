/**
 * merge-merit-formulas.js
 * Appends generated formulas into meritFormulas.ts
 * Run: node scripts/merge-merit-formulas.js
 */

const fs = require('fs');
const path = require('path');

const formulasPath = path.join(__dirname, '../src/data/meritFormulas.ts');
const content = fs.readFileSync(formulasPath, 'utf8');
const generated = fs.readFileSync(path.join(__dirname, '../src/data/_generated_formulas.ts'), 'utf8');

// Extract IDs already in the existing file
const existingIds = new Set();
const idMatches = content.matchAll(/id:\s*'([^']+)'/g);
for (const m of idMatches) existingIds.add(m[1]);
console.log(`Existing formula IDs: ${existingIds.size}`);

// Parse generated formulas (using regex to extract blocks)
const genContent = generated.replace(/^\/\/.+$/mg, '').replace(/export const GENERATED_FORMULAS = \[/, '').replace(/\];\s*$/, '');

// Split into individual formula blocks by finding objects
// Each block starts with "  {" and ends with "  }"
const blocks = [];
let depth = 0;
let current = '';
let inBlock = false;
for (const char of genContent) {
  if (char === '{') {
    depth++;
    inBlock = true;
    current += char;
  } else if (char === '}') {
    depth--;
    current += char;
    if (depth === 0 && inBlock) {
      blocks.push(current.trim());
      current = '';
      inBlock = false;
    }
  } else if (inBlock) {
    current += char;
  }
}

console.log(`Generated blocks parsed: ${blocks.length}`);

// Filter out blocks with IDs already in existing file
const newBlocks = blocks.filter(block => {
  const idMatch = block.match(/id:\s*'([^']+)'/);
  if (!idMatch) return false;
  const id = idMatch[1];
  if (existingIds.has(id)) {
    return false;
  }
  return true;
});

console.log(`New unique formulas to add: ${newBlocks.length}`);

if (newBlocks.length === 0) {
  console.log('Nothing to add.');
  process.exit(0);
}

// Find the closing of MERIT_FORMULAS array and append before it
// The array ends with "];" after the last object  
// Handle both LF and CRLF
const marker = content.includes('\r\n') ? '];\r\n\r\nexport const ENTRY_TESTS' : '];\n\nexport const ENTRY_TESTS';
const eol = content.includes('\r\n') ? '\r\n' : '\n';
const insertionPoint = content.lastIndexOf(marker);

if (insertionPoint === -1) {
  console.error('Could not find insertion point in meritFormulas.ts. Trying fallback...');
  // Try to find end of array
  const idx = content.lastIndexOf(`${eol}];${eol}`);
  if (idx === -1) { console.error('Fallback also failed.'); process.exit(1); }
  const newContent = content.slice(0, idx) + `,${eol}  // ── AUTO-GENERATED: Additional University Formulas ──────────────────────${eol}  ` + newBlocks.join(`,${eol}  `) + `${eol}` + content.slice(idx);
  fs.writeFileSync(formulasPath, newContent, 'utf8');
} else {
  const newContent = content.slice(0, insertionPoint) + 
    `,${eol}  // ── AUTO-GENERATED: Additional University Formulas ──────────────────────${eol}  ` + 
    newBlocks.join(`,${eol}  `) + 
    `${eol}` + 
    content.slice(insertionPoint);
  fs.writeFileSync(formulasPath, newContent, 'utf8');
}

console.log(`✅ meritFormulas.ts updated with ${newBlocks.length} new formulas`);

// Clean up temp file
fs.unlinkSync(path.join(__dirname, '../src/data/_generated_formulas.ts'));
console.log('Cleaned up temp file.');
