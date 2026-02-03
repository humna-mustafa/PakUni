const fs = require('fs');
let content = fs.readFileSync('src/data/meritArchive.ts', 'utf8');

// Additional specific fixes for remaining universities
const additionalFixes = [
  { name: 'Bahria University', city: 'Islamabad' },
  { name: 'Information Technology University', city: 'Lahore' },
  { name: 'University of Engineering and Technology"', city: 'Lahore' },  // plain UET without city
];

let updated = 0;
for (const fix of additionalFixes) {
  const escapedName = fix.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(
    `(universityName: ['"]${escapedName}['"]?,(?:(?!\\{).)*?)city: 'Unknown'`,
    'gs'
  );
  const before = (content.match(/city: 'Unknown'/g) || []).length;
  content = content.replace(regex, `$1city: '${fix.city}'`);
  const after = (content.match(/city: 'Unknown'/g) || []).length;
  const fixed = before - after;
  if (fixed > 0) {
    console.log(`${fix.name}: fixed ${fixed} records`);
    updated += fixed;
  }
}

fs.writeFileSync('src/data/meritArchive.ts', content);
console.log(`\nTotal fixed: ${updated} cities`);
console.log('Remaining Unknown:', (content.match(/city: 'Unknown'/g) || []).length);
