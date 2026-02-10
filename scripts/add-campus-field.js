const fs = require('fs');
const path = require('path');

const filePath = path.join(process.cwd(), 'src', 'data', 'meritArchive.ts');
const content = fs.readFileSync(filePath, 'utf8');

const lines = content.split('\n');
const output = [];
let inMeritRecords = false;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];

  if (line.includes('MERIT_RECORDS: MeritRecord[]')) {
    inMeritRecords = true;
  }

  if (!inMeritRecords) {
    output.push(line);
    continue;
  }

  // Check if this is a programName line
  const progMatch = line.match(/programName:\s*"(.+?)"/);
  if (progMatch) {
    const progName = progMatch[1];
    const cityInProg = progName.match(/\(([^)]+)\)$/);

    // Look ahead for city field
    let cityVal = '';
    for (let j = i + 1; j < Math.min(i + 15, lines.length); j++) {
      const cityMatch = lines[j].match(/city:\s*'([^']+)'/);
      if (cityMatch) {
        cityVal = cityMatch[1];
        break;
      }
    }

    let campus = cityVal;
    let cleanProgName = progName;

    if (cityInProg) {
      const campusFromProg = cityInProg[1];
      const cityNames = ['Islamabad', 'Lahore', 'Karachi', 'Peshawar', 'Multan', 'Topi', 'Jamshoro'];

      if (cityNames.includes(campusFromProg)) {
        campus = campusFromProg;
        cleanProgName = progName.replace(/\s*\([^)]+\)$/, '');
      }
      // "Self-Finance Islamabad" or "Self-Finance" stays in program name
    }

    // Write cleaned programName line
    if (cleanProgName !== progName) {
      output.push(line.replace(progName, cleanProgName));
    } else {
      output.push(line);
    }

    // Add campus line after programName
    const indent = line.match(/^(\s+)/);
    const indentStr = indent ? indent[1] : '    ';
    output.push(indentStr + 'campus: "' + campus + '",');
  } else {
    output.push(line);
  }
}

fs.writeFileSync(filePath, output.join('\n'));
console.log('Done - campus field added to all merit records');
